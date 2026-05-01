import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import im from "../../images/hotel.jpg";
import editIcon from "../../icons/edit.svg";
import api from "../../api";

function Hotels(props) {
    const [displayDetails, setDisplayDetails] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hotelList, setHotelList] = useState([]);
    const loadData = async () => {
        var res = await api
            .get("/api/gethotels/")
            .then((r) => {
                setHotelList(r.data);
            })
            .catch((e) => {
                alert(e.response.data.detail);
            });
    };
    useEffect(() => {
        const init = () => {
            loadData();
        };
        init();
    }, []);
    return (
        <>
            {displayDetails && (
                <>
                    <div className=" mx-auto p-6 bg-white shadow-lg rounded-lg ">
                        <button
                            onClick={() => setDisplayDetails(false)}
                            className="bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary mb-6"
                        >
                            &larr; Back
                        </button>
                        <h1 className="text-4xl font-bold text-center mb-6">
                            {hotelList[activeIndex].name}
                        </h1>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Hotel Image */}
                            <div className="md:w-1/2">
                                <img
                                    src={
                                        (hotelList[activeIndex].image &&
                                            `${
                                                api.getUri() +
                                                hotelList[activeIndex].image
                                            }`) ||
                                        im
                                    }
                                    alt={hotelList[activeIndex].name}
                                    className="w-full h-auto rounded-lg shadow-lg"
                                    onError={(e) => { e.target.src = im; }}
                                />
                            </div>

                            {/* Hotel Details */}
                            <div className="md:w-1/2 space-y-4 text-xl">
                                <p>
                                    <span className="font-semibold">
                                        Email:
                                    </span>
                                    {hotelList[activeIndex].email || "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Address:
                                    </span>
                                    {hotelList[activeIndex].address || "N/A"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Total Rooms:
                                    </span>
                                    {hotelList[activeIndex].total_rooms ||
                                        "Unknown"}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Floors:
                                    </span>
                                    {hotelList[activeIndex].floors || "Unknown"}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {!displayDetails && (
                <>
                    <h1 className="text-5xl mb-5">My Hotels</h1>
                    <div className="grid grid-cols-4 gap-4">
                        {props.role === "Owner" && (
                            <NavLink to="/dashboard/hotels/create">
                                <div className="shadow-lg bg-gray-200 rounded-3xl hover:scale-105 transition duration-300 overflow-hidden h-52">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="200"
                                        height="200"
                                        fill="gray"
                                        className="bi bi-plus  mx-auto"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                    </svg>
                                </div>
                            </NavLink>
                        )}
                        {hotelList.map((value, index) => (
                            <>
                                <div
                                    className="cursor-pointer shadow-lg relative bg-primary rounded-3xl hover:scale-105 transition duration-300 overflow-hidden h-52"
                                    onClick={() => {
                                        setActiveIndex(index);
                                        setDisplayDetails(true);
                                    }}
                                >
                                    <div className="w-full h-[80%] overflow-hidden">
                                        <img
                                            src={
                                                (value.image &&
                                                    `${
                                                        api.getUri() +
                                                        value.image
                                                    }`) ||
                                                im
                                            }
                                            alt="image"
                                            className="w-full"
                                            onError={(e) => { e.target.src = im; }}
                                        />
                                    </div>
                                    <h1 className="text-xl text-center ">
                                        {value.name}
                                    </h1>
                                </div>
                            </>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
export default Hotels;