# Azure Deployment Guide

This guide will help you deploy the Finance Quiz Backend to Azure with CosmosDB.

## 🚀 Prerequisites

- Azure subscription
- Azure CLI installed
- Node.js 18+ (for local testing)
- Git repository with the backend code

## 📋 Step 1: Azure Resource Setup

### 1.1 Create Resource Group
```bash
# Create resource group
az group create --name finance-quiz-rg --location eastus

# Set as default resource group
az config set defaults.group=finance-quiz-rg
```

### 1.2 Create CosmosDB Account
```bash
# Create CosmosDB account
az cosmosdb create \
  --name finance-quiz-cosmos \
  --resource-group finance-quiz-rg \
  --kind MongoDB \
  --capabilities EnableMongo \
  --locations regionName=eastus failoverPriority=0 isZoneRedundant=false

# Get the connection string
az cosmosdb keys list \
  --name finance-quiz-cosmos \
  --resource-group finance-quiz-rg \
  --type connection-strings
```

### 1.3 Create App Service Plan
```bash
# Create App Service Plan (B1 for development, P1V2 for production)
az appservice plan create \
  --name finance-quiz-plan \
  --resource-group finance-quiz-rg \
  --sku B1 \
  --is-linux
```

### 1.4 Create Web App
```bash
# Create web app
az webapp create \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --plan finance-quiz-plan \
  --runtime "NODE|18-lts"
```

## 🔧 Step 2: Configure Environment Variables

### 2.1 Set Application Settings
```bash
# Set environment variables
az webapp config appsettings set \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    MONGODB_URI="<your-cosmosdb-connection-string>" \
    JWT_SECRET="<your-super-secret-jwt-key>" \
    JWT_EXPIRES_IN=24h \
    CORS_ORIGIN="<your-frontend-url>" \
    DEFAULT_ADMIN_USERNAME=admin \
    DEFAULT_ADMIN_PASSWORD=admin123
```

### 2.2 Configure CORS (if needed)
```bash
# Add CORS settings
az webapp cors add \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --allowed-origins "<your-frontend-url>"
```

## 📦 Step 3: Deploy Application

### 3.1 Using Azure CLI
```bash
# Navigate to backend directory
cd backend

# Deploy using Azure CLI
az webapp deployment source config-local-git \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg

# Get deployment URL
az webapp deployment list-publishing-credentials \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg

# Deploy using Git
git add .
git commit -m "Deploy to Azure"
git push azure main
```

### 3.2 Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'finance-quiz-api'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

### 3.3 Using VS Code Azure Extension
1. Install Azure App Service extension
2. Right-click on your backend folder
3. Select "Deploy to Web App"
4. Choose your web app

## 🗄️ Step 4: Database Setup

### 4.1 Seed the Database
```bash
# Connect to your deployed app
az webapp ssh --name finance-quiz-api --resource-group finance-quiz-rg

# Run the seeder
npm run seed
```

### 4.2 Verify Database Connection
```bash
# Check application logs
az webapp log tail --name finance-quiz-api --resource-group finance-quiz-rg
```

## 🔍 Step 5: Testing

### 5.1 Health Check
```bash
curl https://finance-quiz-api.azurewebsites.net/health
```

### 5.2 API Documentation
```bash
curl https://finance-quiz-api.azurewebsites.net/api
```

### 5.3 Test Authentication
```bash
# Test admin login
curl -X POST https://finance-quiz-api.azurewebsites.net/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🔧 Step 6: Configuration

### 6.1 Custom Domain (Optional)
```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --hostname api.yourdomain.com
```

### 6.2 SSL Certificate
```bash
# Bind SSL certificate
az webapp config ssl bind \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg
```

### 6.3 Application Insights (Optional)
```bash
# Create Application Insights
az monitor app-insights component create \
  --app finance-quiz-insights \
  --location eastus \
  --resource-group finance-quiz-rg \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app finance-quiz-insights \
  --resource-group finance-quiz-rg \
  --query instrumentationKey
```

## 📊 Step 7: Monitoring

### 7.1 Enable Logging
```bash
# Enable application logging
az webapp log config \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --web-server-logging filesystem
```

### 7.2 View Logs
```bash
# Stream logs
az webapp log tail --name finance-quiz-api --resource-group finance-quiz-rg

# Download logs
az webapp log download --name finance-quiz-api --resource-group finance-quiz-rg
```

## 🔄 Step 8: Updates

### 8.1 Deploy Updates
```bash
# Deploy new version
git add .
git commit -m "Update application"
git push azure main
```

### 8.2 Rollback (if needed)
```bash
# List deployments
az webapp deployment list --name finance-quiz-api --resource-group finance-quiz-rg

# Rollback to previous deployment
az webapp deployment source config --name finance-quiz-api --resource-group finance-quiz-rg --repo-url <previous-deployment-url>
```

## 🛡️ Step 9: Security

### 9.1 Network Security
```bash
# Configure IP restrictions
az webapp config access-restriction add \
  --name finance-quiz-api \
  --resource-group finance-quiz-rg \
  --rule-name "Allow Frontend" \
  --action Allow \
  --ip-address <frontend-ip>
```

### 9.2 Environment Variables Security
- Use Azure Key Vault for sensitive data
- Rotate JWT secrets regularly
- Use managed identities for database access

## 📈 Step 10: Scaling

### 10.1 Auto Scaling
```bash
# Enable auto scaling
az monitor autoscale create \
  --resource-group finance-quiz-rg \
  --resource /subscriptions/<subscription-id>/resourceGroups/finance-quiz-rg/providers/Microsoft.Web/serverFarms/finance-quiz-plan \
  --resource-type Microsoft.Web/serverFarms \
  --name finance-quiz-autoscale \
  --min-count 1 \
  --max-count 10 \
  --count 1
```

### 10.2 Manual Scaling
```bash
# Scale up/down
az appservice plan update \
  --name finance-quiz-plan \
  --resource-group finance-quiz-rg \
  --sku P1V2
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check CosmosDB connection string
   - Verify network access
   - Check firewall rules

2. **CORS Errors**
   - Verify CORS_ORIGIN setting
   - Check frontend URL configuration

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings

4. **Performance Issues**
   - Monitor CosmosDB RU consumption
   - Check application logs
   - Consider scaling up

### Useful Commands
```bash
# Restart app
az webapp restart --name finance-quiz-api --resource-group finance-quiz-rg

# Check app status
az webapp show --name finance-quiz-api --resource-group finance-quiz-rg

# View configuration
az webapp config show --name finance-quiz-api --resource-group finance-quiz-rg
```

## 📞 Support

- Azure Documentation: https://docs.microsoft.com/azure/
- CosmosDB Documentation: https://docs.microsoft.com/azure/cosmos-db/
- App Service Documentation: https://docs.microsoft.com/azure/app-service/ 