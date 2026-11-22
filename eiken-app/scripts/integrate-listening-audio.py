"""Validate and integrate recorded Eiken Listening MP3 archives across all grades (`eiken_5`, `eiken_4`, `eiken_3`, `eiken_2`, ...):
1) Reads `deliverables/listening-booklets.json` for all 8 grades x 15 rounds (3,285 audio units).
2) Scans:
   - Existing `public/eiken_audio/<grade>/<audioId>.mp3` (preserves already-transcoded MP3s when source archives are absent)
   - `/home/user/*_audio_persist/` (e.g., `/home/user/g5_audio_persist/`) for `<audioId>.mp3` and optional `対応表.csv`
   - Uploaded ZIP archives in `/home/user/uploaded_files/` (`*.zip` containing `eiken_*_listening_*.mp3`, such as `英検4級_3級_音声のみ.zip`, `eiken_2_累計450件_一括納品.zip`, `eiken_5_listening_r01-r15_375mp3.zip`, and any future `eiken_pre2` / `eiken_pre2plus` / `eiken_pre1` / `eiken_1` ZIPs)
3) Verifies every MP3 against canonical `audioId`s, transcodes speech MP3s cleanly to crisp 24 kHz mono 48 kbps CBR MP3 under `public/eiken_audio/<grade>/<audioId>.mp3` (streaming directly from ZIP without extracting gigabytes to disk; skips already-valid outputs for fast incremental runs).
4) Generates `src/eiken/listeningAudio.generated.ts` exporting `LISTENING_AUDIO_URLS: Readonly<Record<string, string>>` and writes `deliverables/eiken_listening_audio_audit.json`.
"""
from concurrent.futures import ThreadPoolExecutor
import csv
import json
import subprocess
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
DELIV = ROOT / 'deliverables'
UP_DIR = Path('/home/user/uploaded_files')
OUT_BASE = PUBLIC / 'eiken_audio'
OUT_BASE.mkdir(parents=True, exist_ok=True)

BOOKLETS = json.loads((DELIV / 'listening-booklets.json').read_text('utf-8'))['booklets']

# 1. Discover local file sources in /home/user/*_audio_persist
PERSIST_DIRS = sorted(Path('/home/user').glob('*_audio_persist'))
src_mp3_by_id: dict[str, Path] = {}
csv_rows_by_id: dict[str, dict[str, str]] = {}

for pdir in PERSIST_DIRS:
    for mp3 in sorted(pdir.rglob('*.mp3')):
        src_mp3_by_id[mp3.stem] = mp3
    for csv_path in sorted(pdir.rglob('*.csv')):
        try:
            with csv_path.open('r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                if reader.fieldnames and '音源ID' in reader.fieldnames:
                    for row in reader:
                        aid = (row.get('音源ID') or '').strip()
                        if aid:
                            csv_rows_by_id[aid] = row
        except Exception as exc:
            print(f'[warn] Could not parse CSV {csv_path}: {exc}')

# 2. Discover MP3 entries inside uploaded ZIP archives (/home/user/uploaded_files/*.zip)
zip_mp3_by_id: dict[str, tuple[Path, str]] = {}
if UP_DIR.exists():
    for zp in sorted(UP_DIR.glob('*.zip')):
        try:
            with zipfile.ZipFile(zp) as zf:
                for entry in zf.namelist():
                    if entry.endswith('/') or not entry.lower().endswith('.mp3'):
                        continue
                    stem = Path(entry).stem
                    if stem.startswith('eiken_') and '_listening_' in stem:
                        zip_mp3_by_id[stem] = (zp, entry)
        except Exception as exc:
            print(f'[warn] Could not inspect ZIP {zp}: {exc}')

expected_units: dict[str, dict] = {}
for exam in BOOKLETS:
    grade = exam['grade']
    rnd = exam['round']
    for unit in exam['units']:
        aid = unit['audioId']
        norm_roles: list[str] = []
        for t in unit['turns']:
            rl = t['roleLabel']
            sp = t['speaker']
            if rl == 'Narrator':
                if not norm_roles or norm_roles[-1] != 'Narrator':
                    norm_roles.append('Narrator')
            elif sp.startswith('M'):
                norm_roles.append('Man')
            elif sp.startswith('F'):
                norm_roles.append('Woman')
            else:
                norm_roles.append(rl)
        expected_units[aid] = {
            'grade': grade,
            'round': rnd,
            'part': unit['part'],
            'questionNumber': unit['questions'][0]['questionNumber'],
            'normRoles': norm_roles,
        }

jobs: list[tuple[str, str, Path | None, tuple[Path, str] | None, Path]] = []
audit_by_grade: dict[str, dict] = {}
mismatches: list[dict] = []

for aid, meta in sorted(expected_units.items()):
    grade = meta['grade']
    g_stat = audit_by_grade.setdefault(
        grade,
        {'expectedUnits': 0, 'integratedUnits': 0, 'csvVerifiedUnits': 0, 'mismatches': 0},
    )
    g_stat['expectedUnits'] += 1

    out_dir = OUT_BASE / grade
    out_dir.mkdir(parents=True, exist_ok=True)
    dst = out_dir / f'{aid}.mp3'

    src_path = src_mp3_by_id.get(aid)
    zip_ref = zip_mp3_by_id.get(aid)
    already_exists = dst.exists() and dst.stat().st_size >= 1000

    if not src_path and not zip_ref and not already_exists:
        continue

    row = csv_rows_by_id.get(aid)
    if row:
        csv_round = int(row['回'])
        csv_part = f"part{row['Part'].strip()}"
        csv_qno = int(row['actual_no'])
        csv_roles = [r.strip() for r in row['原稿上の役割'].split('/') if r.strip()]
        if (
            csv_round != meta['round']
            or csv_part != meta['part']
            or csv_qno != meta['questionNumber']
            or csv_roles != meta['normRoles']
        ):
            mismatches.append({
                'audioId': aid,
                'expected': meta,
                'csv': row,
            })
            g_stat['mismatches'] += 1
            continue
        g_stat['csvVerifiedUnits'] += 1

    jobs.append((aid, grade, src_path, zip_ref, dst))
    g_stat['integratedUnits'] += 1

if mismatches:
    raise SystemExit(f'Found {len(mismatches)} audio mapping mismatches: {mismatches[:3]}')


def transcode_one(item: tuple[str, str, Path | None, tuple[Path, str] | None, Path]) -> tuple[str, str, int, float]:
    aid, grade, src_path, zip_ref, dst = item
    if not dst.exists() or dst.stat().st_size < 1000:
        if src_path and src_path.exists():
            subprocess.run(
                [
                    'ffmpeg',
                    '-y',
                    '-v',
                    'error',
                    '-i',
                    str(src_path),
                    '-vn',
                    '-ac',
                    '1',
                    '-ar',
                    '24000',
                    '-c:a',
                    'libmp3lame',
                    '-b:a',
                    '48k',
                    str(dst),
                ],
                check=True,
            )
        elif zip_ref is not None:
            zp, entry = zip_ref
            with zipfile.ZipFile(zp) as zf:
                raw_mp3 = zf.read(entry)
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=True) as tmp_in:
                tmp_in.write(raw_mp3)
                tmp_in.flush()
                subprocess.run(
                    [
                        'ffmpeg',
                        '-y',
                        '-v',
                        'error',
                        '-i',
                        tmp_in.name,
                        '-vn',
                        '-ac',
                        '1',
                        '-ar',
                        '24000',
                        '-c:a',
                        'libmp3lame',
                        '-b:a',
                        '48k',
                        str(dst),
                    ],
                    check=True,
                )
        else:
            raise FileNotFoundError(f'No audio source for {aid}')

    probe = subprocess.check_output(
        [
            'ffprobe',
            '-v',
            'error',
            '-show_entries',
            'format=duration:stream=codec_name,sample_rate,channels',
            '-of',
            'json',
            str(dst),
        ],
        text=True,
    )
    info = json.loads(probe)
    dur = float(info['format']['duration'])
    st = info['streams'][0]
    if st.get('codec_name') != 'mp3' or int(st.get('sample_rate', 0)) != 24000 or int(st.get('channels', 0)) != 1:
        raise RuntimeError(f'Audio stream spec mismatch on {dst}: {st}')
    if dur < 3.0 or dur > 300.0:
        raise RuntimeError(f'Abnormal audio duration on {dst}: {dur:.2f}s')
    return aid, f'/eiken_audio/{grade}/{aid}.mp3', dst.stat().st_size, dur


audio_url_map: dict[str, str] = {}
total_bytes = 0
durations_by_grade: dict[str, list[float]] = {}

with ThreadPoolExecutor(max_workers=4) as pool:
    for aid, web_url, sz, dur in pool.map(transcode_one, jobs):
        audio_url_map[aid] = web_url
        total_bytes += sz
        g = expected_units[aid]['grade']
        durations_by_grade.setdefault(g, []).append(dur)

for g, durs in durations_by_grade.items():
    audit_by_grade[g]['minDurationSec'] = round(min(durs), 2)
    audit_by_grade[g]['maxDurationSec'] = round(max(durs), 2)
    audit_by_grade[g]['avgDurationSec'] = round(sum(durs) / len(durs), 2)

summary_parts = [
    f"{g}: {st['integratedUnits']}/{st['expectedUnits']}"
    for g, st in sorted(audit_by_grade.items())
    if st['integratedUnits'] > 0
]
header_comment = ' | '.join(summary_parts) if summary_parts else 'none yet'

gen_ts = ROOT / 'src/eiken/listeningAudio.generated.ts'
json_literal = json.dumps(json.dumps(audio_url_map, sort_keys=True))
gen_ts.write_text(
    f'// Auto-generated by scripts/integrate-listening-audio.py\n'
    f'// Integrated recorded MP3 units: {len(audio_url_map)} ({header_comment}) — Manus AI commercial-OK\n'
    f'export const LISTENING_AUDIO_URLS: Readonly<Record<string, string>> = JSON.parse(\n'
    f'  {json_literal}\n'
    f') as Readonly<Record<string, string>>;\n',
    'utf-8',
)

audit_report = {
    'totalIntegratedUnits': len(audio_url_map),
    'totalPublicAudioMB': round(total_bytes / (1024 * 1024), 2),
    'sourceLicense': 'Manus AI generated (user-confirmed commercial use OK, non-official original script)',
    'grades': audit_by_grade,
}
(DELIV / 'eiken_listening_audio_audit.json').write_text(
    json.dumps(audit_report, indent=2, ensure_ascii=False) + '\n',
    'utf-8',
)

print(
    f'Integrated {len(audio_url_map)} MP3 files ({total_bytes / (1024 * 1024):.2f} MB total) -> {gen_ts.relative_to(ROOT)}'
)
for g, st in sorted(audit_by_grade.items()):
    if st['integratedUnits'] > 0:
        print(f"  {g}: {st['integratedUnits']}/{st['expectedUnits']} integrated (CSV verified: {st['csvVerifiedUnits']}, mismatches: {st['mismatches']})")
