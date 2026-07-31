import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CreateComplaintModal } from './components/CreateComplaintModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';

import { LoginView } from './views/LoginView';
import { UserDashboard } from './views/UserDashboard';
import { TechnicianDashboard } from './views/TechnicianDashboard';
import { SupervisorDashboard } from './views/SupervisorDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { AnalyticsView } from './views/AnalyticsView';
import { UserManagementView } from './views/UserManagementView';
import { AuditLogsView } from './views/AuditLogsView';
import { IssuePresetsView } from './views/IssuePresetsView';
import { CategoryManagerView } from './views/CategoryManagerView';

function MainApp() {
  const { currentUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleDefaultPath = (role) => {
    if (role === 'user') return '/user';
    if (role === 'technician') return '/technician';
    if (role === 'supervisor') return '/supervisor';
    if (role === 'admin') return '/admin';
    return '/login';
  };

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    const path = getRoleDefaultPath(user?.role || currentUser.role);
    navigate(path);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getRoleDefaultPath(currentUser.role)} replace />
          ) : (
            <LoginView onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      <Route
        path="/*"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans">
              {/* Full-Height Vertical Side Navigation Bar (Only for Supervisor & Admin) */}
              {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && (
                <Sidebar
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onLogout={() => setIsAuthenticated(false)}
                />
              )}

              {/* Right Content Panel */}
              <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Top Header Navbar */}
                <Navbar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onLogout={() => setIsAuthenticated(false)}
                />

                {/* Dynamic Route View Area */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Routes>
                    <Route
                      path="/user"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['user']}>
                          <UserDashboard
                            onOpenCreateModal={() => setIsCreateModalOpen(true)}
                            onSelectComplaint={(c) => setSelectedComplaint(c)}
                            searchQuery={searchQuery}
                          />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/technician"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['technician']}>
                          <TechnicianDashboard
                            onSelectComplaint={(c) => setSelectedComplaint(c)}
                            searchQuery={searchQuery}
                          />
                        </ProtectedRoute>
                      }
                    />

                    {/* Supervisor Routes */}
                    <Route
                      path="/supervisor"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['supervisor', 'admin']}>
                          <SupervisorDashboard
                            onSelectComplaint={(c) => setSelectedComplaint(c)}
                            searchQuery={searchQuery}
                          />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/supervisor/analytics"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['supervisor', 'admin']}>
                          <AnalyticsView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/supervisor/issue-presets"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['supervisor', 'admin']}>
                          <IssuePresetsView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/supervisor/users"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['supervisor', 'admin']}>
                          <UserManagementView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/supervisor/audit-logs"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['supervisor', 'admin']}>
                          <AuditLogsView />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']}>
                          <AdminDashboard
                            onSelectComplaint={(c) => setSelectedComplaint(c)}
                            searchQuery={searchQuery}
                          />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/analytics"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']}>
                          <AnalyticsView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/issue-presets"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']}>
                          <IssuePresetsView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']}>
                          <UserManagementView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/audit-logs"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']}>
                          <AuditLogsView />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/categories"
                      element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']}>
                          <CategoryManagerView />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<Navigate to={getRoleDefaultPath(currentUser.role)} replace />} />
                  </Routes>
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
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
