import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

const HexPattern = () => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1 }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" x="0" y="0" width="80" height="92" patternUnits="userSpaceOnUse">
        <polygon points="40,2 78,22 78,62 40,82 2,62 2,22" fill="none" stroke="#000" strokeWidth="1.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    await api
      .post("/api/token/", { email, password })
      .then((res) => {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        props.changeLogIn(true);
        props.loadRole();
        navigate("/dashboard");
      })
      .catch((err) => {
        setErrorMessage(
          err?.response?.data?.detail || "Invalid email or password."
        );
      });

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <HexPattern />

        <div style={styles.leftTop}>
          <div style={styles.brandLogo}>
            <div style={styles.brandIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#F5C842" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="#F5C842" />
              </svg>
            </div>
            <span style={styles.brandName}>
              Hotel <span style={styles.brandHighlight}>Hive</span>
            </span>
          </div>

          <h1 style={styles.headline}>Welcome<br />back.</h1>
          <p style={styles.subText}>
            Sign in to manage your hotels, track bookings, and stay in control — all from one dashboard.
          </p>
        </div>

        <div style={styles.statsRow}>
          {[
            { value: "500+", label: "Hotels managed" },
            { value: "12k+", label: "Bookings processed" },
            { value: "99.9%", label: "Uptime" },
          ].map((s, i) => (
            <div key={i} style={styles.statItem}>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <p style={styles.eyebrow}>Welcome back</p>
          <h2 style={styles.formTitle}>Sign in to your account</h2>
          <p style={styles.formSubtitle}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>Create one free</Link>
          </p>

          {errorMessage && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="7" stroke="#C0392B" strokeWidth="1.5" />
                <path d="M8 4.5V8.5M8 11h.01" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={e => Object.assign(e.target.style, styles.input)}
              />
            </div>

            <div style={styles.field}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={styles.label}>Password</label>
                <a href="#" style={styles.forgotLink}>Forgot password?</a>
              </div>
              <div style={styles.passWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: "40px", width: "100%" }}
                  onFocus={e => Object.assign(e.target.style, { ...styles.inputFocus, paddingRight: "40px", width: "100%" })}
                  onBlur={e => Object.assign(e.target.style, { ...styles.input, paddingRight: "40px", width: "100%" })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? <span style={styles.spinner} /> : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M9 4L13 8L9 12" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          <button style={styles.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#FFFBF0",
  },
  leftPanel: {
    width: "42%",
    background: "#F5C842",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "44px 40px",
  },
  leftTop: { position: "relative", zIndex: 2 },
  brandLogo: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" },
  brandIcon: {
    width: "44px", height: "44px", background: "#1A1A1A",
    borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "600", color: "#1A1A1A" },
  brandHighlight: {
    background: "#1A1A1A", color: "#F5C842",
    padding: "0 5px", borderRadius: "4px",
  },
  headline: {
    fontFamily: "Georgia, serif", fontSize: "48px", fontWeight: "500",
    color: "#1A1A1A", lineHeight: "1.15", marginBottom: "18px",
  },
  subText: { fontSize: "15px", color: "#3A3A2A", lineHeight: "1.7", maxWidth: "280px" },
  statsRow: {
    position: "relative", zIndex: 2,
    display: "flex", gap: "24px",
    borderTop: "1px solid rgba(0,0,0,0.12)",
    paddingTop: "24px",
  },
  statItem: { display: "flex", flexDirection: "column", gap: "2px" },
  statValue: { fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "500", color: "#1A1A1A" },
  statLabel: { fontSize: "12px", color: "#3A3A2A" },
  rightPanel: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "40px 48px",
  },
  formContainer: { width: "100%", maxWidth: "400px" },
  eyebrow: {
    fontSize: "11px", fontWeight: "500", letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#B89A00", marginBottom: "8px",
  },
  formTitle: {
    fontFamily: "Georgia, serif", fontSize: "30px",
    fontWeight: "500", color: "#1A1A1A", marginBottom: "6px",
  },
  formSubtitle: { fontSize: "14px", color: "#888", marginBottom: "24px" },
  link: { color: "#C49A00", textDecoration: "none", fontWeight: "500" },
  forgotLink: { fontSize: "12px", color: "#C49A00", textDecoration: "none" },
  errorBox: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#FFF0F0", border: "1.5px solid #F5C5C5",
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "13px", color: "#C0392B", marginBottom: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "11px", fontWeight: "500", color: "#666",
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  input: {
    width: "100%", height: "46px",
    border: "1.5px solid #E8E0C8", borderRadius: "10px",
    padding: "0 14px", fontSize: "14px", color: "#1A1A1A",
    background: "#fff", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  inputFocus: {
    width: "100%", height: "46px",
    border: "1.5px solid #F5C842", borderRadius: "10px",
    padding: "0 14px", fontSize: "14px", color: "#1A1A1A",
    background: "#fff", outline: "none", boxSizing: "border-box",
    boxShadow: "0 0 0 3px rgba(245,200,66,0.18)",
    fontFamily: "inherit",
  },
  passWrap: { position: "relative", display: "flex", alignItems: "center" },
  eyeBtn: {
    position: "absolute", right: "12px", background: "none",
    border: "none", cursor: "pointer", padding: 0, display: "flex",
  },
  submitBtn: {
    width: "100%", height: "50px", background: "#F5C842",
    color: "#1A1A1A", border: "none", borderRadius: "12px",
    fontSize: "15px", fontWeight: "500", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", fontFamily: "inherit", marginTop: "4px",
  },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(0,0,0,0.15)",
    borderTop: "2px solid #1A1A1A",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  divider: {
    display: "flex", alignItems: "center",
    gap: "12px", margin: "20px 0",
  },
  dividerLine: { flex: 1, height: "1px", background: "#E8E0C8" },
  dividerText: { fontSize: "12px", color: "#AAA" },
  googleBtn: {
    width: "100%", height: "46px", background: "#fff",
    border: "1.5px solid #E8E0C8", borderRadius: "12px",
    fontSize: "14px", color: "#333", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "10px", fontFamily: "inherit",
  },
};

export default Login;