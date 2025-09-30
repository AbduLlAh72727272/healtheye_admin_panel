import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// Import your logo - replace 'your-logo.png' with your actual logo filename
import logo from './assets/logo.png';
// Import Firebase hooks
import { useAppointments, useDoctors, useUsers, useDashboardStats } from './hooks/useFirebaseData.js';
// Import Firebase services
import { settingsService } from './firebase/services.js';
// Import Error Boundary
import ErrorBoundary from './components/ErrorBoundary.jsx';
// Import Admin Authentication
import { AdminAuthWrapper } from './components/AdminAuthWrapper.jsx';

// Firebase data will be loaded via hooks - using real Firebase data!


// --- SVG Icons ---
// Using inline SVGs to keep everything in one file.
const icons = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    doctors: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>,
    appointments: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>,
    reports: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a6 6 0 0 0-6 0"></path><path d="M12.7 14a6 6 0 0 0-6 0"></path><path d="m12.7 14 6-6"></path></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.12l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.12l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    // New icons for better UX
    activity: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline></svg>,
    clock: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>,
    calendar: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
};


// --- 3D Background Component ---
const ThreeJSBackground = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mountNode = mountRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountNode.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(2, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00aaff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3,
            wireframe: true,
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        camera.position.z = 5;

        const animate = function () {
            requestAnimationFrame(animate);
            sphere.rotation.x += 0.001;
            sphere.rotation.y += 0.001;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
        };
        
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            mountNode.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.3 }} />;
};


// --- UI Components ---
const Sidebar = ({ activeScreen, setActiveScreen }) => {
    const navItems = ['Dashboard', 'User Management', 'Doctor Management', 'Appointment Management', 'Reports & Analytics', 'Settings'];
    const navIcons = ['dashboard', 'users', 'doctors', 'appointments', 'reports', 'settings'];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <img src={logo} alt="HealthEye Logo" className="logo-image" />
                <h1>HealthEye</h1>
            </div>
            <nav>
                <ul>
                    {navItems.map((item, index) => (
                        <li key={item} className={activeScreen === item ? 'active' : ''} onClick={() => setActiveScreen(item)}>
                            <div className="nav-icon">{icons[navIcons[index]]}</div>
                            <span>{item}</span>
                            <div className="nav-glow"></div>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <p>&copy; 2025 HealthEye.</p>
                <p>All Rights Reserved</p>
            </div>
        </aside>
    );
};

const DashboardScreen = ({ setActiveScreen }) => {
    const { stats, recentBookings, loading } = useDashboardStats();

    if (loading) {
        return (
            <div className="screen-content">
                <header className="content-header">
                    <h2>Dashboard Overview</h2>
                    <p>Loading dashboard data...</p>
                </header>
            </div>
        );
    }

    const dashboardStats = [
        { label: 'Total Users', value: stats.totalUsers || 0, change: '+5%' },
        { label: 'Active Appointments', value: stats.activeAppointments || 0, change: '-2%' },
        { label: 'Total Doctors', value: stats.totalDoctors || 0, change: '+1' },
        { label: 'Available Doctors', value: stats.availableDoctors || 0, change: 'Online' },
        { label: 'System Health', value: stats.systemHealth || 'Unknown', change: 'Stable' },
    ];
    
    return (
        <div className="screen-content">
            <header className="content-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome to the HealthEye command center - Real-time data from Firebase.</p>
            </header>
            
            {/* Quick Actions Panel */}
            <div className="quick-actions-panel">
                <h3>✨ Quick Actions</h3>
                <div className="action-buttons">
                    <button 
                        className="action-btn primary"
                        onClick={() => setActiveScreen('User Management')}
                    >
                        {icons.plus}
                        <span>Add New User</span>
                    </button>
                    <button 
                        className="action-btn primary"
                        onClick={() => setActiveScreen('Doctor Management')}
                    >
                        {icons.plus}
                        <span>Add Doctor</span>
                    </button>
                    <button 
                        className="action-btn secondary"
                        onClick={() => setActiveScreen('Appointment Management')}
                    >
                        {icons.calendar}
                        <span>View Appointments</span>
                    </button>
                    <button 
                        className="action-btn secondary"
                        onClick={() => setActiveScreen('Reports & Analytics')}
                    >
                        {icons.reports}
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* System Status Cards */}
            <div className="system-status-panel">
                <div className="status-card">
                    <div className="status-icon">
                        {icons.activity}
                    </div>
                    <div className="status-content">
                        <h4>System Health</h4>
                        <p className="status-value">Excellent</p>
                        <span className="status-indicator online">●</span>
                    </div>
                </div>
                <div className="status-card">
                    <div className="status-icon">
                        {icons.bell}
                    </div>
                    <div className="status-content">
                        <h4>Firebase Status</h4>
                        <p className="status-value">Connected</p>
                        <span className="status-indicator online">●</span>
                    </div>
                </div>
                <div className="status-card">
                    <div className="status-icon">
                        {icons.clock}
                    </div>
                    <div className="status-content">
                        <h4>Server Uptime</h4>
                        <p className="status-value">99.9%</p>
                        <span className="status-indicator online">●</span>
                    </div>
                </div>
            </div>
            
            <div className="dashboard-grid">
                {dashboardStats.map(stat => (
                    <div className="stat-card" key={stat.label}>
                        <h3>{stat.label}</h3>
                        <p className="stat-value">{stat.value}</p>
                        <p className={`stat-change ${stat.change.startsWith('+') ? 'positive' : stat.change.startsWith('-') ? 'negative' : ''}`}>{stat.change}</p>
                    </div>
                ))}
                <div className="large-card recent-bookings">
                    <h3>Recent Bookings</h3>
                    <ul>
                        {recentBookings && recentBookings.length > 0 ? (
                            recentBookings.map((booking, index) => (
                                <li key={index}>
                                    <div className="booking-info">
                                        <span className="patient-name">{booking.patient}</span>
                                        <span className="service-name">{booking.service}</span>
                                    </div>
                                    <span className="booking-time">{booking.time}</span>
                                </li>
                            ))
                        ) : (
                            <li>
                                <div className="booking-info">
                                    <span className="patient-name">No recent bookings</span>
                                    <span className="service-name">Check back later</span>
                                </div>
                                <span className="booking-time">--</span>
                            </li>
                        )}
                    </ul>
                </div>
                <div className="large-card analytics-preview">
                    <h3>Appointment Trends</h3>
                     <div className="chart-container">
                        {[45, 60, 75, 50, 80, 95, 70].map((val, i) => (
                            <div className="bar-wrapper" key={i}>
                                <div className="bar" style={{'--height': `${val}%`}}></div>
                                <span className="bar-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// A specialized table component for appointment management with status toggle
const AppointmentDataTable = ({ headers, data, onAction }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'completed';
            case 'cancelled': return 'cancelled';
            case 'scheduled': return 'scheduled';
            case 'rescheduled': return 'rescheduled';
            case 'no-show': return 'no-show';
            default: return 'scheduled';
        }
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus?.toLowerCase()) {
            case 'scheduled': return 'completed';
            case 'completed': return 'cancelled';
            default: return 'scheduled';
        }
    };

    return (
        <div className="data-table-container">
            <table>
                <thead>
                    <tr>
                        {headers.map(h => <th key={h}>{h}</th>)}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id}>
                            {Object.keys(row).map(key => key !== 'id' && key !== 'currentStatus' && <td key={key}>{row[key]}</td>)}
                            <td className="actions">
                                <button 
                                    className="edit-btn"
                                    onClick={() => onAction('edit', row.id)}
                                    title="Edit appointment"
                                >
                                    ⚙️ Edit
                                </button>
                                <button 
                                    className={`status-toggle-btn ${getStatusColor(row.currentStatus)}`}
                                    onClick={() => onAction('toggle', row.id)}
                                    title={`Change status to ${getNextStatus(row.currentStatus)}`}
                                >
                                    <span>Status</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// A specialized table component for doctor management with toggle functionality
const DoctorDataTable = ({ headers, data, onAction }) => {
    return (
        <div className="data-table-container">
            <table>
                <thead>
                    <tr>
                        {headers.map(h => <th key={h}>{h}</th>)}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id}>
                            {Object.keys(row).map(key => key !== 'id' && key !== 'isAvailable' && <td key={key}>{row[key]}</td>)}
                            <td className="actions">
                                <button 
                                    className="edit-btn"
                                    onClick={() => onAction('edit', row.id)}
                                    title="Edit doctor"
                                >
                                    ⚙️ Edit
                                </button>
                                <button 
                                    className={`toggle-btn ${row.isAvailable ? 'active' : 'inactive'}`}
                                    onClick={() => onAction('toggle', row.id)}
                                    title={row.isAvailable ? 'Deactivate doctor' : 'Activate doctor'}
                                >
                                    <span>{row.isAvailable ? 'Deactivate' : 'Activate'}</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// A specialized table component for user management with toggle functionality
const UserDataTable = ({ headers, data, onAction }) => {
    return (
        <div className="data-table-container">
            <table>
                <thead>
                    <tr>
                        {headers.map(h => <th key={h}>{h}</th>)}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id}>
                            {Object.keys(row).map(key => key !== 'id' && key !== 'isActive' && <td key={key}>{row[key]}</td>)}
                            <td className="actions">
                                <button 
                                    className="edit-btn"
                                    onClick={() => onAction('edit', row.id)}
                                    title="Edit user"
                                >
                                    ⚙️ Edit
                                </button>
                                <button 
                                    className={`toggle-btn ${row.isActive ? 'active' : 'inactive'}`}
                                    onClick={() => onAction('toggle', row.id)}
                                    title={row.isActive ? 'Deactivate user' : 'Activate user'}
                                >
                                    <span>{row.isActive ? 'Deactivate' : 'Activate'}</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// A reusable table component for management screens
const DataTable = ({ headers, data, onAction }) => {
    return (
        <div className="data-table-container">
            <table>
                <thead>
                    <tr>
                        {headers.map(h => <th key={h}>{h}</th>)}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id}>
                            {Object.keys(row).map(key => key !== 'id' && <td key={key}>{row[key]}</td>)}
                            <td className="actions">
                                <button onClick={() => onAction('edit', row.id)}>Edit</button>
                                <button className="danger" onClick={() => onAction('delete', row.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const UserManagementScreen = () => {
    const { users, loading, error, updateUser } = useUsers();
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const headers = ['Display Name', 'Email', 'Role', 'Admin Status', 'Active Status'];

    const handleAction = async (action, id) => {
        console.log(`Action: ${action} on user ID: ${id}`);
        
        if (action === 'edit') {
            const user = users?.find(u => u.id === id);
            if (user) {
                setEditingUser(id);
                setEditFormData({
                    username: user.original?.username || '',
                    displayName: user.original?.displayName || '',
                    email: user.email,
                    role: user.original?.role || 'patient',
                    isAdmin: user.original?.isAdmin || false,
                    isActive: user.original?.isActive !== false
                });
            }
        } else if (action === 'toggle') {
            try {
                const user = users?.find(u => u.id === id);
                if (!user) return;
                
                const newActiveStatus = !user.original?.isActive;
                
                await updateUser(id, { isActive: newActiveStatus });
                console.log(`User ${id} ${newActiveStatus ? 'activated' : 'deactivated'}`);
            } catch (error) {
                console.error('Error toggling user status:', error);
                alert('Failed to update user status');
            }
        }
    };

    const handleSaveEdit = async () => {
        try {
            await updateUser(editingUser, editFormData);
            setEditingUser(null);
            setEditFormData({});
            console.log('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditFormData({});
    };

    if (loading) {
        return (
            <div className="screen-content">
                <header className="content-header">
                    <h2>User Management</h2>
                    <p>Loading users...</p>
                </header>
            </div>
        );
    }

    if (error) {
        return (
            <div className="screen-content">
                <header className="content-header">
                    <h2>User Management</h2>
                    <p>Error loading users: {error}</p>
                </header>
            </div>
        );
    }

    // Transform data for table display using real Firebase structure
    const tableData = (users || []).map(user => {
        // Use username for regular users, displayName for admins
        const displayName = user.original?.username || 
                           user.original?.displayName || 
                           user.name ||
                           user.email?.split('@')[0] ||
                           user.original?.email?.split('@')[0] ||
                           'No Name Available';
        
        return {
            id: user.id,
            name: displayName,
            email: user.email || user.original?.email || 'No email',
            role: user.original?.role || 'patient',
            isAdmin: user.original?.isAdmin ? 'Yes' : 'No',
            activeStatus: user.original?.isActive !== false ? 'Active' : 'Inactive',
            isActive: user.original?.isActive !== false, // Default to true if not specified
            registered: user.registered || 'Unknown'
        };
    });

    return (
        <div className="screen-content">
            <header className="content-header">
                <h2>User Management</h2>
                <p>View, edit, and manage all registered users. Total users: {users.length}</p>
            </header>
            
            {editingUser && (
                <div className="edit-modal">
                    <div className="modal-content">
                        <h3>Edit User</h3>
                        {editFormData.isAdmin ? (
                            <div className="form-group">
                                <label>Display Name:</label>
                                <input
                                    type="text"
                                    value={editFormData.displayName || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={editFormData.username || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={editFormData.email || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Role:</label>
                            <select
                                value={editFormData.role || 'patient'}
                                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editFormData.isAdmin || false}
                                    onChange={(e) => setEditFormData({ ...editFormData, isAdmin: e.target.checked })}
                                />
                                Admin User
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editFormData.isActive || false}
                                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                                />
                                Active User
                            </label>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleSaveEdit} className="save-btn">Save</button>
                            <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            <UserDataTable headers={headers} data={tableData} onAction={handleAction} />
        </div>
    );
};

const DoctorManagementScreen = () => {
    const { doctors, loading, error, updateDoctor } = useDoctors();
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const headers = ['Name', 'Email', 'Hospital', 'Experience', 'Consultation Fee', 'Available Status'];
    
    const handleAction = async (action, id) => {
        console.log(`Action: ${action} on doctor ID: ${id}`);
        
        if (action === 'edit') {
            const doctor = doctors?.find(d => d.id === id);
            if (doctor) {
                setEditingDoctor(id);
                setEditFormData({
                    name: doctor.name,
                    email: doctor.original?.email || '',
                    hospital: doctor.original?.hospital || '',
                    specialty: doctor.original?.specialty || '',
                    experience: doctor.original?.experience || 0,
                    consultationFee: doctor.original?.consultationFee || 0,
                    about: doctor.original?.about || '',
                    isAvailable: doctor.original?.isAvailable !== false,
                    languages: doctor.original?.languages || []
                });
            }
        } else if (action === 'toggle') {
            try {
                const doctor = doctors?.find(d => d.id === id);
                if (!doctor) return;
                
                const newAvailableStatus = !doctor.original?.isAvailable;
                
                await updateDoctor(id, { isAvailable: newAvailableStatus });
                console.log(`Doctor ${id} ${newAvailableStatus ? 'activated' : 'deactivated'}`);
            } catch (error) {
                console.error('Error toggling doctor status:', error);
                alert('Failed to update doctor status');
            }
        }
    };

    const handleSaveEdit = async () => {
        try {
            await updateDoctor(editingDoctor, editFormData);
            setEditingDoctor(null);
            setEditFormData({});
            console.log('Doctor updated successfully');
        } catch (error) {
            console.error('Error updating doctor:', error);
            alert('Failed to update doctor');
        }
    };

    const handleCancelEdit = () => {
        setEditingDoctor(null);
        setEditFormData({});
    };

    if (loading) {
        return (
            <div className="screen-content">
                <header className="content-header">
                    <h2>Doctor Management</h2>
                    <p>Loading doctors...</p>
                </header>
            </div>
        );
    }

    if (error) {
        return (
            <div className="screen-content">
                <header className="content-header">
                    <h2>Doctor Management</h2>
                    <p>Error loading doctors: {error}</p>
                </header>
            </div>
        );
    }

    // Transform data for table display using real Firebase structure
    const tableData = (doctors || []).map(doctor => ({
        id: doctor.id,
        name: doctor.name || doctor.original?.name || 'Unknown Doctor',
        email: doctor.original?.email || 'No email',
        hospital: doctor.original?.hospital || 'Unknown Hospital',
        experience: `${doctor.original?.experience || 0} years`,
        consultationFee: `$${doctor.original?.consultationFee || 0}`,
        availableStatus: doctor.original?.isAvailable ? 'Available' : 'Unavailable',
        isAvailable: doctor.original?.isAvailable !== false // for toggle button
    }));

    return (
        <div className="screen-content">
            <header className="content-header">
                <h2>Doctor Management</h2>
                <p>Manage doctor profiles, schedules, and performance metrics. Total doctors: {doctors.length}</p>
            </header>
            
            {editingDoctor && (
                <div className="edit-modal">
                    <div className="modal-content">
                        <h3>Edit Doctor</h3>
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={editFormData.name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={editFormData.email || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Hospital:</label>
                            <input
                                type="text"
                                value={editFormData.hospital || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, hospital: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Specialty:</label>
                            <input
                                type="text"
                                value={editFormData.specialty || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Experience (years):</label>
                            <input
                                type="number"
                                value={editFormData.experience || 0}
                                onChange={(e) => setEditFormData({ ...editFormData, experience: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Consultation Fee ($):</label>
                            <input
                                type="number"
                                value={editFormData.consultationFee || 0}
                                onChange={(e) => setEditFormData({ ...editFormData, consultationFee: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-group">
                            <label>About:</label>
                            <textarea
                                value={editFormData.about || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, about: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editFormData.isAvailable || false}
                                    onChange={(e) => setEditFormData({ ...editFormData, isAvailable: e.target.checked })}
                                />
                                Available for Consultations
                            </label>
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleSaveEdit} className="save-btn">Save</button>
                            <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            
            <DoctorDataTable headers={headers} data={tableData} onAction={handleAction} />
        </div>
    );
};

const AppointmentManagementScreen = () => {
    const { appointments, loading, error, updateAppointment } = useAppointments();
    const headers = ['Patient', 'Patient Email', 'Doctor', 'Specialty', 'Date', 'Fee', 'Status'];

    const handleAction = async (action, id) => {
        console.log(`Action: ${action} on appointment ID: ${id}`);
        
        if (action === 'edit') {
            // Simple edit - just show a prompt for now
            const newStatus = prompt('Enter new status (scheduled, completed, cancelled):');
            if (newStatus) {
                try {
                    await updateAppointment(id, { status: newStatus });
                    alert('Appointment updated successfully!');
                } catch (error) {
                    alert('Failed to update appointment');
                }
            }
        } else if (action === 'delete') {
            // Change delete to status toggle
            const appointment = appointments.find(apt => apt.id === id);
            if (appointment) {
                const currentStatus = appointment.status || appointment.original?.status || 'scheduled';
                let newStatus = currentStatus === 'scheduled' ? 'cancelled' : 'scheduled';
                
                try {
                    await updateAppointment(id, { status: newStatus });
                    alert(`Appointment status changed to ${newStatus}`);
                } catch (error) {
                    alert('Failed to update appointment status');
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="screen-content">
                <header className="content-header">
                    <h2>Appointment Management</h2>
                    <p>Loading appointments...</p>
                </header>
            </div>
        );
    }

    if (error) {
        return (
            <div className="screen-content">
                <header className="content-header">
                    <h2>Appointment Management</h2>
                    <p>Error loading appointments: {error}</p>
                </header>
            </div>
        );
    }

    // Transform data for table display using real Firebase structure
    const tableData = appointments.map(apt => ({
        id: apt.id,
        patient: apt.patient || apt.original?.patientName || 'Unknown Patient',
        patientEmail: apt.original?.patientEmail || 'No email',
        doctor: apt.doctor || apt.original?.doctorName || 'Unknown Doctor',
        specialty: apt.original?.doctorSpecialty || 'General',
        date: apt.date || 'No date',
        fee: `$${apt.original?.consultationFee || 0}`,
        status: apt.status || apt.original?.status || 'Pending'
    }));

    return (
        <div className="screen-content">
            <header className="content-header">
                <h2>Appointment Management</h2>
                <p>Track, reschedule, or cancel appointments. Total appointments: {appointments.length}</p>
            </header>
            <DataTable headers={headers} data={tableData} onAction={handleAction} />
        </div>
    );
};

const ReportsScreen = () => {
    const { users } = useUsers();
    const { doctors } = useDoctors();
    const { appointments } = useAppointments();
    
    // Calculate real analytics from your Firebase data
    const totalRevenue = appointments.reduce((sum, apt) => {
        return sum + (apt.original?.consultationFee || 0);
    }, 0);

    const doctorsBySpecialty = doctors.reduce((acc, doctor) => {
        const specialty = doctor.original?.specialty || 'General';
        acc[specialty] = (acc[specialty] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="screen-content">
            <header className="content-header">
                <h2>Reports & Analytics</h2>
                <p>In-depth analysis of your HealthEye platform data.</p>
            </header>
            <div className="reports-grid">
                <div className="report-card">
                    <h3>User Growth Trends</h3>
                    <div className="chart-container line-chart">
                         <svg viewBox="0 0 100 50">
                            <polyline fill="none" stroke="var(--primary-glow)" strokeWidth="1" points="0,45 15,30 30,35 45,20 60,25 75,10 90,15 100,5" />
                         </svg>
                    </div>
                    <p>Total Users: <strong>{users.length}</strong></p>
                </div>
                <div className="report-card">
                    <h3>Doctors by Specialty</h3>
                    <div className="chart-container">
                        {Object.entries(doctorsBySpecialty).slice(0, 3).map(([specialty, count], i) => (
                            <div className="bar-wrapper" key={i}>
                                <div className="bar" style={{'--height': `${(count / Math.max(...Object.values(doctorsBySpecialty))) * 100}%`}}></div>
                                <span className="bar-label">{specialty}</span>
                            </div>
                        ))}
                    </div>
                    <p>Total Doctors: <strong>{doctors.length}</strong></p>
                </div>
                <div className="report-card">
                    <h3>Revenue Analytics</h3>
                    <div className="revenue-stats">
                        <div className="revenue-item">
                            <span className="revenue-label">Total Revenue:</span>
                            <span className="revenue-value">${totalRevenue}</span>
                        </div>
                        <div className="revenue-item">
                            <span className="revenue-label">Average per Appointment:</span>
                            <span className="revenue-value">${appointments.length > 0 ? Math.round(totalRevenue / appointments.length) : 0}</span>
                        </div>
                        <div className="revenue-item">
                            <span className="revenue-label">Total Appointments:</span>
                            <span className="revenue-value">{appointments.length}</span>
                        </div>
                    </div>
                </div>
                <div className="report-card">
                    <h3>Platform Statistics</h3>
                    <div className="platform-stats">
                        <div className="stat-row">
                            <span>Admin Users:</span>
                            <span>{users.filter(u => u.original?.isAdmin).length}</span>
                        </div>
                        <div className="stat-row">
                            <span>Regular Users:</span>
                            <span>{users.filter(u => !u.original?.isAdmin).length}</span>
                        </div>
                        <div className="stat-row">
                            <span>Available Doctors:</span>
                            <span>{doctors.filter(d => d.original?.isAvailable).length}</span>
                        </div>
                        <div className="stat-row">
                            <span>Offline Doctors:</span>
                            <span>{doctors.filter(d => !d.original?.isAvailable).length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// This is the only functional screen as requested
const SettingsScreen = ({ settings, setSettings }) => {
    const [saving, setSaving] = useState(false);
    const [clearingCache, setClearingCache] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const handleToggle = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const handleSelectChange = async (e) => {
        const newSettings = { ...settings, [e.target.name]: e.target.value };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const saveSettings = async (newSettings) => {
        setSaving(true);
        try {
            await settingsService.saveSettings(newSettings);
            setLastSaved(new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
        setSaving(false);
    };

    const handleClearCache = async () => {
        setClearingCache(true);
        try {
            const result = await settingsService.clearCache();
            if (result.success) {
                alert('System cache cleared successfully!');
            } else {
                alert('Failed to clear cache: ' + result.message);
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            alert('Error clearing cache');
        }
        setClearingCache(false);
    };

    return (
        <div className="screen-content">
            <header className="content-header">
                <h2>Settings & Configuration</h2>
                <p>Customize the application behavior and appearance.</p>
            </header>
            <div className="settings-container">
                <div className="setting-card">
                    <h3>Appearance</h3>
                    <div className="setting-item">
                        <label>UI Theme</label>
                        <select name="theme" value={settings.theme} onChange={handleSelectChange}>
                            <option value="dark_blue">Dark Blue (Default)</option>
                            <option value="dark_purple">Dark Purple</option>
                            <option value="light_mode">Light Mode</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Enable 3D Background Animation</label>
                        <label className="switch">
                            <input type="checkbox" checked={settings.animations} onChange={() => handleToggle('animations')} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="setting-card">
                    <h3>Data Management</h3>
                    <div className="setting-item">
                        <label>Auto-refresh Data Every (seconds)</label>
                        <select name="refreshInterval" value={settings.refreshInterval} onChange={handleSelectChange}>
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="300">5 minutes</option>
                            <option value="600">10 minutes</option>
                            <option value="0">Manual only</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Records per page</label>
                        <select name="recordsPerPage" value={settings.recordsPerPage} onChange={handleSelectChange}>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Show detailed timestamps</label>
                         <label className="switch">
                            <input type="checkbox" checked={settings.showTimestamps} onChange={() => handleToggle('showTimestamps')} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
                
                 <div className="setting-card">
                    <h3>System</h3>
                    <div className="setting-item">
                        <label>System Maintenance Mode</label>
                         <label className="switch">
                            <input type="checkbox" checked={settings.maintenanceMode} onChange={() => handleToggle('maintenanceMode')} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="setting-item">
                        <button 
                            className="action-button" 
                            onClick={handleClearCache}
                            disabled={clearingCache}
                        >
                            {clearingCache ? 'Clearing...' : 'Clear System Cache'}
                        </button>
                        {lastSaved && (
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                                Settings last saved at {lastSaved}
                            </p>
                        )}
                        {saving && (
                            <p style={{ fontSize: '12px', color: '#007bff', marginTop: '5px' }}>
                                Saving settings...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [activeScreen, setActiveScreen] = useState('Dashboard');
    const [settings, setSettings] = useState({
        theme: 'dark_blue',
        animations: true,
        refreshInterval: '60',
        recordsPerPage: '25',
        showTimestamps: true,
        maintenanceMode: false,
    });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Load settings from Firebase on startup
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await settingsService.getSettings();
                setSettings(savedSettings);
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePos({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const renderScreen = () => {
        switch (activeScreen) {
            case 'Dashboard': 
                return <ErrorBoundary><DashboardScreen setActiveScreen={setActiveScreen} /></ErrorBoundary>;
            case 'User Management': 
                return <ErrorBoundary><UserManagementScreen /></ErrorBoundary>;
            case 'Doctor Management': 
                return <ErrorBoundary><DoctorManagementScreen /></ErrorBoundary>;
            case 'Appointment Management': 
                return <ErrorBoundary><AppointmentManagementScreen /></ErrorBoundary>;
            case 'Reports & Analytics': 
                return <ErrorBoundary><ReportsScreen /></ErrorBoundary>;
            case 'Settings': 
                return <ErrorBoundary><SettingsScreen settings={settings} setSettings={setSettings} /></ErrorBoundary>;
            default: 
                return <ErrorBoundary><DashboardScreen setActiveScreen={setActiveScreen} /></ErrorBoundary>;
        }
    };
    
    // Calculate rotation based on mouse position for the 3D effect
    const rotX = (mousePos.y / window.innerHeight - 0.5) * -10;
    const rotY = (mousePos.x / window.innerWidth - 0.5) * 10;
    
    const panelStyle = {
        '--rot-x': `${rotX}deg`,
        '--rot-y': `${rotY}deg`,
    };

    return (
        <>
            <style>{STYLES}</style>
            <div id="app-container" data-theme={settings.theme}>
                {settings.animations && <ThreeJSBackground />}
                <div className="admin-panel" style={panelStyle}>
                    <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
                    <main className="main-content">
                        {renderScreen()}
                    </main>
                </div>
                <div className="glow-cursor" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}></div>
            </div>
        </>
    );
}

// Export App wrapped with Admin Authentication
export default function AppWithAuth() {
    return (
        <AdminAuthWrapper>
            <App />
        </AdminAuthWrapper>
    );
}

// --- CSS Styles ---
// All styles are included here to keep it in a single file, as requested.
const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap');

    :root {
        --bg-color-dark: #01040a;
        --bg-color-light: #0a0f1a;
        --panel-bg: rgba(10, 15, 26, 0.6);
        --sidebar-bg: rgba(5, 8, 14, 0.7);
        --border-color: rgba(0, 170, 255, 0.2);
        --primary-glow: #00aaff;
        --primary-text: #e6f1ff;
        --secondary-text: #8b949e;
        --accent-color: #00ffff;
        --danger-color: #ff4d4d;
        --positive-color: #4dff88;
        --font-primary: 'Orbitron', sans-serif;
        --font-secondary: 'Roboto', sans-serif;
        --rot-x: 0deg;
        --rot-y: 0deg;
    }

    [data-theme="dark_purple"] {
        --primary-glow: #a855f7;
        --accent-color: #e879f9;
        --border-color: rgba(168, 85, 247, 0.2);
    }
    
    [data-theme="light_mode"] {
        --bg-color-dark: #f0f2f5;
        --bg-color-light: #ffffff;
        --panel-bg: rgba(255, 255, 255, 0.7);
        --sidebar-bg: rgba(240, 242, 245, 0.8);
        --border-color: rgba(0, 20, 50, 0.1);
        --primary-glow: #0052cc;
        --primary-text: #091e42;
        --secondary-text: #505f79;
        --accent-color: #0065ff;
    }


    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body, html {
        width: 100%;
        height: 100%;
        overflow: hidden;
        font-family: var(--font-secondary);
        background-color: var(--bg-color-dark);
        color: var(--primary-text);
    }

    #app-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
        background-image: radial-gradient(circle at 20% 80%, rgba(0, 170, 255, 0.1), transparent 30%),
                          radial-gradient(circle at 80% 30%, var(--primary-glow), transparent 30%);
        perspective: 2000px;
        transition: background-color 0.5s ease;
    }

    .glow-cursor {
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: -2;
        opacity: 0.15;
        filter: blur(50px);
    }

    .admin-panel {
        width: 95vw;
        height: 95vh;
        max-width: 1800px;
        max-height: 1000px;
        display: flex;
        background: var(--panel-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.5), inset 0 0 15px var(--border-color);
        transform-style: preserve-3d;
        transform: rotateX(var(--rot-x)) rotateY(var(--rot-y));
        transition: transform 0.1s ease-out, background-color 0.5s ease;
        overflow: hidden;
    }

    .sidebar {
        width: 260px;
        flex-shrink: 0;
        background: var(--sidebar-bg);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        padding: 2rem 0;
        transition: background-color 0.5s ease;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        padding: 0 2rem;
        margin-bottom: 3rem;
    }
    
    .logo-image {
        width: 40px;
        height: 40px;
        margin-right: 1rem;
        border-radius: 8px;
        object-fit: contain;
        filter: drop-shadow(0 0 10px var(--primary-glow));
        transition: transform 0.3s ease, filter 0.3s ease;
    }
    
    .logo-image:hover {
        transform: scale(1.1);
        filter: drop-shadow(0 0 15px var(--primary-glow));
    }

    .sidebar-header h1 {
        font-family: var(--font-primary);
        font-size: 1.5rem;
        color: var(--primary-text);
        text-shadow: 0 0 10px var(--primary-glow);
    }

    .sidebar nav ul {
        list-style: none;
    }

    .sidebar nav li {
        display: flex;
        align-items: center;
        padding: 1rem 2rem;
        cursor: pointer;
        position: relative;
        color: var(--secondary-text);
        transition: color 0.3s, background-color 0.3s;
    }

    .sidebar nav li .nav-icon {
        margin-right: 1rem;
        color: var(--secondary-text);
        transition: color 0.3s;
    }
    
    .sidebar nav li .nav-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background: var(--primary-glow);
        box-shadow: 0 0 10px var(--primary-glow);
        transform: scaleY(0);
        transition: transform 0.3s ease;
    }
    
    .sidebar nav li:hover, .sidebar nav li.active {
        color: var(--primary-text);
        background: rgba(0, 170, 255, 0.05);
    }
    
    .sidebar nav li:hover .nav-icon, .sidebar nav li.active .nav-icon {
        color: var(--accent-color);
    }
    
    .sidebar nav li.active .nav-glow {
        transform: scaleY(1);
    }

    .sidebar-footer {
        margin-top: auto;
        padding: 0 2rem;
        font-size: 0.75rem;
        color: var(--secondary-text);
        opacity: 0.5;
    }

    .main-content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 2rem 3rem;
    }

    .main-content::-webkit-scrollbar { width: 6px; }
    .main-content::-webkit-scrollbar-track { background: transparent; }
    .main-content::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }

    .content-header {
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;
    }

    .content-header h2 {
        font-family: var(--font-primary);
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: var(--primary-text);
    }

    .content-header p {
        color: var(--secondary-text);
    }
    
    /* Dashboard Screen */
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .stat-card {
        background: rgba(0, 0, 0, 0.1);
        border: 1px solid var(--border-color);
        padding: 1.5rem;
        border-radius: 10px;
        position: relative;
        transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2), 0 0 15px var(--border-color);
    }

    .stat-card h3 {
        font-size: 1rem;
        color: var(--secondary-text);
        margin-bottom: 1rem;
    }

    .stat-card .stat-value {
        font-family: var(--font-primary);
        font-size: 2.5rem;
        color: var(--primary-text);
    }
    
    .stat-card .stat-change {
        font-size: 0.9rem;
    }
    .stat-card .stat-change.positive { color: var(--positive-color); }
    .stat-card .stat-change.negative { color: var(--danger-color); }

    .large-card {
        grid-column: span 2;
        background: rgba(0,0,0,0.1);
        border: 1px solid var(--border-color);
        padding: 1.5rem;
        border-radius: 10px;
    }
    
    .recent-bookings ul { list-style: none; }
    .recent-bookings li {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
    }
    .recent-bookings li:last-child { border: none; }
    .recent-bookings .service-name { color: var(--secondary-text); margin-left: 1rem; font-size: 0.9em; }

    .analytics-preview h3, .recent-bookings h3, .reports-grid h3 {
        margin-bottom: 1rem;
        font-family: var(--font-primary);
    }

    .chart-container {
        display: flex;
        height: 180px;
        align-items: flex-end;
        justify-content: space-around;
        padding: 1rem 0;
    }
    
    .bar-wrapper { text-align: center; }
    .bar {
        width: 25px;
        background: linear-gradient(to top, var(--primary-glow), var(--accent-color));
        border-radius: 5px 5px 0 0;
        height: var(--height);
        animation: grow-bar 1s ease-out;
    }
    .bar-label { font-size: 0.75rem; color: var(--secondary-text); margin-top: 0.5rem; }

    @keyframes grow-bar {
        from { height: 0; }
        to { height: var(--height); }
    }
    
    /* Data Table */
    .data-table-container {
      overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
        white-space: nowrap;
    }
    
    th {
        font-family: var(--font-primary);
        color: var(--secondary-text);
        font-weight: 400;
    }
    
    tbody tr {
        transition: background-color 0.2s;
    }
    
    tbody tr:hover {
        background: rgba(0, 170, 255, 0.05);
    }
    
    td.actions button {
        margin-right: 0.5rem;
        padding: 0.4rem 0.8rem;
        border-radius: 5px;
        cursor: pointer;
        background: var(--border-color);
        color: var(--primary-text);
        border: 1px solid var(--primary-glow);
        transition: background-color 0.2s, box-shadow 0.2s;
    }
    
    td.actions button:hover {
        background: var(--primary-glow);
        box-shadow: 0 0 10px var(--primary-glow);
    }
    
    td.actions button.danger {
        border-color: var(--danger-color);
    }

    td.actions button.danger:hover {
        background: var(--danger-color);
        box-shadow: 0 0 10px var(--danger-color);
    }
    
    /* Reports Screen */
    .reports-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }
    .report-card {
        background: rgba(0,0,0,0.1);
        border: 1px solid var(--border-color);
        padding: 1.5rem;
        border-radius: 10px;
    }
    .line-chart svg {
        width: 100%;
        height: 100%;
    }
    .line-chart polyline {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: dash 2s ease-out forwards;
    }
    @keyframes dash {
      to {
        stroke-dashoffset: 0;
      }
    }

    /* New styles for enhanced reports */
    .revenue-stats, .platform-stats {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }
    .revenue-item, .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: rgba(0, 170, 255, 0.05);
        border-radius: 5px;
        border-left: 3px solid var(--primary-glow);
    }
    .revenue-label {
        color: var(--secondary-text);
        font-size: 0.9rem;
    }
    .revenue-value {
        color: var(--primary-text);
        font-weight: bold;
        font-family: var(--font-primary);
    }
    .stat-row span:first-child {
        color: var(--secondary-text);
    }
    .stat-row span:last-child {
        color: var(--accent-color);
        font-weight: bold;
    }

    /* Settings Screen */
    .settings-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    .setting-card {
        background: rgba(0,0,0,0.1);
        border: 1px solid var(--border-color);
        padding: 1.5rem;
        border-radius: 10px;
    }
    .setting-card h3 {
        font-family: var(--font-primary);
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;
    }
    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    .setting-item label {
        color: var(--secondary-text);
        max-width: 60%;
    }
    select, .action-button {
        background: rgba(0,0,0,0.2);
        border: 1px solid var(--border-color);
        color: var(--primary-text);
        padding: 0.5rem;
        border-radius: 5px;
        font-family: var(--font-secondary);
    }
    .action-button {
        cursor: pointer;
        transition: background-color 0.3s, box-shadow 0.3s;
    }
    .action-button:hover {
        background-color: var(--primary-glow);
        box-shadow: 0 0 10px var(--primary-glow);
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 28px;
    }
    .switch input { display: none; }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(120, 120, 120, 0.3);
        transition: .4s;
        border-radius: 28px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider { background-color: var(--primary-glow); }
    input:checked + .slider:before { transform: translateX(22px); }
`;

