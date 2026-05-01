import React, { useEffect, useState } from "react";
import { DashViewSkeleton } from "./Skeleton";
import api from "../../api";

const StatCard = ({ value, label, icon, accent }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIconWrap, background: accent + "18" }}>
      <span style={{ color: accent, fontSize: "20px" }}>{icon}</span>
    </div>
    <div>
      <p style={styles.statValue}>{value}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  </div>
);

const OccupancyRing = ({ percentage, hotelName }) => {
  const size = 110;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const pct = parseFloat(percentage);
  const color = pct >= 75 ? "#22C55E" : pct >= 40 ? "#F5C842" : "#EF4444";

  return (
    <div style={styles.ringWrap}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EBD8" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ fontSize: "16px", fontWeight: "600", fill: "#1A1A1A", fontFamily: "inherit" }}>
          {pct}%
        </text>
      </svg>
      <p style={styles.ringLabel}>{hotelName}</p>
    </div>
  );
};

function DashView() {
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/api/usertype/"),
      api.get("/api/dashboard/"),
    ]).then(([userRes, dashRes]) => {
      setRole(userRes.data.role);
      setOverview(dashRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashViewSkeleton />;

  const ownerStats = [
    { value: overview.total_hotels || 0, label: "Total Hotels", icon: "🏨", accent: "#F5C842" },
    { value: overview.total_rooms || 0, label: "Total Rooms", icon: "🛏️", accent: "#3B82F6" },
    { value: `${overview.overall_occupancy?.toFixed(1) || 0}%`, label: "Overall Occupancy", icon: "📊", accent: "#22C55E" },
  ];

  const managerStats = [
    { value: overview.available_rooms || 0, label: "Available Rooms", icon: "✅", accent: "#22C55E" },
    { value: overview.occupied_rooms || 0, label: "Occupied Rooms", icon: "🔴", accent: "#EF4444" },
    { value: overview.total_rooms || 0, label: "Total Rooms", icon: "🛏️", accent: "#3B82F6" },
  ];

  const stats = role === "Owner" ? ownerStats : managerStats;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <p style={styles.pageEyebrow}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 style={styles.pageTitle}>Overview</h1>
        </div>
        <div style={styles.roleBadge}>
          {role === "Owner" ? "👑" : "🔑"} {role}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Hotel Occupancy (Owner only) */}
      {role === "Owner" && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Hotel occupancy</h2>
            <span style={styles.sectionCount}>
              {overview.hotels?.length || 0} hotel{overview.hotels?.length !== 1 ? "s" : ""}
            </span>
          </div>

          {overview.hotels && overview.hotels.length > 0 ? (
            <div style={styles.ringsWrap}>
              {[...overview.hotels]
                .sort((a, b) => b.occupancy - a.occupancy)
                .map((hotel, i) => (
                  <OccupancyRing
                    key={i}
                    percentage={hotel.occupancy?.toFixed(1) || 0}
                    hotelName={hotel.name || ""}
                  />
                ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No hotels created yet.</p>
              <a href="/dashboard/hotels/create" style={styles.emptyLink}>Create your first hotel →</a>
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick actions</h2>
        <div style={styles.quickGrid}>
          {[
            { label: "New booking", href: "/dashboard/booking/create", icon: "➕" },
            { label: "View rooms", href: "/dashboard/rooms", icon: "🛏️" },
            { label: "Manage hotels", href: "/dashboard/hotels", icon: "🏨" },
            { label: "View profile", href: "/dashboard/profile", icon: "👤" },
          ].map((q, i) => (
            <a key={i} href={q.href} style={styles.quickCard}
              onMouseEnter={e => Object.assign(e.currentTarget.style, styles.quickCardHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, styles.quickCard)}>
              <span style={{ fontSize: "22px" }}>{q.icon}</span>
              <span style={styles.quickLabel}>{q.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  loadingWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", height: "300px",
  },
  spinner: {
    width: "32px", height: "32px",
    border: "3px solid #EDE8D8",
    borderTop: "3px solid #F5C842",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  pageHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: "28px",
  },
  pageEyebrow: {
    fontSize: "12px", color: "#AAA",
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px",
  },
  pageTitle: {
    fontFamily: "Georgia, serif", fontSize: "32px",
    fontWeight: "500", color: "#1A1A1A", margin: 0,
  },
  roleBadge: {
    background: "#F5C842", color: "#1A1A1A",
    fontSize: "13px", fontWeight: "500",
    padding: "6px 14px", borderRadius: "20px",
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px", marginBottom: "32px",
  },
  statCard: {
    background: "#FAFAF7", border: "1px solid #EDE8D8",
    borderRadius: "14px", padding: "20px",
    display: "flex", alignItems: "center", gap: "16px",
  },
  statIconWrap: {
    width: "48px", height: "48px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    fontFamily: "Georgia, serif", fontSize: "28px",
    fontWeight: "500", color: "#1A1A1A", margin: "0 0 2px",
  },
  statLabel: { fontSize: "13px", color: "#888", margin: 0 },
  section: { marginBottom: "32px" },
  sectionHeader: {
    display: "flex", alignItems: "center",
    gap: "10px", marginBottom: "16px",
  },
  sectionTitle: {
    fontFamily: "Georgia, serif", fontSize: "20px",
    fontWeight: "500", color: "#1A1A1A", margin: 0,
  },
  sectionCount: {
    background: "#F4F1E8", color: "#888",
    fontSize: "12px", padding: "3px 10px", borderRadius: "20px",
  },
  ringsWrap: {
    display: "flex", flexWrap: "wrap", gap: "16px",
    background: "#FAFAF7", border: "1px solid #EDE8D8",
    borderRadius: "14px", padding: "24px",
  },
  ringWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "8px",
  },
  ringLabel: {
    fontSize: "13px", color: "#555", fontWeight: "500",
    margin: 0, textAlign: "center", maxWidth: "110px",
  },
  emptyState: {
    background: "#FAFAF7", border: "1px dashed #DDD",
    borderRadius: "14px", padding: "32px",
    textAlign: "center",
  },
  emptyText: { color: "#AAA", fontSize: "14px", margin: "0 0 8px" },
  emptyLink: { color: "#C49A00", fontSize: "14px", textDecoration: "none", fontWeight: "500" },
  quickGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px",
  },
  quickCard: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "8px", padding: "20px 12px",
    background: "#FAFAF7", border: "1px solid #EDE8D8",
    borderRadius: "14px", textDecoration: "none",
    transition: "all 0.15s", cursor: "pointer",
  },
  quickCardHover: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "8px", padding: "20px 12px",
    background: "#F5C842", border: "1px solid #F5C842",
    borderRadius: "14px", textDecoration: "none",
    cursor: "pointer",
  },
  quickLabel: { fontSize: "13px", color: "#444", fontWeight: "500", textAlign: "center" },
};

export default DashView;