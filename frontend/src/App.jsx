import { useState } from "react";
import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import "./App.css";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import ContentLayout from "./components/layouts/ContentLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateIssue from "./pages/create-issue/CreateIssue";
import SearchComplaints from "./pages/search-complaints/SearchComplaints";
import UserProfile from "./pages/profile/UserProfile";
import ChangePassword from "./pages/change-password/ChangePassword";
import DeleteAccount from "./pages/delete-account/DeleteAccount";
import IssueDetails from "./pages/issue-details/IssueDetails";
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

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <SignedIn>
          <Navbar
            onMobileMenuToggle={handleMobileMenuToggle}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          <Sidebar isOpen={isMobileMenuOpen} onClose={handleMobileMenuClose} />
        </SignedIn>

        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ContentLayout>
                  <Dashboard />
                </ContentLayout>
              </ProtectedRoute>
            }
          />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
