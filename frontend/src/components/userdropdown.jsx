import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
function UserDropdown(props) {
    const [toggle, setToggle] = useState(false);
    const onCkick = () => setToggle(!toggle);

    const dropdownRef = useRef(null);
    const handleOnClickOutside = (event) => {
        if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
            console.log("Inside click" + toggle);
        } else {
            setToggle(false);
            console.log("Outside click");
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleOnClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleOnClickOutside);
        };
        // eslint-disable-next-line
    }, [toggle]);
    const userDropdownLinkClass =
        "block px-4 py-2 text-sm text-gray-700 hover:text-secondary active:text-primary";

    return (
        <>
            <div ref={dropdownRef}>
                <button
                    type="button"
                    id="menu-button"
                    onClick={onCkick}
                    className="inline-flex align-center hover:bg-secondary transition-colors duration-800 rounded-full border border-2 border-solid border-black overflow-hidden w-8 h-8"
                    data-dropdown-toggle="userDropdown"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-11"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
                <div
                    id="userDropdown"
                    aria-labelledby="menu-button"
                    className={`absolute right-0 z-10 mt-2 z-10 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 divide-y divide-gray-150 ring-black ring-opacity-5 focus:outline-none ${
                        toggle ? "" : "hidden"
                    }`}
                >
                    {!props.isLoggedin && (
                        <>
                            <div className="py-1">
                                <Link
                                    to="/register"
                                    className={userDropdownLinkClass}
                                    onClick={onCkick}
                                >
                                    Register your company
                                </Link>
                                <Link
                                    to="/login"
                                    className={userDropdownLinkClass}
                                    onClick={onCkick}
                                >
                                    Log in
                                </Link>
                            </div>
                        </>
                    )}
                    {props.isLoggedin && (
                        <>
                            <div className="py-1">
                                <Link
                                    to="dashboard"
                                    className={userDropdownLinkClass}
                                    onClick={onCkick}
                                >
                                    Dashboard
                                </Link>
                            </div>
                            <div className="py-1">
                                <Link
                                    to="/logout"
                                    className={userDropdownLinkClass}
                                    onClick={onCkick}
                                >
                                    Log out
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
export default UserDropdown;
