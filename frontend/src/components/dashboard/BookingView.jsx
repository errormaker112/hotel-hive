import React, { useEffect, useState } from "react";
import api from "../../api";
import { NavLink } from "react-router-dom";
import { BookingViewSkeleton } from "./Skeleton";

const BookingView = () => {
    const [hotelList, setHotelList] = useState([]);
    const [operation, setOperation] = useState("");
    const [roomList, setRoomList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(-1);
    const [role, setRole] = useState("");
    const [activeOp, setActiveOp] = useState({});
    const [loading, setLoading] = useState(true);

    const loadBooking = async () => {
        await api.get("/api/getbookings/")
            .then((res) => setBookingList(res.data))
            .catch((err) => alert(err.response.data.detail));
    };
    const loadRooms = async () => {
        await api.get("/api/hotel/rooms/").then((res) => setRoomList(res.data));
    };
    const loadHotels = async () => {
        await api.get("/api/gethotels/")
            .then((r) => {
                setHotelList(r.data);
                if (r.data.length > 0) setSelectedHotel(r.data[0].id);
            })
            .catch((e) => alert(e.response.data.detail));
    };
    const loadCustomers = async () => {
        await api.get("/api/getcustomers/")
            .then((res) => setCustomerList(res.data))
            .catch((err) => alert(err.response.data.detail));
    };
    const getUserType = async () => {
        try {
            const res1 = await api.get("/api/usertype/");
            setRole(res1.data.role);
        } catch (error) { console.log(error); }
    };
    const handleHotelChange = (e) => setSelectedHotel(parseInt(e.target.value, 10));
    const getRoomName = (roomId) => {
        const room = roomList.find((r) => r.id === roomId);
        return room ? room.name : "Unknown Room";
    };
    const getRoomIsOccupied = (roomId) => {
        const room = roomList.find((r) => r.id === roomId);
        return room ? room.is_occupied : false;
    };
    const getCustomerDetails = (customerId) =>
        customerList.find((c) => c.id === customerId);

    const handleOperation = async (bookingId) => {
        const op = activeOp[bookingId];
        if (!op) return;
        await api.post("/api/booking/operation/", { booking: bookingId, operation: op })
            .then((res) => {
                loadRooms(); loadBooking(); loadCustomers();
                alert(res.data.detail);
                setActiveOp((prev) => ({ ...prev, [bookingId]: "" }));
            })
            .catch((err) => alert(err.response.data.detail));
    };

    useEffect(() => {
        Promise.all([
            getUserType(), loadCustomers(), loadHotels(), loadBooking(), loadRooms()
        ]).finally(() => setLoading(false));
    }, []);

    const filteredBookings = bookingList.filter((b) => b.hotel === selectedHotel);

    if (loading) return <BookingViewSkeleton />;

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Bookings</h1>
                    <p style={styles.pageSubtitle}>{filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found</p>
                </div>
                {hotelList.length > 0 && (
                    <NavLink to="create" state={{ selectedHotel }} style={styles.newBtn}>
                        + New booking
                    </NavLink>
                )}
            </div>

            {/* Hotel selector */}
            <div style={styles.filterRow}>
                <label style={styles.filterLabel}>Hotel</label>
                <select onChange={handleHotelChange} style={styles.select}>
                    {hotelList.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {["Booking ID", "Guest", "Phone", "Room", "Status", "Operation"].map((h) => (
                                <th key={h} style={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length === 0 && (
                            <tr>
                                <td colSpan={6} style={styles.emptyCell}>
                                    No bookings found for this hotel.
                                </td>
                            </tr>
                        )}
                        {filteredBookings.map((booking, index) => {
                            const customer = getCustomerDetails(booking.customer);
                            const occupied = getRoomIsOccupied(booking.room);
                            if (!customer) return (
                                <tr key={index}><td colSpan={6} style={styles.td}>Loading...</td></tr>
                            );
                            return (
                                <tr key={index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                    <td style={styles.td}>
                                        <span style={styles.idBadge}>#{booking.id}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.guestName}>
                                            {customer.first_name} {customer.last_name}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{customer.phone_number}</td>
                                    <td style={styles.td}>{getRoomName(booking.room)}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: occupied ? "#FEE2E2" : "#DCFCE7",
                                            color: occupied ? "#991B1B" : "#166534",
                                        }}>
                                            {occupied ? "Occupied" : "Available"}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.opRow}>
                                            <select
                                                value={activeOp[booking.id] || ""}
                                                onChange={(e) => setActiveOp((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                                                style={styles.opSelect}
                                            >
                                                <option disabled hidden value="">Select</option>
                                                <option value="cancel">Cancel</option>
                                                <option value="checkin">Check in</option>
                                                <option value="checkout">Check out</option>
                                            </select>
                                            <button
                                                type="button"
                                                disabled={!activeOp[booking.id]}
                                                onClick={() => handleOperation(booking.id)}
                                                style={{
                                                    ...styles.goBtn,
                                                    opacity: !activeOp[booking.id] ? 0.4 : 1,
                                                    cursor: !activeOp[booking.id] ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    page: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    pageHeader: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", marginBottom: "24px",
    },
    pageTitle: {
        fontFamily: "Georgia, serif", fontSize: "32px",
        fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px",
    },
    pageSubtitle: { fontSize: "13px", color: "#AAA", margin: 0 },
    newBtn: {
        background: "#F5C842", color: "#1A1A1A",
        padding: "10px 20px", borderRadius: "10px",
        fontSize: "14px", fontWeight: "500",
        textDecoration: "none", whiteSpace: "nowrap",
    },
    filterRow: {
        display: "flex", alignItems: "center", gap: "12px",
        marginBottom: "20px",
    },
    filterLabel: {
        fontSize: "12px", fontWeight: "500", color: "#666",
        textTransform: "uppercase", letterSpacing: "0.05em",
    },
    select: {
        height: "46px", border: "1.5px solid #E8E0C8",
        borderRadius: "8px", padding: "0 12px",
        fontSize: "14px", color: "#1A1A1A",
        background: "#fff", outline: "none",
        fontFamily: "inherit", minWidth: "200px",
    },
    tableWrap: {
        border: "1px solid #EDE8D8", borderRadius: "14px",
        overflow: "hidden",
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
    guestName: { fontWeight: "500", color: "#1A1A1A" },
    statusBadge: {
        padding: "4px 10px", borderRadius: "20px",
        fontSize: "12px", fontWeight: "500",
    },
    opRow: { display: "flex", alignItems: "center", gap: "8px" },
    opSelect: {
        height: "34px", border: "1.5px solid #E8E0C8",
        borderRadius: "8px", padding: "0 8px",
        fontSize: "13px", color: "#1A1A1A",
        background: "#fff", outline: "none", fontFamily: "inherit",
    },
    goBtn: {
        height: "34px", padding: "0 14px",
        background: "#F5C842", border: "none",
        borderRadius: "8px", fontSize: "13px",
        fontWeight: "500", color: "#1A1A1A",
        fontFamily: "inherit",
    },
};

export default BookingView;