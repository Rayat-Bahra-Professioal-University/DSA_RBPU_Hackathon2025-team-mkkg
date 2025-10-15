import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn(
    "Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to .env.local"
  );
}

createRoot(document.getElementById("root")).render(
  // Temporarily disable StrictMode for Leaflet compatibility
  // <StrictMode>
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      variables: {
        colorPrimary: "#22c55e",
        colorBackground: "#0a0a0f",
        colorInputBackground: "rgba(255, 255, 255, 0.05)",
        colorInputText: "#ffffff",
        colorText: "#ffffff",
        colorTextSecondary: "rgba(255, 255, 255, 0.7)",
        colorTextOnPrimaryBackground: "#ffffff",
        borderRadius: "0px",
      },
      elements: {
        formButtonPrimary: {
          backgroundColor: "#22c55e",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#16a34a",
          },
          "&:focus": {
            backgroundColor: "#16a34a",
          },
        },
        card: {
          backgroundColor: "#020202",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "0",
        },
        headerTitle: {
          color: "#ffffff",
        },
        headerSubtitle: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        socialButtonsBlockButton: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
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
        footerActionLink: {
          color: "#22c55e",
          "&:hover": {
            color: "#4ade80",
          },
        },
        identityPreviewText: {
          color: "#ffffff",
        },
        identityPreviewEditButton: {
          color: "#22c55e",
        },
        formFieldInputShowPasswordButton: {
          color: "rgba(255, 255, 255, 0.5)",
          "&:hover": {
            color: "#22c55e",
          },
        },
        dividerLine: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        dividerText: {
          color: "rgba(255, 255, 255, 0.5)",
        },
        formHeaderTitle: {
          color: "#ffffff",
        },
        formHeaderSubtitle: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        otpCodeFieldInput: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
          borderRadius: "0",
        },
        alertText: {
          color: "#ffffff",
        },
        formFieldWarningText: {
          color: "#ff6b35",
        },
        badge: {
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          color: "#22c55e",
        },
        avatarBox: {
          border: "2px solid #22c55e",
        },
        userButtonPopoverCard: {
          backgroundColor: "#020202",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        userButtonPopoverActionButton: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#ffffff",
          },
        },
        userButtonPopoverActionButtonText: {
          color: "#ffffff",
          "&:hover": {
            color: "#ffffff",
          },
        },
        userButtonPopoverActionButtonIcon: {
          color: "#22c55e",
          "&:hover": {
            color: "#22c55e",
          },
        },
        userButtonPopoverFooter: {
          backgroundColor: "#020202",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        },
        userPreviewMainIdentifier: {
          color: "#ffffff",
        },
        userPreviewSecondaryIdentifier: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        profileSectionPrimaryButton: {
          color: "#22c55e",
          "&:hover": {
            color: "#4ade80",
          },
        },
        profileSectionTitle: {
          color: "#ffffff",
        },
        profileSectionContent: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        accordionTriggerButton: {
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        },
        navbar: {
          backgroundColor: "#020202",
        },
        navbarButton: {
          color: "#ffffff",
        },
        navbarButtonIcon: {
          color: "#22c55e",
        },
        pageScrollBox: {
          backgroundColor: "#0a0a0f",
        },
        modalBackdrop: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        },
        modalContent: {
          backgroundColor: "#020202",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    }}
  >
    <App />
  </ClerkProvider>
  // </StrictMode>
);
