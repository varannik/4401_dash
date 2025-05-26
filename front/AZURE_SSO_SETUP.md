# Azure SSO Integration with NextAuth

This guide will help you set up Azure Active Directory Single Sign-On (SSO) with NextAuth in your Next.js application.

## Prerequisites

1. An Azure Active Directory tenant
2. Administrative access to register applications in Azure AD
3. Node.js and npm installed

## Azure AD Setup

### 1. Register Application in Azure AD

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the application details:
   - **Name**: Your application name (e.g., "My Next.js App")
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: 
     - Type: Web
     - URL: `http://localhost:3000/api/auth/callback/azure-ad` (for development)

### 2. Configure Application

After registration, note down:
- **Application (client) ID**
- **Directory (tenant) ID**

### 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and set expiration
4. **Copy the secret value immediately** (you won't be able to see it again)

### 4. Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`

### 5. Update Redirect URIs for Production

For production, add your production URL:
- `https://yourdomain.com/api/auth/callback/azure-ad`

## Environment Configuration

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update the values in `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-string
   AZURE_AD_CLIENT_ID=your-application-client-id
   AZURE_AD_CLIENT_SECRET=your-client-secret
   AZURE_AD_TENANT_ID=your-tenant-id
   ```

### Generating NEXTAUTH_SECRET

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

## Testing the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click the "Sign in" button
4. You should be redirected to Azure AD login
5. After successful authentication, you'll be redirected back to your app
6. Visit `/dashboard` to see the protected route in action 