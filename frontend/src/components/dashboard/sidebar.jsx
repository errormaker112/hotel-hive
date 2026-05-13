import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  bookings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  rooms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  hotels: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  managers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  approvals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: "dashboard", end: true },
  { label: "Bookings", to: "/dashboard/booking", icon: "bookings", end: true },
  { label: "Rooms", to: "/dashboard/rooms", icon: "rooms", end: true },
  { label: "Hotels", to: "/dashboard/hotels", icon: "hotels", end: true },
  { label: "Analytics", to: "/dashboard/analytics", icon: "analytics", end: true },
  { label: "Email Alerts", to: "/dashboard/email-alerts", icon: "email", end: true },
  { label: "Approvals", to: "/dashboard/approvals", icon: "approvals", end: true },
];

function Sidebar(props) {
  const navigate = useNavigate();

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#F5C842" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="3" fill="#F5C842" />
          </svg>
        </div>
        <span style={styles.logoText}>Hotel <span style={styles.logoAccent}>Hive</span></span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <p style={styles.sectionLabel}>Main menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            end={item.end}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{icons[item.icon]}</span>
            {item.label}
          </NavLink>
        ))}

        {props.role === "Owner" && (
          <NavLink
            end
            to="/dashboard/managers"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{icons.managers}</span>
            Managers
          </NavLink>
        )}

        <p style={{ ...styles.sectionLabel, marginTop: "24px" }}>Account</p>
        <NavLink
          end
          to="/dashboard/profile"
          style={({ isActive }) => ({
            ...styles.navItem,
            ...(isActive ? styles.navItemActive : {}),
          })}
        >
          <span style={styles.navIcon}>{icons.profile}</span>
          Profile
        </NavLink>
      </nav>

      {/* Logout */}
      <div style={styles.bottom}>
        <NotificationBell />
        <button
          onClick={() => navigate("/logout")}
          style={styles.logoutBtn}
          onMouseEnter={e => Object.assign(e.currentTarget.style, styles.logoutBtnHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, styles.logoutBtn)}
        >
          <span style={styles.navIcon}>{icons.logout}</span>
          Sign out
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    height: "100%", display: "flex", flexDirection: "column",
    background: "#1A1A1A", borderRadius: "16px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    overflow: "hidden",
  },
  logoArea: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "24px 20px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  logoIcon: {
    width: "36px", height: "36px", background: "#2A2A2A",
    borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "Georgia, serif", fontSize: "17px",
    fontWeight: "600", color: "#fff",
  },
  logoAccent: {
    background: "#F5C842", color: "#1A1A1A",
    padding: "0 4px", borderRadius: "3px",
  },
  nav: { flex: 1, padding: "16px 12px", overflowY: "auto" },
  sectionLabel: {
    fontSize: "10px", fontWeight: "500", letterSpacing: "0.1em",
    textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
    padding: "0 8px", marginBottom: "6px", marginTop: "4px",
  },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 12px", borderRadius: "10px",
    fontSize: "14px", fontWeight: "400", color: "rgba(255,255,255,0.6)",
    textDecoration: "none", marginBottom: "2px",
    transition: "all 0.15s",
  },
  navItemActive: {
    background: "#F5C842", color: "#1A1A1A", fontWeight: "500",
  },
  navIcon: { display: "flex", flexShrink: 0 },
  bottom: {
    padding: "12px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: "10px",
    width: "100%", padding: "10px 12px", borderRadius: "10px",
    background: "none", border: "none", cursor: "pointer",
    fontSize: "14px", color: "rgba(255,255,255,0.5)",
    fontFamily: "inherit", transition: "all 0.15s",
  },
  logoutBtnHover: {
    display: "flex", alignItems: "center", gap: "10px",
    width: "100%", padding: "10px 12px", borderRadius: "10px",
    background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer",
    fontSize: "14px", color: "#fff",
    fontFamily: "inherit",
  },
};

export default Sidebar;