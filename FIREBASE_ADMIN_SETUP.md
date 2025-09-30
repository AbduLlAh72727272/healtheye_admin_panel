# Firebase Admin Panel Setup for HealthEye

This document explains how your React admin panel connects to the same Firebase project used by your Flutter app.

## 🚀 Project Configuration

Your React admin panel is now connected to the HealthEye Firebase project:

- **Project ID**: `healtheye-95247`
- **API Key**: `AIzaSyDYQ54DRyZaTkzEofG9lkJKtW_pfCeeflk`
- **Auth Domain**: `healtheye-95247.firebaseapp.com`

## 📁 Firebase Collections

Your admin panel can access all the same Firestore collections that your Flutter app uses:

### Core Collections:
- **`users`** - Patient/user accounts and profiles
- **`doctors`** - Doctor profiles and information
- **`appointments`** - Medical appointments between patients and doctors
- **`medical_reports`** - Patient medical reports and documents
- **`chats`** - Chat conversations between patients and doctors

### Admin Collections:
- **`admins`** - Admin user profiles and permissions

## 🔧 Available Services

### Core Data Services

```javascript
import { 
  usersService, 
  doctorsService, 
  appointmentsService, 
  medicalReportsService, 
  chatsService 
} from './src/firebase/services.js';

// Example usage:
const users = await usersService.getAll();
const doctors = await doctorsService.getAll();
const appointments = await appointmentsService.getAll();
```

### Admin-Specific Services

```javascript
import { adminService } from './src/firebase/services.js';

// Get dashboard statistics
const stats = await adminService.getDashboardStats();

// Get recent activity
const recentActivity = await adminService.getRecentActivity(10);

// Search across all collections
const searchResults = await adminService.searchAll('search term');
```

### Real-time Updates

All services support real-time subscriptions:

```javascript
// Subscribe to appointments updates
const unsubscribe = appointmentsService.subscribe((appointments) => {
  console.log('Updated appointments:', appointments);
});

// Don't forget to unsubscribe when component unmounts
unsubscribe();
```

## 🔐 Authentication

### Admin Authentication

```javascript
import { adminLogin, adminLogout, isAdmin } from './src/firebase/adminAuth.js';

// Admin login
try {
  const user = await adminLogin('admin@healtheye.com', 'password');
  console.log('Admin logged in:', user);
} catch (error) {
  console.error('Login failed:', error);
}

// Check if user is admin
const currentUser = auth.currentUser;
if (isAdmin(currentUser)) {
  console.log('User has admin privileges');
}
```

### Admin Roles and Permissions

The system supports different admin roles:
- **SUPER_ADMIN**: Full access to all features
- **ADMIN**: Standard admin access
- **MODERATOR**: Limited moderation capabilities
- **SUPPORT**: Support-specific functions

## 🛠 CRUD Operations

Each service provides standard CRUD operations:

### Create
```javascript
const newAppointment = await appointmentsService.add({
  patientName: 'John Doe',
  doctorName: 'Dr. Smith',
  appointmentDate: new Date(),
  status: 'Confirmed'
});
```

### Read
```javascript
// Get all records
const allUsers = await usersService.getAll();

// Get by ID
const user = await usersService.getById('user_id');
```

### Update
```javascript
await usersService.update('user_id', {
  patientName: 'Updated Name',
  status: 'Active'
});
```

### Delete
```javascript
await usersService.delete('user_id');
```

## 📊 Admin Dashboard Features

### Dashboard Statistics
```javascript
const stats = await adminService.getDashboardStats();
// Returns: { totalUsers, totalDoctors, totalAppointments, totalReports }
```

### Recent Activity Monitoring
```javascript
const activities = await adminService.getRecentActivity(10);
// Returns array of recent activities across all collections
```

### Global Search
```javascript
const results = await adminService.searchAll('search term');
// Searches across users, doctors, appointments, and medical reports
```

## 🔄 Synchronization

Your React admin panel and Flutter app share the same Firebase backend, ensuring:

- **Real-time synchronization** between mobile app and admin panel
- **Consistent data** across both platforms
- **Immediate updates** when changes are made from either platform

## 🚨 Security Considerations

### Admin Access Control
- Admin emails are defined in `adminAuth.js`
- Users must be authenticated with admin credentials
- Role-based permissions for different admin levels

### Firestore Security Rules
You'll need to update your Firestore security rules to allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access rules
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in ['admin@healtheye.com', 'support@healtheye.com'];
    }
    
    // Regular user rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Doctor rules
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == doctorId;
    }
  }
}
```

## 🧪 Testing Firebase Connection

Use the built-in connection test:

```javascript
import { testFirebaseConnection } from './src/firebase/services.js';

const connectionStatus = await testFirebaseConnection();
console.log('Firebase connected:', connectionStatus);
```

## 🔧 Development vs Production

### Development Mode
- Optionally connects to Firebase Emulators
- Enhanced logging and debugging
- Local testing capabilities

### Production Mode
- Direct connection to Firebase project
- Optimized for performance
- Production security rules

## 📱 Mobile App Integration

Your admin panel works seamlessly with your Flutter app because:

1. **Same Project**: Both use `healtheye-95247`
2. **Same Collections**: Access identical Firestore collections
3. **Real-time Sync**: Changes reflect immediately across platforms
4. **Shared Authentication**: Can manage users from both platforms

## 🎯 Next Steps

1. **Set up Firestore Security Rules** for admin access
2. **Create admin user accounts** in Firebase Authentication
3. **Configure role-based permissions** for different admin levels
4. **Test the connection** using the provided test functions
5. **Build your admin UI** using the provided services

## 🆘 Troubleshooting

### Common Issues:

1. **Authentication Errors**: Ensure admin emails are added to `ADMIN_EMAILS` array
2. **Permission Denied**: Update Firestore security rules to allow admin access
3. **Connection Issues**: Check Firebase configuration and internet connectivity
4. **CORS Errors**: Ensure your domain is authorized in Firebase console

### Debug Mode:
```javascript
// Enable debug logging
import { getFirebaseStatus } from './src/firebase/config.js';
console.log('Firebase Status:', getFirebaseStatus());
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify Firebase configuration in the Firebase console
3. Ensure admin emails are properly configured
4. Test the connection using the provided test functions

Your React admin panel is now fully connected to your Flutter app's Firebase backend! 🎉