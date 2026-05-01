import React from "react";

const shimmer = `
@keyframes shimmer {
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
`;

const base = {
    background: "linear-gradient(90deg, #F4F1E8 25%, #EDEADE 50%, #F4F1E8 75%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.4s infinite linear",
    borderRadius: "8px",
    display: "block",
};

export const SkeletonStyle = () => (
    <style>{shimmer}</style>
);

export const Skeleton = ({ width = "100%", height = "16px", radius = "8px", style = {} }) => (
    <span style={{ ...base, width, height, borderRadius: radius, ...style }} />
);

// Pre-built skeleton layouts for each page

export const DashViewSkeleton = () => (
    <div style={{ fontFamily: "inherit" }}>
        <SkeletonStyle />
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
            <Skeleton width="160px" height="14px" style={{ marginBottom: "10px" }} />
            <Skeleton width="220px" height="36px" />
        </div>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "32px" }}>
            {[1,2,3].map(i => (
                <div key={i} style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "20px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <Skeleton width="48px" height="48px" radius="12px" />
                    <div style={{ flex: 1 }}>
                        <Skeleton width="60px" height="32px" style={{ marginBottom: "8px" }} />
                        <Skeleton width="100px" height="14px" />
                    </div>
                </div>
            ))}
        </div>
        {/* Occupancy */}
        <Skeleton width="180px" height="24px" style={{ marginBottom: "16px" }} />
        <div style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "24px", display: "flex", gap: "24px" }}>
            {[1,2,3].map(i => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Skeleton width="110px" height="110px" radius="50%" />
                    <Skeleton width="90px" height="14px" />
                </div>
            ))}
        </div>
        {/* Quick actions */}
        <Skeleton width="140px" height="24px" style={{ margin: "32px 0 16px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
            {[1,2,3,4].map(i => (
                <Skeleton key={i} height="80px" radius="14px" />
            ))}
        </div>
    </div>
);

export const HotelsViewSkeleton = () => (
    <div>
        <SkeletonStyle />
        <div style={{ marginBottom: "24px" }}>
            <Skeleton width="180px" height="36px" style={{ marginBottom: "8px" }} />
            <Skeleton width="120px" height="14px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {[1,2,3,4].map(i => (
                <div key={i} style={{ border: "1px solid #EDE8D8", borderRadius: "16px", overflow: "hidden" }}>
                    <Skeleton width="100%" height="160px" radius="0" />
                    <div style={{ padding: "14px 16px" }}>
                        <Skeleton width="70%" height="16px" style={{ marginBottom: "8px" }} />
                        <Skeleton width="50%" height="12px" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const BookingViewSkeleton = () => (
    <div>
        <SkeletonStyle />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
                <Skeleton width="160px" height="36px" style={{ marginBottom: "8px" }} />
                <Skeleton width="120px" height="14px" />
            </div>
            <Skeleton width="130px" height="44px" radius="10px" />
        </div>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <Skeleton width="80px" height="14px" />
            <Skeleton width="200px" height="46px" radius="8px" />
        </div>
        <div style={{ border: "1px solid #EDE8D8", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ background: "#FAFAF7", padding: "12px 16px", borderBottom: "1px solid #EDE8D8", display: "flex", gap: "40px" }}>
                {[80,120,100,80,90,100].map((w,i) => <Skeleton key={i} width={`${w}px`} height="12px" />)}
            </div>
            {[1,2,3,4,5].map(i => (
                <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #F4F1E8", display: "flex", gap: "40px", alignItems: "center" }}>
                    {[80,120,100,80,90,140].map((w,j) => <Skeleton key={j} width={`${w}px`} height="14px" />)}
                </div>
            ))}
        </div>
    </div>
);

export const RoomViewSkeleton = () => (
    <div>
        <SkeletonStyle />
        <div style={{ marginBottom: "20px" }}>
            <Skeleton width="120px" height="36px" style={{ marginBottom: "8px" }} />
            <Skeleton width="200px" height="14px" />
        </div>
        <div style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "20px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
            {[1,2,3,4].map(i => (
                <div key={i}>
                    <Skeleton width="80px" height="12px" style={{ marginBottom: "8px" }} />
                    <Skeleton height="46px" radius="8px" />
                </div>
            ))}
        </div>
        {[1,2].map(floor => (
            <div key={floor} style={{ marginBottom: "28px" }}>
                <Skeleton width="120px" height="22px" style={{ marginBottom: "14px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))", gap: "10px" }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} height="120px" radius="12px" />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export const ManagersViewSkeleton = () => (
    <div>
        <SkeletonStyle />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
                <Skeleton width="160px" height="36px" style={{ marginBottom: "8px" }} />
                <Skeleton width="140px" height="14px" />
            </div>
            <Skeleton width="130px" height="44px" radius="10px" />
        </div>
        <div style={{ border: "1px solid #EDE8D8", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ background: "#FAFAF7", padding: "12px 16px", borderBottom: "1px solid #EDE8D8", display: "flex", gap: "60px" }}>
                {[60,120,120,100,80].map((w,i) => <Skeleton key={i} width={`${w}px`} height="12px" />)}
            </div>
            {[1,2,3,4].map(i => (
                <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #F4F1E8", display: "flex", gap: "60px", alignItems: "center" }}>
                    <Skeleton width="60px" height="14px" />
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Skeleton width="32px" height="32px" radius="50%" />
                        <Skeleton width="100px" height="14px" />
                    </div>
                    <Skeleton width="100px" height="14px" />
                    <Skeleton width="90px" height="26px" radius="6px" />
                    <Skeleton width="70px" height="32px" radius="8px" />
                </div>
            ))}
        </div>
    </div>
);

export const ProfileViewSkeleton = () => (
    <div>
        <SkeletonStyle />
        <div style={{ marginBottom: "24px" }}>
            <Skeleton width="160px" height="36px" style={{ marginBottom: "8px" }} />
            <Skeleton width="240px" height="14px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px" }}>
            {/* Avatar card */}
            <div style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "16px", padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <Skeleton width="120px" height="120px" radius="50%" />
                <Skeleton width="130px" height="20px" />
                <Skeleton width="160px" height="14px" />
                <Skeleton width="80px" height="28px" radius="20px" />
            </div>
            {/* Fields card */}
            <div style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "16px", padding: "28px" }}>
                <Skeleton width="200px" height="22px" style={{ marginBottom: "20px", paddingBottom: "14px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {[1,2,3,4].map(i => (
                        <div key={i}>
                            <Skeleton width="80px" height="12px" style={{ marginBottom: "8px" }} />
                            <Skeleton height="50px" radius="10px" />
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                    <Skeleton width="130px" height="44px" radius="10px" />
                </div>
            </div>
        </div>
    </div>
);