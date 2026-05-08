# Admin Control System Documentation

## Overview

The admin control system provides comprehensive management capabilities for the CarRental platform, including:
- User verification and account management
- Vehicle listing management (view, toggle status, delete)
- Platform statistics and analytics
- Admin authentication with security features

## Default Admin Credentials

**Login ID:** `admin`  
**Password:** `admin`  
**Email:** `admin@carrental.com`

⚠️ **IMPORTANT:** Change the admin password immediately after first login for security.

## Setup Instructions

### 1. Initialize Default Admin Account

Run the initialization script to create the default admin account:

```bash
cd backend
node init-admin.js
```

**Expected Output:**
```
✅ Connected to database
✅ Default admin account created successfully!
   Login ID: admin
   Password: admin
   Email: admin@carrental.com
   Role: superAdmin

⚠️  IMPORTANT: Change the admin password immediately after first login!
```

### 2. Start Backend Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Start Frontend Development

```bash
cd frontend
npm run dev
```

The frontend will typically run on `http://localhost:5173`

## Features

### Admin Login

**URL:** `/admin/login`

- Access the admin control panel
- Default credentials provided above
- Token-based authentication (JWT)
- Session management with refresh tokens
- Account lockout after 5 failed attempts (30-minute duration)

### Admin Dashboard

**URL:** `/admin/dashboard`

Displays:
- Total users count
- Verified users count
- Unverified/pending users count
- Active users count
- Total vehicles count
- Active vehicle listings count
- Inactive vehicle listings count
- Quick statistics (verification rate, active vehicle rate, platform health)

Quick actions:
- Navigate to user management
- Navigate to vehicle management
- View pending user verification list

### User Management

**URL:** `/admin/users`

#### Capabilities:
- **View all users** with pagination (10 users per page)
- **Search users** by name, email, or phone
- **Filter users** by verification status
- **View user details** including:
  - Personal information
  - Verification documents (Driving License, Aadhar)
  - Account status
  - Verification status

#### User Actions:
- **Verify users:** Mark unverified users as verified
- **Reject users:** Mark verified users as unverified
- **Deactivate accounts:** Disable user accounts

**API Endpoint:** `GET /api/v1/admin/users`

Query Parameters:
```
page=1
limit=10
isVerified=true|false
search=<keyword>
```

### Vehicle Management

**URL:** `/admin/vehicles`

#### Capabilities:
- **View all vehicles** with pagination (10 vehicles per page)
- **Search vehicles** by title, brand, model, or license plate
- **Filter vehicles** by status (active/inactive)
- **View vehicle details** including:
  - Vehicle information (title, brand, model, year, price)
  - Owner information
  - License plate
  - Mileage
  - Listing status

#### Vehicle Actions:
- **Toggle status:** Mark vehicles as active or inactive
- **Delete listings:** Remove vehicle listings with reason documentation

**API Endpoints:**
```
GET    /api/v1/admin/vehicles
PATCH  /api/v1/admin/vehicles/:vehicleId/toggle-status
DELETE /api/v1/admin/vehicles/:vehicleId
```

### Admin Account Management

#### Change Password
- Access from admin profile
- Old password verification required

#### Update Profile
- Modify full name
- Update email address

**API Endpoints:**
```
PATCH /api/v1/admin/change-password
PATCH /api/v1/admin/profile
```

## API Reference

### Admin Authentication

#### Login
```
POST /api/v1/admin/login

Body:
{
  "loginId": "admin",
  "password": "admin"
}

Response:
{
  "success": true,
  "data": {
    "admin": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "Admin logged in successfully"
}
```

#### Logout
```
POST /api/v1/admin/logout

Response:
{
  "success": true,
  "data": {},
  "message": "Admin logged out successfully"
}
```

### User Management APIs

#### Get All Users
```
GET /api/v1/admin/users?page=1&limit=10&isVerified=false&search=john

Response:
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  },
  "message": "Users fetched successfully"
}
```

#### Get User Details
```
GET /api/v1/admin/users/:userId

Response:
{
  "success": true,
  "data": { ...userDetails },
  "message": "User details fetched successfully"
}
```

#### Verify User
```
PATCH /api/v1/admin/users/:userId/verify

Response:
{
  "success": true,
  "data": { ...updatedUser },
  "message": "User verified successfully"
}
```

#### Reject User
```
PATCH /api/v1/admin/users/:userId/reject

Body:
{
  "reason": "Documents do not match"
}

Response:
{
  "success": true,
  "data": { ...updatedUser },
  "message": "User rejected successfully"
}
```

#### Deactivate User
```
PATCH /api/v1/admin/users/:userId/deactivate

Response:
{
  "success": true,
  "data": { ...updatedUser },
  "message": "User deactivated successfully"
}
```

### Vehicle Management APIs

#### Get All Vehicles
```
GET /api/v1/admin/vehicles?page=1&limit=10&status=active&search=toyota

Response:
{
  "success": true,
  "data": {
    "vehicles": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  },
  "message": "Vehicles fetched successfully"
}
```

#### Get Vehicle Details
```
GET /api/v1/admin/vehicles/:vehicleId

Response:
{
  "success": true,
  "data": { ...vehicleDetails },
  "message": "Vehicle details fetched successfully"
}
```

#### Toggle Vehicle Status
```
PATCH /api/v1/admin/vehicles/:vehicleId/toggle-status

Response:
{
  "success": true,
  "data": { ...updatedVehicle },
  "message": "Vehicle status updated successfully"
}
```

#### Delete Vehicle
```
DELETE /api/v1/admin/vehicles/:vehicleId

Body:
{
  "reason": "Violates terms of service"
}

Response:
{
  "success": true,
  "data": { ...deletedVehicle },
  "message": "Vehicle deleted successfully"
}
```

### Statistics API

#### Get Platform Statistics
```
GET /api/v1/admin/statistics

Response:
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "verified": 120,
      "unverified": 30,
      "active": 145
    },
    "vehicles": {
      "total": 200,
      "active": 180,
      "inactive": 20
    }
  },
  "message": "Statistics fetched successfully"
}
```

## Security Features

### Authentication
- JWT-based token authentication
- Access token validity: 15 minutes
- Refresh token validity: 7 days
- Secure HTTP-only cookies

### Account Protection
- Login attempt tracking
- Account lockout after 5 failed attempts
- 30-minute lockout duration
- Automatic unlock after timeout

### Permissions
- Role-based access control (RBAC)
- SuperAdmin: Full access to all operations
- Admin: Limited access based on permissions
- Permission types:
  - `manageUsers`
  - `verifyUsers`
  - `manageVehicles`
  - `viewReports`
  - `manageAdmins` (SuperAdmin only)

## Database Models

### Admin Schema

```javascript
{
  loginId: String (unique),
  password: String (hashed),
  email: String (unique),
  fullName: String,
  role: String (enum: ['superAdmin', 'admin']),
  permissions: {
    manageUsers: Boolean,
    verifyUsers: Boolean,
    manageVehicles: Boolean,
    viewReports: Boolean,
    manageAdmins: Boolean
  },
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  isLocked: Boolean,
  lockedUntil: Date,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/login` | AdminLogin | Admin login page |
| `/admin/dashboard` | AdminDashboard | Main admin dashboard |
| `/admin/users` | AdminUsers | User management |
| `/admin/vehicles` | AdminVehicles | Vehicle management |

## Best Practices

1. **Change Default Password Immediately**
   - Security risk to keep default credentials
   - Use a strong, unique password

2. **Regular Backups**
   - Backup admin database regularly
   - Maintain audit logs

3. **Monitor Account Activity**
   - Review user verification patterns
   - Track vehicle listing changes

4. **Account Lockout Management**
   - Monitor failed login attempts
   - Reset locked accounts as needed

5. **Permission Assignment**
   - Follow principle of least privilege
   - Only grant necessary permissions

6. **Session Management**
   - Regularly logout after sessions
   - Clear browser cookies/cache

## Troubleshooting

### Admin Account Not Created
**Problem:** `init-admin.js` fails to create admin

**Solution:**
1. Verify MongoDB connection
2. Check `.env` file configuration
3. Ensure database has write permissions
4. Run script from backend directory

### Login Failures
**Problem:** Cannot login with admin credentials

**Solutions:**
1. Verify credentials are correct (case-sensitive)
2. Check if account is locked (5 failed attempts)
3. Ensure backend server is running
4. Clear browser cache/cookies
5. Check network connectivity

### Permission Denied Errors
**Problem:** "You do not have permission" message

**Solutions:**
1. Verify admin role is "superAdmin" or has required permissions
2. Check token validity
3. Logout and login again
4. Verify permission names in code

### API Response Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired token | Re-login to get new token |
| 403 Forbidden | Insufficient permissions | Contact superAdmin |
| 404 Not Found | Resource doesn't exist | Verify resource ID |
| 423 Locked | Account locked | Wait 30 minutes or reset |
| 500 Server Error | Backend error | Check server logs |

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── admin.controller.js
│   ├── middleware/
│   │   └── admin.middleware.js
│   ├── models/
│   │   └── admin.model.js
│   └── routes/
│       └── admin.routes.js
├── init-admin.js
└── package.json

frontend/
└── src/
    ├── pages/
    │   ├── AdminLogin.jsx
    │   ├── AdminDashboard.jsx
    │   ├── AdminUsers.jsx
    │   └── AdminVehicles.jsx
    ├── services/
    │   └── api.js (with adminAPI)
    ├── context/
    │   └── AuthContext.jsx (with loginAdmin)
    └── App.jsx (with admin routes)
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response messages
3. Check browser console for errors
4. Review backend server logs
5. Verify all environment variables are set

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Audit logging for all admin actions
- [ ] Admin activity dashboard
- [ ] Bulk user/vehicle operations
- [ ] Custom report generation
- [ ] Email notifications for critical actions
- [ ] Admin role management interface
