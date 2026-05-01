import React, { useEffect, useState } from "react";
import api from "../../api";
import { ManagersViewSkeleton } from "./Skeleton";

function ManagersView() {
    const [createView, setCreateView] = useState(false);
    const [managerList, setManagerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Register form state
    const [hotelList, setHotelList] = useState([]);
    const [hotel, setHotel] = useState(-1);
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const loadManagers = async () => {
        setLoading(true);
        await api.get("/api/getmanagers/")
            .then((res) => setManagerList(res.data))
            .catch((err) => alert(err.response.data.detail))
            .finally(() => setLoading(false));
    };

    const loadHotels = async () => {
        await api.get("/api/gethotels/")
            .then((r) => setHotelList(r.data))
            .catch((e) => alert(e.response.data.detail));
    };

    const handleDeleteManager = async (managerId) => {
        if (!window.confirm("Are you sure you want to delete this manager?")) return;
        setDeleteId(managerId);
        await api.post("/api/manager/delete/", { manager: managerId })
            .then(() => { loadManagers(); })
            .catch((err) => alert(err.response.data.detail))
            .finally(() => setDeleteId(null));
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (password !== password2) { setErrorMessage("Passwords do not match."); return; }
        if (hotel === -1) { setErrorMessage("Please select a hotel."); return; }
        setSubmitting(true);
        const formData = new FormData();
        const data = { user: { first_name, last_name, email, password, password2 }, hotel };
        formData.append("data", JSON.stringify(data));
        await api.post("/api/user/manager/register/", formData, { headers: { "Content-Type": "multipart/form-data" } })
            .then(() => {
                setCreateView(false);
                loadManagers();
                setFirstName(""); setLastName(""); setEmail("");
                setPassword(""); setPassword2(""); setHotel(-1);
            })
            .catch((err) => setErrorMessage(err?.response?.data?.detail || "Registration failed."))
            .finally(() => setSubmitting(false));
    };

    useEffect(() => {
        loadManagers();
        loadHotels();
    }, []);

    if (loading && !createView) return <ManagersViewSkeleton />;

    if (createView) {
        return (
            <div style={styles.page}>
                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>Add Manager</h1>
                        <p style={styles.pageSubtitle}>Register a new manager and assign to a hotel</p>
                    </div>
                    <button type="button" onClick={() => setCreateView(false)} style={styles.backBtn}>
                        ← Back
                    </button>
                </div>

                <div style={styles.formCard}>
                    <p style={styles.sectionTitle}>Manager details</p>

                    {errorMessage && (
                        <div style={styles.errorBox}>
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                                <circle cx="8" cy="8" r="7" stroke="#C0392B" strokeWidth="1.5" />
                                <path d="M8 4.5V8.5M8 11h.01" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} style={styles.form}>
                        <div style={styles.grid2}>
                            <div style={styles.field}>
                                <label style={styles.label}>First name</label>
                                <input type="text" value={first_name} required
                                    onChange={(e) => setFirstName(e.target.value)}
                                    style={styles.input} placeholder="John" />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Last name</label>
                                <input type="text" value={last_name} required
                                    onChange={(e) => setLastName(e.target.value)}
                                    style={styles.input} placeholder="Doe" />
                            </div>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Email address</label>
                            <input type="email" value={email} required
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input} placeholder="manager@hotel.com" />
                        </div>
                        <div style={styles.grid2}>
                            <div style={styles.field}>
                                <label style={styles.label}>Password</label>
                                <input type="password" value={password} required
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={styles.input} placeholder="••••••••" />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Confirm password</label>
                                <input type="password" value={password2} required
                                    onChange={(e) => setPassword2(e.target.value)}
                                    style={styles.input} placeholder="••••••••" />
                            </div>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Assign hotel</label>
                            <select value={hotel} required
                                onChange={(e) => setHotel(parseInt(e.target.value, 10))}
                                style={styles.input}>
                                <option value={-1} disabled>Select a hotel</option>
                                {hotelList.map((h) => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>

                        {hotelList.length === 0 && (
                            <p style={styles.hintText}>No hotels found. Please create a hotel first.</p>
                        )}

                        <div style={styles.formFooter}>
                            <button type="button" onClick={() => setCreateView(false)} style={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting || hotelList.length === 0}
                                style={{ ...styles.submitBtn, opacity: (submitting || hotelList.length === 0) ? 0.6 : 1 }}>
                                {submitting ? "Adding..." : "Add manager"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Managers</h1>
                    <p style={styles.pageSubtitle}>{managerList.length} manager{managerList.length !== 1 ? "s" : ""} registered</p>
                </div>
                <button type="button" onClick={() => setCreateView(true)} style={styles.addBtn}>
                    + Add manager
                </button>
            </div>

            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {["ID", "Name", "Phone number", "Hotel", ""].map((h) => (
                                <th key={h} style={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={5} style={styles.emptyCell}>Loading...</td></tr>
                        )}
                        {!loading && managerList.length === 0 && (
                            <tr>
                                <td colSpan={5} style={styles.emptyCell}>
                                    No managers yet. Add your first one!
                                </td>
                            </tr>
                        )}
                        {managerList.map((manager, index) => (
                            <tr key={manager.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>
                                    <span style={styles.idBadge}>#{manager.id}</span>
                                </td>
                                <td style={styles.td}>
                                    <div style={styles.managerNameRow}>
                                        <div style={styles.avatar}>
                                            {manager.name?.[0]?.toUpperCase() || "M"}
                                        </div>
                                        <span style={styles.managerName}>{manager.name}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>{manager.phone_number || "—"}</td>
                                <td style={styles.td}>
                                    <span style={styles.hotelBadge}>{manager.hotel}</span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteManager(manager.id)}
                                        disabled={deleteId === manager.id}
                                        style={styles.deleteBtn}
                                        onMouseEnter={e => Object.assign(e.currentTarget.style, styles.deleteBtnHover)}
                                        onMouseLeave={e => Object.assign(e.currentTarget.style, styles.deleteBtn)}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                                        </svg>
                                        {deleteId === manager.id ? "Deleting..." : "Delete"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    page: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    pageHeader: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "24px",
    },
    pageTitle: {
        fontFamily: "Georgia, serif", fontSize: "32px",
        fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px",
    },
    pageSubtitle: { fontSize: "13px", color: "#AAA", margin: 0 },
    addBtn: {
        background: "#F5C842", color: "#1A1A1A",
        border: "none", borderRadius: "10px",
        padding: "10px 20px", fontSize: "14px",
        fontWeight: "500", cursor: "pointer", fontFamily: "inherit",
    },
    backBtn: {
        background: "none", border: "1.5px solid #E8E0C8",
        borderRadius: "8px", padding: "8px 16px",
        fontSize: "13px", color: "#555", cursor: "pointer",
        fontFamily: "inherit",
    },
    tableWrap: {
        border: "1px solid #EDE8D8", borderRadius: "14px", overflow: "hidden",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "12px 16px", textAlign: "left",
        fontSize: "11px", fontWeight: "500", color: "#888",
        textTransform: "uppercase", letterSpacing: "0.05em",
        background: "#FAFAF7", borderBottom: "1px solid #EDE8D8",
    },
    trEven: { background: "#fff" },
    trOdd: { background: "#FDFCF7" },
    td: {
        padding: "14px 16px", fontSize: "15px",
        color: "#333", borderBottom: "1px solid #F4F1E8",
        verticalAlign: "middle",
    },
    emptyCell: {
        padding: "40px", textAlign: "center",
        fontSize: "14px", color: "#AAA",
    },
    idBadge: {
        background: "#F4F1E8", color: "#888",
        padding: "3px 8px", borderRadius: "6px",
        fontSize: "12px", fontWeight: "500",
    },
    managerNameRow: { display: "flex", alignItems: "center", gap: "10px" },
    avatar: {
        width: "32px", height: "32px", borderRadius: "50%",
        background: "#F5C842", color: "#1A1A1A",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", fontWeight: "600", flexShrink: 0,
    },
    managerName: { fontWeight: "500", color: "#1A1A1A" },
    hotelBadge: {
        background: "#EDE8D8", color: "#555",
        padding: "3px 10px", borderRadius: "6px",
        fontSize: "12px",
    },
    deleteBtn: {
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: "none", border: "1px solid #EDE8D8",
        borderRadius: "8px", padding: "6px 12px",
        fontSize: "13px", color: "#888", cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.15s",
    },
    deleteBtnHover: {
        display: "inline-flex", alignItems: "center", gap: "6px",
        background: "#FEE2E2", border: "1px solid #FECACA",
        borderRadius: "8px", padding: "6px 12px",
        fontSize: "13px", color: "#991B1B", cursor: "pointer",
        fontFamily: "inherit",
    },
    formCard: {
        background: "#FAFAF7", border: "1px solid #EDE8D8",
        borderRadius: "16px", padding: "28px", maxWidth: "600px",
    },
    sectionTitle: {
        fontFamily: "Georgia, serif", fontSize: "18px",
        fontWeight: "500", color: "#1A1A1A",
        margin: "0 0 20px", paddingBottom: "14px",
        borderBottom: "1px solid #EDE8D8",
    },
    errorBox: {
        display: "flex", alignItems: "center", gap: "8px",
        background: "#FFF0F0", border: "1.5px solid #F5C5C5",
        borderRadius: "10px", padding: "10px 14px",
        fontSize: "13px", color: "#C0392B", marginBottom: "16px",
    },
    form: { display: "flex", flexDirection: "column", gap: "14px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
    field: { display: "flex", flexDirection: "column", gap: "6px" },
    label: {
        fontSize: "12px", fontWeight: "500", color: "#666",
        textTransform: "uppercase", letterSpacing: "0.05em",
    },
    input: {
        height: "50px", border: "1.5px solid #E8E0C8",
        borderRadius: "10px", padding: "0 14px",
        fontSize: "15px", color: "#1A1A1A", background: "#fff",
        outline: "none", boxSizing: "border-box",
        fontFamily: "inherit", width: "100%",
    },
    hintText: { fontSize: "13px", color: "#EF4444", margin: 0 },
    formFooter: {
        display: "flex", justifyContent: "flex-end",
        gap: "12px", marginTop: "8px",
    },
    cancelBtn: {
        height: "50px", padding: "0 24px",
        background: "none", border: "1.5px solid #E8E0C8",
        borderRadius: "10px", fontSize: "14px",
        color: "#888", cursor: "pointer", fontFamily: "inherit",
    },
    submitBtn: {
        height: "50px", padding: "0 28px",
        background: "#F5C842", border: "none",
        borderRadius: "10px", fontSize: "14px",
        fontWeight: "500", color: "#1A1A1A",
        cursor: "pointer", fontFamily: "inherit",
    },
};

export default ManagersView;