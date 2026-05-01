import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import UserDropdown from "./userdropdown";

function Navbar(props) {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      const sections = ["home", "services", "about", "contact"];
      let current = "";
      sections.forEach((s) => {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) current = s;
        }
      });
      if (current !== activeSection) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About us" },
    { id: "contact", label: "Contact us" },
  ];

  return (
    <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#F5C842" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="3" fill="#F5C842" />
            </svg>
          </div>
          <span style={styles.brandText}>Hotel <span style={styles.brandAccent}>Hive</span></span>
        </Link>

        <ul style={styles.navList}>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => props.scrollToSection(item.id)}
                style={{
                  ...styles.navBtn,
                  ...(activeSection === item.id ? styles.navBtnActive : {}),
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <UserDropdown isLoggedin={props.isLoggedin} />
          </li>
        </ul>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    background: "#FFFBF0",
    borderBottom: "1px solid #EDE8D8",
    transition: "box-shadow 0.2s",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  navScrolled: {
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
  },
  inner: {
    maxWidth: "1280px", margin: "0 auto",
    padding: "0 32px", height: "68px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  brand: {
    display: "flex", alignItems: "center", gap: "10px",
    textDecoration: "none",
  },
  brandIcon: {
    width: "38px", height: "38px", background: "#1A1A1A",
    borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandText: {
    fontFamily: "Georgia, serif", fontSize: "20px",
    fontWeight: "600", color: "#1A1A1A",
  },
  brandAccent: {
    background: "#F5C842", padding: "0 4px",
    borderRadius: "4px", color: "#1A1A1A",
  },
  navList: {
    display: "flex", alignItems: "center",
    gap: "4px", listStyle: "none", margin: 0, padding: 0,
  },
  navBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: "8px 16px", borderRadius: "8px",
    fontSize: "14px", fontWeight: "500", color: "#444",
    fontFamily: "inherit", transition: "all 0.15s",
  },
  navBtnActive: {
    background: "#F5C842", color: "#1A1A1A",
  },
};

export default Navbar;