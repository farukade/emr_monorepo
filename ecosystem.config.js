module.exports = {
  apps: [
    {
      name: 'api',
      exec_mode: 'cluster',
      instances: 'max',
      script: './dist/main.js',
      args: '',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'prod',
      },
    },
  ],
};
