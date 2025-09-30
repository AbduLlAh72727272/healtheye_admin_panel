import { useState, useEffect } from 'react';
import { appointmentsService, doctorsService, usersService, adminService, formatFirebaseDate, formatFirebaseTime } from '../firebase/services.js';

// Custom hook for appointments data with real Firebase structure
export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await appointmentsService.getAll();
        
        // Transform Firebase data to match your UI format using real data structure
        const transformedData = data.map(apt => ({
          id: apt.id,
          patient: apt.patientName || 'Unknown Patient',
          doctor: apt.doctorName || 'Unknown Doctor',
          date: formatFirebaseDate(apt.appointmentDate),
          time: formatFirebaseTime(apt.appointmentDate),
          status: apt.status || 'check', // Using the real status field from your data
          specialty: apt.doctorSpecialty || 'General',
          fee: apt.consultationFee || 0,
          patientEmail: apt.patientEmail || '',
          patientPhone: apt.patientPhone || '',
          reason: apt.reason || '',
          // Keep original data for reference
          original: apt
        }));
        
        setAppointments(transformedData);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(`Failed to load appointments: ${err.message}`);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const addAppointment = async (appointmentData) => {
    try {
      const id = await appointmentsService.add(appointmentData);
      // Refresh data
      const data = await appointmentsService.getAll();
      const transformedData = data.map(apt => ({
        id: apt.id,
        patient: apt.patientName || 'Unknown Patient',
        doctor: apt.doctorName || 'Unknown Doctor',
        date: formatFirebaseDate(apt.appointmentDate),
        time: formatFirebaseTime(apt.appointmentDate),
        status: apt.status || 'check',
        original: apt
      }));
      setAppointments(transformedData);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      await appointmentsService.update(id, appointmentData);
      // Refresh data
      const data = await appointmentsService.getAll();
      const transformedData = data.map(apt => ({
        id: apt.id,
        patient: apt.patientName || 'Unknown Patient',
        doctor: apt.doctorName || 'Unknown Doctor',
        date: formatFirebaseDate(apt.appointmentDate),
        time: formatFirebaseTime(apt.appointmentDate),
        status: apt.status || 'check',
        original: apt
      }));
      setAppointments(transformedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await appointmentsService.delete(id);
      // Refresh data
      const data = await appointmentsService.getAll();
      const transformedData = data.map(apt => ({
        id: apt.id,
        patient: apt.patientName || 'Unknown Patient',
        doctor: apt.doctorName || 'Unknown Doctor',
        date: formatFirebaseDate(apt.appointmentDate),
        time: formatFirebaseTime(apt.appointmentDate),
        status: apt.status || 'check',
        original: apt
      }));
      setAppointments(transformedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment
  };
};

// Custom hook for doctors data with real Firebase structure
export const useDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await doctorsService.getAll();
        
        // Transform Firebase data using real data structure
        const transformedData = data.map(doc => ({
          id: doc.id,
          name: doc.name || 'Unknown Doctor',
          specialization: doc.specialty || 'General', // Note: using 'specialty' not 'doctorSpecialty'
          availability: doc.isAvailable ? 'Available' : 'Unavailable',
          performance: doc.isAvailable ? 98 : 85, // Mock performance based on availability
          email: doc.email || '',
          experience: `${doc.experience || 0} years`,
          hospital: doc.hospital || 'Unknown Hospital',
          consultationFee: doc.consultationFee || 0,
          languages: doc.languages || [],
          about: doc.about || '',
          // Keep original data for reference
          original: doc
        }));
        
        setDoctors(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const addDoctor = async (doctorData) => {
    try {
      const id = await doctorsService.add(doctorData);
      // Refresh data
      const data = await doctorsService.getAll();
      const transformedData = data.map(doc => ({
        id: doc.id,
        name: doc.name || 'Unknown Doctor',
        specialization: doc.specialty || 'General',
        availability: doc.isAvailable ? 'Available' : 'Unavailable',
        performance: doc.isAvailable ? 98 : 85,
        original: doc
      }));
      setDoctors(transformedData);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateDoctor = async (id, doctorData) => {
    try {
      await doctorsService.update(id, doctorData);
      // Refresh data
      const data = await doctorsService.getAll();
      const transformedData = data.map(doc => ({
        id: doc.id,
        name: doc.name || 'Unknown Doctor',
        specialization: doc.specialty || 'General',
        availability: doc.isAvailable ? 'Available' : 'Unavailable',
        performance: doc.isAvailable ? 98 : 85,
        original: doc
      }));
      setDoctors(transformedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await doctorsService.delete(id);
      // Refresh data
      const data = await doctorsService.getAll();
      const transformedData = data.map(doc => ({
        id: doc.id,
        name: doc.name || 'Unknown Doctor',
        specialization: doc.specialty || 'General',
        availability: doc.isAvailable ? 'Available' : 'Unavailable',
        performance: doc.isAvailable ? 98 : 85,
        original: doc
      }));
      setDoctors(transformedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    doctors,
    loading,
    error,
    addDoctor,
    updateDoctor,
    deleteDoctor
  };
};

// Custom hook for users data with real Firebase structure
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getAll();
        
        // Transform Firebase data using real data structure
        const transformedData = data.map(user => {
          return {
            id: user.id,
            name: user.username || user.displayName || user.email?.split('@')[0] || 'No Name',
            email: user.email || 'No email',
            registered: formatFirebaseDate(user.createdAt),
            status: user.isAdmin ? 'Admin' : 'Active',
            role: user.role || 'patient',
            isAdmin: user.isAdmin || false,
            // Keep original data for reference
            original: user
          };
        });
        
        setUsers(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const addUser = async (userData) => {
    try {
      const id = await usersService.add(userData);
      // Refresh data
      const data = await usersService.getAll();
      const transformedData = data.map(user => ({
        id: user.id,
        name: user.displayName || 'Unknown User',
        email: user.email || 'No email',
        registered: formatFirebaseDate(user.createdAt),
        status: user.isAdmin ? 'Admin' : 'Active',
        original: user
      }));
      setUsers(transformedData);
      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      await usersService.update(id, userData);
      // Refresh data
      const data = await usersService.getAll();
      const transformedData = data.map(user => ({
        id: user.id,
        name: user.username || user.displayName || user.email?.split('@')[0] || 'No Name',
        email: user.email || 'No email',
        registered: formatFirebaseDate(user.createdAt),
        status: user.isAdmin ? 'Admin' : 'Active',
        role: user.role || 'patient',
        isAdmin: user.isAdmin || false,
        original: user
      }));
      setUsers(transformedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await usersService.delete(id);
      // Refresh data
      const data = await usersService.getAll();
      const transformedData = data.map(user => ({
        id: user.id,
        name: user.displayName || 'Unknown User',
        email: user.email || 'No email',
        registered: formatFirebaseDate(user.createdAt),
        status: user.isAdmin ? 'Admin' : 'Active',
        original: user
      }));
      setUsers(transformedData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser
  };
};

// Hook for dashboard statistics using real Firebase data
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAppointments: 0,
    totalDoctors: 0,
    systemHealth: 'Loading...'
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get real dashboard stats
        const dashboardStats = await adminService.getDashboardStats();
        setStats({
          totalUsers: dashboardStats.totalUsers,
          activeAppointments: dashboardStats.activeAppointments,
          totalDoctors: dashboardStats.totalDoctors,
          availableDoctors: dashboardStats.availableDoctors,
          systemHealth: dashboardStats.systemHealth
        });

        // Get real recent bookings
        const bookings = await adminService.getRecentBookings(5);
        setRecentBookings(bookings);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats({
          totalUsers: 0,
          activeAppointments: 0,
          totalDoctors: 0,
          systemHealth: 'Error'
        });
        setRecentBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    recentBookings,
    loading
  };
};