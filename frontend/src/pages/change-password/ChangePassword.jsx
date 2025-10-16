import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import "./ChangePassword.css";

export default function ChangePassword() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");

  // Check if user signed in with OAuth (Google, Apple, Microsoft, etc.)
  const isOAuthUser =
    user?.externalAccounts?.length > 0 && !user?.passwordEnabled;
  const oauthProvider = user?.externalAccounts?.[0]?.provider;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      // Update password using Clerk's updatePassword method
      await user.updatePassword({
        newPassword: formData.newPassword,
        signOutOfOtherSessions: true,
      });

      alert(
        "Password changed successfully! You'll remain signed in on this device."
      );
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle specific Clerk errors
      if (error.errors?.[0]?.code === "form_password_incorrect") {
        setError("Current password is incorrect");
      } else if (error.errors?.[0]?.code === "reverification_required") {
        setError(
          "Please sign out and sign back in before changing your password"
        );
      } else {
        setError(
          error.errors?.[0]?.longMessage ||
            error.errors?.[0]?.message ||
            "Failed to change password. Please try again."
        );
      }
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-header">
        <h1>Change Password</h1>
        <p>Update your account password</p>
      </div>

      <div className="password-card">
        {isOAuthUser ? (
          <div className="oauth-info-card">
            <FiAlertCircle className="info-icon" />
            <h3>Password Change Not Available</h3>
            <p>
              You signed in with{" "}
              <strong>{oauthProvider || "social login"}</strong>. Your password
              is managed by {oauthProvider || "your authentication provider"},
              not by CityCare.
            </p>
            <p className="info-detail">
              To change your password, please visit your{" "}
              <strong>{oauthProvider || "account provider"}</strong> account
              settings.
            </p>
            {oauthProvider === "google" && (
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="provider-link"
              >
                Go to Google Account Security →
              </a>
            )}
            {oauthProvider === "microsoft" && (
              <a
                href="https://account.microsoft.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="provider-link"
              >
                Go to Microsoft Account Security →
              </a>
            )}
            {oauthProvider === "apple" && (
              <a
                href="https://appleid.apple.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="provider-link"
              >
                Go to Apple ID Settings →
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">
                <FiLock /> Current Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="password-input"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">
                <FiLock /> New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="password-input"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <span className="helper-text">Minimum 8 characters</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FiLock /> Confirm New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="password-input"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn">
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
