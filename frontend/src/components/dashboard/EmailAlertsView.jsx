import React, { useEffect, useState } from "react";
import api from "../../api";

const TYPE_COLORS = {
    checkout_today: { bg: "#FEE2E2", color: "#991B1B", icon: "⏰" },
    checkout_tomorrow: { bg: "#FEF9EC", color: "#B89A00", icon: "📅" },
    booking_confirmation: { bg: "#DCFCE7", color: "#166534", icon: "📋" },
    payment_receipt: { bg: "#DBEAFE", color: "#1E40AF", icon: "💳" },
};

export default function EmailAlertsView() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const loadLogs = async () => {
        setLoading(true);
        try {
            let url = "/api/email-logs/?";
            if (filter !== "all") url += `type=${filter}&`;
            if (statusFilter !== "all") url += `status=${statusFilter}`;
            const res = await api.get(url);
            setLogs(res.data.logs);
            setStats(res.data.stats);
        } catch (err) {
            console.error("Failed to load email logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, [filter, statusFilter]);

    const filteredLogs = logs.filter(log =>
        search === "" ||
        log.recipient_email.toLowerCase().includes(search.toLowerCase()) ||
        log.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
        log.hotel_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.pageHeader}>
                <div>
                    <h1 style={S.pageTitle}>Email Alerts</h1>
                    <p style={S.pageSubtitle}>Track all automated emails sent to guests</p>
                </div>
                <button onClick={loadLogs} style={S.refreshBtn}>🔄 Refresh</button>
            </div>

            {/* Stats */}
            <div style={S.statsGrid}>
                <div style={S.statCard}>
                    <span style={{ fontSize: "22px" }}>📧</span>
                    <div>
                        <p style={S.statValue}>{stats.total}</p>
                        <p style={S.statLabel}>Total emails sent</p>
                    </div>
                </div>
                <div style={S.statCard}>
                    <span style={{ fontSize: "22px" }}>✅</span>
                    <div>
                        <p style={{ ...S.statValue, color: "#22C55E" }}>{stats.sent}</p>
                        <p style={S.statLabel}>Successfully sent</p>
                    </div>
                </div>
                <div style={S.statCard}>
                    <span style={{ fontSize: "22px" }}>❌</span>
                    <div>
                        <p style={{ ...S.statValue, color: "#EF4444" }}>{stats.failed}</p>
                        <p style={S.statLabel}>Failed</p>
                    </div>
                </div>
                <div style={S.statCard}>
                    <span style={{ fontSize: "22px" }}>📊</span>
                    <div>
                        <p style={S.statValue}>
                            {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
                        </p>
                        <p style={S.statLabel}>Success rate</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={S.filtersRow}>
                <input
                    type="text"
                    placeholder="Search by email, name or hotel..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={S.searchInput}
                />
                <select value={filter} onChange={e => setFilter(e.target.value)} style={S.select}>
                    <option value="all">All types</option>
                    <option value="checkout_today">Checkout Today</option>
                    <option value="checkout_tomorrow">Checkout Tomorrow</option>
                    <option value="booking_confirmation">Booking Confirmation</option>
                    <option value="payment_receipt">Payment Receipt</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={S.select}>
                    <option value="all">All status</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div style={S.loadingWrap}>
                    <div style={S.spinner} />
                    <p style={{ color: "#AAA", marginTop: "12px", fontSize: "14px" }}>Loading email logs...</p>
                </div>
            ) : (
                <div style={S.tableWrap}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                {["Type", "Recipient", "Hotel", "Booking", "Status", "Sent at"].map(h => (
                                    <th key={h} style={S.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={S.emptyCell}>
                                        <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📭</p>
                                        No email logs found.
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log, i) => {
                                const typeStyle = TYPE_COLORS[log.email_type] || { bg: "#F4F1E8", color: "#888", icon: "📧" };
                                return (
                                    <tr key={log.id} style={i % 2 === 0 ? S.trEven : S.trOdd}>
                                        <td style={S.td}>
                                            <span style={{ ...S.typeBadge, background: typeStyle.bg, color: typeStyle.color }}>
                                                {typeStyle.icon} {log.email_type_display}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <p style={S.recipientName}>{log.recipient_name}</p>
                                            <p style={S.recipientEmail}>{log.recipient_email}</p>
                                        </td>
                                        <td style={S.td}>
                                            <span style={S.hotelBadge}>{log.hotel_name || "—"}</span>
                                        </td>
                                        <td style={S.td}>
                                            {log.booking_id ? (
                                                <span style={S.bookingBadge}>#{log.booking_id}</span>
                                            ) : "—"}
                                        </td>
                                        <td style={S.td}>
                                            <span style={{
                                                ...S.statusBadge,
                                                background: log.status === "sent" ? "#DCFCE7" : "#FEE2E2",
                                                color: log.status === "sent" ? "#166534" : "#991B1B",
                                            }}>
                                                {log.status === "sent" ? "✅ Sent" : "❌ Failed"}
                                            </span>
                                            {log.error_message && (
                                                <p style={S.errorMsg}>{log.error_message}</p>
                                            )}
                                        </td>
                                        <td style={S.td}>
                                            <p style={S.sentAt}>{log.sent_at}</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" },
    statCard: { background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" },
    statValue: { fontFamily: "Georgia,serif", fontSize: "26px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 2px" },
    statLabel: { fontSize: "12px", color: "#888", margin: 0 },
    filtersRow: { display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" },
    searchInput: { flex: 1, height: "46px", border: "1.5px solid #E8E0C8", borderRadius: "10px", padding: "0 14px", fontSize: "14px", color: "#1A1A1A", background: "#fff", outline: "none", fontFamily: "inherit" },
    select: { height: "46px", border: "1.5px solid #E8E0C8", borderRadius: "10px", padding: "0 12px", fontSize: "13px", color: "#1A1A1A", background: "#fff", outline: "none", fontFamily: "inherit", minWidth: "160px" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px" },
    spinner: { width: "32px", height: "32px", border: "3px solid #EDE8D8", borderTop: "3px solid #F5C842", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
    tableWrap: { border: "1px solid #EDE8D8", borderRadius: "14px", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "500", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", background: "#FAFAF7", borderBottom: "1px solid #EDE8D8" },
    trEven: { background: "#fff" },
    trOdd: { background: "#FDFCF7" },
    td: { padding: "14px 16px", fontSize: "14px", color: "#333", borderBottom: "1px solid #F4F1E8", verticalAlign: "middle" },
    emptyCell: { padding: "40px", textAlign: "center", fontSize: "14px", color: "#AAA" },
    typeBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap" },
    recipientName: { fontWeight: "500", color: "#1A1A1A", margin: "0 0 2px", fontSize: "14px" },
    recipientEmail: { fontSize: "12px", color: "#888", margin: 0 },
    hotelBadge: { background: "#F4F1E8", color: "#555", padding: "3px 10px", borderRadius: "6px", fontSize: "12px" },
    bookingBadge: { background: "#F4F1E8", color: "#888", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" },
    statusBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    errorMsg: { fontSize: "11px", color: "#EF4444", margin: "4px 0 0" },
    sentAt: { fontSize: "13px", color: "#666", margin: 0 },
};