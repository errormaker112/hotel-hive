import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../../api";

function NewBooking() {
    const [today] = useState(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });
    const location = useLocation();
    const [hotelList, setHotelList] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const [reset, setReset] = useState(true);
    const [document, setDocument] = useState(null);
    const [previousBooking, setPreviousBooking] = useState({});
    const [customerDetails, setCustomerDetails] = useState({
        first_name: "", last_name: "", phone_number: "",
        address: "", email: "", id_proof: "",
    });
    const [bookingDetails, setBookingDetails] = useState({ check_in: "", check_out: "" });

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingDetails({ ...bookingDetails, [name]: value });
    };
    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails({ ...customerDetails, [name]: value });
    };
    const resetForm = () => {
        if (reset) {
            setCustomerDetails({ first_name: "", last_name: "", phone_number: "", address: "", email: "", id_proof: "" });
            setBookingDetails({ check_in: "", check_out: "" });
        }
        setSelectedFloor(""); setSelectedRoom("");
    };
    const loadHotels = async () => {
        await api.get("/api/gethotels/").then((r) => setHotelList(r.data)).catch((e) => alert(e.response.data.detail));
    };
    const loadRooms = async () => {
        await api.get("/api/hotel/rooms/").then((res) => setRoomList(res.data));
    };
    const loadBooking = async () => {
        await api.get("/api/getbookings/").then((res) => setBookingList(res.data)).catch((err) => alert(err.response.data.detail));
    };

    const filteredRooms = roomList.filter((room) => {
        if (room.hotel !== selectedHotel) return false;
        const isBooked = bookingList.some((booking) =>
            booking.room === room.id &&
            (bookingDetails.check_in > booking.check_out || bookingDetails.check_out < booking.check_in) === false
        );
        return !isBooked;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        localStorage.setItem("previousBooking", JSON.stringify(customerDetails));
        const formData = new FormData();
        const data = { customerDetails, bookingDetails, hotel: selectedHotel, room: selectedRoom, floor: selectedFloor };
        formData.append("data", JSON.stringify(data));
        if (document) formData.append("document", document);
        resetForm();
        await api.post("/api/addbooking/", formData, { headers: { "Content-Type": "multipart/form-data" } })
            .then((res) => { alert("Booking successful."); loadBooking(); loadRooms(); })
            .catch((err) => alert(err.response.data.detail));
    };

    useEffect(() => {
        const previousBooking = localStorage.getItem("previousBooking");
        if (previousBooking) setPreviousBooking(JSON.parse(previousBooking));
        const states = location.state || {};
        if (states.selectedHotel) setSelectedHotel(states.selectedHotel);
        if (states.roomFloor) setSelectedFloor(states.roomFloor);
        if (states.roomId) setSelectedRoom(states.roomId);
        if (states.bookingDetails) setBookingDetails(states.bookingDetails);
        loadHotels(); loadBooking(); loadRooms();
    }, [location.state]);

    const selectedHotelName = hotelList.find((h) => h.id === selectedHotel)?.name || "";

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>New Booking</h1>
                    {selectedHotelName && <p style={styles.pageSubtitle}>{selectedHotelName}</p>}
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                        type="button"
                        onClick={() => setCustomerDetails(previousBooking)}
                        style={styles.secondaryBtn}
                    >
                        Load previous guest
                    </button>
                    <NavLink to="/dashboard/booking/" style={styles.backBtn}>
                        ← Back
                    </NavLink>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>

                {/* Section: Dates */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Stay dates</p>
                    <div style={styles.grid2}>
                        <div style={styles.field}>
                            <label style={styles.label}>Arrival date</label>
                            <input type="date" min={today} name="check_in"
                                value={bookingDetails.check_in} onChange={handleBookingChange}
                                required style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Checkout date</label>
                            <input type="date" min={bookingDetails.check_in}
                                disabled={!bookingDetails.check_in}
                                name="check_out" value={bookingDetails.check_out}
                                onChange={handleBookingChange} required style={{
                                    ...styles.input,
                                    opacity: !bookingDetails.check_in ? 0.5 : 1,
                                }} />
                        </div>
                    </div>
                </div>

                {/* Section: Room */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Room details</p>
                    <div style={styles.grid2}>
                        <div style={styles.field}>
                            <label style={styles.label}>Floor</label>
                            <select value={selectedFloor} required onChange={(e) => setSelectedFloor(e.target.value)} style={styles.input}>
                                <option value="" hidden>Select floor</option>
                                {[...new Set(filteredRooms.map((r) => r.floor))].map((floor, i) => (
                                    <option key={i} value={floor}>{floor}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Room</label>
                            <select disabled={!selectedFloor} value={selectedRoom} required
                                onChange={(e) => setSelectedRoom(e.target.value)}
                                style={{ ...styles.input, opacity: !selectedFloor ? 0.5 : 1 }}>
                                <option value="" hidden>Select room</option>
                                {filteredRooms.filter((r) => r.floor === selectedFloor).map((room) => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section: Guest */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Guest details</p>
                    <div style={styles.grid2}>
                        <div style={styles.field}>
                            <label style={styles.label}>First name</label>
                            <input type="text" name="first_name" value={customerDetails.first_name}
                                onChange={handleCustomerChange} required style={styles.input} placeholder="John" />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Last name</label>
                            <input type="text" name="last_name" value={customerDetails.last_name || ""}
                                onChange={handleCustomerChange} required style={styles.input} placeholder="Doe" />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Phone number</label>
                            <input type="tel" name="phone_number" value={customerDetails.phone_number || ""}
                                onChange={handleCustomerChange} required style={styles.input} placeholder="+91 98765 43210" />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Email</label>
                            <input type="email" name="email" value={customerDetails.email || ""}
                                onChange={handleCustomerChange} required style={styles.input} placeholder="guest@email.com" />
                        </div>
                    </div>
                    <div style={{ ...styles.field, marginTop: "14px" }}>
                        <label style={styles.label}>Address</label>
                        <textarea name="address" value={customerDetails.address || ""}
                            onChange={handleCustomerChange} required
                            style={{ ...styles.input, height: "80px", resize: "none", paddingTop: "10px" }}
                            placeholder="Full address" />
                    </div>
                    <div style={{ ...styles.field, marginTop: "14px" }}>
                        <label style={styles.label}>ID proof</label>
                        <input type="text" name="id_proof" value={customerDetails.id_proof || ""}
                            onChange={handleCustomerChange} required style={styles.input}
                            placeholder="Aadhaar / Passport / Driving licence" />
                    </div>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    <button type="submit" onClick={() => setReset(true)} style={styles.primaryBtn}>
                        Book &amp; reset
                    </button>
                    <button type="submit" onClick={() => setReset(false)} style={styles.primaryBtn}>
                        Book &amp; add room
                    </button>
                    <button type="reset" onClick={() => { setReset(true); resetForm(); }} style={styles.ghostBtn}>
                        Reset form
                    </button>
                </div>
            </form>
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
    backBtn: {
        display: "inline-flex", alignItems: "center",
        background: "none", border: "1.5px solid #E8E0C8",
        borderRadius: "8px", padding: "8px 16px",
        fontSize: "13px", color: "#555", textDecoration: "none",
        fontFamily: "inherit",
    },
    secondaryBtn: {
        background: "#F4F1E8", border: "none", borderRadius: "8px",
        padding: "8px 16px", fontSize: "13px", color: "#555",
        cursor: "pointer", fontFamily: "inherit",
    },
    form: { display: "flex", flexDirection: "column", gap: "0" },
    section: {
        background: "#FAFAF7", border: "1px solid #EDE8D8",
        borderRadius: "14px", padding: "24px", marginBottom: "16px",
    },
    sectionTitle: {
        fontFamily: "Georgia, serif", fontSize: "16px",
        fontWeight: "500", color: "#1A1A1A",
        margin: "0 0 16px", paddingBottom: "12px",
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
    actions: {
        display: "flex", gap: "12px",
        justifyContent: "flex-end", paddingTop: "8px",
    },
    primaryBtn: {
        height: "50px", padding: "0 24px",
        background: "#F5C842", border: "none",
        borderRadius: "10px", fontSize: "14px",
        fontWeight: "500", color: "#1A1A1A",
        cursor: "pointer", fontFamily: "inherit",
    },
    ghostBtn: {
        height: "50px", padding: "0 24px",
        background: "none", border: "1.5px solid #E8E0C8",
        borderRadius: "10px", fontSize: "14px",
        color: "#888", cursor: "pointer", fontFamily: "inherit",
    },
};

export default NewBooking;