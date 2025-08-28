#!/bin/bash

# Setup script for Azure environment variables
echo "Setting up Azure environment variables for Next.js dashboard..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "Warning: .env.local already exists. This script will overwrite it."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Copy the Azure configuration to .env.local
cp azure-config.env .env.local

echo "✅ Azure environment variables have been configured!"
echo ""
echo "Next steps:"
echo "1. Update the following values in .env.local:"
echo "   - NEXTAUTH_SECRET (generate a secure random string)"
echo "   - AZURE_AD_CLIENT_ID (from your Azure AD app registration)"
echo "   - AZURE_AD_CLIENT_SECRET (from your Azure AD app registration)"
echo "   - AZURE_AD_TENANT_ID (your Azure tenant ID)"
echo "   - FABRIC_SQL_SERVER (your Fabric SQL server endpoint)"
echo "   - FABRIC_SQL_DATABASE (your Fabric database name)"
echo ""
echo "2. Start your Next.js development server:"
echo "   npm run dev"
echo ""
echo "3. Test the Redis connection:"
echo "   node test-redis.js"
echo ""
echo "Note: The Redis connection should now work with Azure Redis Cache instead of the local Redis instance."
