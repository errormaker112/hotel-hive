import React, { useState } from "react";
import defaultHotelImage from "../../images/hotel.jpg";
import api from "../../api";
import { useNavigate } from "react-router-dom";

function CreateHotel() {
    const navigate = useNavigate();
    const [hotelImage, setHotelImage] = useState(null);
    const [hotelUrl, setHotelUrl] = useState("");
    const [floorRooms, setFloorRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hotel, setHotel] = useState({
        name: "", email: "", phone_number: "",
        address: "", floors: 0, ground_floor_rooms: 0,
    });

    const handleHotelChange = (e) => {
        const { name, value } = e.target;
        setHotel({ ...hotel, [name]: name === "phone_number" ? value.replace(/\D/g, "") : value });
    };
    const handleGroundFloorRooms = (e) => {
        setHotel({ ...hotel, [e.target.name]: parseInt(e.target.value, 10) || 0 });
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setHotelImage(file); setHotelUrl(URL.createObjectURL(file)); }
    };
    const handleFloorRoomsChange = (index, value) => {
        const updated = [...floorRooms];
        updated[index].rooms = parseInt(value, 10) || 0;
        setFloorRooms(updated);
    };
    const handleFloorsChange = (e) => {
        const count = parseInt(e.target.value, 10) || 0;
        setHotel({ ...hotel, floors: count });
        setFloorRooms(Array.from({ length: count }, (_, i) => ({
            floor: i + 1,
            rooms: floorRooms[i] ? floorRooms[i].rooms : 0,
        })));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        if (hotelImage) formData.append("image", hotelImage);
        const total_rooms = floorRooms.reduce((acc, cur) => acc + cur.rooms, 0) + hotel.ground_floor_rooms;
        formData.append("data", JSON.stringify({ hotel: { ...hotel, total_rooms }, floorRooms }));
        await api.post("/api/hotel/create/", formData, { headers: { "Content-Type": "multipart/form-data" } })
            .then(() => { alert("Hotel created successfully."); navigate("/dashboard/hotels/"); })
            .catch((err) => alert(err.response.data.detail));
        setLoading(false);
    };

    const totalRooms = floorRooms.reduce((acc, cur) => acc + (cur.rooms || 0), 0) + (hotel.ground_floor_rooms || 0);

    return (
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Create Hotel</h1>
                    <p style={styles.pageSubtitle}>Fill in the details to register a new hotel</p>
                </div>
                <button type="button" onClick={() => navigate("/dashboard/hotels/")} style={styles.backBtn}>
                    ← Back
                </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.formWrap}>

                {/* Section 1: Hotel details */}
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>Hotel details</p>
                    <div style={styles.detailsLayout}>

                        {/* Image upload */}
                        <div style={styles.imageCol}>
                            <div style={styles.imageWrap}>
                                <img
                                    src={hotelUrl || defaultHotelImage}
                                    alt="Hotel preview"
                                    style={styles.hotelImg}
                                />
                                <label htmlFor="hotelImageUpload" style={styles.imageOverlay}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span style={{ fontSize: "12px", color: "#fff", marginTop: "4px" }}>Change image</span>
                                </label>
                                <input type="file" id="hotelImageUpload" style={{ display: "none" }}
                                    onChange={handleFileChange} accept="image/*" />
                            </div>
                            <p style={styles.imageHint}>Click image to upload</p>
                        </div>

                        {/* Fields */}
                        <div style={styles.fieldsCol}>
                            <div style={styles.field}>
                                <label style={styles.label}>Hotel name *</label>
                                <input type="text" name="name" required value={hotel.name}
                                    onChange={handleHotelChange} style={styles.input}
                                    placeholder="Grand Palace Hotel" />
                            </div>
                            <div style={styles.grid2}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Email</label>
                                    <input type="email" name="email" value={hotel.email}
                                        onChange={handleHotelChange} style={styles.input}
                                        placeholder="hotel@email.com" />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Phone number</label>
                                    <input type="text" name="phone_number" value={hotel.phone_number}
                                        onChange={handleHotelChange} style={styles.input}
                                        placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Address</label>
                                <input type="text" name="address" value={hotel.address}
                                    onChange={handleHotelChange} style={styles.input}
                                    placeholder="123 Main Street, City" />
                            </div>
                            <div style={{ ...styles.field, maxWidth: "160px" }}>
                                <label style={styles.label}>Number of floors *</label>
                                <input type="number" name="floors" min={0}
                                    value={hotel.floors} onChange={handleFloorsChange}
                                    style={styles.input} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Room management */}
                <div style={styles.section}>
                    <div style={styles.sectionHeaderRow}>
                        <p style={styles.sectionTitle}>Room management</p>
                        <span style={styles.totalBadge}>{totalRooms} total rooms</span>
                    </div>

                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Floor</th>
                                    <th style={styles.th}>Number of rooms</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={styles.trEven}>
                                    <td style={styles.td}>
                                        <span style={styles.floorLabel}>Ground floor</span>
                                    </td>
                                    <td style={styles.td}>
                                        <input type="number" min={0} name="ground_floor_rooms"
                                            value={hotel.ground_floor_rooms}
                                            onChange={handleGroundFloorRooms}
                                            style={styles.numInput} />
                                    </td>
                                </tr>
                                {floorRooms.map((floorRoom, index) => (
                                    <tr key={index} style={index % 2 === 0 ? styles.trOdd : styles.trEven}>
                                        <td style={styles.td}>
                                            <span style={styles.floorLabel}>Floor {floorRoom.floor}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <input type="number" min={0}
                                                value={floorRoom.rooms}
                                                onChange={(e) => handleFloorRoomsChange(index, e.target.value)}
                                                style={styles.numInput} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {hotel.floors === 0 && (
                        <p style={styles.floorHint}>Set number of floors above to add floor rooms.</p>
                    )}
                </div>

                {/* Submit */}
                <div style={styles.formFooter}>
                    <button type="button" onClick={() => navigate("/dashboard/hotels/")} style={styles.cancelBtn}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Creating..." : "Create hotel"}
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
        background: "none", border: "1.5px solid #E8E0C8",
        borderRadius: "8px", padding: "8px 16px",
        fontSize: "13px", color: "#555", cursor: "pointer",
        fontFamily: "inherit",
    },
    formWrap: { display: "flex", flexDirection: "column", gap: "16px" },
    section: {
        background: "#FAFAF7", border: "1px solid #EDE8D8",
        borderRadius: "16px", padding: "24px",
    },
    sectionTitle: {
        fontFamily: "Georgia, serif", fontSize: "18px",
        fontWeight: "500", color: "#1A1A1A",
        margin: "0 0 20px", paddingBottom: "14px",
        borderBottom: "1px solid #EDE8D8",
    },
    sectionHeaderRow: {
        display: "flex", alignItems: "center",
        gap: "12px", marginBottom: "16px",
        paddingBottom: "14px", borderBottom: "1px solid #EDE8D8",
    },
    totalBadge: {
        background: "#F5C842", color: "#1A1A1A",
        fontSize: "12px", fontWeight: "500",
        padding: "3px 12px", borderRadius: "20px",
    },
    detailsLayout: { display: "grid", gridTemplateColumns: "200px 1fr", gap: "24px" },
    imageCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
    imageWrap: {
        width: "180px", height: "140px", borderRadius: "12px",
        overflow: "hidden", position: "relative", cursor: "pointer",
        border: "1.5px solid #EDE8D8",
    },
    hotelImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    imageOverlay: {
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: 0, transition: "opacity 0.2s", cursor: "pointer",
    },
    imageHint: { fontSize: "11px", color: "#BBB", margin: 0, textAlign: "center" },
    fieldsCol: { display: "flex", flexDirection: "column", gap: "14px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
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
    tableWrap: { border: "1px solid #EDE8D8", borderRadius: "10px", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "10px 16px", textAlign: "left",
        fontSize: "11px", fontWeight: "500", color: "#888",
        textTransform: "uppercase", letterSpacing: "0.05em",
        background: "#F4F1E8", borderBottom: "1px solid #EDE8D8",
    },
    trEven: { background: "#fff" },
    trOdd: { background: "#FDFCF7" },
    td: {
        padding: "12px 16px", fontSize: "14px",
        color: "#333", borderBottom: "1px solid #F4F1E8",
    },
    floorLabel: { fontWeight: "500", color: "#1A1A1A" },
    numInput: {
        width: "100px", height: "36px",
        border: "1.5px solid #E8E0C8", borderRadius: "8px",
        padding: "0 12px", fontSize: "14px",
        textAlign: "center", outline: "none",
        fontFamily: "inherit", background: "#fff",
    },
    floorHint: { fontSize: "13px", color: "#BBB", marginTop: "12px", textAlign: "center" },
    formFooter: {
        display: "flex", justifyContent: "flex-end",
        gap: "12px", paddingTop: "4px",
    },
    cancelBtn: {
        height: "50px", padding: "0 24px",
        background: "none", border: "1.5px solid #E8E0C8",
        borderRadius: "10px", fontSize: "14px",
        color: "#888", cursor: "pointer", fontFamily: "inherit",
    },
    submitBtn: {
        height: "50px", padding: "0 28px",
        background: "#F5C842", border: "none",
        borderRadius: "10px", fontSize: "14px",
        fontWeight: "500", color: "#1A1A1A",
        cursor: "pointer", fontFamily: "inherit",
    },
};

export default CreateHotel;