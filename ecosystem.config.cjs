module.exports = {
  apps: [
    {
      name: 'manatobi-chemistry',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 3000 --strictPort',
      cwd: '/home/user/webapp/eiken-app',
      env: { NODE_ENV: 'production', PORT: 3000 },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
}
