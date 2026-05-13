import React, { useState } from "react";
import { ArrowRight, Hotel, Calendar, Users, BarChart } from "lucide-react";
import img1 from "../images/home-1.jpg";
import api from "../api";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        await api.post("/api/contactus/", { name, email, message })
            .then(() => {
                alert("We received your query. We will reply soon.");
                setEmail(""); setName(""); setMessage("");
            })
            .catch((err) => alert(err.response.data.detail))
            .finally(() => setSending(false));
    };

    const features = [
        { icon: Hotel, title: "Smart Booking", desc: "Effortless reservation management with real-time updates." },
        { icon: Calendar, title: "Live Availability", desc: "Always up-to-date room status across all your hotels." },
        { icon: Users, title: "Guest Services", desc: "Deliver exceptional experiences to every guest." },
        { icon: BarChart, title: "Analytics", desc: "Data-driven insights to grow your business." },
    ];

    return (
        <div id="home" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#FFFBF0" }}>

            {/* Hero */}
            <section style={{
                ...S.hero,
                backgroundImage: `url(${img1})`,
            }}>
                <div style={S.heroOverlay} />
                <div style={S.heroContent}>
                    <p style={S.heroEyebrow}>Hotel Management Platform</p>
                    <h1 style={S.heroTitle}>Elevate Your<br />Hotel Management</h1>
                    <p style={S.heroSub}>Streamline operations, boost efficiency, and delight your guests — all from one dashboard.</p>
                    <div style={S.heroBtns}>
                        <button onClick={() => navigate("/register")} style={S.heroCta}>
                            Get started free
                            <ArrowRight size={18} />
                        </button>
                        <button onClick={() => navigate("/book")} style={S.heroBookBtn}>
                            🏨 Book a Room
                        </button>
                        <button onClick={() => props.scrollToSection("services")} style={S.heroSecondary}>
                            Learn more
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats bar */}
            <div style={S.statsBar}>
                {[
                    { value: "500+", label: "Hotels managed" },
                    { value: "12,000+", label: "Bookings processed" },
                    { value: "99.9%", label: "Uptime" },
                    { value: "24/7", label: "Support" },
                ].map((s, i) => (
                    <div key={i} style={S.statItem}>
                        <span style={S.statValue}>{s.value}</span>
                        <span style={S.statLabel}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Services */}
            <section id="services" style={S.section}>
                <div style={S.container}>
                    <p style={S.eyebrow}>Why choose us</p>
                    <h2 style={S.sectionTitle}>Everything you need to run your hotel</h2>
                    <div style={S.featuresGrid}>
                        {features.map((f, i) => (
                            <div key={i} style={S.featureCard}>
                                <div style={S.featureIconWrap}>
                                    <f.icon size={22} color="#1A1A1A" />
                                </div>
                                <h3 style={S.featureTitle}>{f.title}</h3>
                                <p style={S.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About */}
            <section id="about" style={{ ...S.section, background: "#F5C842" }}>
                <div style={{ ...S.container, textAlign: "center" }}>
                    <p style={{ ...S.eyebrow, color: "#7A6000" }}>Our story</p>
                    <h2 style={{ ...S.sectionTitle, color: "#1A1A1A" }}>About Hotel Hive</h2>
                    <p style={{ ...S.aboutText }}>
                        At HotelHive, we're passionate about revolutionizing hotel management. Our platform empowers hoteliers with cutting-edge tools and insights, enabling them to deliver exceptional guest experiences while optimizing operations.
                    </p>
                    <p style={S.aboutText}>
                        With years of industry expertise and a commitment to innovation, we're your trusted partner in navigating the evolving landscape of hospitality management.
                    </p>
                    <button onClick={() => navigate("/register")} style={S.aboutCta}>
                        Get started today <ArrowRight size={16} style={{ marginLeft: "8px" }} />
                    </button>
                </div>
            </section>

            {/* CTA Banner */}
            <section style={S.ctaBanner}>
                <div style={{ ...S.container, textAlign: "center" }}>
                    <h2 style={S.ctaTitle}>Ready to transform your hotel operations?</h2>
                    <p style={S.ctaSub}>Join thousands of successful hoteliers using our platform.</p>
                    <button onClick={() => navigate("/register")} style={S.ctaBtn}>
                        Start for free <ArrowRight size={18} style={{ marginLeft: "8px" }} />
                    </button>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" style={S.section}>
                <div style={{ ...S.container, maxWidth: "680px" }}>
                    <p style={S.eyebrow}>Get in touch</p>
                    <h2 style={S.sectionTitle}>Contact Us</h2>
                    <form onSubmit={handleContactSubmit} style={S.contactForm}>
                        <div style={S.grid2}>
                            <div style={S.field}>
                                <label style={S.label}>Your name</label>
                                <input type="text" value={name} required
                                    onChange={(e) => setName(e.target.value)}
                                    style={S.input} placeholder="John Doe"
                                    onFocus={e => Object.assign(e.target.style, S.inputFocus)}
                                    onBlur={e => Object.assign(e.target.style, S.input)} />
                            </div>
                            <div style={S.field}>
                                <label style={S.label}>Email address</label>
                                <input type="email" value={email} required
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={S.input} placeholder="you@email.com"
                                    onFocus={e => Object.assign(e.target.style, S.inputFocus)}
                                    onBlur={e => Object.assign(e.target.style, S.input)} />
                            </div>
                        </div>
                        <div style={S.field}>
                            <label style={S.label}>Message</label>
                            <textarea value={message} required rows={5}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ ...S.input, height: "auto", paddingTop: "12px", resize: "vertical" }}
                                placeholder="How can we help you?"
                                onFocus={e => Object.assign(e.target.style, { ...S.inputFocus, height: "auto", paddingTop: "12px" })}
                                onBlur={e => Object.assign(e.target.style, { ...S.input, height: "auto", paddingTop: "12px" })}
                            />
                        </div>
                        <button type="submit" disabled={sending} style={{ ...S.contactBtn, opacity: sending ? 0.7 : 1 }}>
                            {sending ? "Sending..." : "Send message"}
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer style={S.footer}>
                <div style={{ ...S.container, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px" }}>
                    <div>
                        <div style={S.footerBrand}>
                            <div style={S.footerIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#F5C842" strokeWidth="1.5" fill="none" />
                                    <circle cx="12" cy="12" r="3" fill="#F5C842" />
                                </svg>
                            </div>
                            <span style={S.footerBrandName}>Hotel <span style={S.footerAccent}>Hive</span></span>
                        </div>
                        <p style={S.footerTagline}>Empowering hoteliers worldwide.</p>
                    </div>
                    <div>
                        <p style={S.footerHeading}>Quick links</p>
                        {[
                            { label: "Home", id: "home" },
                            { label: "Services", id: "services" },
                            { label: "About", id: "about" },
                            { label: "Contact", id: "contact" },
                        ].map((l) => (
                            <button key={l.id} onClick={() => props.scrollToSection(l.id)} style={S.footerLink}>
                                {l.label}
                            </button>
                        ))}
                    </div>
                    <div>
                        <p style={S.footerHeading}>Contact</p>
                        <p style={S.footerText}>Naranpura, Ahmedabad, India</p>
                        <p style={S.footerText}>contact@hotelhive.com</p>
                        <p style={S.footerText}>+91 9537684421</p>
                    </div>
                    <div>
                        <p style={S.footerHeading}>Follow us</p>
                        {["Facebook", "Twitter", "LinkedIn"].map((s) => (
                            <a key={s} href="#" style={S.footerLink}>{s}</a>
                        ))}
                    </div>
                </div>
                <div style={S.footerBottom}>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", margin: 0 }}>
                        © {new Date().getFullYear()} Hotel Hive. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const S = {
    hero: {
        position: "relative", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundSize: "cover", backgroundPosition: "center",
    },
    heroOverlay: {
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 100%)",
    },
    heroContent: {
        position: "relative", zIndex: 2,
        textAlign: "center", padding: "0 24px", maxWidth: "800px",
    },
    heroEyebrow: {
        fontSize: "13px", fontWeight: "500", letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#F5C842", marginBottom: "16px",
    },
    heroTitle: {
        fontFamily: "Georgia, serif", fontSize: "clamp(40px, 6vw, 72px)",
        fontWeight: "500", color: "#fff", lineHeight: "1.15",
        marginBottom: "20px",
    },
    heroSub: {
        fontSize: "18px", color: "rgba(255,255,255,0.85)",
        lineHeight: "1.7", marginBottom: "36px", maxWidth: "560px", margin: "0 auto 36px",
    },
    heroBtns: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },
    heroCta: {
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: "#F5C842", color: "#1A1A1A",
        border: "none", borderRadius: "50px",
        padding: "14px 32px", fontSize: "16px", fontWeight: "600",
        cursor: "pointer", fontFamily: "inherit",
    },
    heroSecondary: {
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: "rgba(255,255,255,0.15)", color: "#fff",
        border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: "50px",
        padding: "14px 32px", fontSize: "16px", fontWeight: "500",
        cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(4px)",
    },
    heroBookBtn: {
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: "#22C55E", color: "#fff",
        border: "none", borderRadius: "50px",
        padding: "14px 32px", fontSize: "16px", fontWeight: "600",
        cursor: "pointer", fontFamily: "inherit",
    },
    statsBar: {
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        background: "#1A1A1A", padding: "28px 48px",
    },
    statItem: {
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "4px",
        borderRight: "1px solid rgba(255,255,255,0.1)",
    },
    statValue: {
        fontFamily: "Georgia, serif", fontSize: "28px",
        fontWeight: "500", color: "#F5C842",
    },
    statLabel: { fontSize: "13px", color: "rgba(255,255,255,0.5)" },
    section: { padding: "80px 24px", background: "#FFFBF0" },
    container: { maxWidth: "1100px", margin: "0 auto" },
    eyebrow: {
        fontSize: "12px", fontWeight: "500", letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#B89A00",
        marginBottom: "10px", textAlign: "center",
    },
    sectionTitle: {
        fontFamily: "Georgia, serif", fontSize: "36px",
        fontWeight: "500", color: "#1A1A1A",
        textAlign: "center", marginBottom: "48px", lineHeight: "1.3",
    },
    featuresGrid: {
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px",
    },
    featureCard: {
        background: "#fff", border: "1px solid #EDE8D8",
        borderRadius: "16px", padding: "28px 24px",
        transition: "box-shadow 0.2s",
    },
    featureIconWrap: {
        width: "48px", height: "48px", background: "#F5C842",
        borderRadius: "12px", display: "flex",
        alignItems: "center", justifyContent: "center",
        marginBottom: "16px",
    },
    featureTitle: {
        fontFamily: "Georgia, serif", fontSize: "18px",
        fontWeight: "500", color: "#1A1A1A", marginBottom: "8px",
    },
    featureDesc: { fontSize: "14px", color: "#888", lineHeight: "1.6" },
    aboutText: {
        fontSize: "17px", color: "#2A2A1A",
        lineHeight: "1.8", marginBottom: "20px", maxWidth: "700px",
        margin: "0 auto 20px",
    },
    aboutCta: {
        display: "inline-flex", alignItems: "center",
        background: "#1A1A1A", color: "#F5C842",
        border: "none", borderRadius: "50px",
        padding: "14px 32px", fontSize: "15px", fontWeight: "500",
        cursor: "pointer", fontFamily: "inherit", marginTop: "32px",
    },
    ctaBanner: {
        padding: "80px 24px",
        background: "#1A1A1A",
    },
    ctaTitle: {
        fontFamily: "Georgia, serif", fontSize: "36px",
        fontWeight: "500", color: "#fff",
        marginBottom: "14px", lineHeight: "1.3",
    },
    ctaSub: { fontSize: "16px", color: "rgba(255,255,255,0.6)", marginBottom: "32px" },
    ctaBtn: {
        display: "inline-flex", alignItems: "center",
        background: "#F5C842", color: "#1A1A1A",
        border: "none", borderRadius: "50px",
        padding: "14px 36px", fontSize: "16px", fontWeight: "600",
        cursor: "pointer", fontFamily: "inherit",
    },
    contactForm: { display: "flex", flexDirection: "column", gap: "16px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    field: { display: "flex", flexDirection: "column", gap: "6px" },
    label: {
        fontSize: "12px", fontWeight: "500", color: "#666",
        textTransform: "uppercase", letterSpacing: "0.05em",
    },
    input: {
        width: "100%", height: "50px",
        border: "1.5px solid #E8E0C8", borderRadius: "10px",
        padding: "0 14px", fontSize: "15px", color: "#1A1A1A",
        background: "#fff", outline: "none",
        boxSizing: "border-box", fontFamily: "inherit",
    },
    inputFocus: {
        width: "100%", height: "50px",
        border: "1.5px solid #F5C842", borderRadius: "10px",
        padding: "0 14px", fontSize: "15px", color: "#1A1A1A",
        background: "#fff", outline: "none", boxSizing: "border-box",
        boxShadow: "0 0 0 3px rgba(245,200,66,0.18)", fontFamily: "inherit",
    },
    contactBtn: {
        width: "100%", height: "52px",
        background: "#F5C842", border: "none",
        borderRadius: "10px", fontSize: "16px",
        fontWeight: "600", color: "#1A1A1A",
        cursor: "pointer", fontFamily: "inherit",
    },
    footer: { background: "#111", padding: "60px 48px 0" },
    footerBrand: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
    footerIcon: {
        width: "34px", height: "34px", background: "#222",
        borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
    },
    footerBrandName: {
        fontFamily: "Georgia, serif", fontSize: "18px",
        fontWeight: "600", color: "#fff",
    },
    footerAccent: { background: "#F5C842", color: "#1A1A1A", padding: "0 4px", borderRadius: "3px" },
    footerTagline: { fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 },
    footerHeading: {
        fontSize: "13px", fontWeight: "500", color: "#fff",
        letterSpacing: "0.08em", textTransform: "uppercase",
        marginBottom: "14px",
    },
    footerLink: {
        display: "block", background: "none", border: "none",
        padding: "3px 0", fontSize: "14px", color: "rgba(255,255,255,0.5)",
        cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
        marginBottom: "4px",
    },
    footerText: { fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" },
    footerBottom: {
        borderTop: "1px solid rgba(255,255,255,0.08)",
        marginTop: "48px", padding: "20px 0", textAlign: "center",
    },
};

export default Home;