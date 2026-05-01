import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

const steps = ["Hotel & Dates", "Room", "Your Details", "Confirm"];

function GuestBooking() {
    const [step, setStep] = useState(0);
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [dates, setDates] = useState({ check_in: "", check_out: "" });
    const [guest, setGuest] = useState({
        first_name: "", last_name: "", email: "",
        phone_number: "", address: "", id_proof: "",
    });

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        Promise.all([
            api.get("/api/public/hotels/"),
            api.get("/api/public/rooms/"),
            api.get("/api/public/bookings/"),
        ]).then(([h, r, b]) => {
            setHotels(h.data);
            setRooms(r.data);
            setBookings(b.data);
        }).catch(() => setError("Failed to load hotel data."))
        .finally(() => setLoading(false));
    }, []);

    const availableRooms = rooms.filter((room) => {
        if (!selectedHotel || room.hotel !== selectedHotel.id) return false;
        if (!dates.check_in || !dates.check_out) return false;
        const isBooked = bookings.some((b) =>
            b.room === room.id &&
            !(dates.check_in > b.check_out || dates.check_out < b.check_in)
        );
        return !isBooked;
    });

    const groupedByFloor = availableRooms.reduce((acc, room) => {
        if (!acc[room.floor]) acc[room.floor] = [];
        acc[room.floor].push(room);
        return acc;
    }, {});

    const handleGuestChange = (e) => {
        setGuest({ ...guest, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        const formData = new FormData();
        const data = {
            customerDetails: guest,
            bookingDetails: dates,
            hotel: selectedHotel.id,
            room: selectedRoom.id,
            floor: selectedRoom.floor,
        };
        formData.append("data", JSON.stringify(data));
        await api.post("/api/public/book/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then(() => setSuccess(true))
            .catch((err) => setError(err?.response?.data?.detail || "Booking failed. Please try again."))
            .finally(() => setSubmitting(false));
    };

    if (loading) return (
        <div style={S.loadingPage}>
            <div style={S.spinner} />
            <p style={{ color: "#AAA", marginTop: "12px" }}>Loading available hotels...</p>
        </div>
    );

    if (success) return (
        <div style={S.successPage}>
            <div style={S.successCard}>
                <div style={S.successIcon}>✅</div>
                <h2 style={S.successTitle}>Booking Confirmed!</h2>
                <p style={S.successSub}>
                    Thank you, <strong>{guest.first_name}</strong>! Your booking at <strong>{selectedHotel?.name}</strong> is confirmed.
                    A confirmation email has been sent to <strong>{guest.email}</strong>.
                </p>
                <div style={S.summaryCard}>
                    {[
                        { label: "Hotel", value: selectedHotel?.name },
                        { label: "Room", value: selectedRoom?.name },
                        { label: "Check-in", value: dates.check_in },
                        { label: "Check-out", value: dates.check_out },
                    ].map((item, i) => (
                        <div key={i} style={S.summaryRow}>
                            <span style={S.summaryLabel}>{item.label}</span>
                            <span style={S.summaryValue}>{item.value}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => window.location.href = "/"} style={S.homeBtn}>
                    Back to Home
                </button>
            </div>
        </div>
    );

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.header}>
                <a href="/" style={S.brandLink}>
                    <div style={S.brandIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#F5C842" strokeWidth="1.5" fill="none" />
                            <circle cx="12" cy="12" r="3" fill="#F5C842" />
                        </svg>
                    </div>
                    <span style={S.brandName}>Hotel <span style={S.brandAccent}>Hive</span></span>
                </a>
                <p style={S.headerSub}>Book your stay</p>
            </div>

            <div style={S.body}>
                {/* Stepper */}
                <div style={S.stepper}>
                    {steps.map((s, i) => (
                        <div key={i} style={S.stepItem}>
                            <div style={{
                                ...S.stepDot,
                                background: i <= step ? "#F5C842" : "#EDE8D8",
                                color: i <= step ? "#1A1A1A" : "#AAA",
                            }}>
                                {i < step ? "✓" : i + 1}
                            </div>
                            <span style={{ ...S.stepLabel, color: i <= step ? "#1A1A1A" : "#AAA" }}>{s}</span>
                            {i < steps.length - 1 && (
                                <div style={{ ...S.stepLine, background: i < step ? "#F5C842" : "#EDE8D8" }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={S.errorBox}>⚠️ {error}</div>
                )}

                {/* Step 0: Hotel & Dates */}
                {step === 0 && (
                    <div style={S.card}>
                        <h2 style={S.cardTitle}>Choose a hotel & dates</h2>
                        <div style={S.field}>
                            <label style={S.label}>Select hotel</label>
                            <div style={S.hotelGrid}>
                                {hotels.map((hotel) => (
                                    <div
                                        key={hotel.id}
                                        onClick={() => setSelectedHotel(hotel)}
                                        style={{
                                            ...S.hotelCard,
                                            border: selectedHotel?.id === hotel.id
                                                ? "2px solid #F5C842" : "1.5px solid #EDE8D8",
                                            boxShadow: selectedHotel?.id === hotel.id
                                                ? "0 0 0 3px rgba(245,200,66,0.2)" : "none",
                                        }}
                                    >
                                        <div style={S.hotelCardIcon}>🏨</div>
                                        <div>
                                            <p style={S.hotelCardName}>{hotel.name}</p>
                                            {hotel.address && <p style={S.hotelCardAddr}>{hotel.address}</p>}
                                        </div>
                                        {selectedHotel?.id === hotel.id && (
                                            <span style={S.hotelCheck}>✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={S.grid2}>
                            <div style={S.field}>
                                <label style={S.label}>Check-in date</label>
                                <input type="date" min={today}
                                    value={dates.check_in}
                                    onChange={(e) => setDates({ ...dates, check_in: e.target.value, check_out: "" })}
                                    style={S.input} />
                            </div>
                            <div style={S.field}>
                                <label style={S.label}>Check-out date</label>
                                <input type="date"
                                    min={dates.check_in || today}
                                    disabled={!dates.check_in}
                                    value={dates.check_out}
                                    onChange={(e) => setDates({ ...dates, check_out: e.target.value })}
                                    style={{ ...S.input, opacity: !dates.check_in ? 0.5 : 1 }} />
                            </div>
                        </div>
                        <div style={S.actions}>
                            <button
                                onClick={() => setStep(1)}
                                disabled={!selectedHotel || !dates.check_in || !dates.check_out}
                                style={{
                                    ...S.nextBtn,
                                    opacity: (!selectedHotel || !dates.check_in || !dates.check_out) ? 0.4 : 1,
                                }}>
                                Next — Choose room →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Room */}
                {step === 1 && (
                    <div style={S.card}>
                        <h2 style={S.cardTitle}>Choose a room</h2>
                        <p style={S.cardSub}>
                            {availableRooms.length} room{availableRooms.length !== 1 ? "s" : ""} available at {selectedHotel?.name} for your dates
                        </p>
                        {availableRooms.length === 0 ? (
                            <div style={S.emptyState}>
                                <p style={{ fontSize: "32px" }}>😔</p>
                                <p style={{ color: "#AAA", fontSize: "14px" }}>No rooms available for these dates. Try different dates.</p>
                                <button onClick={() => setStep(0)} style={S.backBtn}>← Change dates</button>
                            </div>
                        ) : (
                            Object.entries(groupedByFloor).map(([floor, floorRooms]) => (
                                <div key={floor} style={{ marginBottom: "24px" }}>
                                    <p style={S.floorLabel}>Floor {floor}</p>
                                    <div style={S.roomGrid}>
                                        {floorRooms.map((room) => (
                                            <div
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room)}
                                                style={{
                                                    ...S.roomCard,
                                                    border: selectedRoom?.id === room.id
                                                        ? "2px solid #F5C842" : "1.5px solid #EDE8D8",
                                                    background: selectedRoom?.id === room.id ? "#FFFBF0" : "#fff",
                                                }}
                                            >
                                                <p style={S.roomName}>{room.name}</p>
                                                <p style={S.roomBeds}>🛏 {room.beds} bed{room.beds !== 1 ? "s" : ""}</p>
                                                {selectedRoom?.id === room.id && (
                                                    <span style={S.roomCheck}>✓</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                        <div style={S.actions}>
                            <button onClick={() => setStep(0)} style={S.backBtn}>← Back</button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedRoom}
                                style={{ ...S.nextBtn, opacity: !selectedRoom ? 0.4 : 1 }}>
                                Next — Your details →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Guest Details */}
                {step === 2 && (
                    <div style={S.card}>
                        <h2 style={S.cardTitle}>Your details</h2>
                        <div style={S.grid2}>
                            <div style={S.field}>
                                <label style={S.label}>First name *</label>
                                <input type="text" name="first_name" required
                                    value={guest.first_name} onChange={handleGuestChange}
                                    style={S.input} placeholder="John" />
                            </div>
                            <div style={S.field}>
                                <label style={S.label}>Last name *</label>
                                <input type="text" name="last_name" required
                                    value={guest.last_name} onChange={handleGuestChange}
                                    style={S.input} placeholder="Doe" />
                            </div>
                            <div style={S.field}>
                                <label style={S.label}>Email address *</label>
                                <input type="email" name="email" required
                                    value={guest.email} onChange={handleGuestChange}
                                    style={S.input} placeholder="you@email.com" />
                            </div>
                            <div style={S.field}>
                                <label style={S.label}>Phone number *</label>
                                <input type="tel" name="phone_number" required
                                    value={guest.phone_number}
                                    onChange={(e) => setGuest({ ...guest, phone_number: e.target.value.replace(/\D/g, "") })}
                                    style={S.input} placeholder="+91 98765 43210" />
                            </div>
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Address *</label>
                            <textarea name="address" required rows={3}
                                value={guest.address} onChange={handleGuestChange}
                                style={{ ...S.input, height: "auto", paddingTop: "12px", resize: "vertical" }}
                                placeholder="Your full address" />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>ID proof *</label>
                            <input type="text" name="id_proof" required
                                value={guest.id_proof} onChange={handleGuestChange}
                                style={S.input} placeholder="Aadhaar / Passport / Driving licence number" />
                        </div>
                        <div style={S.actions}>
                            <button onClick={() => setStep(1)} style={S.backBtn}>← Back</button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!guest.first_name || !guest.last_name || !guest.email || !guest.phone_number || !guest.address || !guest.id_proof}
                                style={{
                                    ...S.nextBtn,
                                    opacity: (!guest.first_name || !guest.last_name || !guest.email || !guest.phone_number || !guest.address || !guest.id_proof) ? 0.4 : 1
                                }}>
                                Next — Confirm →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div style={S.card}>
                        <h2 style={S.cardTitle}>Confirm your booking</h2>
                        <div style={S.confirmGrid}>
                            <div style={S.confirmSection}>
                                <p style={S.confirmSectionTitle}>Stay details</p>
                                {[
                                    { label: "Hotel", value: selectedHotel?.name },
                                    { label: "Room", value: selectedRoom?.name },
                                    { label: "Floor", value: selectedRoom?.floor },
                                    { label: "Beds", value: selectedRoom?.beds },
                                    { label: "Check-in", value: dates.check_in },
                                    { label: "Check-out", value: dates.check_out },
                                ].map((item, i) => (
                                    <div key={i} style={S.confirmRow}>
                                        <span style={S.confirmLabel}>{item.label}</span>
                                        <span style={S.confirmValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={S.confirmSection}>
                                <p style={S.confirmSectionTitle}>Guest details</p>
                                {[
                                    { label: "Name", value: `${guest.first_name} ${guest.last_name}` },
                                    { label: "Email", value: guest.email },
                                    { label: "Phone", value: guest.phone_number },
                                    { label: "ID proof", value: guest.id_proof },
                                ].map((item, i) => (
                                    <div key={i} style={S.confirmRow}>
                                        <span style={S.confirmLabel}>{item.label}</span>
                                        <span style={S.confirmValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={S.confirmNote}>
                            📧 A confirmation email will be sent to <strong>{guest.email}</strong> after booking.
                        </div>
                        <div style={S.actions}>
                            <button onClick={() => setStep(2)} style={S.backBtn}>← Back</button>
                            <button onClick={handleSubmit} disabled={submitting}
                                style={{ ...S.nextBtn, opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? "Confirming..." : "✓ Confirm booking"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const S = {
    page: { minHeight: "100vh", background: "#F4F1E8", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
    loadingPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" },
    spinner: { width: "32px", height: "32px", border: "3px solid #EDE8D8", borderTop: "3px solid #F5C842", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
    header: { background: "#1A1A1A", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    brandLink: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" },
    brandIcon: { width: "36px", height: "36px", background: "#2A2A2A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
    brandName: { fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "600", color: "#fff" },
    brandAccent: { background: "#F5C842", color: "#1A1A1A", padding: "0 4px", borderRadius: "3px" },
    headerSub: { fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 },
    body: { maxWidth: "760px", margin: "0 auto", padding: "40px 24px" },
    stepper: { display: "flex", alignItems: "center", marginBottom: "32px" },
    stepItem: { display: "flex", alignItems: "center", flex: 1 },
    stepDot: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", flexShrink: 0 },
    stepLabel: { fontSize: "12px", fontWeight: "500", marginLeft: "8px", whiteSpace: "nowrap" },
    stepLine: { flex: 1, height: "2px", margin: "0 8px" },
    card: { background: "#fff", border: "1px solid #EDE8D8", borderRadius: "16px", padding: "32px" },
    cardTitle: { fontFamily: "Georgia,serif", fontSize: "24px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 6px" },
    cardSub: { fontSize: "13px", color: "#AAA", margin: "0 0 24px" },
    errorBox: { background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#C0392B", marginBottom: "16px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" },
    label: { fontSize: "12px", fontWeight: "500", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", height: "50px", border: "1.5px solid #E8E0C8", borderRadius: "10px", padding: "0 14px", fontSize: "15px", color: "#1A1A1A", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
    hotelGrid: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" },
    hotelCard: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", cursor: "pointer", position: "relative", transition: "all 0.15s" },
    hotelCardIcon: { fontSize: "24px", flexShrink: 0 },
    hotelCardName: { fontSize: "15px", fontWeight: "500", color: "#1A1A1A", margin: 0 },
    hotelCardAddr: { fontSize: "12px", color: "#AAA", margin: "2px 0 0" },
    hotelCheck: { position: "absolute", right: "16px", background: "#F5C842", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" },
    floorLabel: { fontFamily: "Georgia,serif", fontSize: "16px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 10px" },
    roomGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: "10px" },
    roomCard: { borderRadius: "12px", padding: "14px", cursor: "pointer", position: "relative", transition: "all 0.15s" },
    roomName: { fontSize: "15px", fontWeight: "600", color: "#1A1A1A", margin: "0 0 4px" },
    roomBeds: { fontSize: "12px", color: "#888", margin: 0 },
    roomCheck: { position: "absolute", top: "8px", right: "8px", background: "#F5C842", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" },
    emptyState: { textAlign: "center", padding: "40px 0" },
    actions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #EDE8D8" },
    backBtn: { height: "48px", padding: "0 24px", background: "none", border: "1.5px solid #E8E0C8", borderRadius: "10px", fontSize: "14px", color: "#888", cursor: "pointer", fontFamily: "inherit" },
    nextBtn: { height: "48px", padding: "0 28px", background: "#F5C842", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#1A1A1A", cursor: "pointer", fontFamily: "inherit" },
    confirmGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    confirmSection: { background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "12px", padding: "16px" },
    confirmSectionTitle: { fontSize: "11px", fontWeight: "500", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px", paddingBottom: "10px", borderBottom: "1px solid #EDE8D8" },
    confirmRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F4F1E8" },
    confirmLabel: { fontSize: "13px", color: "#888" },
    confirmValue: { fontSize: "13px", fontWeight: "500", color: "#1A1A1A" },
    confirmNote: { background: "#FFF8E1", border: "1px solid #F5C842", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#7A6000", marginBottom: "8px" },
    successPage: { minHeight: "100vh", background: "#F4F1E8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "24px" },
    successCard: { background: "#fff", border: "1px solid #EDE8D8", borderRadius: "20px", padding: "48px 40px", maxWidth: "500px", width: "100%", textAlign: "center" },
    successIcon: { fontSize: "48px", marginBottom: "16px" },
    successTitle: { fontFamily: "Georgia,serif", fontSize: "28px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 12px" },
    successSub: { fontSize: "15px", color: "#666", lineHeight: "1.7", margin: "0 0 24px" },
    summaryCard: { background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "12px", padding: "16px", marginBottom: "24px", textAlign: "left" },
    summaryRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F4F1E8" },
    summaryLabel: { fontSize: "13px", color: "#888" },
    summaryValue: { fontSize: "13px", fontWeight: "500", color: "#1A1A1A" },
    homeBtn: { height: "48px", padding: "0 32px", background: "#F5C842", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", color: "#1A1A1A", cursor: "pointer", fontFamily: "inherit" },
};

export default GuestBooking;