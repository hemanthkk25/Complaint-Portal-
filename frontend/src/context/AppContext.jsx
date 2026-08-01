import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [predefinedIssues, setPredefinedIssues] = useState({});
  const [departments, setDepartments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch initial state directly from Express Backend REST API
  const refreshBackendData = async () => {
    try {
      const [complaintsRes, usersRes, catRes, presetsRes, auditRes] = await Promise.allSettled([
        api.getComplaints(),
        api.getUsers(),
        api.getCategories(),
        api.getPresets(),
        api.getAuditLogs(),
      ]);

      if (complaintsRes.status === 'fulfilled' && complaintsRes.value?.complaints) {
        setComplaints(complaintsRes.value.complaints);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
        setUsers(usersRes.value.users);
        if (!currentUser) {
          const defaultUser = usersRes.value.users.find(u => u.role === 'user') || usersRes.value.users[0];
          setCurrentUser(defaultUser);
        }
      }
      if (catRes.status === 'fulfilled' && catRes.value?.categories) {
        setCategories(catRes.value.categories);
        if (catRes.value.departments) setDepartments(catRes.value.departments);
      }
      if (presetsRes.status === 'fulfilled' && presetsRes.value?.predefinedIssues) {
        setPredefinedIssues(presetsRes.value.predefinedIssues);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value?.auditLogs) {
        setAuditLogs(auditRes.value.auditLogs);
      }
    } catch (err) {
      console.error('Failed to load data from Backend REST API:', err.message);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  const sendNotification = (userId, title, message, type = 'info', complaintId = null, ticketId = null) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      complaintId,
      ticketId,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = (userId) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  };

  const logAuditEvent = (action, details, targetType = 'General', targetId = null) => {
    if (!currentUser) return;
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      targetType,
      targetId,
      ipAddress: '127.0.0.1',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const loginUser = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.user) {
      localStorage.setItem('COMPLAINT_PORTAL_TOKEN', res.token);
      setCurrentUser(res.user);
      logAuditEvent('USER_LOGIN', `Logged in as ${res.user.name} (${res.user.role})`, 'Auth', res.user.id);
      return { success: true, user: res.user };
    }
    return { success: false, message: res.message || 'Login failed.' };
  };

  const createComplaint = async (formData) => {
    const res = await api.createComplaint({
      ...formData,
      createdBy: currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      } : { id: 'usr-1', name: 'User', email: 'user@portal.edu' }
    });

    if (res.success && res.complaint) {
      await refreshBackendData();
      sendNotification(
        currentUser?.id || 'usr-1',
        'Complaint Ticket Submitted',
        `Ticket #${res.complaint.ticketId} created successfully. Assigned Priority: ${res.complaint.priority.toUpperCase()}.`,
        'creation',
        res.complaint.id,
        res.complaint.ticketId
      );
      return res.complaint;
    }
    return null;
  };

  const updateComplaintStatus = async (complaintId, newStatus, note = '', afterImageUrl = null) => {
    const res = await api.updateStatus(complaintId, {
      newStatus,
      note,
      afterImageUrl,
      changedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Staff'
    });
    if (res.success) {
      await refreshBackendData();
    }
  };

  const reassignStaffManually = async (complaintId, newStaffId) => {
    const res = await api.reassignTechnician(complaintId, {
      newStaffId,
      changedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Supervisor'
    });
    if (res.success) {
      await refreshBackendData();
    }
  };

  const addFeedbackRating = async (complaintId, rating, feedback) => {
    const res = await api.addFeedback(complaintId, { rating, feedback });
    if (res.success) {
      await refreshBackendData();
    }
  };

  const checkDuplicateComplaints = async (draftComplaint) => {
    try {
      const res = await api.checkDuplicates(draftComplaint);
      return res;
    } catch (err) {
      return { success: false, duplicates: [] };
    }
  };

  const addPredefinedIssue = async (categoryName, issueText) => {
    if (!categoryName || !issueText) return;
    const res = await api.addPreset(categoryName, issueText);
    if (res.success) {
      await refreshBackendData();
    }
  };

  const removePredefinedIssue = async (categoryName, issueText) => {
    const res = await api.removePreset(categoryName, issueText);
    if (res.success) {
      await refreshBackendData();
    }
  };

  const addCategory = async (categoryName, description) => {
    if (!categoryName || !categoryName.trim()) return;
    const res = await api.addCategory(categoryName, description);
    if (res.success) {
      await refreshBackendData();
    }
  };

  const addUserByAdmin = async (userData) => {
    const res = await api.createUser(userData);
    if (res.success && res.user) {
      await refreshBackendData();
      return res.user;
    }
    return null;
  };

  const toggleUserStatus = async (userId) => {
    const res = await api.toggleUserStatus(userId);
    if (res.success) {
      await refreshBackendData();
    }
  };

  const assignSupervisorToCategory = async (supervisorUserId, categoryName) => {
    const res = await api.assignSupervisorCategory(supervisorUserId, categoryName);
    if (res.success) {
      await refreshBackendData();
    }
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        complaints,
        categories,
        predefinedIssues,
        departments,
        statusHistory,
        notifications,
        auditLogs,

        loginUser,
        createComplaint,
        updateComplaintStatus,
        reassignStaffManually,
        addFeedbackRating,
        checkDuplicateComplaints,

        addPredefinedIssue,
        removePredefinedIssue,
        addCategory,
        addUserByAdmin,
        toggleUserStatus,
        assignSupervisorToCategory,

        markNotificationRead,
        markAllNotificationsRead,
        logAuditEvent,
        refreshBackendData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
