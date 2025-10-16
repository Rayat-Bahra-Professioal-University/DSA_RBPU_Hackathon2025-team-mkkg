import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import ContentLayout from "./components/layouts/ContentLayout";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import AdminDashboard from "./pages/admin-dashboard/AdminDashboard";
import AssignIssues from "./pages/assign-issues/AssignIssues";
import ChangePassword from "./pages/change-password/ChangePassword";
import CreateIssue from "./pages/create-issue/CreateIssue";
import Dashboard from "./pages/dashboard/Dashboard";
import DeleteAccount from "./pages/delete-account/DeleteAccount";
import IssueDetails from "./pages/issue-details/IssueDetails";
import Landing from "./pages/landing/Landing";
import ManageAdmins from "./pages/manage-admins/ManageAdmins";
import MyAssignedIssues from "./pages/my-assigned-issues/MyAssignedIssues";
import UserProfile from "./pages/profile/UserProfile";
import SearchComplaints from "./pages/search-complaints/SearchComplaints";
import ViewAllComplaints from "./pages/view-complaints/ViewAllComplaints";

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app">
      {!isLandingPage && (
        <SignedIn>
          <Navbar
            onMobileMenuToggle={handleMobileMenuToggle}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          <Sidebar isOpen={isMobileMenuOpen} onClose={handleMobileMenuClose} />
        </SignedIn>
      )}

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <Dashboard />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-issue"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <CreateIssue />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search-complaints"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <SearchComplaints />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-complaints"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <ViewAllComplaints />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/issue/:id"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <IssueDetails />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <UserProfile />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <ChangePassword />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delete-account"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <DeleteAccount />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <AdminDashboard />
              </ContentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assign-issues"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <AssignIssues />
              </ContentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/my-assigned"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <MyAssignedIssues />
              </ContentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-admins"
          element={
            <ProtectedRoute>
              <ContentLayout>
                <ManageAdmins />
              </ContentLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
