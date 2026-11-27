"""Offline PDF generator for Manatobi Chemistry (化学基礎・化学):
1) 8 Common Test Full Mock Exam Booklets (basic 1-4, adv 1-4):
   - _questions.pdf : Authentic Common Test Cover + Problem Booklet (SVG figures, data tables, dialogues, atomic weights)
   - _answers.pdf   : Landscape A4 Optical-style Mark Sheet (katakana ア〜ト slots + oval ①〜④ + self-scoring box)
   - _explanations.pdf : Answer Summary Table + Full Step-by-Step Explanations & Distractor Diagnosis
   - .pdf           : Combined all-in-one print pack
2) 6 Course Complete Summary Sheet Compendiums (全114単元の1ページまとめプリント総集編 PDF)
3) 1 Master 37-Year Center Exam (1990-2020) & Common Test (2021-2026) Analysis & Trap Bible PDF
4) Generates src/chemistry/chemistryPdfCatalog.generated.ts with exact page counts and KB sizes.
"""
from __future__ import annotations

import base64
import io
import json
import math
import re
import urllib.parse
from html import escape
from pathlib import Path

import pymupdf
from PIL import Image as PILImage
from reportlab import rl_config

rl_config.invariant = True

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    Image as RLImage,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PRINTS_DIR = PUBLIC / "prints"
THUMBS_DIR = PRINTS_DIR / "thumbs"
SOURCE_JSON = ROOT / "deliverables" / "chemistry-pdf-source.json"
GEN_TS = ROOT / "src" / "chemistry" / "chemistryPdfCatalog.generated.ts"
LOGO_PATH = PUBLIC / "brand" / "manatobi-logo-gray.png"

PRINTS_DIR.mkdir(parents=True, exist_ok=True)
THUMBS_DIR.mkdir(parents=True, exist_ok=True)

# Register Japanese Serif & Sans TrueType (.ttf) fonts so chemical sub/superscripts, arrows, and CJK render crisply
FALLBACK_SERIF = PUBLIC / "fonts" / "booklet-noto-serif-jp.ttf"
SERIF_BOLD_TTF = PUBLIC / "fonts" / "LDI2apCLNRc6A8oT4pbYF8Os.ttf"      # Klee One SemiBold (10,178 glyphs)
SANS_BOLD_TTF = PUBLIC / "fonts" / "VdGBAYIAV6gnpUpoWwNkYvrugw9RuM064ZsK.ttf"  # M PLUS Rounded 1c Bold

pdfmetrics.registerFont(TTFont("ChemSerif", str(FALLBACK_SERIF)))
pdfmetrics.registerFont(TTFont("ChemSerifBold", str(SERIF_BOLD_TTF if SERIF_BOLD_TTF.exists() else FALLBACK_SERIF)))
pdfmetrics.registerFont(TTFont("ChemSansBold", str(SANS_BOLD_TTF if SANS_BOLD_TTF.exists() else FALLBACK_SERIF)))

W, H = A4
LEFT_M = 46
RIGHT_M = 46
BODY_W = W - LEFT_M - RIGHT_M

KATAKANA_SLOTS = [
    "ア", "イ", "ウ", "エ", "オ",
    "カ", "キ", "ク", "ケ", "コ",
    "サ", "シ", "ス", "セ", "ソ",
    "タ", "チ", "ツ", "テ", "ト",
]
CIRCLED = ["①", "②", "③", "④"]

SUB_MAP = str.maketrans("₀₁₂₃₄₅₆₇₈₉₊₋", "0123456789+-")
SUP_MAP = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻", "0123456789+-")


def chem_markup(raw: str, bold_head: bool = False) -> str:
    """Convert Unicode subscripts/superscripts & newlines to ReportLab XML markup for crisp textbook typesetting."""
    if not raw:
        return ""
    s = str(raw)
    # Normalize rare symbols (e.g. U+2212 '−' minus, U+21CC '⇌') so every font renders clean glyphs
    s = (
        s.replace("−", "-")
        .replace("⇄", "⇔")
        .replace("⇌", "⇔")
        .replace("⇒", "→")
        .replace("≪", "&lt;&lt;")
        .replace("≫", "&gt;&gt;")
    )
    out: list[str] = []
    i = 0
    n = len(s)
    while i < n:
        ch = s[i]
        if ch in "₀₁₂₃₄₅₆₇₈₉₊₋":
            j = i
            while j < n and s[j] in "₀₁₂₃₄₅₆₇₈₉₊₋":
                j += 1
            sub_txt = escape(s[i:j].translate(SUB_MAP))
            out.append(f'<sub rise="-1.8" size="70%">{sub_txt}</sub>')
            i = j
        elif ch in "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻":
            j = i
            while j < n and s[j] in "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻":
                j += 1
            sup_txt = escape(s[i:j].translate(SUP_MAP))
            out.append(f'<super rise="3.2" size="70%">{sup_txt}</super>')
            i = j
        elif ch == "\n":
            out.append("<br/>")
            i += 1
        else:
            out.append(escape(ch))
            i += 1
    res = "".join(out)
    # Highlight katakana mark boxes like ［ ア ］ or [ア]
    res = re.sub(
        r"［\s*([ア-ト0-9]+)\s*］",
        r'<font name="ChemSansBold">【 \1 】</font>',
        res,
    )
    if bold_head:
        res = f'<font name="ChemSerifBold">{res}</font>'
    return res


STYLES = {
    "daimon_bar": ParagraphStyle(
        "daimon_bar",
        fontName="ChemSansBold",
        fontSize=10.8,
        leading=15,
        textColor=colors.HexColor("#111827"),
        wordWrap="CJK",
    ),
    "daimon_right": ParagraphStyle(
        "daimon_right",
        fontName="ChemSansBold",
        fontSize=9.2,
        leading=14,
        alignment=2,
        textColor=colors.HexColor("#1f2937"),
        wordWrap="CJK",
    ),
    "lead": ParagraphStyle(
        "lead",
        fontName="ChemSerif",
        fontSize=9.7,
        leading=15.8,
        spaceAfter=5,
        textColor=colors.black,
        wordWrap="CJK",
    ),
    "stem": ParagraphStyle(
        "stem",
        fontName="ChemSerif",
        fontSize=9.7,
        leading=17.4,
        spaceAfter=4,
        textColor=colors.black,
        wordWrap="CJK",
    ),
    "choice": ParagraphStyle(
        "choice",
        fontName="ChemSerif",
        fontSize=9.3,
        leading=16.2,
        leftIndent=14,
        firstLineIndent=-14,
        spaceAfter=2.5,
        textColor=colors.black,
        wordWrap="CJK",
    ),
    "caption": ParagraphStyle(
        "caption",
        fontName="ChemSansBold",
        fontSize=8.4,
        leading=12.5,
        alignment=1,
        spaceBefore=2,
        spaceAfter=5,
        textColor=colors.HexColor("#1e293b"),
        wordWrap="CJK",
    ),
    "tbl_head": ParagraphStyle(
        "tbl_head",
        fontName="ChemSansBold",
        fontSize=8.4,
        leading=12.2,
        textColor=colors.HexColor("#0f172a"),
        wordWrap="CJK",
    ),
    "tbl_cell": ParagraphStyle(
        "tbl_cell",
        fontName="ChemSerif",
        fontSize=8.4,
        leading=14.2,
        textColor=colors.black,
        wordWrap="CJK",
    ),
    "dlg_speaker": ParagraphStyle(
        "dlg_speaker",
        fontName="ChemSansBold",
        fontSize=8.5,
        leading=13.0,
        textColor=colors.HexColor("#0f172a"),
        wordWrap="CJK",
    ),
    "dlg_text": ParagraphStyle(
        "dlg_text",
        fontName="ChemSerif",
        fontSize=8.8,
        leading=13.8,
        textColor=colors.black,
        wordWrap="CJK",
    ),
    "exp_head": ParagraphStyle(
        "exp_head",
        fontName="ChemSansBold",
        fontSize=10.0,
        leading=14.5,
        textColor=colors.HexColor("#0f172a"),
        wordWrap="CJK",
    ),
    "exp_body": ParagraphStyle(
        "exp_body",
        fontName="ChemSerif",
        fontSize=9.0,
        leading=14.4,
        spaceAfter=3,
        textColor=colors.HexColor("#111827"),
        wordWrap="CJK",
    ),
    "exp_step": ParagraphStyle(
        "exp_step",
        fontName="ChemSerif",
        fontSize=8.6,
        leading=13.4,
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=2,
        textColor=colors.HexColor("#0f5132"),
        wordWrap="CJK",
    ),
    "exp_reason": ParagraphStyle(
        "exp_reason",
        fontName="ChemSerif",
        fontSize=8.3,
        leading=12.8,
        leftIndent=14,
        firstLineIndent=-14,
        spaceAfter=1.5,
        textColor=colors.HexColor("#334155"),
        wordWrap="CJK",
    ),
    "sum_title": ParagraphStyle(
        "sum_title",
        fontName="ChemSansBold",
        fontSize=13.0,
        leading=18.0,
        textColor=colors.HexColor("#0f172a"),
        wordWrap="CJK",
    ),
    "sum_sub": ParagraphStyle(
        "sum_sub",
        fontName="ChemSansBold",
        fontSize=9.4,
        leading=14.2,
        textColor=colors.HexColor("#1e3a5f"),
        wordWrap="CJK",
    ),
}


def P(text: str, style_key: str = "stem") -> Paragraph:
    return Paragraph(chem_markup(text), STYLES[style_key])


_SVG_CACHE: dict[str, tuple[bytes, int, int]] = {}


def rasterize_svg_data_uri(data_uri: str, target_dpi: int = 180) -> tuple[bytes, int, int] | None:
    """Convert `data:image/svg+xml;utf8,...` or base64 SVG to crisp PNG bytes via PyMuPDF."""
    if not data_uri or not data_uri.startswith("data:image/svg+xml"):
        return None
    if data_uri in _SVG_CACHE:
        return _SVG_CACHE[data_uri]
    header, payload = data_uri.split(",", 1)
    if ";base64" in header:
        svg_bytes = base64.b64decode(payload)
    else:
        svg_text = urllib.parse.unquote(payload)
        # Ensure CJK font-family points to installed Noto Sans CJK JP so PyMuPDF renders Japanese labels cleanly
        svg_text = re.sub(
            r"font-family\s*:\s*[^;\"']+",
            "font-family: 'Noto Sans CJK JP', sans-serif",
            svg_text,
        )
        svg_bytes = svg_text.encode("utf-8")

    with pymupdf.open(stream=svg_bytes, filetype="svg") as doc:
        page = doc[0]
        pix = page.get_pixmap(dpi=target_dpi, alpha=False)
        png_bytes = pix.tobytes("png")
        res = (png_bytes, pix.width, pix.height)
        _SVG_CACHE[data_uri] = res
        return res


def make_rl_image(data_uri: str, max_w: float = 360.0, max_h: float = 158.0) -> RLImage | None:
    ras = rasterize_svg_data_uri(data_uri)
    if not ras:
        return None
    png_bytes, pw, ph = ras
    scale = min(max_w / pw, max_h / ph)
    img = RLImage(io.BytesIO(png_bytes), width=pw * scale, height=ph * scale)
    img.hAlign = "CENTER"
    return img


def save_webp_thumb(pdf_path: Path, thumb_path: Path) -> None:
    with pymupdf.open(pdf_path) as doc:
        pix = doc[0].get_pixmap(dpi=110, alpha=False)
        im = PILImage.frombytes("RGB", (pix.width, pix.height), pix.samples)
        im.save(thumb_path, "WEBP", quality=82)


def merge_pdfs(parts: list[Path], out_path: Path, title: str) -> int:
    out = pymupdf.open()
    for part in parts:
        with pymupdf.open(part) as src:
            out.insert_pdf(src)
    out.set_metadata({"title": title, "author": "まなとび化学基礎・化学"})
    out.save(out_path, garbage=4, deflate=True)
    pages = out.page_count
    out.close()
    return pages


def build_mock_cover_pdf(path: Path, exam: dict) -> None:
    """Authentic Common Test (令和8・9年度 大学入学共通テスト準拠) A4 Examination Cover Sheet."""
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1, invariant=1)
    is_basic = exam["examCategory"] == "basic"
    subj_code = "理科①（基礎を付した科目）" if is_basic else "理科（専門科目）"
    big_subj = "化 学 基 礎" if is_basic else "化　　学"
    items_flat = [it for sec in exam["sections"] for it in sec["items"]]
    last_slot = KATAKANA_SLOTS[min(len(items_flat) - 1, len(KATAKANA_SLOTS) - 1)]

    # Outer double border (classic DNC examination cover style)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1.6)
    c.rect(36, 36, W - 72, H - 72, stroke=1, fill=0)
    c.setLineWidth(0.5)
    c.rect(40, 40, W - 80, H - 80, stroke=1, fill=0)

    # Top bar: logo + Year / Series label
    if LOGO_PATH.exists():
        c.drawImage(str(LOGO_PATH), 52, H - 78, width=88, height=28, mask="auto", preserveAspectRatio=True)
    c.setFillColor(colors.black)
    c.setFont("ChemSansBold", 9.5)
    c.drawString(148, H - 62, "大学入学共通テスト実戦模試（センター37年過去問分析準拠）")
    c.setFont("ChemSerif", 8.8)
    c.drawString(148, H - 75, f"第{exam['round']}回　{exam.get('levelBadge', '')}")

    # Exam code box top-right
    c.setFillColor(colors.black)
    c.rect(W - 134, H - 80, 82, 28, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("ChemSansBold", 11)
    c.drawCentredString(W - 93, H - 70, f"{'基礎' if is_basic else '化学'}-第{exam['round']}回")
    c.setFillColor(colors.black)

    c.setLineWidth(0.8)
    c.line(50, H - 88, W - 50, H - 88)

    # Center Subject Title Box
    c.setFont("ChemSerif", 11.5)
    c.drawCentredString(W / 2, H - 114, f"令和8・9年度 大学入学共通テスト準拠　{subj_code}")
    c.setLineWidth(1.3)
    c.rect(86, H - 188, W - 172, 58, stroke=1, fill=0)
    c.setFont("ChemSansBold", 28)
    c.drawCentredString(W / 2, H - 168, big_subj)
    c.setFont("ChemSansBold", 11)
    c.drawCentredString(
        W / 2,
        H - 208,
        f"（全問必答　／　制限時間：{exam['timeLimitMinutes']}分　／　配点：{exam['totalPoints']}点満点）",
    )

    # Precautions Box (注意事項)
    box_top = 224
    box_h = 148
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setLineWidth(0.7)
    c.rect(52, H - box_top - box_h, W - 104, box_h, stroke=1, fill=1)
    c.setFillColor(colors.black)
    c.setFont("ChemSansBold", 10.2)
    c.drawString(64, H - box_top - 18, "【試験開始前の注意事項（本番シミュレーション）】")

    notes = [
        f"1. 試験開始の合図があるまで、この問題冊子の中を見てはいけません（解答欄は【 ア 】〜【 {last_slot} 】の全{len(items_flat)}マーク）。",
        "2. 解答はすべて別紙の「マークシート解答用紙（A4横）」の該当番号（①〜④）を濃く塗りつぶしなさい。",
        "3. 問題冊子の余白は、化学反応式・mol収支表・構造異性体の書き出し計算メモとして自由に使いなさい。",
        "4. 【満点への鉄則】1周目でA・B標準問題を確実に仕留め、時間を食う逆推論・異性体数え上げは印をつけて2周目で回収せよ。",
    ]
    p_notes = Paragraph(
        "<br/>".join(escape(line) for line in notes),
        ParagraphStyle("cov_n", fontName="ChemSerif", fontSize=8.8, leading=14.5, wordWrap="CJK"),
    )
    _, nh = p_notes.wrap(W - 128, box_h - 28)
    p_notes.drawOn(c, 64, H - box_top - 26 - nh)

    # Atomic weights & Physical Constants Box (原子量・気体定数・ファラデー定数)
    const_top = box_top + box_h + 12
    const_h = 68
    c.setFillColor(colors.HexColor("#fffbeb"))
    c.setLineWidth(0.8)
    c.rect(52, H - const_top - const_h, W - 104, const_h, stroke=1, fill=1)
    c.setFillColor(colors.black)
    c.setFont("ChemSansBold", 9.4)
    c.drawString(64, H - const_top - 16, "■ 必要があれば、次の原子量・定数の値を用いよ（問題冊子巻頭定数表）")
    p_const = Paragraph(
        chem_markup(exam.get("constantsNote", "")),
        ParagraphStyle("cov_c", fontName="ChemSerif", fontSize=8.7, leading=13.6, wordWrap="CJK"),
    )
    _, ch = p_const.wrap(W - 128, const_h - 22)
    p_const.drawOn(c, 64, H - const_top - 22 - ch)

    # Daimon Pacing & Self-Scoring Table
    tbl_top = const_top + const_h + 16
    c.setFont("ChemSansBold", 10.0)
    c.drawString(52, H - tbl_top - 10, "■ 大問構成・推奨時間配分・自己採点記録表（目標：共テ本番85% ／ 国公立2次余裕圏92%+）")

    headers = ["大問", "出題分野・テーマ", "マーク数", "推奨時間", "配点", "自己採点"]
    table_rows = [
        [Paragraph(h, STYLES["tbl_head"]) for h in headers]
    ]
    slot_cursor = 0
    for sec in exam["sections"]:
        cnt = len(sec["items"])
        pts = sum(it["points"] for it in sec["items"])
        s_first = KATAKANA_SLOTS[slot_cursor]
        s_last = KATAKANA_SLOTS[min(slot_cursor + cnt - 1, len(KATAKANA_SLOTS) - 1)]
        slot_cursor += cnt
        clean_title = re.sub(r"（配点\s*\d+点）", "", sec["title"]).strip()
        table_rows.append([
            Paragraph(f'<font name="ChemSansBold">{escape(sec["daimonLabel"])}</font>', STYLES["tbl_cell"]),
            Paragraph(chem_markup(clean_title), STYLES["tbl_cell"]),
            Paragraph(f"{s_first}〜{s_last}（{cnt}欄）", STYLES["tbl_cell"]),
            Paragraph(f"{sec.get('recommendedMinutes', 12)} 分", STYLES["tbl_cell"]),
            Paragraph(f"{pts} 点", STYLES["tbl_cell"]),
            Paragraph(f"　　 ／ {pts}", STYLES["tbl_cell"]),
        ])

    col_w = [44, BODY_W - 266, 66, 48, 42, 66]
    t = Table(table_rows, colWidths=col_w)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#334155")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    _, th = t.wrap(BODY_W, 240)
    t.drawOn(c, 52, H - tbl_top - 18 - th)

    # Candidate Name / Score Footer Box
    rec_y = 66
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.setLineWidth(0.6)
    c.rect(52, rec_y, W - 104, 46, stroke=1, fill=1)
    c.setFillColor(colors.black)
    c.setFont("ChemSerif", 9.5)
    c.drawString(64, rec_y + 28, "実施日：202　年　　月　　日　｜　所要時間：　　分　　秒")
    c.drawString(64, rec_y + 10, "受験者氏名：__________________________")
    c.setFont("ChemSansBold", 11)
    c.drawRightString(W - 64, rec_y + 16, f"合計得点：　　　 ／ {exam['totalPoints']} 点")

    c.setFont("ChemSerif", 7.5)
    c.drawCentredString(
        W / 2,
        48,
        "※本冊子は『まなとび化学基礎・化学』独自のオリジナル予想問題冊子であり、大学入試センターの公式問題ではありません。",
    )
    c.showPage()
    c.save()


def build_mock_questions_pdf(path: Path, exam: dict) -> int:
    """Cover + Authentic Common Test Problem Booklet with figures, tables, dialogues, and katakana mark boxes."""
    cover_tmp = path.with_suffix(".cover.pdf")
    body_tmp = path.with_suffix(".body.pdf")
    build_mock_cover_pdf(cover_tmp, exam)

    story: list = []
    slot_idx = 0

    for sec_i, sec in enumerate(exam["sections"]):
        if sec_i > 0:
            story.append(PageBreak())

        sec_pts = sum(it["points"] for it in sec["items"])
        rec_min = sec.get("recommendedMinutes", 12)
        clean_title = re.sub(r"（配点\s*\d+点）", "", sec["title"]).strip()

        # Daimon Header Band
        bar = Table(
            [[
                Paragraph(f"{escape(sec['daimonLabel'])}　{chem_markup(clean_title)}", STYLES["daimon_bar"]),
                Paragraph(f"（必答・配点 {sec_pts}点 ／ 目安 {rec_min}分）", STYLES["daimon_right"]),
            ]],
            colWidths=[BODY_W * 0.70, BODY_W * 0.30],
        )
        bar.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.9, colors.black),
            ("LINEBEFORE", (0, 0), (0, 0), 4.0, colors.HexColor("#0f172a")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(bar)
        story.append(Spacer(1, 6))

        if sec.get("leadText"):
            story.append(P(sec["leadText"], "lead"))

        if sec.get("imageUrl"):
            img = make_rl_image(sec["imageUrl"], max_w=BODY_W * 0.86, max_h=148)
            if img:
                fig_parts = [img]
                if sec.get("imageCaption"):
                    fig_parts.append(P(sec["imageCaption"], "caption"))
                story.append(KeepTogether(fig_parts))

        if sec.get("dataTable"):
            dt = sec["dataTable"]
            if dt.get("caption"):
                story.append(P(dt["caption"], "caption"))
            ncols = max(len(dt["headers"]), 1)
            cw = [BODY_W / ncols] * ncols
            t_rows = [[P(h, "tbl_head") for h in dt["headers"]]]
            for r in dt["rows"]:
                t_rows.append([P(cell, "tbl_cell") for cell in r])
            tbl = Table(t_rows, colWidths=cw)
            tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#475569")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(KeepTogether([tbl, Spacer(1, 6)]))

        if sec.get("dialogue"):
            dlg_rows = []
            for line in sec["dialogue"]:
                dlg_rows.append([
                    P(f"【{line['speaker']}】", "dlg_speaker"),
                    P(line["text"], "dlg_text"),
                ])
            dlg_tbl = Table(dlg_rows, colWidths=[58, BODY_W - 58])
            dlg_tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#334155")),
                ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(KeepTogether([dlg_tbl, Spacer(1, 7)]))

        # Questions inside this Daimon
        for item in sec["items"]:
            slot = item.get("markSlot") or KATAKANA_SLOTS[min(slot_idx, len(KATAKANA_SLOTS) - 1)]
            slot_idx += 1
            diff_map = {
                "foundation": "★基礎",
                "kyotsu_standard": "★★共テ標準",
                "kyotsu_2ji": "★★★2次余裕",
            }
            diff_label = diff_map.get(item.get("difficulty", "kyotsu_standard"), "★★共テ標準")

            q_block: list = []
            q_head = (
                f'<font name="ChemSansBold">{escape(item["label"])}</font>　'
                f'{chem_markup(item["stem"])}　'
                f'<font name="ChemSansBold">［解答番号 【 {escape(slot)} 】｜配点 {item["points"]}点｜{diff_label}］</font>'
            )
            q_block.append(Paragraph(q_head, STYLES["stem"]))

            if item.get("imageUrl"):
                q_img = make_rl_image(item["imageUrl"], max_w=BODY_W * 0.82, max_h=132)
                if q_img:
                    q_block.append(q_img)
                    if item.get("imageCaption"):
                        q_block.append(P(item["imageCaption"], "caption"))

            for ci, ch_txt in enumerate(item["choices"]):
                q_block.append(
                    Paragraph(
                        f'<font name="ChemSansBold">{CIRCLED[ci]}</font>　{chem_markup(ch_txt)}',
                        STYLES["choice"],
                    )
                )
            q_block.append(Spacer(1, 8))
            story.append(KeepTogether(q_block))

        # Margin calculation scratchpad box at bottom of Daimon
        memo_tbl = Table(
            [[Paragraph(
                '<font name="ChemSansBold">【計算・構造式メモ余白】</font>　化学反応式の係数・mol収支・選択肢消去（① ② ③ ④）のメモ欄',
                ParagraphStyle("memo_p", fontName="ChemSerif", fontSize=7.8, leading=11.5, textColor=colors.HexColor("#64748b")),
            )]],
            colWidths=[BODY_W],
            rowHeights=[42],
        )
        memo_tbl.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.45, colors.HexColor("#94a3b8")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(memo_tbl)

    def draw_booklet_chrome(c: canvas.Canvas, doc) -> None:
        c.saveState()
        c.setStrokeColor(colors.black)
        c.setLineWidth(0.5)
        c.line(LEFT_M, H - 34, W - RIGHT_M, H - 34)
        c.line(LEFT_M, 34, W - RIGHT_M, 34)
        c.setFont("ChemSansBold", 8.2)
        c.drawString(LEFT_M, H - 26, f"まなとび共通テスト実戦模試｜{exam['title']}")
        c.drawRightString(W - RIGHT_M, H - 26, "【問題冊子】")
        c.setFont("ChemSerif", 8.2)
        c.drawCentredString(W / 2, 21, f"— {doc.page + 1} —")
        c.drawRightString(W - RIGHT_M, 21, "（下書き・計算余白自由）")
        c.restoreState()

    SimpleDocTemplate(
        str(body_tmp),
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=44,
        bottomMargin=42,
        pageCompression=1,
    ).build(story, onFirstPage=draw_booklet_chrome, onLaterPages=draw_booklet_chrome)

    pages = merge_pdfs([cover_tmp, body_tmp], path, f"{exam['title']} 問題冊子")
    cover_tmp.unlink(missing_ok=True)
    body_tmp.unlink(missing_ok=True)
    return pages


def build_mock_marksheet_pdf(path: Path, exam: dict) -> int:
    """Authentic Common Test Optical-Style Landscape A4 Mark Sheet (1 page, zero overlap)."""
    lw, lh = landscape(A4)
    c = canvas.Canvas(str(path), pagesize=(lw, lh), pageCompression=1, invariant=1)

    # Outer frame + timing alignment marks on left/right edges (authentic DNC OMR sheet feel)
    c.setStrokeColor(colors.HexColor("#0f766e"))
    c.setLineWidth(1.4)
    c.rect(28, 26, lw - 56, lh - 52, stroke=1, fill=0)

    c.setFillColor(colors.black)
    for idx in range(18):
        ty = lh - 68 - idx * 26
        if ty > 40:
            c.rect(14, ty, 8, 4.5, stroke=0, fill=1)
            c.rect(lw - 22, ty, 8, 4.5, stroke=0, fill=1)

    # Header band
    c.setFillColor(colors.HexColor("#0f766e"))
    c.rect(40, lh - 74, 118, 34, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("ChemSansBold", 13)
    c.drawCentredString(99, lh - 61, "共通テスト解答用紙")

    c.setFillColor(colors.black)
    short_title = re.sub(r"（.*?）", "", exam["title"]).strip()
    c.setFont("ChemSansBold", 13.0)
    c.drawString(166, lh - 55, f"{short_title}　マークシート解答用紙（A4横）")
    c.setFont("ChemSerif", 8.5)
    c.drawString(
        166,
        lh - 70,
        f"制限時間：{exam['timeLimitMinutes']}分　｜　満点：{exam['totalPoints']}点　｜　HB・Bの黒鉛筆で楕円枠内を濃く塗りつぶすこと",
    )

    # Candidate / Score box top-right
    c.setStrokeColor(colors.HexColor("#0f766e"))
    c.setLineWidth(0.8)
    c.rect(lw - 236, lh - 78, 196, 40, stroke=1, fill=0)
    c.setFont("ChemSerif", 8.6)
    c.drawString(lw - 228, lh - 54, "氏名：__________________")
    c.setFont("ChemSansBold", 10.2)
    c.drawString(lw - 228, lh - 71, f"自己採点：　　 ／ {exam['totalPoints']} 点")

    # Mark Sheet Columns (Left column: slots 1..10, Center column: slots 11..20, Right column: Daimon score summary & memo)
    flat_items = []
    s_idx = 0
    for sec in exam["sections"]:
        for it in sec["items"]:
            slot = it.get("markSlot") or KATAKANA_SLOTS[min(s_idx, len(KATAKANA_SLOTS) - 1)]
            flat_items.append((sec["daimonLabel"], it["label"], slot, it["points"]))
            s_idx += 1

    col_w = 248
    col_xs = [44, 308]
    top_y = lh - 102
    row_h = 34

    for col_no in range(2):
        chunk = flat_items[col_no * 8 : (col_no + 1) * 8]
        if not chunk:
            continue
        cx = col_xs[col_no]
        # Column header
        c.setFillColor(colors.HexColor("#e6f4f1"))
        c.setStrokeColor(colors.HexColor("#0f766e"))
        c.setLineWidth(0.8)
        c.rect(cx, top_y - 22, col_w, 22, stroke=1, fill=1)
        c.setFillColor(colors.HexColor("#064e3b"))
        c.setFont("ChemSansBold", 8.6)
        c.drawString(cx + 8, top_y - 15, "大問・設問")
        c.drawCentredString(cx + 86, top_y - 15, "解答番号")
        c.drawCentredString(cx + 168, top_y - 15, "マーク欄（①〜④）")
        c.drawRightString(cx + col_w - 6, top_y - 15, "配点")

        for r_i, (d_lbl, q_lbl, slot, pts) in enumerate(chunk):
            ry = top_y - 22 - (r_i + 1) * row_h
            if r_i % 2 == 1:
                c.setFillColor(colors.HexColor("#f8fafc"))
                c.rect(cx, ry, col_w, row_h, stroke=0, fill=1)
            c.setStrokeColor(colors.HexColor("#0f766e"))
            c.setLineWidth(0.55)
            c.rect(cx, ry, col_w, row_h, stroke=1, fill=0)

            c.setFillColor(colors.black)
            c.setFont("ChemSerif", 8.5)
            c.drawString(cx + 7, ry + 13, f"{d_lbl} {q_lbl}")

            # Bold katakana slot box
            c.setFillColor(colors.HexColor("#ecfdf5"))
            c.rect(cx + 68, ry + 6, 36, 22, stroke=1, fill=1)
            c.setFillColor(colors.HexColor("#064e3b"))
            c.setFont("ChemSansBold", 10.5)
            c.drawCentredString(cx + 86, ry + 13, slot)

            # 4 Optical Mark Ovals
            for opt_i in range(4):
                ox = cx + 122 + opt_i * 25
                oy = ry + 17
                c.setStrokeColor(colors.HexColor("#0f766e"))
                c.setFillColor(colors.white)
                c.setLineWidth(0.85)
                c.roundRect(ox - 8.5, oy - 9.5, 17, 19, 7.5, stroke=1, fill=1)
                c.setFillColor(colors.HexColor("#0f766e"))
                c.setFont("ChemSansBold", 8.5)
                c.drawCentredString(ox, oy - 3.2, str(opt_i + 1))

            c.setFillColor(colors.HexColor("#334155"))
            c.setFont("ChemSerif", 8.2)
            c.drawRightString(cx + col_w - 6, ry + 13, f"{pts}点")

    # Right Panel: Daimon Breakdown + Good/Bad Mark Example + Time Check
    rx = 574
    rw = lw - rx - 42
    c.setFillColor(colors.HexColor("#f0fdfa"))
    c.setStrokeColor(colors.HexColor("#0f766e"))
    c.setLineWidth(0.8)
    c.rect(rx, lh - 270, rw, 168, stroke=1, fill=1)
    c.setFillColor(colors.HexColor("#064e3b"))
    c.setFont("ChemSansBold", 9.6)
    c.drawString(rx + 10, lh - 118, "■ 大問別 得点・経過時間チェック欄")

    cy = lh - 138
    c.setFillColor(colors.black)
    for sec in exam["sections"]:
        s_pts = sum(it["points"] for it in sec["items"])
        r_min = sec.get("recommendedMinutes", 12)
        c.setFont("ChemSansBold", 8.8)
        c.drawString(rx + 10, cy, f"{sec['daimonLabel']}（目安{r_min}分）")
        c.setFont("ChemSerif", 8.8)
        c.drawRightString(rx + rw - 10, cy, f"　　 ／ {s_pts} 点（実測 　　分）")
        c.setLineWidth(0.3)
        c.line(rx + 10, cy - 4, rx + rw - 10, cy - 4)
        cy -= 22

    # Strategy checklist box bottom-right
    c.setFillColor(colors.HexColor("#fffbeb"))
    c.setStrokeColor(colors.HexColor("#b45309"))
    c.setLineWidth(0.75)
    c.rect(rx, 52, rw, lh - 336, stroke=1, fill=1)
    c.setFillColor(colors.HexColor("#78350f"))
    c.setFont("ChemSansBold", 9.2)
    c.drawString(rx + 10, lh - 300, "■ 共通テスト満点 最終見直し5項目")
    checks = [
        "□ 「誤りを含むもの」か「正しいもの」か設問文末尾を再確認したか",
        "□ mL→L（×10⁻³）、cm³→L、℃→K（+273）の単位変換漏れはないか",
        "□ 気体・電気分解で 2倍 / 1/2倍（O₂=4e⁻、HI=2x）の係数忘れはないか",
        "□ マーク欄（ア〜ト）の1段ズレ・塗り残しはないか",
        "□ 見直しフラグを立てた保留問題に必ず仮マークを入れたか",
    ]
    p_chk = Paragraph(
        "<br/>".join(chem_markup(x) for x in checks),
        ParagraphStyle("ms_chk", fontName="ChemSerif", fontSize=8.1, leading=14.8, wordWrap="CJK"),
    )
    _, ch_h = p_chk.wrap(rw - 20, 180)
    p_chk.drawOn(c, rx + 10, lh - 308 - ch_h)

    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("ChemSerif", 7.8)
    c.drawString(44, 34, "※印刷設定：「A4横・実際のサイズ（100%）」で出力すると本番マークシートに近い実寸で演習できます。")
    c.showPage()
    c.save()
    return 1


def build_mock_explanations_pdf(path: Path, exam: dict) -> int:
    """Answer Key Quick-Table + Step-by-Step Derivation + All 4-Choice Distractor Diagnoses."""
    story: list = []

    # Top Title Banner
    head_tbl = Table(
        [[
            Paragraph(f"{escape(exam['title'])}　【解答・詳解冊子】", STYLES["sum_title"]),
            Paragraph(f"{exam['totalPoints']}点満点 ／ 全問ステップ解法つき", STYLES["daimon_right"]),
        ]],
        colWidths=[BODY_W * 0.68, BODY_W * 0.32],
    )
    head_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ("BOX", (0, 0), (-1, -1), 0.9, colors.black),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(head_tbl)
    story.append(Spacer(1, 8))

    # Quick Answer Key Table (正答・配点・出題スキル一覧表)
    ans_rows = [[
        P("解答番号", "tbl_head"),
        P("大問・設問", "tbl_head"),
        P("正答", "tbl_head"),
        P("配点", "tbl_head"),
        P("難易度", "tbl_head"),
        P("測定スキル・過去問頻出テーマ", "tbl_head"),
    ]]
    s_idx = 0
    diff_jp = {"foundation": "★基礎", "kyotsu_standard": "★★標準", "kyotsu_2ji": "★★★2次余裕"}
    for sec in exam["sections"]:
        for it in sec["items"]:
            slot = it.get("markSlot") or KATAKANA_SLOTS[min(s_idx, len(KATAKANA_SLOTS) - 1)]
            s_idx += 1
            ans_rows.append([
                Paragraph(f'<font name="ChemSansBold">【 {escape(slot)} 】</font>', STYLES["tbl_cell"]),
                P(f"{sec['daimonLabel']} {it['label']}", "tbl_cell"),
                Paragraph(f'<font name="ChemSansBold">{CIRCLED[it["answer"]]}</font>', STYLES["tbl_cell"]),
                P(f"{it['points']}点", "tbl_cell"),
                P(diff_jp.get(it.get("difficulty", "kyotsu_standard"), "★★標準"), "tbl_cell"),
                P(it.get("skill", ""), "tbl_cell"),
            ])

    ans_tbl = Table(ans_rows, colWidths=[50, 62, 34, 34, 58, BODY_W - 238], repeatRows=1)
    ans_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#475569")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(ans_tbl)
    story.append(Spacer(1, 12))

    # Detailed per-item explanation blocks
    s_idx = 0
    for sec in exam["sections"]:
        sec_bar = Table(
            [[Paragraph(f"■ {escape(sec['daimonLabel'])}　{chem_markup(sec['title'])}　詳解", STYLES["daimon_bar"])]],
            colWidths=[BODY_W],
        )
        sec_bar.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 0.65, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(sec_bar)
        story.append(Spacer(1, 6))

        for it in sec["items"]:
            slot = it.get("markSlot") or KATAKANA_SLOTS[min(s_idx, len(KATAKANA_SLOTS) - 1)]
            s_idx += 1
            block: list = []
            block.append(Paragraph(
                f'{escape(it["label"])}　解答番号【 {escape(slot)} 】　正答：{CIRCLED[it["answer"]]}（配点 {it["points"]}点）｜テーマ：{chem_markup(it.get("skill", ""))}',
                STYLES["exp_head"],
            ))
            block.append(Spacer(1, 2))
            if it.get("steps"):
                for st_i, step_txt in enumerate(it["steps"], 1):
                    block.append(Paragraph(
                        f'<font name="ChemSansBold">Step {st_i}:</font> {chem_markup(step_txt)}',
                        STYLES["exp_step"],
                    ))
            block.append(P(it["explanation"], "exp_body"))
            for r_i, r_txt in enumerate(it["reasons"]):
                mark = "◎" if r_i == it["answer"] else "×"
                block.append(Paragraph(
                    f'<font name="ChemSansBold">{CIRCLED[r_i]} ({mark}):</font> {chem_markup(r_txt)}',
                    STYLES["exp_reason"],
                ))
            block.append(Spacer(1, 8))
            story.append(KeepTogether(block))

    def draw_exp_chrome(c: canvas.Canvas, doc) -> None:
        c.saveState()
        c.setStrokeColor(colors.black)
        c.setLineWidth(0.45)
        c.line(LEFT_M, H - 34, W - RIGHT_M, H - 34)
        c.line(LEFT_M, 34, W - RIGHT_M, 34)
        c.setFont("ChemSansBold", 8.2)
        c.drawString(LEFT_M, H - 26, f"まなとび共通テスト実戦模試｜{exam['title']}｜解答・解説冊子")
        c.drawRightString(W - RIGHT_M, 21, f"解説 {doc.page}")
        c.restoreState()

    SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=44,
        bottomMargin=42,
        pageCompression=1,
    ).build(story, onFirstPage=draw_exp_chrome, onLaterPages=draw_exp_chrome)

    with pymupdf.open(path) as d:
        return d.page_count


def build_course_summary_pdf(path: Path, course: dict, chapters: list[dict]) -> int:
    """1-Page-Per-Unit Crisp A4 Summary Sheet Compendium (公式・比較整理表・共通テストの急所) for a Course."""
    story: list = []

    for idx, ch in enumerate(chapters):
        if idx > 0:
            story.append(PageBreak())
        sheet = ch.get("summarySheet")
        if not sheet:
            continue

        # Unit Header Card
        unit_bar = Table(
            [[
                Paragraph(
                    f'<font size="8.5" color="#0f766e">{escape(course["label"])} ｜ {escape(ch["tabTitle"])}</font><br/>'
                    f'{chem_markup(ch["unitTitle"])}',
                    STYLES["sum_title"],
                ),
                Paragraph(
                    f'単元 {idx + 1} / {len(chapters)}<br/>確認演習：全{ch["subQuestionCount"]}問',
                    STYLES["daimon_right"],
                ),
            ]],
            colWidths=[BODY_W * 0.76, BODY_W * 0.24],
        )
        unit_bar.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdfa")),
            ("BOX", (0, 0), (-1, -1), 0.85, colors.HexColor("#0f766e")),
            ("LINEBEFORE", (0, 0), (0, 0), 4.5, colors.HexColor("#0f766e")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(unit_bar)
        story.append(Spacer(1, 6))

        # Core 1-line subtitle banner
        sub_box = Table(
            [[Paragraph(f"★ 核心：{chem_markup(sheet['subtitle'])}", STYLES["sum_sub"])]],
            colWidths=[BODY_W],
        )
        sub_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#93c5fd")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(sub_box)
        story.append(Spacer(1, 8))

        # Section 1: Key Formulas & Equations
        story.append(Paragraph("① 最重要公式・化学反応式・定義（即答チェック）", STYLES["exp_head"]))
        story.append(Spacer(1, 3))
        f_rows = []
        for f in sheet.get("formulas", []):
            note_part = f'　<font size="8" color="#475569">（{chem_markup(f["note"])}）</font>' if f.get("note") else ""
            f_rows.append([
                Paragraph(f'<font name="ChemSansBold" color="#0f766e">{chem_markup(f["label"])}</font>', STYLES["tbl_cell"]),
                Paragraph(f'<font name="ChemSansBold">{chem_markup(f["expr"])}</font>{note_part}', STYLES["tbl_cell"]),
            ])
        if f_rows:
            f_tbl = Table(f_rows, colWidths=[132, BODY_W - 132])
            f_tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0fdfa")),
                ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#5eead4")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(f_tbl)
            story.append(Spacer(1, 9))

        # Section 2: Comparison Table
        tbl_spec = sheet.get("table", {})
        story.append(Paragraph(f"② {chem_markup(tbl_spec.get('caption') or '比較・整理まとめ表')}", STYLES["exp_head"]))
        story.append(Spacer(1, 3))
        headers = tbl_spec.get("headers", [])
        ncols = max(len(headers), 1)
        if ncols == 3:
            cw = [BODY_W * 0.24, BODY_W * 0.34, BODY_W * 0.42]
        elif ncols == 4:
            cw = [BODY_W * 0.20, BODY_W * 0.22, BODY_W * 0.26, BODY_W * 0.32]
        else:
            cw = [BODY_W / ncols] * ncols

        t_rows = [[P(h, "tbl_head") for h in headers]]
        for r in tbl_spec.get("rows", []):
            t_rows.append([P(cell, "tbl_cell") for cell in r])
        c_tbl = Table(t_rows, colWidths=cw)
        c_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#475569")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(c_tbl)
        story.append(Spacer(1, 9))

        # Section 3: Common Test & Center Exam Traps
        story.append(Paragraph("③ センター試験〜共通テストの急所（ひっかけ秒殺ルール）", STYLES["exp_head"]))
        story.append(Spacer(1, 3))
        trap_rows = []
        for t_i, trap in enumerate(sheet.get("traps", []), 1):
            trap_rows.append([
                Paragraph(f'<font name="ChemSansBold" color="#92400e">急所 {t_i}</font>', STYLES["tbl_cell"]),
                P(trap, "tbl_cell"),
            ])
        if trap_rows:
            trap_tbl = Table(trap_rows, colWidths=[48, BODY_W - 48])
            trap_tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fffbeb")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#f59e0b")),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#fcd34d")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(trap_tbl)

    def draw_sum_chrome(c: canvas.Canvas, doc) -> None:
        c.saveState()
        c.setStrokeColor(colors.HexColor("#0f766e"))
        c.setLineWidth(0.5)
        c.line(LEFT_M, H - 32, W - RIGHT_M, H - 32)
        c.line(LEFT_M, 32, W - RIGHT_M, 32)
        c.setFont("ChemSansBold", 8.0)
        c.drawString(LEFT_M, H - 24, f"まなとび化学基礎・化学｜要点まとめプリント総集編｜{course['label']}")
        c.drawRightString(W - RIGHT_M, 20, f"{doc.page} / {len(chapters)}")
        c.drawString(LEFT_M, 20, "赤シート・直前見直し対応（A4実寸印刷推奨）")
        c.restoreState()

    SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=42,
        bottomMargin=40,
        pageCompression=1,
    ).build(story, onFirstPage=draw_sum_chrome, onLaterPages=draw_sum_chrome)

    with pymupdf.open(path) as d:
        return d.page_count


def build_past_exam_bible_pdf(path: Path, analysis: dict) -> int:
    """37-Year Center Exam (1990-2020) & Common Test (2021-2026) Complete Analysis & 100-Point Trap Bible PDF."""
    story: list = []

    banner = Table(
        [[
            Paragraph(
                "センター試験(1990-2020)〜共通テスト(2021-2026)<br/>37年過去問徹底分析＆満点突破バイブル",
                STYLES["sum_title"],
            ),
            Paragraph("全37年トレンド・正答率30%台の壁<br/>頻出ひっかけ18選 完全収録", STYLES["daimon_right"]),
        ]],
        colWidths=[BODY_W * 0.68, BODY_W * 0.32],
    )
    banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef3c7")),
        ("BOX", (0, 0), (-1, -1), 1.0, colors.HexColor("#92400e")),
        ("LINEBEFORE", (0, 0), (0, 0), 5.0, colors.HexColor("#b45309")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(banner)
    story.append(Spacer(1, 8))

    # Part 1: 3 Full-Score Tactics
    story.append(Paragraph("■ 第1部　共通テスト100点・化学基礎50点満点を獲り切る「3大実戦戦術」", STYLES["exp_head"]))
    story.append(Spacer(1, 4))
    for tac in analysis["tactics"]:
        bullets = "<br/>".join(f"・{chem_markup(b)}" for b in tac["bulletPoints"])
        t_box = Table(
            [
                [Paragraph(f'<font name="ChemSansBold" color="#92400e">【{escape(tac["stepNo"])}】 {chem_markup(tac["title"])}</font>', STYLES["tbl_cell"])],
                [Paragraph(f'{chem_markup(tac["summary"])}<br/>{bullets}', STYLES["tbl_cell"])],
            ],
            colWidths=[BODY_W],
        )
        t_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#fef3c7")),
            ("BACKGROUND", (0, 1), (0, 1), colors.HexColor("#fffbeb")),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#d97706")),
            ("LINEBELOW", (0, 0), (0, 0), 0.4, colors.HexColor("#d97706")),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(KeepTogether([t_box, Spacer(1, 6)]))

    # Part 2: Year-by-year Timeline Table
    story.append(Spacer(1, 4))
    story.append(Paragraph("■ 第2部　共通テスト(2021-2026)〜センター試験(1990-2020) 平均点・A/B/C内訳・合否分岐点", STYLES["exp_head"]))
    story.append(Spacer(1, 4))
    yr_rows = [[
        P("年度・区分", "tbl_head"),
        P("平均点", "tbl_head"),
        P("A/B/Cマーク比", "tbl_head"),
        P("最頻出テーマと「正答率30%台の合否分岐トラップ」", "tbl_head"),
    ]]
    for rec in analysis["timeline"]:
        yr_rows.append([
            Paragraph(f'<font name="ChemSansBold">{escape(rec["examLabel"])}</font>', STYLES["tbl_cell"]),
            P(f"化学 {rec['chemAvg']}点\n(基礎 {rec.get('basicAvg', '-')})", "tbl_cell"),
            P(rec["abcRatio"], "tbl_cell"),
            Paragraph(
                f'<font name="ChemSansBold">{chem_markup(rec["headline"])}</font><br/>'
                f'★要注意罠：{chem_markup(rec["lowAccuracyTrap"])}',
                STYLES["tbl_cell"],
            ),
        ])
    yr_tbl = Table(yr_rows, colWidths=[92, 58, 86, BODY_W - 236], repeatRows=1)
    yr_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#475569")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(yr_tbl)

    story.append(PageBreak())
    story.append(Paragraph("■ 第3部　センター31年＋共通テスト6年「歴代ひっかけ誤文＆秒殺ルール18選」", STYLES["exp_head"]))
    story.append(Spacer(1, 5))

    for tr in analysis["traps"]:
        tr_tbl = Table(
            [
                [
                    Paragraph(
                        f'<font name="ChemSansBold">Trap #{tr["no"]:02d} ［{escape(tr["eraTag"])}］ {chem_markup(tr["title"])}</font>',
                        STYLES["tbl_cell"],
                    ),
                    Paragraph(
                        f'出題年：{escape(tr["appearances"])} ｜ 目標 {tr["targetTimeSec"]}秒',
                        STYLES["daimon_right"],
                    ),
                ],
                [
                    Paragraph(
                        f'<font name="ChemSansBold" color="#991b1b">【典型誤文・罠】</font> {chem_markup(tr["wrongStatementExample"])}<br/>'
                        f'<font name="ChemSansBold" color="#065f46">【秒殺ルール】</font> {chem_markup(tr["instantKillRule"])}',
                        STYLES["tbl_cell"],
                    ),
                    "",
                ],
            ],
            colWidths=[BODY_W * 0.66, BODY_W * 0.34],
        )
        tr_tbl.setStyle(TableStyle([
            ("SPAN", (0, 1), (1, 1)),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("BOX", (0, 0), (-1, -1), 0.55, colors.HexColor("#334155")),
            ("LINEBELOW", (0, 0), (-1, 0), 0.4, colors.HexColor("#64748b")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(KeepTogether([tr_tbl, Spacer(1, 5)]))

    def draw_bible_chrome(c: canvas.Canvas, doc) -> None:
        c.saveState()
        c.setStrokeColor(colors.HexColor("#92400e"))
        c.setLineWidth(0.5)
        c.line(LEFT_M, H - 32, W - RIGHT_M, H - 32)
        c.line(LEFT_M, 32, W - RIGHT_M, 32)
        c.setFont("ChemSansBold", 8.0)
        c.drawString(LEFT_M, H - 24, "まなとび化学基礎・化学｜センター試験〜共通テスト37年過去問分析バイブル")
        c.drawRightString(W - RIGHT_M, 20, f"Page {doc.page}")
        c.restoreState()

    SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=42,
        bottomMargin=40,
        pageCompression=1,
    ).build(story, onFirstPage=draw_bible_chrome, onLaterPages=draw_bible_chrome)

    with pymupdf.open(path) as d:
        return d.page_count


def main() -> None:
    data = json.loads(SOURCE_JSON.read_text("utf-8"))
    catalog_entries: list[dict] = []

    # 1. Master 37-year Past Exam Analysis & Trap Bible PDF
    bible_id = "print_chem_past37_bible"
    bible_pdf = PRINTS_DIR / f"{bible_id}.pdf"
    bible_thumb = THUMBS_DIR / f"{bible_id}.webp"
    bible_pages = build_past_exam_bible_pdf(bible_pdf, data["pastAnalysis"])
    save_webp_thumb(bible_pdf, bible_thumb)
    bible_kb = max(1, round(bible_pdf.stat().st_size / 1024))
    catalog_entries.append({
        "id": bible_id,
        "kind": "bible",
        "title": "センター(1990-2020)〜共通テスト(2021-2026) 37年過去問分析＆満点バイブル",
        "subtitle": "年度別平均点・A/B/Cマーク比率・正答率30%台の壁・歴代ひっかけ誤文18選と秒殺ルール",
        "badge": "37年分析バイブル",
        "file": f"/prints/{bible_id}.pdf",
        "thumb": f"/prints/thumbs/{bible_id}.webp",
        "pages": bible_pages,
        "kb": bible_kb,
    })
    print(f"[chem-pdf] Built {bible_id}.pdf ({bible_pages}p, {bible_kb}KB)")

    # Also write print_level_eiken_howto.pdf so growthItems reward link resolves cleanly to chemistry guide
    howto_pdf = PRINTS_DIR / "print_level_eiken_howto.pdf"
    howto_thumb = THUMBS_DIR / "print_level_eiken_howto.webp"
    howto_pdf.write_bytes(bible_pdf.read_bytes())
    howto_thumb.write_bytes(bible_thumb.read_bytes())

    # 2. 8 Common Test Full Mock Exam Booklet Packs
    for exam in data["mockExams"]:
        base_id = f"print_{exam['id']}"
        q_pdf = PRINTS_DIR / f"{base_id}_questions.pdf"
        a_pdf = PRINTS_DIR / f"{base_id}_answers.pdf"
        e_pdf = PRINTS_DIR / f"{base_id}_explanations.pdf"
        full_pdf = PRINTS_DIR / f"{base_id}.pdf"
        thumb = THUMBS_DIR / f"{base_id}.webp"

        q_pages = build_mock_questions_pdf(q_pdf, exam)
        a_pages = build_mock_marksheet_pdf(a_pdf, exam)
        e_pages = build_mock_explanations_pdf(e_pdf, exam)
        full_pages = merge_pdfs([q_pdf, a_pdf, e_pdf], full_pdf, f"{exam['title']} フルセット")
        save_webp_thumb(q_pdf, thumb)

        catalog_entries.append({
            "id": base_id,
            "kind": "mock",
            "examId": exam["id"],
            "examCategory": exam["examCategory"],
            "round": exam["round"],
            "course": exam["course"],
            "title": f"{exam['title']}（本番形式冊子＋A4横マークシート＋詳解）",
            "subtitle": exam["subtitle"],
            "badge": f"{exam['timeLimitMinutes']}分・{exam['totalPoints']}点",
            "file": f"/prints/{base_id}.pdf",
            "thumb": f"/prints/thumbs/{base_id}.webp",
            "pages": full_pages,
            "kb": max(1, round(full_pdf.stat().st_size / 1024)),
            "variants": [
                {
                    "part": "questions",
                    "label": "問題冊子（表紙＋図表問題）",
                    "file": f"/prints/{base_id}_questions.pdf",
                    "pages": q_pages,
                    "kb": max(1, round(q_pdf.stat().st_size / 1024)),
                },
                {
                    "part": "answers",
                    "label": "マークシート解答用紙（A4横）",
                    "file": f"/prints/{base_id}_answers.pdf",
                    "pages": a_pages,
                    "kb": max(1, round(a_pdf.stat().st_size / 1024)),
                },
                {
                    "part": "explanations",
                    "label": "正答一覧・ステップ詳解冊子",
                    "file": f"/prints/{base_id}_explanations.pdf",
                    "pages": e_pages,
                    "kb": max(1, round(e_pdf.stat().st_size / 1024)),
                },
            ],
        })
        print(f"[chem-pdf] Built {base_id}: Q={q_pages}p, A={a_pages}p, E={e_pages}p, Full={full_pages}p")

    # 3. 6 Course Summary Sheet Compendium PDFs (全114単元のまとめプリント完全収録)
    for course in data["courses"]:
        cid = course["id"]
        c_chaps = [ch for ch in data["chapters"] if ch["course"] == cid]
        sum_id = f"print_summary_{cid}"
        sum_pdf = PRINTS_DIR / f"{sum_id}.pdf"
        sum_thumb = THUMBS_DIR / f"{sum_id}.webp"
        sum_pages = build_course_summary_pdf(sum_pdf, course, c_chaps)
        save_webp_thumb(sum_pdf, sum_thumb)
        sum_kb = max(1, round(sum_pdf.stat().st_size / 1024))
        unit_page_map = {ch["id"]: idx + 1 for idx, ch in enumerate(c_chaps)}
        catalog_entries.append({
            "id": sum_id,
            "kind": "summary",
            "course": cid,
            "title": f"{course['label']}｜全{len(c_chaps)}単元 要点まとめプリント総集編",
            "subtitle": f"{course['tagline']}（1単元1ページ完結・公式＋比較整理表＋共通テストの急所）",
            "badge": f"全{len(c_chaps)}単元収録",
            "file": f"/prints/{sum_id}.pdf",
            "thumb": f"/prints/thumbs/{sum_id}.webp",
            "pages": sum_pages,
            "kb": sum_kb,
            "unitPageMap": unit_page_map,
        })
        print(f"[chem-pdf] Built {sum_id}.pdf ({sum_pages}p, {sum_kb}KB)")

    # Emit TypeScript metadata catalog
    ts_code = (
        "// Auto-generated by scripts/build-chemistry-pdfs.py — DO NOT EDIT MANUALLY\n"
        "export interface ChemPdfVariant {\n"
        "  part: 'questions' | 'answers' | 'explanations';\n"
        "  label: string;\n"
        "  file: string;\n"
        "  pages: number;\n"
        "  kb: number;\n"
        "}\n\n"
        "export interface ChemPdfEntry {\n"
        "  id: string;\n"
        "  kind: 'bible' | 'mock' | 'summary';\n"
        "  examId?: string;\n"
        "  examCategory?: 'basic' | 'advanced';\n"
        "  round?: number;\n"
        "  course?: string;\n"
        "  title: string;\n"
        "  subtitle: string;\n"
        "  badge: string;\n"
        "  file: string;\n"
        "  thumb: string;\n"
        "  pages: number;\n"
        "  kb: number;\n"
        "  variants?: readonly ChemPdfVariant[];\n"
        "  unitPageMap?: Readonly<Record<string, number>>;\n"
        "}\n\n"
        f"export const CHEM_PDF_CATALOG: readonly ChemPdfEntry[] = {json.dumps(catalog_entries, ensure_ascii=False, indent=2)};\n"
    )
    GEN_TS.write_text(ts_code, "utf-8")
    print(f"[chem-pdf] Wrote {GEN_TS} ({len(catalog_entries)} entries)")


if __name__ == "__main__":
    main()
