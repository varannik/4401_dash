# Azure Setup Guide for Next.js Dashboard

This guide will help you configure your Next.js application to use the deployed Azure resources.

## Prerequisites

- Azure resources deployed via Terraform (already completed)
- Node.js and npm installed
- Access to Azure portal

## Quick Setup

1. **Run the setup script:**
   ```bash
   cd dashboard
   ./setup-azure-env.sh
   ```

2. **Or manually create `.env.local`:**
   ```bash
   cp azure-config.env .env.local
   ```

## Required Configuration Updates

After running the setup script, you need to update the following values in `.env.local`:

### 1. NextAuth Configuration
```bash
# Generate a secure random string for NEXTAUTH_SECRET
NEXTAUTH_SECRET=your-generated-secret-here
```

### 2. Azure Active Directory Configuration
You need to create an Azure AD app registration and get these values:

```bash
AZURE_AD_CLIENT_ID=your-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
AZURE_AD_TENANT_ID=your-azure-ad-tenant-id
```

**To get these values:**
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Create a new registration or use existing one
3. Copy the Application (client) ID
4. Go to Certificates & secrets → New client secret
5. Copy the tenant ID from the Overview page

### 3. Microsoft Fabric SQL Configuration
```bash
FABRIC_SQL_SERVER=your-fabric-sql-server.database.windows.net
FABRIC_SQL_DATABASE=your-fabric-database-name
```

## Azure Resources Available

Your Terraform deployment has created the following resources:

### Redis Cache
- **Hostname:** `redis-anomaly-detection-prod-rsvp9y.redis.cache.windows.net`
- **Port:** 6380 (SSL)
- **Connection String:** Already configured in `.env.local`

### Cosmos DB
- **Endpoint:** `https://cosmos-anomaly-detection-prod-rsvp9y.documents.azure.com:443/`
- **Database:** `anomaly-detection-db`
- **Connection String:** Already configured in `.env.local`

### Azure OpenAI
- **Endpoint:** `https://openai-anomaly-detection-prod-rsvp9y.openai.azure.com/`
- **Deployment:** `gpt-35-turbo`
- **API Key:** Already configured in `.env.local`

### Application Insights
- **Connection String:** Already configured in `.env.local`
- **Instrumentation Key:** Already configured in `.env.local`

### Azure Storage
- **Account:** `stanomalydetecprsvp9y`
- **Connection String:** Already configured in `.env.local`

### Key Vault
- **URI:** `https://kvanomalydetectprsvp9y.vault.azure.net/`

## Testing the Configuration

### 1. Test Redis Connection
```bash
node test-redis.js
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Check Application Logs
Look for successful connections to Azure services in the console output.

## Troubleshooting

### Redis Connection Issues
If you see Redis connection errors like in your terminal output:

1. **Check the Redis URL format:**
   ```bash
   # Should be using SSL port (6380) with rediss:// protocol
   REDIS_URL=rediss://:password@hostname:6380/0
   ```

2. **Verify Azure Redis Cache is running:**
   - Go to Azure Portal → Redis Cache
   - Check if the cache is in "Running" state

3. **Check firewall rules:**
   - Ensure your IP is allowed in Redis Cache firewall rules
   - Or temporarily disable firewall for testing

### Azure AD Authentication Issues
1. Verify the app registration has the correct redirect URIs
2. Check that the client secret hasn't expired
3. Ensure the app has the necessary API permissions

### Cosmos DB Connection Issues
1. Verify the connection string format
2. Check if the database exists
3. Ensure the access key is correct

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env.local` to version control**
2. **Rotate Azure keys regularly**
3. **Use Key Vault for production secrets**
4. **Enable Azure AD authentication for production**
5. **Configure proper firewall rules**

## Production Deployment

For production deployment:

1. **Update NEXTAUTH_URL:**
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Use Azure Key Vault for secrets:**
   - Store sensitive values in Key Vault
   - Use managed identity for access

3. **Configure Azure App Service:**
   - Set environment variables in App Service Configuration
   - Enable Application Insights monitoring

4. **Set up proper networking:**
   - Configure VNet integration
   - Set up private endpoints for databases

## Support

If you encounter issues:

1. Check the Azure portal for resource status
2. Review Application Insights logs
3. Check the Next.js console for error messages
4. Verify all environment variables are set correctly
