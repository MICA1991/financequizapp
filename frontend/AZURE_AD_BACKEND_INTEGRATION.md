# Azure AD Backend Integration Guide

This guide explains how to integrate Azure AD authentication with your backend database to store real user data instead of using demo credentials.

## Overview

The integration allows:
- ✅ Real Azure AD user authentication
- ✅ Automatic user creation/update in database
- ✅ JWT token generation for session management
- ✅ Fallback to demo mode if backend is unavailable
- ✅ Secure user data storage

## Backend Changes Made

### 1. Updated User Model (`backend/src/models/User.js`)

**New Azure AD Fields:**
- `azureAdId`: Unique Azure AD user identifier
- `azureAdEmail`: User's email from Azure AD
- `azureAdDisplayName`: User's display name from Azure AD
- `azureAdTenantId`: Azure AD tenant ID
- `isAzureAdUser`: Boolean flag for Azure AD users

**Key Features:**
- Password is optional for Azure AD users
- Automatic user creation/update on first login
- Backward compatibility with traditional login

### 2. New Authentication Endpoints

**Azure AD Login:**
```
POST /api/auth/azure/login
Body: { accessToken, account }
```

**Token Validation:**
```
POST /api/auth/azure/validate
Body: { accessToken, userInfo }
```

### 3. Updated Auth Controller

- `azureAdLogin()`: Handles Azure AD authentication
- `validateAzureAdToken()`: Validates Azure AD tokens
- `createOrUpdateAzureAdUser()`: Creates/updates users in database

## Frontend Changes Made

### 1. API Service (`frontend/src/api.ts`)

**New Functions:**
- `azureAdLogin()`: Sends Azure AD data to backend
- `validateAzureAdToken()`: Validates tokens with backend
- `checkBackendHealth()`: Checks if backend is available
- Local storage utilities for offline functionality

### 2. Updated Login Flow

**Enhanced Microsoft Login:**
1. User clicks "Sign in with Microsoft"
2. Azure AD popup opens
3. User authenticates with Microsoft
4. Frontend checks backend availability
5. If backend available: Send Azure AD data to backend
6. If backend unavailable: Use demo mode
7. Store user data and token locally

## Setup Instructions

### Step 1: Start Backend Server

```bash
cd backend
npm install
npm start
```

**Verify Backend is Running:**
- Visit: `http://localhost:5000/health`
- Should return: `{"success": true, "message": "Finance Quiz API is running"}`

### Step 2: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### Step 3: Test Azure AD Integration

1. **Open the app**: `http://localhost:5173`
2. **Click "Sign in with Microsoft"**
3. **Complete Azure AD authentication**
4. **Check browser console** for integration logs

## Database Schema

### User Collection Structure

```javascript
{
  _id: ObjectId,
  username: String,           // Auto-generated for Azure AD users
  password: String,           // Optional for Azure AD users
  role: String,              // "student" or "admin"
  isActive: Boolean,
  
  // Azure AD specific fields
  azureAdId: String,         // Unique Azure AD identifier
  azureAdEmail: String,      // User's email
  azureAdDisplayName: String, // User's display name
  azureAdTenantId: String,   // Azure AD tenant ID
  isAzureAdUser: Boolean,    // true for Azure AD users
  
  // Student fields (optional for Azure AD)
  mobileNumber: String,
  studentId: String,
  studentName: String,
  
  // Admin fields (optional for Azure AD)
  email: String,
  adminName: String,
  
  // Timestamps
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/azure/login` | Azure AD login |
| POST | `/api/auth/azure/validate` | Validate Azure AD token |
| POST | `/api/auth/student/login` | Traditional student login |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |
| POST | `/api/auth/logout` | Logout |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |

## Error Handling

### Backend Unavailable
- Frontend automatically falls back to demo mode
- User can still authenticate with Azure AD
- Data is stored locally only

### Azure AD Errors
- Invalid client ID: Check Azure AD app registration
- Redirect URI mismatch: Update Azure AD configuration
- Token validation failed: Check token format

### Database Errors
- Duplicate user: Handled automatically
- Validation errors: Check user data format
- Connection errors: Check MongoDB connection

## Security Features

### JWT Token Management
- Tokens generated for authenticated users
- Stored securely in localStorage
- Automatic token validation

### Data Protection
- Passwords hashed for traditional users
- Azure AD users don't store passwords
- Sensitive data encrypted in transit

### CORS Configuration
- Configured for localhost development
- Secure headers with Helmet
- Rate limiting ready

## Testing Scenarios

### 1. Backend Available + Azure AD Working
**Expected Behavior:**
- User authenticates with Azure AD
- User data saved to database
- JWT token generated and stored
- Full functionality available

### 2. Backend Available + Azure AD Fails
**Expected Behavior:**
- Shows Azure AD error message
- User can try again or use demo login

### 3. Backend Unavailable + Azure AD Working
**Expected Behavior:**
- User authenticates with Azure AD
- Data stored locally only
- Demo mode functionality
- Console shows "Backend not available" message

### 4. Backend Unavailable + Azure AD Fails
**Expected Behavior:**
- Shows Azure AD error message
- User can use demo login as fallback

## Monitoring and Debugging

### Backend Logs
```bash
# Check backend logs
cd backend
npm start
```

### Frontend Console
- Open browser DevTools
- Check Console tab for integration logs
- Look for API call results

### Database Queries
```javascript
// Check Azure AD users
db.users.find({ isAzureAdUser: true })

// Check all users
db.users.find({})

// Check recent logins
db.users.find({ lastLoginAt: { $exists: true } }).sort({ lastLoginAt: -1 })
```

## Production Deployment

### Environment Variables
```env
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_quiz
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://yourdomain.com

# Frontend (.env)
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_AZURE_CLIENT_ID=your_azure_client_id
VITE_AZURE_TENANT_ID=your_azure_tenant_id
```

### Azure AD Configuration
1. Update redirect URIs in Azure portal
2. Add production domain to allowed origins
3. Configure proper CORS settings
4. Set up SSL certificates

### Database Migration
1. Backup existing data
2. Run database migrations
3. Test with production data
4. Monitor performance

## Troubleshooting

### Common Issues

**1. "Backend not available" message**
- Check if backend server is running
- Verify port 5000 is not blocked
- Check firewall settings

**2. Azure AD authentication fails**
- Verify Azure AD app registration
- Check client ID and tenant ID
- Ensure redirect URIs match

**3. Database connection errors**
- Check MongoDB connection string
- Verify database server is running
- Check network connectivity

**4. CORS errors**
- Update CORS configuration in backend
- Check allowed origins
- Verify request headers

### Debug Commands

```bash
# Check backend health
curl http://localhost:5000/health

# Test Azure AD endpoint
curl -X POST http://localhost:5000/api/auth/azure/login \
  -H "Content-Type: application/json" \
  -d '{"accessToken":"test","account":{"username":"test@example.com"}}'

# Check MongoDB connection
mongo finance_quiz --eval "db.users.find().count()"
```

## Next Steps

1. **Test the integration** with real Azure AD accounts
2. **Monitor database** for user creation/updates
3. **Implement quiz submission** to backend
4. **Add admin features** for user management
5. **Set up monitoring** and logging
6. **Plan production deployment**

## Support

For issues or questions:
1. Check browser console for error messages
2. Review backend logs for API errors
3. Verify Azure AD configuration
4. Test database connectivity
5. Check network connectivity between frontend and backend 