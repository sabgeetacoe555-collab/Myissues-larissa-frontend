module.exports = {
  apps: [{
    name: 'larissa-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/larissaai.ca',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: '/var/log/pm2/larissa-frontend-error.log',
    out_file: '/var/log/pm2/larissa-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
  }]
}
