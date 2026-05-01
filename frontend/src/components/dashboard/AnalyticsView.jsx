import React, { useEffect, useState } from "react";
import api from "../../api";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const StatCard = ({ icon, value, label, sub, subColor }) => (
    <div style={S.statCard}>
        <div style={S.statIconWrap}>{icon}</div>
        <div>
            <p style={S.statValue}>{value}</p>
            <p style={S.statLabel}>{label}</p>
            {sub && <p style={{ ...S.statSub, color: subColor || "#888" }}>{sub}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={S.tooltip}>
                <p style={S.tooltipLabel}>{label}</p>
                <p style={S.tooltipValue}>{payload[0].value} bookings</p>
            </div>
        );
    }
    return null;
};

const CustomRoomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={S.tooltip}>
                <p style={S.tooltipLabel}>{label}</p>
                <p style={S.tooltipValue}>{payload[0].value} bookings</p>
            </div>
        );
    }
    return null;
};

function AnalyticsView() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/analytics/")
            .then(res => setData(res.data))
            .catch(() => setError("Failed to load analytics."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={S.loadingWrap}>
            <div style={S.spinner} />
            <p style={{ color: "#AAA", marginTop: "12px", fontSize: "14px" }}>Loading analytics...</p>
        </div>
    );

    if (error) return (
        <div style={S.errorWrap}>
            <p style={{ color: "#EF4444", fontSize: "14px" }}>{error}</p>
        </div>
    );

    const { monthly_bookings, top_rooms, occupancy, summary } = data;
    const growthPositive = summary.growth >= 0;

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.pageHeader}>
                <div>
                    <h1 style={S.pageTitle}>Analytics</h1>
                    <p style={S.pageSubtitle}>Booking trends and occupancy overview</p>
                </div>
                <div style={S.dateBadge}>
                    {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </div>
            </div>

            {/* Summary cards */}
            <div style={S.statsGrid}>
                <StatCard
                    icon="📊"
                    value={summary.total_bookings}
                    label="Total bookings"
                />
                <StatCard
                    icon="📅"
                    value={summary.this_month}
                    label="This month"
                    sub={`${growthPositive ? "▲" : "▼"} ${Math.abs(summary.growth)}% vs last month`}
                    subColor={growthPositive ? "#22C55E" : "#EF4444"}
                />
                <StatCard
                    icon="🕐"
                    value={summary.last_month}
                    label="Last month"
                />
                <StatCard
                    icon="🏨"
                    value={occupancy.length}
                    label="Hotels tracked"
                />
            </div>

            {/* Monthly bookings bar chart */}
            <div style={S.chartCard}>
                <div style={S.chartHeader}>
                    <div>
                        <h2 style={S.chartTitle}>Monthly Bookings</h2>
                        <p style={S.chartSub}>Last 12 months</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthly_bookings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F4F1E8" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: "#AAA" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#AAA" }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245,200,66,0.08)" }} />
                        <Bar dataKey="bookings" radius={[6, 6, 0, 0]} maxBarSize={40}>
                            {monthly_bookings.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={index === monthly_bookings.length - 1 ? "#F5C842" : "#EDE8D8"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div style={S.chartLegend}>
                    <div style={S.legendItem}>
                        <div style={{ ...S.legendDot, background: "#F5C842" }} />
                        <span>Current month</span>
                    </div>
                    <div style={S.legendItem}>
                        <div style={{ ...S.legendDot, background: "#EDE8D8" }} />
                        <span>Previous months</span>
                    </div>
                </div>
            </div>

            <div style={S.bottomGrid}>
                {/* Top rooms */}
                {top_rooms && top_rooms.length > 0 && (
                    <div style={S.chartCard}>
                        <div style={S.chartHeader}>
                            <div>
                                <h2 style={S.chartTitle}>Most Booked Rooms</h2>
                                <p style={S.chartSub}>Top 5 rooms by bookings</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={top_rooms}
                                layout="vertical"
                                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F4F1E8" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: "#AAA" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <YAxis type="category" dataKey="room" tick={{ fontSize: 11, fill: "#555" }} axisLine={false} tickLine={false} width={100} />
                                <Tooltip content={<CustomRoomTooltip />} cursor={{ fill: "rgba(245,200,66,0.08)" }} />
                                <Bar dataKey="bookings" fill="#1A1A1A" radius={[0, 6, 6, 0]} maxBarSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Occupancy per hotel */}
                {occupancy && occupancy.length > 0 && (
                    <div style={S.chartCard}>
                        <div style={S.chartHeader}>
                            <div>
                                <h2 style={S.chartTitle}>Hotel Occupancy</h2>
                                <p style={S.chartSub}>Current occupancy rate</p>
                            </div>
                        </div>
                        <div style={S.occupancyList}>
                            {occupancy.map((hotel, i) => (
                                <div key={i} style={S.occItem}>
                                    <div style={S.occTop}>
                                        <span style={S.occName}>{hotel.hotel}</span>
                                        <span style={S.occPct}>{hotel.occupancy}%</span>
                                    </div>
                                    <div style={S.occTrack}>
                                        <div style={{
                                            ...S.occFill,
                                            width: `${hotel.occupancy}%`,
                                            background: hotel.occupancy >= 75 ? "#22C55E"
                                                : hotel.occupancy >= 40 ? "#F5C842" : "#EF4444",
                                        }} />
                                    </div>
                                    <p style={S.occMeta}>
                                        {hotel.occupied} occupied · {hotel.total_rooms - hotel.occupied} available · {hotel.total_rooms} total
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const S = {
    page: { fontFamily: "'DM Sans','Segoe UI',sans-serif" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px" },
    spinner: { width: "32px", height: "32px", border: "3px solid #EDE8D8", borderTop: "3px solid #F5C842", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
    errorWrap: { padding: "40px", textAlign: "center" },
    pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
    pageTitle: { fontFamily: "Georgia,serif", fontSize: "32px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px" },
    pageSubtitle: { fontSize: "13px", color: "#AAA", margin: 0 },
    dateBadge: { background: "#F5C842", color: "#1A1A1A", fontSize: "13px", fontWeight: "500", padding: "6px 14px", borderRadius: "20px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" },
    statCard: { background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" },
    statIconWrap: { fontSize: "22px" },
    statValue: { fontFamily: "Georgia,serif", fontSize: "26px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 2px" },
    statLabel: { fontSize: "12px", color: "#888", margin: "0 0 2px" },
    statSub: { fontSize: "11px", margin: 0, fontWeight: "500" },
    chartCard: { background: "#fff", border: "1px solid #EDE8D8", borderRadius: "16px", padding: "24px", marginBottom: "16px" },
    chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
    chartTitle: { fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px" },
    chartSub: { fontSize: "12px", color: "#AAA", margin: 0 },
    chartLegend: { display: "flex", gap: "20px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F4F1E8" },
    legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#888" },
    legendDot: { width: "10px", height: "10px", borderRadius: "3px" },
    bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    tooltip: { background: "#1A1A1A", border: "none", borderRadius: "8px", padding: "10px 14px" },
    tooltipLabel: { fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "0 0 4px" },
    tooltipValue: { fontSize: "14px", fontWeight: "600", color: "#F5C842", margin: 0 },
    occupancyList: { display: "flex", flexDirection: "column", gap: "16px" },
    occItem: {},
    occTop: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
    occName: { fontSize: "14px", fontWeight: "500", color: "#1A1A1A" },
    occPct: { fontSize: "14px", fontWeight: "700", color: "#1A1A1A" },
    occTrack: { height: "8px", background: "#F4F1E8", borderRadius: "4px", overflow: "hidden", marginBottom: "4px" },
    occFill: { height: "100%", borderRadius: "4px", transition: "width 0.6s ease" },
    occMeta: { fontSize: "11px", color: "#AAA", margin: 0 },
};

export default AnalyticsView;