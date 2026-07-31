import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_COMPLAINTS,
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_PREDEFINED_ISSUES,
  INITIAL_LOCATIONS,
  INITIAL_STATUS_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  calculatePriority,
  findBestStaffAssignment,
  detectDuplicates,
} from '../utils/ruleEngine';

const AppContext = createContext();

export function AppProvider({ children }) {
  // LocalStorage Persistence Keys
  const STORAGE_KEY = 'COMPLAINT_PORTAL_STATE_V7';

  // State initialization
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_USERS`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate legacy emails and roles
      return parsed.map(u => {
        if (u.id === 'adm-1' || u.email.includes('robert.sterling')) {
          return {
            ...u,
            email: 'robert.sterling@supervisor.portal.edu',
            role: 'supervisor',
            name: 'Robert Sterling',
            assignedCategory: u.assignedCategory || 'Electrical',
            department: 'Electrical Engineering',
            departmentName: 'Electrical Engineering'
          };
        }
        if (u.id === 'adm-2' || u.email.includes('sarah.jenkins')) {
          return {
            ...u,
            email: 'sarah.jenkins@supervisor.portal.edu',
            role: 'supervisor',
            name: 'Sarah Jenkins',
            assignedCategory: u.assignedCategory || 'Plumbing',
            department: 'Plumbing & Water Services',
            departmentName: 'Plumbing & Water Services'
          };
        }
        if (u.id === 'sup-1' || u.email.includes('chiefhead') || u.role === 'chief_head') {
          return { ...u, email: 'dr.evelyn@admin.portal.edu', role: 'admin', name: 'Dr. Evelyn Vance', department: 'System Administration' };
        }
        if (u.id === 'stf-1' || u.role === 'staff') {
          return { ...u, email: 'marcus.vance@technician.portal.edu', role: 'technician', name: 'Marcus Vance' };
        }
        if (u.id === 'stf-2') {
          return { ...u, email: 'david.miller@technician.portal.edu', role: 'technician', name: 'David Miller' };
        }
        if (u.id === 'stf-3') {
          return { ...u, email: 'elena.rostova@technician.portal.edu', role: 'technician', name: 'Elena Rostova' };
        }
        return u;
      });
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return users.find(u => u.role === 'user') || users[0];
  });

  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_COMPLAINTS`);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CATEGORIES`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [predefinedIssues, setPredefinedIssues] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_PREDEFINED_ISSUES`);
    return saved ? JSON.parse(saved) : INITIAL_PREDEFINED_ISSUES;
  });

  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_DEPARTMENTS`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [statusHistory, setStatusHistory] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_HISTORY`);
    return saved ? JSON.parse(saved) : INITIAL_STATUS_HISTORY;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_NOTIFICATIONS`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_LOGS`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_USERS`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_COMPLAINTS`, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CATEGORIES`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_DEPARTMENTS`, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_HISTORY`, JSON.stringify(statusHistory));
  }, [statusHistory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_NOTIFICATIONS`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_LOGS`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper: Log Audit Event
  const logAuditEvent = (action, details, targetType, targetId) => {
    const newLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Local Session)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper: Create Notification
  const sendNotification = (userId, title, message, type, complaintId, ticketId) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      type,
      ticketId,
      complaintId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Switch Active User / Quick Role Toggle for Demo
  const switchUserRole = (roleName) => {
    const foundUser = users.find(u => u.role === roleName);
    if (foundUser) {
      setCurrentUser(foundUser);
      logAuditEvent('USER_ROLE_SWITCH', `Switched active perspective to ${roleName.toUpperCase()} (${foundUser.name})`, 'Auth', foundUser.id);
    }
  };

  const loginUser = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      setCurrentUser(found);
      logAuditEvent('USER_LOGIN', `Logged in as ${found.name} (${found.role})`, 'Auth', found.id);
      return { success: true, user: found };
    }

    // Auto-detect role from institutional email domain patterns
    let detectedRole = 'user';
    let deptName = 'General Academic';
    if (cleanEmail.includes('technician') || cleanEmail.includes('tech') || cleanEmail.includes('staff')) {
      detectedRole = 'technician';
      deptName = 'Electrical Engineering';
    } else if (cleanEmail.includes('supervisor') || cleanEmail.includes('cathead')) {
      detectedRole = 'supervisor';
      deptName = 'Facilities Supervision';
    } else if (cleanEmail.includes('admin') || cleanEmail.includes('superadmin')) {
      detectedRole = 'admin';
      deptName = 'System Administration';
    }

    const autoCreatedUser = {
      id: `${detectedRole.slice(0, 3)}-${Date.now()}`,
      name: cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Portal User',
      email: cleanEmail,
      password: password || 'password123',
      role: detectedRole,
      department: deptName,
      departmentName: deptName,
      phone: '+1 (555) 000-1111',
      avatar: detectedRole === 'staff' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' 
        : detectedRole === 'admin' || detectedRole === 'superadmin'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, autoCreatedUser]);
    setCurrentUser(autoCreatedUser);
    logAuditEvent('USER_LOGIN_AUTO', `Logged in via email pattern detection as ${autoCreatedUser.name} (${autoCreatedUser.role})`, 'Auth', autoCreatedUser.id);
    return { success: true, user: autoCreatedUser };
  };

  const registerUser = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password || 'password123',
      role: userData.role || 'user',
      department: userData.department || 'General',
      phone: userData.phone || '+1 (555) 000-0000',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    logAuditEvent('USER_REGISTER', `New user registered: ${newUser.name}`, 'User', newUser.id);
    return newUser;
  };

  // Module 2, 3, 4, 10: Create Complaint with Rule-Based Logic
  const createComplaint = (formData) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randId = Math.floor(100 + Math.random() * 900);
    const ticketId = `TICK-${dateStr}-${randId}`;
    const complaintId = `cmp-${Date.now()}`;

    // Module 3: Priority Calculation (Deterministic Rule Engine)
    const priorityResult = calculatePriority(
      formData.category,
      formData.title,
      formData.description,
      formData.userUrgency
    );

    // Find category object
    const categoryObj = categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase()) || categories[0];

    // Module 4: Staff Workload Balancing Auto-Assignment
    const assignedStaff = findBestStaffAssignment(categoryObj, users, complaints);

    const initialStatus = assignedStaff ? 'assigned' : 'submitted';

    const newComplaint = {
      id: complaintId,
      ticketId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      departmentId: categoryObj.departmentId,
      location: {
        block: formData.block,
        floor: formData.floor,
        room: formData.room,
      },
      priority: priorityResult.priority,
      priorityReason: priorityResult.summary,
      priorityScore: priorityResult.score,
      status: initialStatus,
      userUrgency: formData.userUrgency || 'Standard',
      createdBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      assignedTo: assignedStaff ? {
        id: assignedStaff.id,
        name: assignedStaff.name,
        department: assignedStaff.departmentName || 'Maintenance',
      } : null,
      attachments: formData.attachments || [],
      beforeImageUrl: null,
      afterImageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      rating: null,
      feedback: null,
      duplicateOf: formData.duplicateOf || null,
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Initial Status History Log
    const historyItem = {
      id: `hist-${Date.now()}`,
      complaintId,
      oldStatus: null,
      newStatus: initialStatus,
      changedBy: `${currentUser.name} (${currentUser.role})`,
      timestamp: new Date().toISOString(),
      notes: `Ticket created with ${priorityResult.priority.toUpperCase()} priority. ${assignedStaff ? `Auto-assigned to ${assignedStaff.name}` : 'Awaiting assignment.'}`,
    };
    setStatusHistory(prev => [historyItem, ...prev]);

    // Module 6 Notifications
    sendNotification(
      currentUser.id,
      'Complaint Ticket Submitted',
      `Ticket #${ticketId} created successfully. Assigned Priority: ${priorityResult.priority.toUpperCase()}.`,
      'creation',
      complaintId,
      ticketId
    );

    if (assignedStaff) {
      sendNotification(
        assignedStaff.id,
        'New Work Order Assigned',
        `You have been auto-assigned ticket #${ticketId} (${formData.category} - ${priorityResult.priority.toUpperCase()} Priority).`,
        'assignment',
        complaintId,
        ticketId
      );
    }

    logAuditEvent(
      'CREATE_COMPLAINT',
      `Created ticket #${ticketId} (${formData.category}, Priority: ${priorityResult.priority})`,
      'Complaint',
      complaintId
    );

    return newComplaint;
  };

  // Module 5 & 8: Update Complaint Status & Upload Before/After Proof
  const updateComplaintStatus = (complaintId, newStatus, extraData = {}) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        const oldStatus = c.status;
        const isResolving = newStatus === 'completed';
        
        const updated = {
          ...c,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          resolvedAt: isResolving ? new Date().toISOString() : c.resolvedAt,
          beforeImageUrl: extraData.beforeImageUrl || c.beforeImageUrl,
          afterImageUrl: extraData.afterImageUrl || c.afterImageUrl,
        };

        // Add history entry
        const historyItem = {
          id: `hist-${Date.now()}`,
          complaintId,
          oldStatus,
          newStatus,
          changedBy: `${currentUser.name} (${currentUser.role})`,
          timestamp: new Date().toISOString(),
          notes: extraData.notes || `Status changed from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
        };
        setStatusHistory(h => [historyItem, ...h]);

        // Send notifications
        if (c.createdBy?.id) {
          sendNotification(
            c.createdBy.id,
            `Ticket Status Updated: ${newStatus.replace('_', ' ').toUpperCase()}`,
            `Ticket #${c.ticketId} is now ${newStatus.replace('_', ' ')}.`,
            'status_change',
            complaintId,
            c.ticketId
          );
        }

        logAuditEvent(
          'UPDATE_COMPLAINT_STATUS',
          `Changed status of #${c.ticketId} from ${oldStatus} to ${newStatus}`,
          'Complaint',
          complaintId
        );

        return updated;
      }
      return c;
    }));
  };

  // Module 4: Manual Staff Reassignment & Dispatch
  const reassignStaffManually = (complaintId, newStaffId) => {
    if (!newStaffId) {
      setComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          const prevStaff = c.assignedTo?.name || 'Unassigned';
          const updated = {
            ...c,
            assignedTo: null,
            status: c.status === 'in_progress' ? 'submitted' : c.status,
            updatedAt: new Date().toISOString(),
          };
          logAuditEvent('STAFF_UNASSIGNMENT', `Unassigned ticket #${c.ticketId} from ${prevStaff}`, 'Complaint', complaintId);
          return updated;
        }
        return c;
      }));
      return;
    }

    const staffMember = users.find(u => u.id === newStaffId);
    if (!staffMember) return;

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        const prevStaff = c.assignedTo?.name || 'Unassigned';
        const updated = {
          ...c,
          status: c.status === 'submitted' ? 'in_progress' : c.status,
          assignedTo: {
            id: staffMember.id,
            name: staffMember.name,
            email: staffMember.email,
            avatar: staffMember.avatar,
            department: staffMember.departmentName || staffMember.department || 'Maintenance',
          },
          updatedAt: new Date().toISOString(),
        };

        const historyItem = {
          id: `hist-${Date.now()}`,
          complaintId,
          oldStatus: c.status,
          newStatus: updated.status,
          changedBy: `${currentUser.name} (${currentUser.role})`,
          timestamp: new Date().toISOString(),
          notes: `Reassigned ticket from ${prevStaff} to ${staffMember.name}`,
        };
        setStatusHistory(h => [historyItem, ...h]);

        sendNotification(
          staffMember.id,
          'Work Order Assigned',
          `Ticket #${c.ticketId} has been assigned to you.`,
          'assignment',
          complaintId,
          c.ticketId
        );

        logAuditEvent(
          'MANUAL_STAFF_REASSIGNMENT',
          `Reassigned ticket #${c.ticketId} from ${prevStaff} to ${staffMember.name}`,
          'Complaint',
          complaintId
        );

        return updated;
      }
      return c;
    }));
  };

  // Module 11: Submit Feedback & Rating
  const submitFeedback = (complaintId, rating, comment) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        const updated = {
          ...c,
          rating,
          feedback: comment,
          updatedAt: new Date().toISOString(),
        };

        logAuditEvent(
          'SUBMIT_FEEDBACK',
          `Submitted ${rating}-star feedback for #${c.ticketId}`,
          'Complaint',
          complaintId
        );

        return updated;
      }
      return c;
    }));
  };

  // Read Notification
  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Add / Edit User (Admin/Super Admin)
  const addUserByAdmin = (userData) => {
    const newUser = {
      id: `${userData.role === 'staff' ? 'stf' : 'usr'}-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: 'password123',
      role: userData.role,
      departmentId: userData.departmentId,
      departmentName: userData.departmentName,
      phone: userData.phone || '+1 (555) 000-1111',
      avatar: DEFAULT_USER_AVATAR,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    logAuditEvent('ADMIN_ADD_USER', `Added new user ${newUser.name} as ${newUser.role}`, 'User', newUser.id);
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isDeactivated: !u.isDeactivated } : u));
    logAuditEvent('ADMIN_TOGGLE_USER', `Toggled account status for user ID ${userId}`, 'User', userId);
  };

  // Check Duplicates Helper
  const checkDuplicateComplaints = (draftComplaint) => {
    return detectDuplicates(draftComplaint, complaints);
  };

  const addPredefinedIssue = (categoryName, issueText) => {
    if (!categoryName || !issueText) return;
    setPredefinedIssues(prev => {
      const currentList = prev[categoryName] || [];
      if (currentList.includes(issueText)) return prev;
      return {
        ...prev,
        [categoryName]: [...currentList, issueText]
      };
    });
    logAuditEvent('SUPERVISOR_ADD_PRESET_ISSUE', `Added predefined issue template to category '${categoryName}': ${issueText}`, 'Category', categoryName);
  };

  const removePredefinedIssue = (categoryName, issueText) => {
    setPredefinedIssues(prev => {
      const currentList = prev[categoryName] || [];
      return {
        ...prev,
        [categoryName]: currentList.filter(item => item !== issueText)
      };
    });
    logAuditEvent('SUPERVISOR_REMOVE_PRESET_ISSUE', `Removed issue template from category '${categoryName}': ${issueText}`, 'Category', categoryName);
  };

  const addCategory = (categoryName, description) => {
    if (!categoryName || !categoryName.trim()) return;
    const trimmed = categoryName.trim();
    const catId = `cat-${Date.now()}`;
    const deptId = `dept-${Date.now()}`;

    const newCategory = {
      id: catId,
      name: trimmed,
      description: description || `${trimmed} Maintenance & Workorder Management`,
      departmentId: deptId,
    };

    const newDepartment = {
      id: deptId,
      name: `${trimmed} Department`,
      code: trimmed.substring(0, 3).toUpperCase(),
    };

    setCategories(prev => {
      if (prev.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, newCategory];
    });

    setDepartments(prev => {
      if (prev.some(d => d.name.toLowerCase() === `${trimmed} Department`.toLowerCase())) return prev;
      return [...prev, newDepartment];
    });

    setPredefinedIssues(prev => {
      if (prev[trimmed]) return prev;
      return {
        ...prev,
        [trimmed]: [`Standard ${trimmed} Issue Inspection`, `Routine ${trimmed} Repair`]
      };
    });

    logAuditEvent('ADMIN_ADD_CATEGORY_DEPARTMENT', `Created new Category/Department '${trimmed}'`, 'Category', catId);
  };

  const assignSupervisorToCategory = (supervisorUserId, categoryName) => {
    const matchedCategory = categories.find(c => c.name === categoryName);
    setUsers(prev => prev.map(u => {
      if (u.id === supervisorUserId) {
        return {
          ...u,
          assignedCategory: categoryName,
          department: `${categoryName} Department`,
          departmentName: `${categoryName} Department`,
          departmentId: matchedCategory?.departmentId || u.departmentId,
        };
      }
      return u;
    }));
    logAuditEvent('ADMIN_ASSIGN_SUPERVISOR_CATEGORY', `Assigned Supervisor ID ${supervisorUserId} to Category '${categoryName}'`, 'User', supervisorUserId);
  };

  const value = {
    currentUser,
    users,
    complaints,
    categories,
    predefinedIssues,
    departments,
    statusHistory,
    notifications,
    auditLogs,
    switchUserRole,
    loginUser,
    registerUser,
    createComplaint,
    updateComplaintStatus,
    reassignStaffManually,
    assignComplaintToStaff: reassignStaffManually,
    submitFeedback,
    markNotificationRead,
    markAllNotificationsRead,
    addUserByAdmin,
    toggleUserStatus,
    checkDuplicateComplaints,
    setCategories,
    addPredefinedIssue,
    removePredefinedIssue,
    addCategory,
    assignSupervisorToCategory,
    logAuditEvent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
