import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Outlet,
    Navigate,
    useNavigate,
    useLocation,
} from "react-router-dom";
import Home from "./components/home";
import Navbar from "./components/navbar";
import Dashboard from "./components/dashboard/dashboard";
import Register from "./components/register";
import Login from "./components/login";
import RoomView from "./components/dashboard/RoomView";
import NotFound from "./components/notfound";
import DashView from "./components/dashboard/DashView";
import HotelsView from "./components/dashboard/HotelsView";
import ProfileView from "./components/dashboard/ProfileView";
import BookingView from "./components/dashboard/BookingView";
import NewBooking from "./components/dashboard/NewBooking";
import CreateHotel from "./components/dashboard/CreateHotel";
import api, { checkAuthorization } from "./api";
import ManagersView from "./components/dashboard/ManagersView";
import GuestBooking from "./components/GuestBooking";
import AnalyticsView from "./components/dashboard/AnalyticsView";

function Logout(props) {
    localStorage.clear();
    props.changeLogIn(false);
    return <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
const AppContent = (props) => {
    const [isLoggedin, setIsLoggedin] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState();
    const location = useLocation();
    const navigate = useNavigate();
    const loadUserType = async () => {
        await api
            .get("/api/usertype/")
            .then((res) => setRole(res.data.role))
            .catch((res) => alert(res.response.data.detail));
    };
    const changeLogIn = (value) => {
        setIsLoggedin(value);
    };

    const scrollToSection = (sectionId) => {
        if (location.pathname !== "/") {
            navigate("/", { state: { scrollTo: sectionId } });
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };
    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await checkAuthorization();
            setIsLoggedin(isAuth);
            setIsLoading(false);
        };
        checkAuth();
        if (isLoggedin) {
            loadUserType();
        }
    }, [isLoggedin]);

    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Pages that should NOT show the navbar
    const hideNavbar = ["/book"].includes(location.pathname);

    return (
        <>
            {!hideNavbar && (
                <Navbar isLoggedin={isLoggedin} scrollToSection={scrollToSection} changeLogIn={changeLogIn} />
            )}

            <div className={hideNavbar ? "" : "bottom-0 right-0 left-0 top-[70px] block bg-gray-100 absolute"}>
                <Routes>
                    <Route index path="/" element={<Home scrollToSection={scrollToSection}/>} />

                    {/* Public guest booking page — no login needed */}
                    <Route path="/book" element={<GuestBooking />} />

                    <Route
                        path="/dashboard"
                        element={
                            isLoggedin ? (
                                <Dashboard role={role} />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    >
                        <Route
                            index
                            element={
                                isLoggedin ? (
                                    <DashView role={role} />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />
                        <Route path="booking" element={<Outlet />}>
                            <Route index element={<BookingView />} />
                            <Route path="create" element={<NewBooking />} />
                        </Route>
                        <Route path="hotels" element={<Outlet />}>
                            <Route index element={<HotelsView role={role} />} />
                            <Route path="create" element={<CreateHotel />} />
                        </Route>
                        <Route path="managers" element={<ManagersView />} />
                        <Route path="rooms" element={<RoomView role={role} />} />
                        <Route path="profile" element={<ProfileView role={role} />} />
                        <Route path="analytics" element={<AnalyticsView />} />
                    </Route>

                    <Route path="/register" element={isLoggedin ? <Navigate to='/dashboard'/> : <Register />} />
                    <Route
                        path="/login"
                        element={
                            <Login
                                loadRole={() => loadUserType()}
                                changeLogIn={changeLogIn}
                            />
                        }
                    />
                    <Route path="/logout" element={<Logout changeLogIn={changeLogIn} />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Outlet />
            </div>
        </>
    );
};

export default App;