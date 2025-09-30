import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from './config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config.js';

// Super Admin and Admin credentials - In production, store these securely
const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@healtheye.com',
  password: 'HealthEye2025@SuperAdmin', // Strong password for super admin
};

const ADMIN_EMAILS = [
  'superadmin@healtheye.com', // Super Admin
  'admin@healtheye.com',      // Regular Admin
  'support@healtheye.com',    // Support Admin
  'admin@healtheye-95247.firebaseapp.com'
  // Add your admin emails here
];

// Admin roles for different permission levels
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support'
};

// Get super admin credentials for login
export const getSuperAdminCredentials = () => {
  return {
    email: SUPER_ADMIN_CREDENTIALS.email,
    password: SUPER_ADMIN_CREDENTIALS.password,
    role: ADMIN_ROLES.SUPER_ADMIN
  };
};

// Check if current user is admin
export const isAdmin = (user) => {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email);
};

// Check if current user is super admin
export const isSuperAdmin = (user) => {
  if (!user) return false;
  return user.email === SUPER_ADMIN_CREDENTIALS.email;
};

// Get admin level/role
export const getAdminLevel = (user) => {
  if (!user) return null;
  if (isSuperAdmin(user)) return ADMIN_ROLES.SUPER_ADMIN;
  if (isAdmin(user)) return ADMIN_ROLES.ADMIN;
  return null;
};

// Get admin profile from Firestore
export const getAdminProfile = async (user) => {
  if (!user || !isAdmin(user)) return null;
  
  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) {
      return { id: adminDoc.id, ...adminDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
};

// Create admin profile in Firestore
export const createAdminProfile = async (user, additionalData = {}) => {
  if (!user || !isAdmin(user)) {
    throw new Error('User is not authorized as admin');
  }
  
  try {
    const adminData = {
      email: user.email,
      displayName: user.displayName || '',
      role: additionalData.role || ADMIN_ROLES.ADMIN,
      permissions: additionalData.permissions || ['read', 'write'],
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      ...additionalData
    };
    
    await setDoc(doc(db, 'admins', user.uid), adminData);
    return adminData;
  } catch (error) {
    console.error('Error creating admin profile:', error);
    throw error;
  }
};

// Admin login function
export const adminLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!isAdmin(user)) {
      await signOut(auth);
      throw new Error('Access denied. Admin privileges required.');
    }
    
    // Update last login time
    try {
      const adminProfile = await getAdminProfile(user);
      if (adminProfile) {
        await setDoc(doc(db, 'admins', user.uid), {
          ...adminProfile,
          lastLogin: new Date()
        }, { merge: true });
      } else {
        // Create admin profile if it doesn't exist
        await createAdminProfile(user);
      }
    } catch (profileError) {
      console.warn('Could not update admin profile:', profileError);
    }
    
    return user;
  } catch (error) {
    console.error('Admin login failed:', error);
    throw error;
  }
};

// Create new admin user (only for super admins)
export const createAdminUser = async (email, password, role = ADMIN_ROLES.ADMIN, additionalData = {}) => {
  try {
    // First add the email to the allowed admin emails
    if (!ADMIN_EMAILS.includes(email)) {
      ADMIN_EMAILS.push(email);
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create admin profile
    await createAdminProfile(user, { role, ...additionalData });
    
    // Update display name if provided
    if (additionalData.displayName) {
      await updateProfile(user, { displayName: additionalData.displayName });
    }
    
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Reset admin password
export const resetAdminPassword = async (email) => {
  try {
    if (!ADMIN_EMAILS.includes(email)) {
      throw new Error('Email is not authorized for admin access');
    }
    
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
};

// Admin logout
export const adminLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

// Check admin permissions
export const hasPermission = async (user, permission) => {
  if (!user || !isAdmin(user)) return false;
  
  try {
    const adminProfile = await getAdminProfile(user);
    if (!adminProfile) return false;
    
    // Super admins have all permissions
    if (adminProfile.role === ADMIN_ROLES.SUPER_ADMIN) return true;
    
    return adminProfile.permissions && adminProfile.permissions.includes(permission);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

// Listen to auth state changes with admin profile
export const onAdminAuthStateChanged = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user && isAdmin(user)) {
      try {
        const adminProfile = await getAdminProfile(user);
        callback({ user, profile: adminProfile });
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        callback({ user, profile: null });
      }
    } else {
      callback(null);
    }
  });
};

// Get current admin session info
export const getCurrentAdminSession = () => {
  const user = auth.currentUser;
  if (!user || !isAdmin(user)) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    lastLoginTime: user.metadata.lastSignInTime,
    creationTime: user.metadata.creationTime
  };
};

// Validate admin session
export const validateAdminSession = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }
  
  if (!isAdmin(user)) {
    await signOut(auth);
    throw new Error('User is not authorized as admin');
  }
  
  const adminProfile = await getAdminProfile(user);
  if (!adminProfile || !adminProfile.isActive) {
    await signOut(auth);
    throw new Error('Admin account is inactive');
  }
  
  return { user, profile: adminProfile };
};