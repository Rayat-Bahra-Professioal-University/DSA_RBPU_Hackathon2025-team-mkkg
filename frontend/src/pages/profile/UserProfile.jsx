import { UserProfile as ClerkUserProfile } from "@clerk/clerk-react";
import "./UserProfile.css";

export default function UserProfile() {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="clerk-profile-wrapper">
        <ClerkUserProfile
          appearance={{
            elements: {
              rootBox: {
                width: "100%",
                maxWidth: "none",
              },
              card: {
                backgroundColor: "#0a0a0f",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0",
                boxShadow: "none",
                padding: "2rem",
                width: "100%",
              },
              navbar: {
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              },
              navbarButton: {
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              },
              navbarButtonIcon: {
                color: "#22c55e",
              },
              pageScrollBox: {
                backgroundColor: "transparent",
                padding: "1.5rem",
              },
              profileSectionTitle: {
                color: "#ffffff",
              },
              profileSectionTitleText: {
                color: "#ffffff",
              },
              profileSectionContent: {
                color: "rgba(255, 255, 255, 0.7)",
              },
              profileSectionPrimaryButton: {
                color: "#22c55e",
                "&:hover": {
                  color: "#4ade80",
                },
              },
              formButtonPrimary: {
                backgroundColor: "#22c55e",
                color: "#ffffff",
                borderRadius: "0",
                "&:hover": {
                  backgroundColor: "#16a34a",
                },
              },
              formFieldLabel: {
                color: "#ffffff",
              },
              formFieldInput: {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                borderRadius: "0",
                "&:focus": {
                  borderColor: "#22c55e",
                  backgroundColor: "rgba(34, 197, 94, 0.05)",
                },
              },
              formFieldInputShowPasswordButton: {
                color: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                  color: "#22c55e",
                },
              },
              accordionTriggerButton: {
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              },
              badge: {
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                color: "#22c55e",
              },
              avatarBox: {
                border: "none",
                boxShadow: "none",
              },
              userButtonAvatarBox: {
                border: "none",
                boxShadow: "none",
              },
              avatarImage: {
                border: "none",
              },
              headerTitle: {
                color: "#ffffff",
              },
              headerSubtitle: {
                color: "rgba(255, 255, 255, 0.7)",
              },
              identityPreviewText: {
                color: "#ffffff",
              },
              identityPreviewEditButton: {
                color: "#22c55e",
              },
              formHeaderTitle: {
                color: "#ffffff",
              },
              formHeaderSubtitle: {
                color: "rgba(255, 255, 255, 0.7)",
              },
              dividerLine: {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
              dividerText: {
                color: "rgba(255, 255, 255, 0.5)",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
