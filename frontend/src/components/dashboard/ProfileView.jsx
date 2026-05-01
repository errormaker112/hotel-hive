import React, { useEffect, useState } from "react";
import api from "../../api";
import { ProfileViewSkeleton } from "./Skeleton";

function ProfileView(props) {
    const [loading, setLoading] = useState(false);
    const [first_name, setFirstname] = useState("");
    const [last_name, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [company_name, setCompany_name] = useState("");
    const [profile_image, setProfileImage] = useState(null);
    const [profileUrl, setProfileUrl] = useState(null);
    const [role, setRole] = useState("");

    const getUserType = async () => {
        try {
            const res = await api.get("/api/usertype/");
            setRole(res.data.role);
            return res.data.role;
        } catch (error) { console.log(error); }
    };

    const loadData = async (userRole) => {
        setLoading(true);
        try {
            const res = userRole === "Owner"
                ? await api.get("/api/user/owner/")
                : await api.get("/api/user/manager/");
            if (res && res.data) {
                setFirstname(res.data.user.first_name);
                setLastname(res.data.user.last_name);
                setPhoneNumber(res.data.user.phone_number);
                setEmail(res.data.user.email);
                setProfileUrl(api.getUri() + res.data.user.profile_image);
                if (userRole === "Owner") setCompany_name(res.data.company_name);
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setProfileImage(file); setProfileUrl(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const json = {
            user: { first_name, last_name, phone_number },
            ...(role === "Owner" ? { company_name } : {}),
        };
        const formData = new FormData();
        formData.append("data", JSON.stringify(json));
        if (profile_image) formData.append("profile_image", profile_image);
        await api.post("/api/user/updateprofile/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then(() => { setLoading(false); alert("Profile updated."); })
            .catch((err) => alert(err.response.data.detail));
        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            const userRole = await getUserType();
            if (userRole) { loadData(userRole); setRole(userRole); }
        };
        init();
    }, []);

    const avatarSrc = profileUrl && profileUrl !== api.getUri() + "null"
        ? profileUrl
        : null;

    const initials = `${first_name?.[0] || ""}${last_name?.[0] || ""}`.toUpperCase() || "?";

    if (loading) return <ProfileViewSkeleton />;

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>My Profile</h1>
                <p style={styles.pageSubtitle}>Manage your personal information</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.formLayout}>
                {/* Left — Avatar card */}
                <div style={styles.avatarCard}>
                    <div style={styles.avatarWrap}>
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="Profile" style={styles.avatarImg} />
                        ) : (
                            <div style={styles.avatarFallback}>{initials}</div>
                        )}
                        <label htmlFor="profileUpload" style={styles.avatarOverlay}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span style={{ fontSize: "12px", color: "#fff", marginTop: "4px" }}>Change photo</span>
                        </label>
                        <input type="file" id="profileUpload" style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
                    </div>

                    <div style={styles.avatarInfo}>
                        <p style={styles.avatarName}>{first_name} {last_name}</p>
                        <p style={styles.avatarEmail}>{email}</p>
                        <span style={styles.roleBadge}>
                            {role === "Owner" ? "👑" : "🔑"} {role}
                        </span>
                    </div>
                </div>

                {/* Right — Fields */}
                <div style={styles.fieldsCard}>
                    <p style={styles.sectionTitle}>Personal information</p>

                    {role === "Owner" && (
                        <div style={{ ...styles.field, marginBottom: "16px" }}>
                            <label style={styles.label}>Company name</label>
                            <input type="text" value={company_name}
                                onChange={(e) => setCompany_name(e.target.value)}
                                style={styles.input} placeholder="Your company name" />
                        </div>
                    )}

                    <div style={styles.grid2}>
                        <div style={styles.field}>
                            <label style={styles.label}>First name</label>
                            <input type="text" value={first_name}
                                onChange={(e) => setFirstname(e.target.value)}
                                style={styles.input} placeholder="John" />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Last name</label>
                            <input type="text" value={last_name}
                                onChange={(e) => setLastname(e.target.value)}
                                style={styles.input} placeholder="Doe" />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Email address</label>
                            <input type="email" value={email} disabled
                                style={{ ...styles.input, background: "#F4F1E8", color: "#AAA", cursor: "not-allowed" }} />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Phone number</label>
                            <input type="text" value={phone_number || ""}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                                style={styles.input} placeholder="+91 98765 43210" />
                        </div>
                    </div>

                    <div style={styles.formFooter}>
                        <p style={styles.emailNote}>
                            Email address cannot be changed.
                        </p>
                        <button type="submit" disabled={loading}
                            style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

const styles = {
    page: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    pageHeader: { marginBottom: "24px" },
    pageTitle: {
        fontFamily: "Georgia, serif", fontSize: "32px",
        fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px",
    },
    pageSubtitle: { fontSize: "13px", color: "#AAA", margin: 0 },
    formLayout: {
        display: "grid", gridTemplateColumns: "260px 1fr",
        gap: "20px", alignItems: "start",
    },
    avatarCard: {
        background: "#FAFAF7", border: "1px solid #EDE8D8",
        borderRadius: "16px", padding: "28px 20px",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "16px",
        textAlign: "center",
    },
    avatarWrap: {
        width: "120px", height: "120px", borderRadius: "50%",
        overflow: "hidden", position: "relative", cursor: "pointer",
        border: "3px solid #F5C842",
    },
    avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
    avatarFallback: {
        width: "100%", height: "100%", background: "#F5C842",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Georgia, serif", fontSize: "36px",
        fontWeight: "500", color: "#1A1A1A",
    },
    avatarOverlay: {
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: 0, transition: "opacity 0.2s",
        cursor: "pointer",
        // hover handled inline is tricky; use CSS trick below
    },
    avatarInfo: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
    avatarName: {
        fontFamily: "Georgia, serif", fontSize: "18px",
        fontWeight: "500", color: "#1A1A1A", margin: 0,
    },
    avatarEmail: { fontSize: "13px", color: "#AAA", margin: 0 },
    roleBadge: {
        background: "#F5C842", color: "#1A1A1A",
        fontSize: "12px", fontWeight: "500",
        padding: "4px 12px", borderRadius: "20px", marginTop: "4px",
    },
    fieldsCard: {
        background: "#FAFAF7", border: "1px solid #EDE8D8",
        borderRadius: "16px", padding: "28px",
    },
    sectionTitle: {
        fontFamily: "Georgia, serif", fontSize: "18px",
        fontWeight: "500", color: "#1A1A1A",
        margin: "0 0 20px", paddingBottom: "14px",
        borderBottom: "1px solid #EDE8D8",
    },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    field: { display: "flex", flexDirection: "column", gap: "6px" },
    label: {
        fontSize: "12px", fontWeight: "500", color: "#666",
        textTransform: "uppercase", letterSpacing: "0.05em",
    },
    input: {
        height: "50px", border: "1.5px solid #E8E0C8",
        borderRadius: "10px", padding: "0 14px",
        fontSize: "15px", color: "#1A1A1A", background: "#fff",
        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
        width: "100%",
    },
    formFooter: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginTop: "24px",
        paddingTop: "20px", borderTop: "1px solid #EDE8D8",
    },
    emailNote: { fontSize: "12px", color: "#BBB", margin: 0 },
    saveBtn: {
        height: "50px", padding: "0 28px",
        background: "#F5C842", border: "none",
        borderRadius: "10px", fontSize: "14px",
        fontWeight: "500", color: "#1A1A1A",
        cursor: "pointer", fontFamily: "inherit",
    },
};

export default ProfileView;