import React, { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });
const PRICE_PER_NIGHT = 500;
const steps = ["Dates & Rooms", "Your Details", "Payment"];

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
}

function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function GuestBooking() {
    const [step, setStep] = useState(0);
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [dates, setDates] = useState({ check_in: "", check_out: "" });
    const [guest, setGuest] = useState({ first_name: "", last_name: "", email: "", phone_number: "", address: "", id_proof: "" });
    const [imgErrors, setImgErrors] = useState({});

    const today = new Date().toISOString().split("T")[0];
    const nights = calculateNights(dates.check_in, dates.check_out);
    const totalAmount = nights * PRICE_PER_NIGHT;

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

    const getAvailableRooms = (hotelId) => {
        return rooms.filter((room) => {
            if (room.hotel !== hotelId) return false;
            if (!dates.check_in || !dates.check_out) return true;
            return !bookings.some((b) =>
                b.room === room.id && !(dates.check_in > b.check_out || dates.check_out < b.check_in)
            );
        });
    };

    const getHotelImage = (hotel) => {
        if (hotel.image && !imgErrors[hotel.id]) {
            if (hotel.image.startsWith("http")) return hotel.image;
            return `${BASE_URL}${hotel.image}`;
        }
        return null;
    };

    const handlePayment = async () => {
        setPaymentLoading(true);
        setError("");
        const loaded = await loadRazorpay();
        if (!loaded) { setError("Failed to load payment gateway."); setPaymentLoading(false); return; }
        try {
            const orderRes = await api.post("/api/payment/create-order/", {
                check_in: dates.check_in, check_out: dates.check_out,
                guest_name: `${guest.first_name} ${guest.last_name}`,
                hotel_name: selectedHotel.name,
            });
            const { order_id, amount_paise, key_id } = orderRes.data;
            const bookingData = { customerDetails: guest, bookingDetails: dates, hotel: selectedHotel.id, room: selectedRoom.id };
            const options = {
                key: key_id, amount: amount_paise, currency: "INR",
                name: "Hotel Hive",
                description: `${selectedHotel.name} — Room ${selectedRoom.name}`,
                order_id,
                prefill: { name: `${guest.first_name} ${guest.last_name}`, email: guest.email, contact: guest.phone_number },
                theme: { color: "#F5C842" },
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post("/api/payment/verify/", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_data: JSON.stringify(bookingData),
                        });
                        setSuccessData({ ...verifyRes.data, guest, hotel: selectedHotel, room: selectedRoom, dates });
                        setSuccess(true);
                    } catch (err) {
                        setError(err?.response?.data?.detail || "Payment verification failed.");
                    } finally { setPaymentLoading(false); }
                },
                modal: { ondismiss: () => { setPaymentLoading(false); setError("Payment cancelled."); } },
            };
            new window.Razorpay(options).open();
        } catch (err) {
            setError(err?.response?.data?.detail || "Failed to initiate payment.");
            setPaymentLoading(false);
        }
    };

    if (loading) return (
        <div style={S.loadingPage}>
            <div style={S.spinner} />
            <p style={{ color: "#AAA", marginTop: "12px" }}>Loading available rooms...</p>
        </div>
    );

    if (success && successData) return (
        <div style={S.successPage}>
            <div style={S.successCard}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
                <h2 style={S.successTitle}>Booking Confirmed!</h2>
                <p style={{ fontSize: "15px", color: "#666", lineHeight: "1.7", margin: "0 0 24px" }}>
                    Thank you, <strong>{successData.guest.first_name}</strong>!
                    Your stay at <strong>{successData.hotel.name}</strong> is booked.
                    Receipt sent to <strong>{successData.guest.email}</strong>.
                </p>
                <div style={S.summaryCard}>
                    {[
                        { label: "Booking ID", value: `#${successData.booking_id}` },
                        { label: "Hotel", value: successData.hotel.name },
                        { label: "Room", value: successData.room.name },
                        { label: "Check-in", value: successData.dates.check_in },
                        { label: "Check-out", value: successData.dates.check_out },
                        { label: "Total Paid", value: `₹${successData.amount}` },
                    ].map((item, i) => (
                        <div key={i} style={S.summaryRow}>
                            <span style={{ fontSize: "13px", color: "#888" }}>{item.label}</span>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: item.label === "Total Paid" ? "#22C55E" : "#1A1A1A" }}>{item.value}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => window.location.href = "/"} style={S.nextBtn}>← Back to Home</button>
            </div>
        </div>
    );

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.header}>
                <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                    <div style={{ width: "36px", height: "36px", background: "#2A2A2A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#F5C842" strokeWidth="1.5" fill="none" /><circle cx="12" cy="12" r="3" fill="#F5C842" /></svg>
                    </div>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "600", color: "#fff" }}>
                        Hotel <span style={{ background: "#F5C842", color: "#1A1A1A", padding: "0 4px", borderRadius: "3px" }}>Hive</span>
                    </span>
                </a>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Book your stay · ₹{PRICE_PER_NIGHT}/night</p>
            </div>

            <div style={S.body}>
                {/* Stepper */}
                <div style={S.stepper}>
                    {steps.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", flexShrink: 0, background: i <= step ? "#F5C842" : "#EDE8D8", color: i <= step ? "#1A1A1A" : "#AAA" }}>
                                {i < step ? "✓" : i + 1}
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "500", marginLeft: "8px", whiteSpace: "nowrap", color: i <= step ? "#1A1A1A" : "#AAA" }}>{s}</span>
                            {i < steps.length - 1 && <div style={{ flex: 1, height: "2px", margin: "0 8px", background: i < step ? "#F5C842" : "#EDE8D8" }} />}
                        </div>
                    ))}
                </div>

                {error && <div style={S.errorBox}>⚠️ {error}</div>}

                {/* Step 0: Dates + Room Selection */}
                {step === 0 && (
                    <div>
                        {/* Date picker */}
                        <div style={S.dateCard}>
                            <h2 style={S.cardTitle}>When are you staying?</h2>
                            <div style={S.grid2}>
                                <div style={S.field}>
                                    <label style={S.label}>Check-in date</label>
                                    <input type="date" min={today} value={dates.check_in}
                                        onChange={(e) => setDates({ ...dates, check_in: e.target.value, check_out: "" })}
                                        style={S.input} />
                                </div>
                                <div style={S.field}>
                                    <label style={S.label}>Checkout date</label>
                                    <input type="date" min={dates.check_in || today} disabled={!dates.check_in}
                                        value={dates.check_out}
                                        onChange={(e) => setDates({ ...dates, check_out: e.target.value })}
                                        style={{ ...S.input, opacity: !dates.check_in ? 0.5 : 1 }} />
                                </div>
                            </div>
                            {nights > 0 && (
                                <div style={S.priceBanner}>
                                    <span>🌙 {nights} night{nights !== 1 ? "s" : ""} × ₹{PRICE_PER_NIGHT}/night</span>
                                    <strong style={{ color: "#22C55E", fontSize: "16px" }}>Total: ₹{totalAmount}</strong>
                                </div>
                            )}
                        </div>

                        {/* Hotels + Rooms */}
                        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "500", color: "#1A1A1A", margin: "24px 0 16px" }}>
                            {dates.check_in && dates.check_out ? "Available rooms" : "All rooms"}
                            <span style={{ fontSize: "13px", fontWeight: "400", color: "#AAA", marginLeft: "10px" }}>₹{PRICE_PER_NIGHT} per night</span>
                        </h2>

                        {hotels.map((hotel) => {
                            const hotelRooms = getAvailableRooms(hotel.id);
                            const hotelImg = getHotelImage(hotel);
                            return (
                                <div key={hotel.id} style={S.hotelSection}>
                                    {/* Hotel header */}
                                    <div style={S.hotelHeader}>
                                        {hotelImg ? (
                                            <img src={hotelImg} alt={hotel.name}
                                                onError={() => setImgErrors(prev => ({ ...prev, [hotel.id]: true }))}
                                                style={S.hotelThumb} />
                                        ) : (
                                            <div style={S.hotelThumbFallback}>🏨</div>
                                        )}
                                        <div>
                                            <h3 style={S.hotelName}>{hotel.name}</h3>
                                            {hotel.address && <p style={S.hotelAddr}>📍 {hotel.address}</p>}
                                            <p style={S.hotelRoomCount}>{hotelRooms.length} room{hotelRooms.length !== 1 ? "s" : ""} available</p>
                                        </div>
                                    </div>

                                    {/* Room cards */}
                                    {hotelRooms.length === 0 ? (
                                        <p style={{ color: "#AAA", fontSize: "14px", padding: "16px", background: "#FAFAF7", borderRadius: "10px" }}>
                                            No rooms available for selected dates.
                                        </p>
                                    ) : (
                                        <div style={S.roomsGrid}>
                                            {hotelRooms.map((room) => {
                                                const isSelected = selectedRoom?.id === room.id;
                                                return (
                                                    <div key={room.id}
                                                        onClick={() => { setSelectedRoom(room); setSelectedHotel(hotel); }}
                                                        style={{
                                                            ...S.roomCard,
                                                            border: isSelected ? "2px solid #F5C842" : "1.5px solid #EDE8D8",
                                                            boxShadow: isSelected ? "0 0 0 3px rgba(245,200,66,0.2)" : "none",
                                                        }}>
                                                        {/* Room image placeholder */}
                                                        <div style={S.roomImgWrap}>
                                                            <div style={S.roomImgPlaceholder}>
                                                                <span style={{ fontSize: "32px" }}>🛏️</span>
                                                            </div>
                                                            {isSelected && (
                                                                <div style={S.selectedBadge}>✓ Selected</div>
                                                            )}
                                                            <div style={S.priceBadge}>₹{PRICE_PER_NIGHT}/night</div>
                                                        </div>
                                                        <div style={S.roomCardBody}>
                                                            <p style={S.roomCardName}>{room.name}</p>
                                                            <p style={S.roomCardBeds}>🛏 {room.beds} bed{room.beds !== 1 ? "s" : ""}</p>
                                                            <div style={S.roomCardFeatures}>
                                                                <span style={S.featurePill}>🏨 Floor {room.floor}</span>
                                                                <span style={S.featurePill}>✅ Available</span>
                                                            </div>
                                                            {nights > 0 && (
                                                                <p style={S.roomCardTotal}>
                                                                    {nights} night{nights !== 1 ? "s" : ""} = <strong style={{ color: "#22C55E" }}>₹{totalAmount}</strong>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {selectedRoom && (
                            <div style={S.stickyBottom}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: "600", color: "#1A1A1A" }}>
                                        {selectedRoom.name} — {selectedHotel.name}
                                    </p>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                                        {nights > 0 ? `${nights} nights · ₹${totalAmount}` : "Select dates to see price"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!dates.check_in || !dates.check_out) { setError("Please select check-in and check-out dates."); return; }
                                        setError(""); setStep(1);
                                    }}
                                    style={S.nextBtn}>
                                    Continue →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: Guest Details */}
                {step === 1 && (
                    <div style={S.card}>
                        <div style={S.selectedRoomBanner}>
                            <span>🛏️ <strong>{selectedRoom?.name}</strong> — {selectedHotel?.name}</span>
                            <span style={{ color: "#22C55E", fontWeight: "700" }}>₹{totalAmount}</span>
                        </div>
                        <h2 style={S.cardTitle}>Your details</h2>
                        <div style={S.grid2}>
                            {[["first_name", "First name", "John"], ["last_name", "Last name", "Doe"]].map(([name, label, ph]) => (
                                <div key={name} style={S.field}>
                                    <label style={S.label}>{label} *</label>
                                    <input type="text" name={name} required value={guest[name]}
                                        onChange={(e) => setGuest({ ...guest, [e.target.name]: e.target.value })}
                                        style={S.input} placeholder={ph} />
                                </div>
                            ))}
                            <div style={S.field}>
                                <label style={S.label}>Email *</label>
                                <input type="email" name="email" required value={guest.email}
                                    onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                                    style={S.input} placeholder="you@email.com" />
                            </div>
                            <div style={S.field}>
                                <label style={S.label}>Phone *</label>
                                <input type="tel" name="phone_number" required value={guest.phone_number}
                                    onChange={(e) => setGuest({ ...guest, phone_number: e.target.value.replace(/\D/g, "") })}
                                    style={S.input} placeholder="9876543210" />
                            </div>
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Address *</label>
                            <textarea name="address" required rows={3} value={guest.address}
                                onChange={(e) => setGuest({ ...guest, address: e.target.value })}
                                style={{ ...S.input, height: "auto", paddingTop: "12px", resize: "vertical" }}
                                placeholder="Your full address" />
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>ID proof *</label>
                            <input type="text" name="id_proof" required value={guest.id_proof}
                                onChange={(e) => setGuest({ ...guest, id_proof: e.target.value })}
                                style={S.input} placeholder="Aadhaar / Passport number" />
                        </div>
                        <div style={S.actions}>
                            <button onClick={() => setStep(0)} style={S.backBtn}>← Back</button>
                            <button onClick={() => setStep(2)}
                                disabled={!guest.first_name || !guest.last_name || !guest.email || !guest.phone_number || !guest.address || !guest.id_proof}
                                style={{ ...S.nextBtn, opacity: (!guest.first_name || !guest.last_name || !guest.email || !guest.phone_number || !guest.address || !guest.id_proof) ? 0.4 : 1 }}>
                                Next — Payment →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                    <div style={S.card}>
                        <h2 style={S.cardTitle}>Confirm & Pay</h2>
                        <div style={S.grid2}>
                            <div style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "12px", padding: "16px" }}>
                                <p style={{ fontSize: "11px", fontWeight: "500", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px", paddingBottom: "10px", borderBottom: "1px solid #EDE8D8" }}>Stay details</p>
                                {[["Hotel", selectedHotel?.name], ["Room", selectedRoom?.name], ["Check-in", dates.check_in], ["Check-out", dates.check_out], ["Nights", nights]].map(([l, v], i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F4F1E8" }}>
                                        <span style={{ fontSize: "13px", color: "#888" }}>{l}</span>
                                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#1A1A1A" }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "12px", padding: "16px" }}>
                                <p style={{ fontSize: "11px", fontWeight: "500", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px", paddingBottom: "10px", borderBottom: "1px solid #EDE8D8" }}>Guest details</p>
                                {[["Name", `${guest.first_name} ${guest.last_name}`], ["Email", guest.email], ["Phone", guest.phone_number]].map(([l, v], i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F4F1E8" }}>
                                        <span style={{ fontSize: "13px", color: "#888" }}>{l}</span>
                                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#1A1A1A" }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontSize: "14px", color: "#666" }}>₹{PRICE_PER_NIGHT} × {nights} night{nights !== 1 ? "s" : ""}</span>
                                <span style={{ fontSize: "16px", fontWeight: "600" }}>₹{totalAmount}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #EDE8D8", paddingTop: "12px" }}>
                                <span style={{ fontSize: "16px", fontWeight: "700", color: "#1A1A1A" }}>Total</span>
                                <span style={{ fontSize: "22px", fontWeight: "700", color: "#22C55E" }}>₹{totalAmount}</span>
                            </div>
                        </div>
                        <div style={{ background: "#FFF8E1", border: "1px solid #F5C842", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#7A6000", marginBottom: "16px" }}>
                            📧 Payment receipt will be sent to <strong>{guest.email}</strong>
                        </div>
                        <div style={S.actions}>
                            <button onClick={() => setStep(1)} style={S.backBtn}>← Back</button>
                            <button onClick={handlePayment} disabled={paymentLoading}
                                style={{ height: "52px", padding: "0 32px", background: "#22C55E", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit", opacity: paymentLoading ? 0.7 : 1 }}>
                                {paymentLoading ? "Processing..." : `💳 Pay ₹${totalAmount}`}
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
    loadingPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F4F1E8" },
    spinner: { width: "32px", height: "32px", border: "3px solid #EDE8D8", borderTop: "3px solid #F5C842", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
    header: { background: "#1A1A1A", padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    body: { maxWidth: "900px", margin: "0 auto", padding: "40px 24px" },
    stepper: { display: "flex", alignItems: "center", marginBottom: "32px" },
    card: { background: "#fff", border: "1px solid #EDE8D8", borderRadius: "16px", padding: "32px", marginBottom: "16px" },
    dateCard: { background: "#fff", border: "1px solid #EDE8D8", borderRadius: "16px", padding: "24px", marginBottom: "8px" },
    cardTitle: { fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 20px" },
    errorBox: { background: "#FFF0F0", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#C0392B", marginBottom: "16px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" },
    label: { fontSize: "12px", fontWeight: "500", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" },
    input: { width: "100%", height: "50px", border: "1.5px solid #E8E0C8", borderRadius: "10px", padding: "0 14px", fontSize: "15px", color: "#1A1A1A", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
    priceBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFBF0", border: "1px solid #F5C842", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#7A6000" },
    hotelSection: { marginBottom: "32px" },
    hotelHeader: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", background: "#fff", border: "1px solid #EDE8D8", borderRadius: "14px", padding: "16px" },
    hotelThumb: { width: "80px", height: "60px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
    hotelThumbFallback: { width: "80px", height: "60px", borderRadius: "10px", background: "#F5C842", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 },
    hotelName: { fontFamily: "Georgia,serif", fontSize: "18px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px" },
    hotelAddr: { fontSize: "13px", color: "#888", margin: "0 0 4px" },
    hotelRoomCount: { fontSize: "12px", color: "#22C55E", fontWeight: "600", margin: 0 },
    roomsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" },
    roomCard: { background: "#fff", borderRadius: "14px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" },
    roomImgWrap: { position: "relative", height: "120px", background: "#F4F1E8", display: "flex", alignItems: "center", justifyContent: "center" },
    roomImgPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" },
    selectedBadge: { position: "absolute", top: "8px", left: "8px", background: "#F5C842", color: "#1A1A1A", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px" },
    priceBadge: { position: "absolute", bottom: "8px", right: "8px", background: "#1A1A1A", color: "#F5C842", fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
    roomCardBody: { padding: "14px" },
    roomCardName: { fontSize: "15px", fontWeight: "700", color: "#1A1A1A", margin: "0 0 4px" },
    roomCardBeds: { fontSize: "13px", color: "#666", margin: "0 0 8px" },
    roomCardFeatures: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" },
    featurePill: { background: "#F4F1E8", color: "#666", fontSize: "11px", padding: "2px 8px", borderRadius: "20px" },
    roomCardTotal: { fontSize: "13px", color: "#666", margin: 0 },
    stickyBottom: { position: "sticky", bottom: "16px", background: "#1A1A1A", borderRadius: "14px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" },
    selectedRoomBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F4F1E8", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#1A1A1A" },
    actions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #EDE8D8" },
    backBtn: { height: "48px", padding: "0 24px", background: "none", border: "1.5px solid #E8E0C8", borderRadius: "10px", fontSize: "14px", color: "#888", cursor: "pointer", fontFamily: "inherit" },
    nextBtn: { height: "48px", padding: "0 28px", background: "#F5C842", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#1A1A1A", cursor: "pointer", fontFamily: "inherit" },
    summaryCard: { background: "#FAFAF7", border: "1px solid #EDE8D8", borderRadius: "12px", padding: "16px", marginBottom: "24px", textAlign: "left" },
    summaryRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F4F1E8" },
    successPage: { minHeight: "100vh", background: "#F4F1E8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "24px" },
    successCard: { background: "#fff", border: "1px solid #EDE8D8", borderRadius: "20px", padding: "48px 40px", maxWidth: "500px", width: "100%", textAlign: "center" },
    successTitle: { fontFamily: "Georgia,serif", fontSize: "28px", fontWeight: "500", color: "#1A1A1A", margin: "0 0 12px" },
};