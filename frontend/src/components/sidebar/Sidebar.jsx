import { useEffect, useMemo, useState } from "react";
import {
  FiChevronRight,
  FiHome,
  FiLogOut,
  FiSettings,
  FiSearch,
  FiFileText,
  FiEye,
} from "react-icons/fi";
import { RiProfileLine } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const location = useLocation();
  const { signOut } = useClerk();

  const navigationSections = useMemo(
    () => [
      {
        title: "General",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: FiHome,
            path: "/dashboard",
            isLink: true,
          },
          {
            id: "create-issue",
            label: "Create Complaint",
            icon: FiFileText,
            path: "/create-issue",
            isLink: true,
          },
          {
            id: "search-complaints",
            label: "Search Complaint",
            icon: FiSearch,
            path: "/search-complaints",
            isLink: true,
          },
          {
            id: "view-complaints",
            label: "View All Complaints",
            icon: FiEye,
            path: "/view-complaints",
            isLink: true,
          },
        ],
      },
      {
        title: "Account",
        items: [
          {
            id: "profile",
            label: "Profile",
            icon: RiProfileLine,
            path: "/profile",
            isLink: true,
          },
          {
            id: "change-password",
            label: "Change Password",
            icon: FiSettings,
            path: "/change-password",
            isLink: true,
          },
          {
            id: "delete-account",
            label: "Delete Account",
            icon: FaTrash,
            path: "/delete-account",
            isLink: true,
          },
        ],
      },
    ],
    []
  );

  const footerItem = useMemo(
    () => ({
      id: "signout",
      label: "Sign Out",
      icon: FiLogOut,
      path: "#",
      isLink: false,
    }),
    []
  );

  useEffect(() => {
    const currentPath = location.pathname;

    const allItems = [
      ...navigationSections.flatMap((section) => section.items),
    ];

    const currentItem = allItems.find((item) => item.path === currentPath);
    if (currentItem) {
      setActiveItem(currentItem.id);
    } else if (currentPath === "/" || currentPath === "/home") {
      setActiveItem("dashboard");
    }
  }, [location.pathname, navigationSections]);

  const handleNavClick = (itemId) => {
    setActiveItem(itemId);
    // Close sidebar on mobile after clicking a nav item
    if (onClose) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const renderNavItem = (item) => {
    const IconComponent = item.icon;
    const isActive = activeItem === item.id;

    return (
      <div
        key={item.id}
        className={`nav-item-wrapper ${isActive ? "active" : ""}`}
      >
        {item.isLink ? (
          <Link
            to={item.path}
            className="nav-item"
            onClick={() => handleNavClick(item.id)}
          >
            <div className="nav-item-content">
              <IconComponent className="nav-icon" />
              <span>{item.label}</span>
            </div>
            {isActive && <FiChevronRight className="chevron-icon" />}
          </Link>
        ) : (
          <button
            className="nav-item"
            onClick={() => {
              if (item.id === "signout") {
                handleSignOut();
              }
              handleNavClick(item.id);
            }}
          >
            <div className="nav-item-content">
              <IconComponent className="nav-icon" />
              <span>{item.label}</span>
            </div>
            {isActive && <FiChevronRight className="chevron-icon" />}
          </button>
        )}
      </div>
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("sidebar-overlay")) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={handleOverlayClick} />
      )}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-content">
          {navigationSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <h3 className="section-title">{section.title}</h3>
              <nav className="nav-menu">{section.items.map(renderNavItem)}</nav>
            </div>
          ))}

          <div className="sidebar-footer">{renderNavItem(footerItem)}</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
