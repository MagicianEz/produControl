"use client";

import React, { useState } from "react";
import { Link } from "@inertiajs/react";

function SiteNav({ auth }: { auth: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link
                        href={route("home")}
                        className="flex items-center gap-2"
                    >
                        <span className="text-lg font-semibold">
                            ProduControl
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={route("dashboard.show")}
                                className="rounded bg-green-600 hover:bg-green-700 py-2 px-5 cursor-pointer text-white duration-300 hover:duration-300 font-medium"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route("login")}
                                className="rounded bg-blue-600 hover:bg-blue-700 py-2 px-5 cursor-pointer text-white duration-300 hover:duration-300 font-medium"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

export default SiteNav;
