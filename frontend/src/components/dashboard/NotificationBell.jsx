import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../api";

const ICONS = {
    booking: "📅",
    payment: "💳",
    checkout: "🚪",
};

const COLORS = {
    booking: "#3B82F6",
    payment: "#22C55E",
    checkout: "#F5C842",
};

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const prevCountRef = useRef(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get("/api/notifications/");
            const newCount = res.data.unread_count;

            // Show browser popup if new notifications arrived
            if (newCount > prevCountRef.current && prevCountRef.current !== 0) {
                const newest = res.data.notifications[0];
                if (newest && "Notification" in window && Notification.permission === "granted") {
                    new Notification(`Hotel Hive — ${newest.title}`, {
                        body: newest.message,
                        icon: "/logo.png",
                    });
                }
            }
            prevCountRef.current = newCount;
            setNotifications(res.data.notifications);
            setUnreadCount(newCount);
        } catch (err) {
            // Silently fail
        }
    }, []);

    // Request browser notification permission
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Fetch on mount and poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleOpen = () => {
        setOpen(!open);
    };

    const handleMarkRead = async (id) => {
        try {
            await api.post(`/api/notifications/mark-read/${id}/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post("/api/notifications/mark-all-read/");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) { }
    };

    return (
        <div ref={dropdownRef} style={S.wrap}>
            {/* Bell button */}
            <button onClick={handleOpen} style={S.bellBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span style={S.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={S.dropdown}>
                    <div style={S.dropHeader}>
                        <span style={S.dropTitle}>Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} style={S.markAllBtn}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={S.dropBody}>
                        {notifications.length === 0 ? (
                            <div style={S.empty}>
                                <span style={{ fontSize: "28px" }}>🔔</span>
                                <p style={S.emptyText}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                                    style={{
                                        ...S.notifItem,
                                        background: n.is_read ? "transparent" : "rgba(245,200,66,0.06)",
                                        cursor: n.is_read ? "default" : "pointer",
                                    }}
                                >
                                    <div style={{ ...S.notifIcon, background: COLORS[n.type] + "20" }}>
                                        <span style={{ fontSize: "16px" }}>{ICONS[n.type]}</span>
                                    </div>
                                    <div style={S.notifContent}>
                                        <div style={S.notifTop}>
                                            <span style={S.notifTitle}>{n.title}</span>
                                            {!n.is_read && <span style={S.unreadDot} />}
                                        </div>
                                        <p style={S.notifMsg}>{n.message}</p>
                                        <span style={S.notifTime}>{timeAgo(n.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const S = {
    wrap: { position: "relative" },
    bellBtn: {
        background: "none", border: "none",
        cursor: "pointer", padding: "8px",
        display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative",
        borderRadius: "8px",
    },
    badge: {
        position: "absolute", top: "2px", right: "2px",
        background: "#EF4444", color: "#fff",
        fontSize: "10px", fontWeight: "700",
        minWidth: "16px", height: "16px",
        borderRadius: "8px", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "0 3px",
    },
    dropdown: {
        position: "absolute", bottom: "48px", left: "0",
        width: "320px", background: "#1E1E1E",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "14px", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        zIndex: 1000,
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    dropHeader: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    dropTitle: {
        fontSize: "14px", fontWeight: "600", color: "#fff",
    },
    markAllBtn: {
        background: "none", border: "none",
        color: "#F5C842", fontSize: "12px",
        cursor: "pointer", fontFamily: "inherit",
        fontWeight: "500",
    },
    dropBody: { maxHeight: "360px", overflowY: "auto" },
    empty: {
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px",
    },
    emptyText: { color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "8px" },
    notifItem: {
        display: "flex", gap: "12px", padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        transition: "background 0.15s",
    },
    notifIcon: {
        width: "36px", height: "36px", borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
    },
    notifContent: { flex: 1, minWidth: 0 },
    notifTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" },
    notifTitle: { fontSize: "13px", fontWeight: "600", color: "#fff" },
    unreadDot: {
        width: "7px", height: "7px", borderRadius: "50%",
        background: "#F5C842", flexShrink: 0,
    },
    notifMsg: { fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "0 0 4px", lineHeight: "1.4" },
    notifTime: { fontSize: "11px", color: "rgba(255,255,255,0.3)" },
};