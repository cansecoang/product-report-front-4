# Azure App Service Deployment Instructions for Next.js

## Quick Start

1. **Environment Variables**: Configure in Azure Portal > App Service > Configuration > Application Settings
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   WEBSITE_NODE_DEFAULT_VERSION=22-lts
   ```

2. **Deploy**: Push to main branch - GitHub Actions will automatically deploy

## Prerequisites

- Azure App Service with Node.js runtime
- PostgreSQL database (Azure Database for PostgreSQL recommended)
- GitHub repository connected to Azure App Service

## Environment Variables Configuration

### Required Variables
```bash
# Database (choose one option)
DATABASE_URL=postgresql://username:password@host:5432/database

# OR individual variables
DB_HOST=your-host.postgres.database.azure.com
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password

# Azure App Service
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=22-lts
```

### Setting Environment Variables in Azure

#### Via Azure Portal:
1. Go to Azure Portal > App Services > Your App
2. Select Configuration > Application Settings
3. Add each variable with "+ New application setting"
4. Click Save and restart the app

#### Via Azure CLI:
```bash
# Set database connection
az webapp config appsettings set --resource-group myResourceGroup --name bioFincas00 --settings DATABASE_URL="your_connection_string"

# Set Node.js version
az webapp config appsettings set --resource-group myResourceGroup --name bioFincas00 --settings WEBSITE_NODE_DEFAULT_VERSION="22-lts"
```

## Database Setup

### Azure Database for PostgreSQL
1. Create Azure Database for PostgreSQL server
2. Configure firewall to allow Azure services
3. Create database and user
4. Use connection string format:
   ```
   DATABASE_URL=postgresql://username%40servername:password@servername.postgres.database.azure.com:5432/database?sslmode=require
   ```

### SSL Configuration
SSL is automatically enabled for cloud databases. The application detects Azure environment and applies proper SSL settings.

## Deployment Process

The GitHub Actions workflow (`main_biofincas00.yml`) automatically:
1. Installs dependencies
2. Builds the Next.js application
3. Creates deployment package
4. Deploys to Azure App Service

### Manual Deployment (Alternative)
```bash
# Build the application
npm run build

# Deploy using Azure CLI
az webapp deployment source config-zip --resource-group myResourceGroup --name bioFincas00 --src deployment.zip
```

## Troubleshooting

### Common Issues

1. **Build Fails**: 
   - Check environment variables are set
   - Verify database connectivity
   - Review build logs in Azure Portal

2. **Database Connection Error**:
   - Verify connection string format
   - Check firewall settings
   - Ensure SSL is properly configured

3. **Application Not Starting**:
   - Check Node.js version in Azure
   - Verify `server.js` exists
   - Review application logs

### Viewing Logs
```bash
# Stream logs
az webapp log tail --resource-group myResourceGroup --name bioFincas00

# Download logs
az webapp log download --resource-group myResourceGroup --name bioFincas00
```

## Performance Optimization

### Recommended Azure App Service Settings
- **Runtime**: Node.js 22 LTS
- **Platform**: 64-bit
- **Always On**: Enabled (for production)
- **ARR Affinity**: Disabled (for better load balancing)

### Database Optimization
- Use connection pooling (already configured)
- Enable SSL/TLS
- Configure appropriate service tier for expected load

## Security Considerations

- Environment variables are encrypted in Azure
- SSL/TLS enforced for database connections
- Security headers configured in `next.config.ts`
- No sensitive data in source code

## Monitoring and Health Checks

Azure Application Insights is recommended for monitoring:
1. Enable Application Insights in Azure Portal
2. Add instrumentation key to App Settings
3. Monitor performance and errors

Health check endpoint: `https://your-app.azurewebsites.net/api/db-test`

## Scaling

Azure App Service supports:
- **Scale Up**: Increase instance size
- **Scale Out**: Add more instances
- **Auto Scale**: Based on CPU/memory usage

## Backup and Recovery

- Database: Use Azure Database backup features
- Application: Source code in GitHub serves as backup
- Environment Variables: Export from Azure CLI or Portal