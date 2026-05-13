import React, { useEffect, useState } from "react";
import api from "../../api";

export default function ApprovalsView() {
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [processingId, setProcessingId] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/approvals/pending/");
            setPending(res.data.pending);
            setApproved(res.data.approved);
        } catch (err) {
            alert("Failed to load approvals.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ownerId, name) => {
        if (!window.confirm(`Approve ${name}?`)) return;
        setProcessingId(ownerId);
        try {
            const res = await api.post(`/api/approvals/approve/${ownerId}/`);
            alert(res.data.detail);
            loadData();
        } catch (err) {
            alert(err?.response?.data?.detail || "Failed to approve.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (ownerId, name) => {
        if (!window.confirm(`Reject and remove ${name}? This cannot be undone.`)) return;
        setProcessingId(ownerId);
        try {
            const res = await api.post(`/api/approvals/reject/${ownerId}/`);
            alert(res.data.detail);
            loadData();
        } catch (err) {
            alert(err?.response?.data?.detail || "Failed to reject.");
        } finally {
            setProcessingId(null);
        }
    };

    useEffect(() => { loadData(); }, []);

    const OwnerCard = ({ owner, showActions }) => (
        <div style={S.ownerCard}>
            <div style={S.ownerAvatar}>
                {owner.first_name?.[0]?.toUpperCase()}{owner.last_name?.[0]?.toUpperCase()}
            </div>
            <div style={S.ownerInfo}>
                <p style={S.ownerName}>{owner.first_name} {owner.last_name}</p>
                <p style={S.ownerEmail}>{owner.email}</p>
                <p style={S.ownerCompany}>🏢 {owner.company_name || "No company"}</p>
                <p style={S.ownerDate}>📅 Registered: {owner.registered_at}</p>
            </div>
            {showActions && (
                <div style={S.ownerActions}>
                    <button
                        onClick={() => handleApprove(owner.id, `${owner.first_name} ${owner.last_name}`)}
                        disabled={processingId === owner.id}
                        style={S.approveBtn}>
                        {processingId === owner.id ? "..." : "✅ Approve"}
                    </button>
                    <button
                        onClick={() => handleReject(owner.id, `${owner.first_name} ${owner.last_name}`)}
                        disabled={processingId === owner.id}
                        style={S.rejectBtn}
                        onMouseEnter={e => Object.assign(e.currentTarget.style, S.rejectBtnHover)}
                        onMouseLeave={e => Object.assign(e.currentTarget.style, S.rejectBtn)}>
                        {processingId === owner.id ? "..." : "❌ Reject"}
                    </button>
                </div>
            )}
            {!showActions && (
                <span style={S.approvedBadge}>✅ Approved</span>
            )}
        </div>
    );

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.pageHeader}>
                <div>
                    <h1 style={S.pageTitle}>Owner Approvals</h1>
                    <p style={S.pageSubtitle}>Manage new hotel owner registrations</p>
                </div>
                <button onClick={loadData} style={S.refreshBtn}>🔄 Refresh</button>
            </div>

            {/* Stats */}
            <div style={S.statsRow}>
                <div style={S.statCard}>
                    <span style={{ fontSize: "24px" }}>⏳</span>
                    <div>
                        <p style={S.statValue}>{pending.length}</p>
                        <p style={S.statLabel}>Pending approval</p>
                    </div>
                </div>
                <div style={S.statCard}>
                    <span style={{ fontSize: "24px" }}>✅</span>
                    <div>
                        <p style={{ ...S.statValue, color: "#22C55E" }}>{approved.length}</p>
                        <p style={S.statLabel}>Approved owners</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={S.tabs}>
                <button
                    onClick={() => setActiveTab("pending")}
                    style={{ ...S.tab, ...(activeTab === "pending" ? S.tabActive : {}) }}>
                    ⏳ Pending ({pending.length})
                </button>
                <button
                    onClick={() => setActiveTab("approved")}
                    style={{ ...S.tab, ...(activeTab === "approved" ? S.tabActive : {}) }}>
                    ✅ Approved ({approved.length})
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div style={S.loadingWrap}>
                    <div style={S.spinner} />
                    <p style={{ color: "#AAA", marginTop: "12px" }}>Loading...</p>
                </div>
            ) : (
                <div style={S.cardsList}>
                    {activeTab === "pending" && (
                        pending.length === 0 ? (
                            <div style={S.emptyState}>
                                <p style={{ fontSize: "40px" }}>🎉</p>
                                <p style={S.emptyText}>No pending approvals!</p>
                            </div>
                        ) : pending.map(owner => (
                            <OwnerCard key={owner.id} owner={owner} showActions={true} />
                        ))
                    )}
                    {activeTab === "approved" && (
                        approved.length === 0 ? (
                            <div style={S.emptyState}>
                                <p style={{ fontSize: "40px" }}>📋</p>
                                <p style={S.emptyText}>No approved owners yet.</p>
                            </div>
                        ) : approved.map(owner => (
                            <OwnerCard key={owner.id} owner={owner} showActions={false} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

const S = {
    page: { fontFamily: "'DM Sans','Segoe UI',sans-serif" },
    pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
    pageTitle: { fontFamily: "Georgia,serif", fontSize: "32px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px" },
    pageSubtitle: { fontSize: "13px", color: "#AAA", margin: 0 },
    refreshBtn: { background: "#F5C842", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit" },
    statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px", maxWidth: "500px" },
    statCard: { background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" },
    statValue: { fontFamily: "Georgia,serif", fontSize: "28px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 2px" },
    statLabel: { fontSize: "12px", color: "#888", margin: 0 },
    tabs: { display: "flex", gap: "8px", marginBottom: "20px" },
    tab: { padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #EDE8D8", background: "#fff", fontSize: "14px", fontWeight: "500", color: "#888", cursor: "pointer", fontFamily: "inherit" },
    tabActive: { background: "#F5C842", border: "1.5px solid #F5C842", color: "#1A1A1A" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px" },
    spinner: { width: "32px", height: "32px", border: "3px solid #EDE8D8", borderTop: "3px solid #F5C842", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
    cardsList: { display: "flex", flexDirection: "column", gap: "12px" },
    ownerCard: { background: "#fff", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" },
    ownerAvatar: { width: "48px", height: "48px", borderRadius: "50%", background: "#F5C842", color: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", flexShrink: 0 },
    ownerInfo: { flex: 1 },
    ownerName: { fontSize: "16px", fontWeight: "600", color: "#1A1A1A", margin: "0 0 3px" },
    ownerEmail: { fontSize: "13px", color: "#888", margin: "0 0 3px" },
    ownerCompany: { fontSize: "13px", color: "#555", margin: "0 0 3px" },
    ownerDate: { fontSize: "12px", color: "#AAA", margin: 0 },
    ownerActions: { display: "flex", gap: "8px" },
    approveBtn: { height: "38px", padding: "0 16px", background: "#22C55E", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#fff", cursor: "pointer", fontFamily: "inherit" },
    rejectBtn: { height: "38px", padding: "0 16px", background: "none", border: "1.5px solid #EDE8D8", borderRadius: "8px", fontSize: "13px", color: "#888", cursor: "pointer", fontFamily: "inherit" },
    rejectBtnHover: { height: "38px", padding: "0 16px", background: "#FEE2E2", border: "1.5px solid #FECACA", borderRadius: "8px", fontSize: "13px", color: "#991B1B", cursor: "pointer", fontFamily: "inherit" },
    approvedBadge: { background: "#DCFCE7", color: "#166534", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px" },
    emptyState: { textAlign: "center", padding: "60px 0" },
    emptyText: { color: "#AAA", fontSize: "14px", marginTop: "8px" },
};