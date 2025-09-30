import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config.js';
import { ensureAuthentication } from './auth.js';

// === APPOINTMENTS ===
export const appointmentsService = {
  // Get all appointments
  getAll: async () => {
    try {
      await ensureAuthentication();
      
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const data = querySnapshot.docs.map(doc => {
        const appointmentData = doc.data();
        return {
          id: doc.id,
          patientName: appointmentData.patientName || 'Unknown Patient',
          doctorName: appointmentData.doctorName || 'Unknown Doctor',
          doctorSpecialty: appointmentData.doctorSpecialty || 'General',
          appointmentDate: appointmentData.appointmentDate,
          consultationFee: appointmentData.consultationFee || 0,
          patientEmail: appointmentData.patientEmail || '',
          patientPhone: appointmentData.patientPhone || '',
          reason: appointmentData.reason || '',
          status: appointmentData.status || 'Pending',
          createdAt: appointmentData.createdAt,
          ...appointmentData
        };
      });
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  // Get appointment by ID
  getById: async (id) => {
    try {
      const docRef = doc(db, 'appointments', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }
  },

  // Add new appointment
  add: async (appointmentData) => {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  },

  // Update appointment
  update: async (id, appointmentData) => {
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, appointmentData);
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Delete appointment
  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  subscribe: (callback) => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(appointments);
    });
  }
};

// === DOCTORS ===
export const doctorsService = {
  getAll: async () => {
    try {
      await ensureAuthentication();
      
      const querySnapshot = await getDocs(collection(db, 'doctors'));
      const data = querySnapshot.docs.map(doc => {
        const doctorData = doc.data();
        return {
          id: doc.id,
          name: doctorData.name || 'Unknown Doctor',
          email: doctorData.email || '',
          about: doctorData.about || '',
          consultationFee: doctorData.consultationFee || 0,
          experience: doctorData.experience || '0',
          hospital: doctorData.hospital || '',
          isAvailable: doctorData.isAvailable || false,
          languages: doctorData.languages || [],
          specialty: doctorData.specialty || 'General',
          createdAt: doctorData.createdAt,
          ...doctorData
        };
      });
      return data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'doctors', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }
  },

  add: async (doctorData) => {
    try {
      const docRef = await addDoc(collection(db, 'doctors'), {
        ...doctorData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw error;
    }
  },

  update: async (id, doctorData) => {
    try {
      const docRef = doc(db, 'doctors', id);
      await updateDoc(docRef, doctorData);
      return true;
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'doctors', id));
      return true;
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    const q = collection(db, 'doctors');
    return onSnapshot(q, (querySnapshot) => {
      const doctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(doctors);
    });
  }
};

// === USERS ===
export const usersService = {
  getAll: async () => {
    try {
      await ensureAuthentication();
      
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data = querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          displayName: userData.displayName || userData.username || userData.name,
          username: userData.username,
          email: userData.email || '',
          isAdmin: userData.isAdmin || false,
          role: userData.role || 'patient',
          createdAt: userData.createdAt,
          isActive: userData.isActive !== false, // Default to true
          age: userData.age,
          gender: userData.gender,
          publicId: userData.publicId,
          photoUrl: userData.photoUrl,
          ...userData
        };
      });
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  add: async (userData) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  update: async (id, userData) => {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, userData);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    const q = collection(db, 'users');
    return onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(users);
    });
  }
};

// === MEDICAL REPORTS ===
export const medicalReportsService = {
  getAll: async () => {
    try {
      await ensureAuthentication();
      
      const querySnapshot = await getDocs(collection(db, 'medical_reports'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return data;
    } catch (error) {
      console.error('Error fetching medical reports:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'medical_reports', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching medical report:', error);
      return null;
    }
  },

  getByPatientId: async (patientId) => {
    try {
      const q = query(
        collection(db, 'medical_reports'), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(report => report.patientId === patientId);
      return reports;
    } catch (error) {
      console.error('Error fetching patient medical reports:', error);
      return [];
    }
  },

  add: async (reportData) => {
    try {
      const docRef = await addDoc(collection(db, 'medical_reports'), {
        ...reportData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding medical report:', error);
      throw error;
    }
  },

  update: async (id, reportData) => {
    try {
      const docRef = doc(db, 'medical_reports', id);
      await updateDoc(docRef, reportData);
      return true;
    } catch (error) {
      console.error('Error updating medical report:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'medical_reports', id));
      return true;
    } catch (error) {
      console.error('Error deleting medical report:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    const q = query(collection(db, 'medical_reports'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const reports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(reports);
    });
  }
};

// === CHATS ===
export const chatsService = {
  getAll: async () => {
    try {
      await ensureAuthentication();
      
      const querySnapshot = await getDocs(collection(db, 'chats'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'chats', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching chat:', error);
      return null;
    }
  },

  getByParticipants: async (userId1, userId2) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'chats'));
      const chats = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(chat => 
          chat.participants && 
          chat.participants.includes(userId1) && 
          chat.participants.includes(userId2)
        );
      return chats;
    } catch (error) {
      console.error('Error fetching chats by participants:', error);
      return [];
    }
  },

  getChatMessages: async (chatId) => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  },

  addMessage: async (chatId, messageData) => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  createChat: async (participants, initialMessage = null) => {
    try {
      const chatData = {
        participants,
        createdAt: serverTimestamp(),
        lastMessage: initialMessage?.text || '',
        lastMessageTime: serverTimestamp()
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      
      if (initialMessage) {
        await this.addMessage(chatRef.id, initialMessage);
      }
      
      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  subscribeToMessages: (chatId, callback) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  },

  subscribe: (callback) => {
    const q = query(collection(db, 'chats'), orderBy('lastMessageTime', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(chats);
    });
  }
};

// === ADMIN SERVICES ===
export const adminService = {
  // Get dashboard analytics with real data structure
  getDashboardStats: async () => {
    try {
      await ensureAuthentication();
      
      const [usersSnapshot, doctorsSnapshot, appointmentsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'doctors')),
        getDocs(collection(db, 'appointments'))
      ]);

      // Calculate active appointments (appointments for future dates)
      const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
      const now = new Date();
      const activeAppointments = appointments.filter(apt => {
        if (apt.appointmentDate?.toDate) {
          return apt.appointmentDate.toDate() >= now;
        }
        return false;
      }).length;

      // Calculate available doctors
      const doctors = doctorsSnapshot.docs.map(doc => doc.data());
      const availableDoctors = doctors.filter(doctor => doctor.isAvailable === true).length;

      return {
        totalUsers: usersSnapshot.size,
        totalDoctors: doctorsSnapshot.size,
        availableDoctors: availableDoctors,
        totalAppointments: appointmentsSnapshot.size,
        activeAppointments: activeAppointments,
        systemHealth: 'Operational',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        totalDoctors: 0,
        availableDoctors: 0,
        totalAppointments: 0,
        activeAppointments: 0,
        systemHealth: 'Error',
        timestamp: new Date()
      };
    }
  },

  // Get recent activity across all collections with real data structure
  getRecentActivity: async (limitCount = 10) => {
    try {
      await ensureAuthentication();
      
      const activities = [];
      
      // Get recent appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'), 
        orderBy('createdAt', 'desc')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      appointmentsSnapshot.docs.slice(0, limitCount).forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'appointment',
          title: `New appointment: ${data.patientName || 'Unknown'} with ${data.doctorName || 'Unknown Doctor'}`,
          subtitle: `Specialty: ${data.doctorSpecialty || 'General'} - Fee: $${data.consultationFee || 0}`,
          timestamp: data.createdAt,
          data: data
        });
      });

      // Get recent users
      const usersQuery = query(
        collection(db, 'users'), 
        orderBy('createdAt', 'desc')
      );
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.docs.slice(0, limitCount).forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'user',
          title: `New user registered: ${data.displayName || 'Unknown User'}`,
          subtitle: `Email: ${data.email || 'No email'} - Role: ${data.role || 'user'}`,
          timestamp: data.createdAt,
          data: data
        });
      });

      // Get recent doctors
      const doctorsQuery = query(
        collection(db, 'doctors'), 
        orderBy('createdAt', 'desc')
      );
      const doctorsSnapshot = await getDocs(doctorsQuery);
      doctorsSnapshot.docs.slice(0, limitCount).forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'doctor',
          title: `New doctor registered: ${data.name || 'Unknown Doctor'}`,
          subtitle: `Hospital: ${data.hospital || 'Unknown'} - Experience: ${data.experience || '0'} years`,
          timestamp: data.createdAt,
          data: data
        });
      });

      // Sort by timestamp and return limited results
      return activities
        .sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
          return timeB - timeA;
        })
        .slice(0, limitCount);
        
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  // Get recent bookings for dashboard with real data structure
  getRecentBookings: async (limitCount = 5) => {
    try {
      await ensureAuthentication();
      
      const appointmentsQuery = query(
        collection(db, 'appointments'), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(appointmentsQuery);
      
      return querySnapshot.docs.slice(0, limitCount).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          patient: data.patientName || 'Unknown Patient',
          service: `${data.doctorSpecialty || 'Consultation'} with ${data.doctorName || 'Doctor'}`,
          time: data.appointmentDate?.toDate?.() ? 
            data.appointmentDate.toDate().toLocaleDateString() : 
            'No date',
          fee: data.consultationFee || 0,
          status: data.status || 'Pending'
        };
      });
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      return [];
    }
  },

  // Bulk operations for admin
  bulkUpdateUsers: async (userIds, updateData) => {
    try {
      const batch = [];
      userIds.forEach(id => {
        const docRef = doc(db, 'users', id);
        batch.push(updateDoc(docRef, updateData));
      });
      
      await Promise.all(batch);
      return true;
    } catch (error) {
      console.error('Error in bulk user update:', error);
      throw error;
    }
  },

  // Search across collections with real data structure
  searchAll: async (searchTerm) => {
    try {
      await ensureAuthentication();
      
      const results = {
        users: [],
        doctors: [],
        appointments: []
      };

      // Search users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      results.users = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => 
          (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

      // Search doctors
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
      results.doctors = doctorsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doctor => 
          (doctor.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doctor.about?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

      // Search appointments
      const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
      results.appointments = appointmentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(appointment => 
          (appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

      return results;
    } catch (error) {
      console.error('Error in search:', error);
      return { users: [], doctors: [], appointments: [] };
    }
  }
};

// === UTILITY FUNCTIONS ===
export const formatFirebaseDate = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  return new Date(timestamp).toLocaleDateString();
};

export const formatFirebaseTime = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// === ADMIN SETTINGS ===
export const settingsService = {
  // Get admin settings
  getSettings: async () => {
    try {
      await ensureAuthentication();
      const settingsDoc = doc(db, 'adminSettings', 'config');
      const docSnap = await getDoc(settingsDoc);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Return default settings if no saved settings exist
        return {
          theme: 'dark_blue',
          animations: true,
          refreshInterval: '60',
          recordsPerPage: '25',
          showTimestamps: true,
          maintenanceMode: false,
        };
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      // Return default settings on error
      return {
        theme: 'dark_blue',
        animations: true,
        refreshInterval: '60',
        recordsPerPage: '25',
        showTimestamps: true,
        maintenanceMode: false,
      };
    }
  },

  // Save admin settings
  saveSettings: async (settings) => {
    try {
      await ensureAuthentication();
      const settingsDoc = doc(db, 'adminSettings', 'config');
      await updateDoc(settingsDoc, {
        ...settings,
        updatedAt: serverTimestamp()
      }).catch(async (error) => {
        // If document doesn't exist, create it
        if (error.code === 'not-found') {
          await addDoc(collection(db, 'adminSettings'), {
            ...settings,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          throw error;
        }
      });
      console.log('✅ Admin settings saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving admin settings:', error);
      return false;
    }
  },

  // Clear cache/data (simulate clearing by refreshing data)
  clearCache: async () => {
    try {
      await ensureAuthentication();
      console.log('🧹 Clearing system cache...');
      // This could trigger a refresh of cached data
      // For now, we'll just return a success message
      return { success: true, message: 'System cache cleared successfully' };
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      return { success: false, message: 'Failed to clear cache' };
    }
  }
};

// Firebase connection test
export const testFirebaseConnection = async () => {
  try {
    await ensureAuthentication();
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};