import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

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

function Register() {
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (password !== password2) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    const data = {
      user: { first_name, last_name, email, password, password2 },
      company_name: "",
    };
    formData.append("data", JSON.stringify(data));

    await api
      .post("/api/user/owner/register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Registration successful! Your account is pending admin approval. You will be notified once approved.");
        navigate("/login");
      })
      .catch((err) => {
        setErrorMessage(
          err?.response?.data?.detail || "Registration failed. Please try again."
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

          <h1 style={styles.headline}>Manage your<br />hotels smarter.</h1>
          <p style={styles.subText}>
            A powerful platform for hotel owners to streamline bookings, rooms, and customers — all in one place.
          </p>
        </div>

        <div style={styles.features}>
          {["Multi-hotel management dashboard", "Real-time booking operations", "Customer & manager access control", "Secure JWT authentication"].map((f, i) => (
            <div key={i} style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span style={styles.featureText}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <p style={styles.eyebrow}>Get started free</p>
          <h2 style={styles.formTitle}>Create your account</h2>
          <p style={styles.formSubtitle}>
            Already have one?{" "}
            <Link to="/login" style={styles.link}>Sign in instead</Link>
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
            {/* Name row */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>First name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={first_name}
                  onChange={(e) => setFirst_name(e.target.value)}
                  required
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.input)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Last name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={last_name}
                  onChange={(e) => setLast_name(e.target.value)}
                  required
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.input)}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password row */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  style={styles.input}
                  onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, styles.input)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span style={styles.spinner} />
              ) : (
                <>
                  Create account
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M9 4L13 8L9 12" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={styles.terms}>
            By registering you agree to our{" "}
            <a href="#" style={styles.link}>Terms of Service</a> and{" "}
            <a href="#" style={styles.link}>Privacy Policy</a>.
          </p>
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
    fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: "500",
    color: "#1A1A1A", lineHeight: "1.25", marginBottom: "18px",
  },
  subText: { fontSize: "15px", color: "#3A3A2A", lineHeight: "1.7", maxWidth: "280px" },
  features: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "14px" },
  featureItem: { display: "flex", alignItems: "center", gap: "12px" },
  featureDot: { width: "8px", height: "8px", background: "#1A1A1A", borderRadius: "50%", flexShrink: 0 },
  featureText: { fontSize: "14px", color: "#2A2A1A" },
  rightPanel: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "40px 48px",
  },
  formContainer: { width: "100%", maxWidth: "430px" },
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
  errorBox: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#FFF0F0", border: "1.5px solid #F5C5C5",
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "13px", color: "#C0392B", marginBottom: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
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
    background: "#fff", outline: "none",
    boxSizing: "border-box",
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
    transition: "background 0.2s",
  },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(0,0,0,0.15)",
    borderTop: "2px solid #1A1A1A",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  terms: { fontSize: "12px", color: "#AAA", textAlign: "center", marginTop: "18px", lineHeight: "1.6" },
};

export default Register;