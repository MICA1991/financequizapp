# Microsoft Office 365 Authentication Setup

This guide explains how to set up Microsoft Office 365 authentication for the Finance Quiz application.

## Prerequisites

1. **Azure Active Directory (Azure AD) Account**
   - You need access to Azure Portal
   - Admin permissions to register applications

2. **Microsoft 365 Tenant**
   - Your institution should have Microsoft 365/Office 365
   - Students should have valid Microsoft accounts

## Setup Steps

### 1. Register Application in Azure AD

1. **Go to Azure Portal**
   - Navigate to [Azure Portal](https://portal.azure.com)
   - Sign in with your admin account

2. **Register New Application**
   - Go to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: "Finance Quiz App"
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: Web → `http://localhost:5174` (for development)

3. **Get Application (Client) ID**
   - After registration, copy the "Application (client) ID"
   - This will be used in the configuration

### 2. Configure Authentication

1. **Set Redirect URIs**
   - Go to "Authentication" in your app registration
   - Add redirect URIs:
     - `http://localhost:5174` (development)
     - `https://yourdomain.com` (production)
   - Enable "Access tokens" and "ID tokens"

2. **Configure API Permissions**
   - Go to "API permissions"
   - Add permissions:
     - Microsoft Graph → Delegated → User.Read
     - Microsoft Graph → Delegated → email
     - Microsoft Graph → Delegated → profile

### 3. Update Application Configuration

1. **Update authConfig.ts**
   ```typescript
   // In frontend/src/authConfig.ts
   export const msalConfig: Configuration = {
     auth: {
       clientId: "YOUR_CLIENT_ID_HERE", // Replace with your actual client ID
       authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your tenant ID
       redirectUri: window.location.origin,
       postLogoutRedirectUri: window.location.origin,
     },
     // ... rest of config
   };
   ```

2. **Get Tenant ID**
   - In Azure Portal, go to "Azure Active Directory" → "Overview"
   - Copy the "Tenant ID"

### 4. Test the Integration

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Test Login**
   - Click "Sign in with Microsoft"
   - Use a valid Microsoft 365 account
   - Should redirect back to the app after successful authentication

## Features

### ✅ **Microsoft O365 Login**
- Students can sign in with their institutional Microsoft accounts
- Secure authentication through Azure AD
- No need to remember separate credentials

### ✅ **User Information**
- Automatically gets user's email and display name
- Uses email as student identifier
- Maintains existing progress tracking

### ✅ **Demo Mode**
- Fallback "Demo Login" for testing without Microsoft accounts
- Useful for development and demonstrations

### ✅ **Progress Persistence**
- Attempted levels are still tracked using localStorage
- Progress is tied to the user's email address

## Security Considerations

1. **Client ID Security**
   - The client ID is public and safe to include in frontend code
   - Azure AD handles the security through redirect URIs

2. **Token Management**
   - MSAL automatically handles token refresh
   - Tokens are stored securely in session storage

3. **Scope Limitations**
   - Only requests minimal permissions (User.Read, email, profile)
   - No access to sensitive data or admin functions

## Troubleshooting

### Common Issues

1. **"AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"**
   - Solution: Add the correct redirect URI in Azure AD app registration

2. **"AADSTS7000215: Invalid client secret is provided"**
   - Solution: Check that the client ID is correct in authConfig.ts

3. **"AADSTS65001: The user or administrator has not consented to use the application"**
   - Solution: Grant admin consent for the app permissions in Azure AD

### Development vs Production

- **Development**: Use `http://localhost:5174` as redirect URI
- **Production**: Use your actual domain as redirect URI
- **Tenant**: Use specific tenant ID for production, "common" for multi-tenant

## Next Steps

1. **Deploy to Production**
   - Update redirect URIs for production domain
   - Configure proper tenant ID
   - Test with actual student accounts

2. **Backend Integration**
   - Consider integrating with backend to store user data
   - Implement proper session management
   - Add role-based access control

3. **Enhanced Features**
   - Add logout functionality
   - Implement token refresh handling
   - Add user profile management 