import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

function Form(props) {
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setpassword2] = useState("");
    const [company_name, setCompany_name] = useState("");
    const [loading, setLoading] = useState(false);
    const [profile_image, setProfile_image] = useState(null);
    const [hotelList, setHotelList] = useState([]);
    const [hotel, setHotel] = useState(-1);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const loadHotels = async () => {
        await api
            .get("/api/gethotels/")
            .then((res) => {
                setHotelList(res.data);
            })
            .catch((err) => {
                alert(err.response.data.detail);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (props.method === "login") {
            await api
                .post("/api/token/", { email, password })
                .then((res) => {
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                    props.changeLogIn(true);
                    props.loadRole();
                    setLoading(false);
                    navigate("/dashboard");
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.detail);
                });
            setLoading(false);
        } else {
            const formData = new FormData();
            var data = {
                user: {
                    first_name,
                    last_name,
                    email,
                    password,
                    password2,
                },
            };
            if (props.userType === "Owner") {
                data = { ...data, company_name };
            } else {
                data = { ...data, hotel };
            }

            formData.append("data", JSON.stringify(data));
            const apiUrl =
                props.userType === "Owner"
                    ? "/api/user/owner/register/"
                    : "/api/user/manager/register/";
            await api
                .post(apiUrl, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((res) => {
                    if (props.userType === "Owner") {
                        alert("Account created.");
                        navigate("/login");
                    } else {
                        props.handleManagerRegister();
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.detail);
                    if (
                        props.userType === "Manager" &&
                        hotelList &&
                        hotelList.length === 0
                    ) {
                        setErrorMessage("Please create a hotel first.");
                    }
                    // alert(err.);
                });
            setLoading(false);
        }
    };
    useEffect(() => {
        if (props.userType === "Manager" && props.method !== "login") {
            const init = () => {
                loadHotels();
            };
            init();
        }
    }, []);
    return (
        <>
            <h2 className="text-3xl font-bold mb-6 text-center">
                {props.method === "login"
                    ? "Log in to Account"
                    : "Create an Account"}
            </h2>

            {errorMessage && (
                <p className="text-red-500 text-center mb-4">{errorMessage}</p>
            )}

            <form
                onSubmit={handleSubmit}
                method="POST"
                className="flex flex-col gap-4"
            >
                {props.method !== "login" && (
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label
                                className="block text-gray-700 font-medium mb-2"
                                htmlFor="firstName"
                            >
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-quad"
                                value={first_name}
                                onChange={(e) => setFirst_name(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label
                                className="block text-gray-700 font-medium mb-2"
                                htmlFor="lastName"
                            >
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-quad"
                                value={last_name}
                                onChange={(e) => setLast_name(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                )}

                {props.method !== "login" && props.userType === "Owner" && (
                    <>
                        <div>
                            <label
                                className="block text-gray-700 font-medium mb-2"
                                htmlFor="company"
                            >
                                Company Name
                            </label>
                            <input
                                id="company"
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-quad"
                                value={company_name}
                                onChange={(e) =>
                                    setCompany_name(e.target.value)
                                }
                                required
                            />
                        </div>
                    </>
                )}
                {props.method !== "login" && props.userType === "Manager" && (
                    <>
                        <div>
                            <label
                                className="block text-gray-700 font-medium mb-2"
                                htmlFor="hotel"
                            >
                                Hotel:
                            </label>
                            <select
                                name="hotel"
                                id="hotel"
                                required
                                onChange={(e) => {
                                    setHotel(parseInt(e.target.value, 10));
                                }}
                            >
                                <option disabled selected>
                                    Select Hotel
                                </option>
                                {hotelList.map((value, index) => (
                                    <>
                                        <option value={value.id}>
                                            {value.name}
                                        </option>
                                    </>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <div>
                    <label
                        className="block text-gray-700 font-medium mb-2"
                        htmlFor="email"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-quad"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label
                        className="block text-gray-700 font-medium mb-2"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-quad"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {props.method !== "login" && (
                    <div>
                        <label
                            className="block text-gray-700 font-medium mb-2"
                            htmlFor="password2"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="password2"
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-quad"
                            value={password2}
                            onChange={(e) => setpassword2(e.target.value)}
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-ternary text-white py-2 px-4 rounded-lg shadow-md font-semibold text-lg hover:bg-quad"
                >
                    {props.method === "login" ? "Log in" : "Register"}
                </button>
            </form>
        </>
    );
}

export default Form;
