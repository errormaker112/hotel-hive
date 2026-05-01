import React, { useEffect, useState } from "react";
import api from "../../api";
import { NavLink } from "react-router-dom";
import { RoomViewSkeleton } from "./Skeleton";

function RoomView(props) {
    const [userType, setUserType] = useState("");
    const [selectedHotel, setSelectedHotel] = useState(-1);
    const [hotelList, setHotelList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [editRoomId, setEditRoomId] = useState(null);
    const [roomList, setRoomList] = useState([]);
    const [editRoomDetails, setEditRoomDetails] = useState({ beds: "" });
    const [filter, setFilter] = useState("all");
    const [bookingDetails, setBookingDetails] = useState({ check_in: "", check_out: "" });
    const [loading, setLoading] = useState(true);
    const [today] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingDetails({ ...bookingDetails, [name]: value });
    };
    const resetDates = () => setBookingDetails({ check_in: "", check_out: "" });

    const loadUserType = async () => {
        await api.get("/api/usertype/").then((res) => setUserType(res.data.role)).catch(() => {});
    };
    const loadBooking = async () => {
        await api.get("/api/getbookings/").then((res) => setBookingList(res.data)).catch((err) => alert(err.response.data.detail));
    };
    const loadRooms = async () => {
        await api.get("/api/hotel/rooms/").then((res) => setRoomList(res.data));
    };
    const handleHotelChange = (e) => setSelectedHotel(parseInt(e.target.value, 10));
    const handleFilterChange = (e) => setFilter(e.target.value);
    const handleEditChange = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
        const { name, value } = e.target;
        setEditRoomDetails((prev) => ({ ...prev, [name]: parseInt(value) }));
    };
    const handleEditSubmit = async () => {
        await api.post("/api/hotel/room/edit/", { hotel: selectedHotel, room: editRoomId, ...editRoomDetails })
            .then((res) => { setEditRoomId(null); setEditRoomDetails({}); alert(res.data.detail); loadRooms(); })
            .catch((err) => alert(err.response.data.detail));
    };
    const loadHotels = async () => {
        await api.get("/api/gethotels/")
            .then((r) => { setHotelList(r.data); if (r.data.length > 0) setSelectedHotel(r.data[0].id); })
            .catch((e) => alert(e.response.data.detail));
    };

    const groupRoomsByFloor = (rooms) => {
        const grouped = {};
        rooms.forEach((room) => {
            if (!grouped[room.floor]) grouped[room.floor] = [];
            grouped[room.floor].push(room);
        });
        return grouped;
    };
    const sortFloors = (a, b) => {
        if (a === "Ground Floor") return -1;
        if (b === "Ground Floor") return 1;
        return parseInt(a, 10) - parseInt(b, 10);
    };

    const filteredRooms = roomList.filter((room) => {
        if (room.hotel !== selectedHotel) return false;
        if (filter === "occupied") return room.is_occupied;
        if (filter === "available") return !room.is_occupied;
        if (!bookingDetails.check_in || !bookingDetails.check_out) return true;
        const isBooked = bookingList.some((booking) =>
            booking.room === room.id &&
            (bookingDetails.check_in > booking.check_out || bookingDetails.check_out < booking.check_in) === false
        );
        return !isBooked;
    });

    const roomsByFloor = groupRoomsByFloor(filteredRooms);
    const sortedFloors = Object.keys(roomsByFloor).sort(sortFloors);

    const totalRooms = filteredRooms.length;
    const occupiedRooms = filteredRooms.filter((r) => r.is_occupied).length;
    const availableRooms = totalRooms - occupiedRooms;

    useEffect(() => {
        Promise.all([loadUserType(), loadHotels(), loadBooking(), loadRooms()])
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <RoomViewSkeleton />;

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Rooms</h1>
                    <p style={styles.pageSubtitle}>
                        <span style={{ color: "#22C55E", fontWeight: 500 }}>{availableRooms} available</span>
                        {" · "}
                        <span style={{ color: "#EF4444", fontWeight: 500 }}>{occupiedRooms} occupied</span>
                        {" · "}
                        {totalRooms} total
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={styles.filtersCard}>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Hotel</label>
                    <select onChange={handleHotelChange} style={styles.select}>
                        {hotelList.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Status</label>
                    <select onChange={handleFilterChange} value={filter} style={styles.select}>
                        <option value="all">All rooms</option>
                        <option value="occupied">Occupied</option>
                        <option value="available">Available</option>
                    </select>
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>
                        Arrival date
                        {(bookingDetails.check_in || bookingDetails.check_out) && (
                            <button type="button" onClick={resetDates} style={styles.clearBtn}>clear</button>
                        )}
                    </label>
                    <input type="date" min={today} name="check_in"
                        value={bookingDetails.check_in} onChange={handleBookingChange}
                        style={styles.input} />
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Checkout date</label>
                    <input type="date" min={bookingDetails.check_in}
                        disabled={!bookingDetails.check_in}
                        name="check_out" value={bookingDetails.check_out}
                        onChange={handleBookingChange}
                        style={{ ...styles.input, opacity: !bookingDetails.check_in ? 0.5 : 1 }} />
                </div>
            </div>

            {/* Floors */}
            {sortedFloors.length === 0 && (
                <div style={styles.emptyState}>
                    <p style={{ fontSize: "36px", marginBottom: "10px" }}>🛏️</p>
                    <p style={{ color: "#AAA", fontSize: "14px" }}>No rooms found.</p>
                </div>
            )}

            {sortedFloors.map((floor) => (
                <div key={floor} style={styles.floorSection}>
                    <div style={styles.floorHeader}>
                        <span style={styles.floorTitle}>Floor {floor}</span>
                        <span style={styles.floorCount}>{roomsByFloor[floor].length} rooms</span>
                    </div>
                    <div style={styles.roomsGrid}>
                        {roomsByFloor[floor].map((room) => {
                            const isEditing = editRoomId === room.id;
                            const occupied = room.is_occupied;
                            return (
                                <div key={room.id} style={{
                                    ...styles.roomCard,
                                    borderColor: occupied ? "#FECACA" : "#BBF7D0",
                                    background: occupied ? "#FFF5F5" : "#F0FFF4",
                                }}>
                                    {/* Top row */}
                                    <div style={styles.roomTop}>
                                        <span style={styles.roomName}>{room.name}</span>
                                        {userType === "Owner" && (
                                            <button
                                                type="button"
                                                onClick={() => setEditRoomId(isEditing ? null : room.id)}
                                                style={styles.editBtn}
                                            >
                                                {isEditing ? (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                ) : (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Status badge */}
                                    <span style={{
                                        ...styles.statusDot,
                                        background: occupied ? "#FEE2E2" : "#DCFCE7",
                                        color: occupied ? "#991B1B" : "#166534",
                                    }}>
                                        {occupied ? "Occupied" : "Available"}
                                    </span>

                                    {/* Beds */}
                                    <div style={styles.bedsRow}>
                                        <span style={styles.bedsLabel}>Beds:</span>
                                        {isEditing ? (
                                            <input type="text" defaultValue={room.beds} name="beds"
                                                onChange={handleEditChange}
                                                style={styles.bedsInput} />
                                        ) : (
                                            <span style={styles.bedsValue}>{room.beds}</span>
                                        )}
                                    </div>

                                    {/* Action */}
                                    {isEditing ? (
                                        <button type="button" onClick={handleEditSubmit} style={styles.saveBtn}>
                                            Save
                                        </button>
                                    ) : (
                                        <NavLink
                                            to="/dashboard/booking/create"
                                            style={styles.bookBtn}
                                            state={{
                                                selectedHotel, roomId: room.id,
                                                roomName: room.name, roomBeds: room.beds,
                                                roomFloor: room.floor, bookingDetails,
                                            }}
                                        >
                                            Book
                                        </NavLink>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    page: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    pageHeader: { marginBottom: "20px" },
    pageTitle: {
        fontFamily: "Georgia, serif", fontSize: "32px",
        fontWeight: "500", color: "#1A1A1A", margin: "0 0 4px",
    },
    pageSubtitle: { fontSize: "13px", color: "#888", margin: 0 },
    filtersCard: {
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px", background: "#FAFAF7",
        border: "1px solid #EDE8D8", borderRadius: "14px",
        padding: "20px", marginBottom: "24px",
    },
    filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    filterLabel: {
        fontSize: "12px", fontWeight: "500", color: "#666",
        textTransform: "uppercase", letterSpacing: "0.05em",
        display: "flex", alignItems: "center", gap: "8px",
    },
    clearBtn: {
        background: "#F5C842", border: "none", borderRadius: "4px",
        padding: "1px 8px", fontSize: "11px", cursor: "pointer",
        color: "#1A1A1A", fontFamily: "inherit",
    },
    select: {
        height: "46px", border: "1.5px solid #E8E0C8",
        borderRadius: "8px", padding: "0 12px",
        fontSize: "13px", color: "#1A1A1A",
        background: "#fff", outline: "none", fontFamily: "inherit",
    },
    input: {
        height: "46px", border: "1.5px solid #E8E0C8",
        borderRadius: "8px", padding: "0 12px",
        fontSize: "13px", color: "#1A1A1A",
        background: "#fff", outline: "none",
        fontFamily: "inherit", width: "100%", boxSizing: "border-box",
    },
    emptyState: { textAlign: "center", padding: "60px 0" },
    floorSection: { marginBottom: "28px" },
    floorHeader: {
        display: "flex", alignItems: "center",
        gap: "10px", marginBottom: "14px",
    },
    floorTitle: {
        fontFamily: "Georgia, serif", fontSize: "18px",
        fontWeight: "500", color: "#1A1A1A",
    },
    floorCount: {
        background: "#F4F1E8", color: "#888",
        fontSize: "12px", padding: "2px 10px", borderRadius: "20px",
    },
    roomsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: "10px",
    },
    roomCard: {
        border: "1.5px solid", borderRadius: "12px",
        padding: "12px", display: "flex",
        flexDirection: "column", gap: "8px",
        transition: "transform 0.15s",
        position: "relative",
    },
    roomTop: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    roomName: { fontSize: "14px", fontWeight: "600", color: "#1A1A1A" },
    editBtn: {
        background: "none", border: "none", cursor: "pointer",
        color: "#888", padding: "2px", display: "flex",
    },
    statusDot: {
        fontSize: "10px", fontWeight: "500",
        padding: "2px 8px", borderRadius: "20px",
        display: "inline-block", width: "fit-content",
    },
    bedsRow: { display: "flex", alignItems: "center", gap: "6px" },
    bedsLabel: { fontSize: "12px", color: "#888" },
    bedsValue: { fontSize: "13px", fontWeight: "500", color: "#333" },
    bedsInput: {
        width: "36px", height: "24px", border: "1.5px solid #E8E0C8",
        borderRadius: "6px", padding: "0 6px", fontSize: "12px",
        textAlign: "center", outline: "none", fontFamily: "inherit",
    },
    saveBtn: {
        background: "#F5C842", border: "none", borderRadius: "8px",
        padding: "5px 0", fontSize: "12px", fontWeight: "500",
        color: "#1A1A1A", cursor: "pointer", fontFamily: "inherit",
        width: "100%",
    },
    bookBtn: {
        background: "#1A1A1A", borderRadius: "8px",
        padding: "5px 0", fontSize: "12px", fontWeight: "500",
        color: "#fff", textDecoration: "none",
        textAlign: "center", display: "block", width: "100%",
        boxSizing: "border-box",
    },
};

export default RoomView;