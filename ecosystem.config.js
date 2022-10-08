module.exports = {
    apps : [
        {
          name: "app",
          script: "app.js",
          watch: true,
          env_dev: {
            "PORT": 8890,
            "NODE_ENV": "development"
          },
          env_uat: {
            "PORT": 8890,
            "NODE_ENV": "uat"
          },
          env_production: {
            "PORT": 8890,
            "NODE_ENV": "production",
          }
        }
    ]
  }