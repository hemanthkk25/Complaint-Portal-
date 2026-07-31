import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CreateComplaintModal } from './components/CreateComplaintModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';

import { LoginView } from './views/LoginView';
import { UserDashboard } from './views/UserDashboard';
import { StaffDashboard } from './views/StaffDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { AnalyticsView } from './views/AnalyticsView';
import { UserManagementView } from './views/UserManagementView';
import { AuditLogsView } from './views/AuditLogsView';
import { SuperAdminConfigView } from './views/SuperAdminConfigView';

function MainApp() {
  const { currentUser } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('my_complaints');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentUser.role === 'user') {
      setActiveTab('my_complaints');
    } else if (currentUser.role === 'staff') {
      setActiveTab('staff_queue');
    } else if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      setActiveTab('admin_master');
    }
  }, [currentUser.role]);

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Sidebar is only shown for Admin & Super Admin roles
  const showSidebar = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Content Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Render Sidebar ONLY for Admin & Super Admin */}
        {showSidebar && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}

        {/* Dynamic View Area: Occupies full 100% width for User and Staff roles */}
        <main className="flex-1 min-w-0">
          {currentUser.role === 'user' && (
            <UserDashboard
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              searchQuery={searchQuery}
            />
          )}

          {currentUser.role === 'staff' && (
            <StaffDashboard
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              searchQuery={searchQuery}
            />
          )}

          {showSidebar && activeTab === 'admin_master' && (
            <AdminDashboard
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              searchQuery={searchQuery}
            />
          )}

          {showSidebar && activeTab === 'analytics' && <AnalyticsView />}

          {showSidebar && activeTab === 'user_mgmt' && <UserManagementView />}

          {showSidebar && activeTab === 'audit_logs' && <AuditLogsView />}

          {currentUser.role === 'superadmin' && activeTab === 'super_config' && (
            <SuperAdminConfigView />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateComplaintModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
