import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../services/api";
import "./DeleteAccount.css";

export default function DeleteAccount() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const api = useApi();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState("");
  const [pendingIssuesCount, setPendingIssuesCount] = useState(0);

  // Fetch user's pending issues count
  useEffect(() => {
    const fetchPendingIssues = async () => {
      // Don't fetch if not authenticated
      if (!isLoaded || !isSignedIn) {
        return;
      }

      try {
        const response = await api.getMyComplaints({ limit: 1000 });
        if (response.success) {
          // Count pending issues (status: pending, in-progress, assigned)
          const pending = response.data.complaints.filter(
            (complaint) =>
              complaint.status === "pending" ||
              complaint.status === "in-progress" ||
              complaint.status === "assigned"
          ).length;
          setPendingIssuesCount(pending);
        }
      } catch (error) {
        console.error("Error fetching pending issues:", error);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchPendingIssues();
    }
  }, [api, isLoaded, isSignedIn]);

  const handleDelete = async () => {
    setError("");

    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    if (!showWarning) {
      setShowWarning(true);
      return;
    }

    setIsDeleting(true);

    try {
      // Delete the user account
      await user.delete();

      // Sign out after successful deletion
      await signOut();

      alert("Account deleted successfully");
      navigate("/sign-in");
    } catch (error) {
      console.error("Error deleting account:", error);

      // Handle specific Clerk errors
      if (
        error.errors?.[0]?.code === "reverification_required" ||
        error.errors?.[0]?.message?.includes("Reverification")
      ) {
        setError(
          "For security, please sign out and sign back in before deleting your account."
        );
      } else {
        setError(
          error.errors?.[0]?.longMessage ||
            error.errors?.[0]?.message ||
            "Failed to delete account. Please try again."
        );
      }

      setIsDeleting(false);
      setShowWarning(false);
    }
  };

  return (
    <div className="delete-account-container">
      <div className="delete-account-header">
        <h1>Delete Account</h1>
        <p>Permanently remove your account and all associated data</p>
      </div>

      <div className="delete-account-card">
        <div className="warning-section">
          <div className="warning-icon">
            <FiAlertTriangle size={48} color="#ef4444" />
          </div>
          <h2>Warning: This action cannot be undone</h2>
          <p>
            Deleting your account will permanently remove all your data,
            including:
          </p>
          <ul className="warning-list">
            <li>Your profile information</li>
            <li>All reported issues ({pendingIssuesCount} pending)</li>
            <li>Comment history and activity</li>
            <li>Saved preferences and settings</li>
          </ul>
        </div>

        {pendingIssuesCount > 0 && (
          <div className="pending-issues-warning">
            <FiAlertTriangle />
            <p>
              You have <strong>{pendingIssuesCount} pending issues</strong> that
              will be permanently deleted along with your account.
            </p>
          </div>
        )}

        <div className="confirmation-section">
          <label htmlFor="confirmText">
            Type <strong>DELETE</strong> to confirm account deletion
          </label>
          <input
            type="text"
            id="confirmText"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="confirm-input"
            placeholder="Type DELETE here"
          />
        </div>

        {error && (
          <div className="error-message">
            <FiAlertTriangle />
            <p>{error}</p>
          </div>
        )}

        {showWarning && (
          <div className="final-warning">
            <p>
              <strong>Final Warning:</strong> Are you absolutely sure you want
              to delete your account? This action is irreversible.
            </p>
          </div>
        )}

        <div className="action-buttons">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={confirmText !== "DELETE" || isDeleting}
            className="delete-btn"
          >
            <FiTrash2 />
            {isDeleting
              ? "Deleting..."
              : showWarning
              ? "Confirm Deletion"
              : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
