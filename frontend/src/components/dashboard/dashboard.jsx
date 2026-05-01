import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";
import api from "../../api";

function Dashboard(props) {
  const [role, setRole] = useState(props.role);

  useEffect(() => {
    api.get("/api/usertype/")
      .then((res) => setRole(res.data.role))
      .catch(() => {});
  }, []);

  return (
    <div style={styles.layout}>
      <div style={styles.sidebarWrap}>
        <Sidebar role={role} />
      </div>
      <div style={styles.main}>
        <Outlet />
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "16px",
    height: "100%",
    padding: "16px",
    background: "#F4F1E8",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },
  sidebarWrap: {
    height: "100%",
  },
  main: {
    background: "#FFF8E1",
    borderRadius: "16px",
    padding: "32px",
    overflowY: "auto",
    overflowX: "hidden",
    border: "1px solid #EDE8D8",
  },
};

export default Dashboard;