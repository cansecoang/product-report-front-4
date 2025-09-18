#!/bin/bash

# Azure App Service Deployment Script
# This script helps deploy the Next.js application to Azure App Service

set -e

echo "🚀 Azure App Service Deployment Script"
echo "======================================"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Configuration variables
RESOURCE_GROUP="bioFincas-rg"
APP_NAME="bioFincas00"
NODE_VERSION="22-lts"

echo "📋 Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Name: $APP_NAME"
echo "   Node Version: $NODE_VERSION"

# Function to check if user is logged in to Azure
check_azure_login() {
    if ! az account show &> /dev/null; then
        echo "❌ Not logged in to Azure. Please log in first:"
        echo "   az login"
        exit 1
    fi
    echo "✅ Azure CLI authenticated"
}

# Function to set environment variables
set_environment_variables() {
    echo ""
    echo "🔧 Setting Environment Variables..."
    
    # Check if DATABASE_URL is provided
    if [ -z "$DATABASE_URL" ]; then
        echo "⚠️  DATABASE_URL not set as environment variable"
        echo "   Please set it manually in Azure Portal or provide it:"
        echo "   export DATABASE_URL='postgresql://user:pass@host:5432/db'"
        echo ""
        echo "   Or set individual DB variables:"
        echo "   export DB_HOST='your-host.postgres.database.azure.com'"
        echo "   export DB_USER='your-username'"
        echo "   export DB_PASSWORD='your-password'"
        echo "   export DB_NAME='your-database'"
    else
        echo "✅ Setting DATABASE_URL..."
        az webapp config appsettings set \
            --resource-group "$RESOURCE_GROUP" \
            --name "$APP_NAME" \
            --settings DATABASE_URL="$DATABASE_URL" \
            --output none
    fi
    
    # Set Node.js version
    echo "✅ Setting Node.js version to $NODE_VERSION..."
    az webapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" \
        --settings WEBSITE_NODE_DEFAULT_VERSION="$NODE_VERSION" \
        --output none
    
    # Set production environment
    echo "✅ Setting NODE_ENV to production..."
    az webapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" \
        --settings NODE_ENV="production" \
        --output none
        
    # Set individual DB variables if provided
    if [ ! -z "$DB_HOST" ]; then
        echo "✅ Setting individual database variables..."
        az webapp config appsettings set \
            --resource-group "$RESOURCE_GROUP" \
            --name "$APP_NAME" \
            --settings \
                DB_HOST="$DB_HOST" \
                DB_USER="$DB_USER" \
                DB_PASSWORD="$DB_PASSWORD" \
                DB_NAME="$DB_NAME" \
                DB_PORT="${DB_PORT:-5432}" \
            --output none
    fi
}

# Function to deploy application
deploy_application() {
    echo ""
    echo "📦 Building and Deploying Application..."
    
    # Install dependencies
    echo "✅ Installing dependencies..."
    npm ci
    
    # Build application
    echo "✅ Building Next.js application..."
    npm run build
    
    # Create deployment package
    echo "✅ Creating deployment package..."
    
    # Create temporary deployment directory
    rm -rf deploy-temp
    mkdir -p deploy-temp
    
    # Copy necessary files
    cp -r .next deploy-temp/
    cp -r public deploy-temp/ 2>/dev/null || echo "No public directory found"
    cp package*.json deploy-temp/
    cp server.js deploy-temp/
    cp web.config deploy-temp/
    cp next.config.ts deploy-temp/ 2>/dev/null || echo "No next.config.ts found"
    
    # Copy src directory (needed for runtime)
    mkdir -p deploy-temp/src
    cp -r src deploy-temp/ 2>/dev/null || echo "No src directory found"
    
    # Create zip file
    cd deploy-temp
    zip -r ../deployment.zip . -x "*.git*" "node_modules/*" ".next/cache/*"
    cd ..
    
    # Deploy to Azure
    echo "✅ Deploying to Azure App Service..."
    az webapp deployment source config-zip \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" \
        --src deployment.zip
    
    # Cleanup
    rm -rf deploy-temp deployment.zip
    
    echo "✅ Deployment completed!"
}

# Function to verify deployment
verify_deployment() {
    echo ""
    echo "🔍 Verifying Deployment..."
    
    APP_URL="https://$APP_NAME.azurewebsites.net"
    echo "   App URL: $APP_URL"
    echo "   Health Check: $APP_URL/api/db-test"
    
    # Wait for app to start
    echo "⏳ Waiting for application to start..."
    sleep 30
    
    # Test health endpoint
    if curl -sf "$APP_URL/api/db-test" > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed. Please check Azure logs:"
        echo "   az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
    fi
}

# Main execution
main() {
    check_azure_login
    set_environment_variables
    deploy_application
    verify_deployment
    
    echo ""
    echo "🎉 Deployment process completed!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your app: https://$APP_NAME.azurewebsites.net"
    echo "2. Monitor logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
    echo "3. Configure custom domain if needed"
    echo ""
}

# Show usage if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: ./deploy-azure.sh"
    echo ""
    echo "Environment Variables (optional):"
    echo "  DATABASE_URL    - Full PostgreSQL connection string"
    echo "  DB_HOST         - Database host"
    echo "  DB_USER         - Database username" 
    echo "  DB_PASSWORD     - Database password"
    echo "  DB_NAME         - Database name"
    echo "  DB_PORT         - Database port (default: 5432)"
    echo ""
    echo "Examples:"
    echo "  # Using DATABASE_URL"
    echo "  export DATABASE_URL='postgresql://user:pass@host:5432/db'"
    echo "  ./deploy-azure.sh"
    echo ""
    echo "  # Using individual variables"
    echo "  export DB_HOST='server.postgres.database.azure.com'"
    echo "  export DB_USER='username'"
    echo "  export DB_PASSWORD='password'"
    echo "  export DB_NAME='database'"
    echo "  ./deploy-azure.sh"
    exit 0
fi

# Run main function
main