# Azure AD App Registration Setup Guide

Follow these steps to register your Finance Quiz app in Azure for Microsoft O365 authentication.

## Step 1: Access Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account (work/school account or personal account)

## Step 2: Navigate to App Registrations

1. In the Azure portal, search for "App registrations" in the search bar
2. Click on "App registrations" from the results
3. Click "New registration" button

## Step 3: Register Your Application

Fill in the registration form:

### Basic Information
- **Name**: `Finance Quiz App` (or your preferred name)
- **Supported account types**: 
  - Choose "Accounts in this organizational directory only" if you want only your organization's users
  - Choose "Accounts in any organizational directory and personal Microsoft accounts" for broader access
- **Redirect URI**: 
  - Type: `Single-page application (SPA)`
  - URI: `http://localhost:5173` (for development)
  - Add additional URIs for production: `https://yourdomain.com`

### Advanced Settings (Optional)
- **Homepage URL**: `http://localhost:5173`
- **Logout URL**: `http://localhost:5173`

4. Click "Register"

## Step 4: Get Your Application Credentials

After registration, you'll be taken to the app overview page. Note down:

### Application (Client) ID
1. Copy the "Application (client) ID" - this is your `clientId`
2. It looks like: `12345678-1234-1234-1234-123456789012`

### Directory (Tenant) ID
1. Copy the "Directory (tenant) ID" - this is your `tenantId`
2. It looks like: `87654321-4321-4321-4321-210987654321`

## Step 5: Configure Authentication Settings

1. In the left sidebar, click "Authentication"
2. Under "Platform configurations", click "Add a platform"
3. Choose "Single-page application"
4. Add redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5173/`
   - `http://localhost:3000` (if using different port)
5. Under "Implicit grant and hybrid flows":
   - ✅ Check "Access tokens"
   - ✅ Check "ID tokens"
6. Click "Configure"
7. Click "Save"

## Step 6: Configure API Permissions

1. In the left sidebar, click "API permissions"
2. Click "Add a permission"
3. Choose "Microsoft Graph"
4. Select "Delegated permissions"
5. Search for and select these permissions:
   - `User.Read` (to read user profile)
   - `User.ReadBasic.All` (to read basic user info)
   - `email` (to access email)
   - `profile` (to access profile)
   - `openid` (for OpenID Connect)
6. Click "Add permissions"
7. Click "Grant admin consent" (if you're an admin)

## Step 7: Create Client Secret (Optional - for server-side auth)

If you need server-side authentication:

1. In the left sidebar, click "Certificates & secrets"
2. Click "New client secret"
3. Add a description: "Finance Quiz App Secret"
4. Choose expiration (recommend 12 months)
5. Click "Add"
6. **IMPORTANT**: Copy the secret value immediately - you won't see it again!

## Step 8: Update Your Application Configuration

Update your `authConfig.ts` file with the real values:

```typescript
export const msalConfig = {
  auth: {
    clientId: "YOUR_ACTUAL_CLIENT_ID", // Replace with your client ID
    authority: "https://login.microsoftonline.com/YOUR_ACTUAL_TENANT_ID", // Replace with your tenant ID
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};
```

## Step 9: Test Your Configuration

1. Start your development server: `npm run dev`
2. Try logging in with Microsoft
3. Check the browser console for any errors
4. Verify that the login popup works correctly

## Troubleshooting Common Issues

### AADSTS700016 Error
- **Cause**: Invalid client ID or app not found
- **Solution**: Double-check your client ID and tenant ID

### AADSTS50011 Error
- **Cause**: Redirect URI mismatch
- **Solution**: Ensure redirect URI in Azure matches your app's URL exactly

### AADSTS65001 Error
- **Cause**: Insufficient permissions
- **Solution**: Grant admin consent for API permissions

### Popup Blocked Error
- **Cause**: Browser blocking popup
- **Solution**: Allow popups for your domain

## Production Deployment

When deploying to production:

1. Update redirect URIs in Azure to include your production domain
2. Update `authConfig.ts` with production URLs
3. Consider using environment variables for sensitive values
4. Set up proper CORS settings if needed

## Security Best Practices

1. **Never commit secrets to version control**
2. Use environment variables for sensitive configuration
3. Regularly rotate client secrets
4. Monitor app usage in Azure portal
5. Set appropriate token expiration times
6. Use least-privilege principle for API permissions

## Environment Variables Setup

Create a `.env` file in your frontend directory:

```env
VITE_AZURE_CLIENT_ID=your_client_id_here
VITE_AZURE_TENANT_ID=your_tenant_id_here
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

Then update your `authConfig.ts`:

```typescript
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "demo-client-id",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "demo-tenant-id"}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || "http://localhost:5173",
  },
  // ... rest of config
};
```

## Next Steps

After completing this setup:

1. Test the login flow thoroughly
2. Implement proper error handling
3. Add logout functionality
4. Consider implementing token refresh logic
5. Add user profile display features
6. Implement role-based access control if needed

## Support Resources

- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)
- [Azure AD Troubleshooting](https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes) 