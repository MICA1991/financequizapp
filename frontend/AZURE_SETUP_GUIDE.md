# Azure AD Setup Guide for Finance Quiz

## Step-by-Step Azure AD Application Registration

### Step 1: Access Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your MICA admin account
3. Make sure you're in the "MICA - The School of Ideas" tenant

### Step 2: Register New Application

1. **Navigate to App Registrations**
   - Search for "Azure Active Directory" in the search bar
   - Click on "Azure Active Directory"
   - In the left menu, click "App registrations"

2. **Create New Registration**
   - Click "New registration" button
   - Fill in the details:
     - **Name**: `Finance Quiz App`
     - **Supported account types**: Select "Accounts in this organizational directory only (MICA - The School of Ideas only - Single tenant)"
     - **Redirect URI**: 
       - Type: `Web`
       - URI: `http://localhost:5174`
   - Click "Register"

### Step 3: Get Application Details

1. **Copy Client ID**
   - After registration, you'll be taken to the app overview
   - Copy the "Application (client) ID" (it looks like: `12345678-1234-1234-1234-123456789012`)

2. **Copy Tenant ID**
   - In the same page, note the "Directory (tenant) ID"
   - Or go to "Azure Active Directory" → "Overview" to get the Tenant ID

### Step 4: Configure Authentication

1. **Set Redirect URIs**
   - In your app registration, go to "Authentication" in the left menu
   - Under "Platform configurations", click "Web"
   - Add these redirect URIs:
     - `http://localhost:5174`
     - `http://localhost:3000` (if needed)
   - Under "Implicit grant and hybrid flows", check:
     - ✅ Access tokens
     - ✅ ID tokens
   - Click "Save"

### Step 5: Configure API Permissions

1. **Add Microsoft Graph Permissions**
   - Go to "API permissions" in the left menu
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Search and add these permissions:
     - `User.Read`
     - `email`
     - `profile`
   - Click "Add permissions"

2. **Grant Admin Consent**
   - After adding permissions, click "Grant admin consent for MICA - The School of Ideas"
   - Click "Yes" to confirm

### Step 6: Update Application Code

1. **Update authConfig.ts**
   ```typescript
   // Replace in frontend/src/authConfig.ts
   export const msalConfig: Configuration = {
     auth: {
       clientId: "YOUR_ACTUAL_CLIENT_ID_HERE", // Paste your client ID here
       authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your tenant ID
       redirectUri: window.location.origin,
       postLogoutRedirectUri: window.location.origin,
     },
     // ... rest of config
   };
   ```

### Step 7: Test the Integration

1. **Start the application**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test Microsoft Login**
   - Click "Sign in with Microsoft"
   - Use a valid MICA student account
   - Should successfully authenticate and return to the app

## Troubleshooting Common Issues

### Issue: "Application not found in directory"
**Solution**: Make sure you're using the correct client ID and tenant ID from your Azure AD app registration.

### Issue: "Reply URL does not match"
**Solution**: Add the correct redirect URI in Azure AD app registration authentication settings.

### Issue: "Insufficient permissions"
**Solution**: Grant admin consent for the API permissions in Azure AD.

### Issue: "Invalid client secret"
**Solution**: You don't need a client secret for this type of application. Check that the client ID is correct.

## Production Deployment

For production deployment:

1. **Update Redirect URIs**
   - Add your production domain (e.g., `https://financequiz.mica.edu`)

2. **Update Authority**
   - Use your specific tenant ID instead of "common"

3. **Test with Real Accounts**
   - Test with actual MICA student accounts
   - Verify permissions work correctly

## Security Notes

- ✅ Client ID is safe to include in frontend code
- ✅ No client secrets needed for this implementation
- ✅ Uses minimal permissions (User.Read, email, profile only)
- ✅ Tokens are handled securely by MSAL

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all Azure AD configuration steps were completed
3. Ensure you're using the correct tenant (MICA - The School of Ideas)
4. Test with a valid MICA student account 