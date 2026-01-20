"use client";

import { useEffect } from "react";

export default function PortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        // Override root layout's overflow-hidden for portfolio pages
        const html = document.documentElement;
        const body = document.body;
        const main = document.querySelector("main");

        html.style.overflow = "auto";
        html.style.height = "auto";
        body.style.overflow = "auto";
        body.style.height = "auto";
        if (main) {
            main.style.overflow = "visible";
            main.style.height = "auto";
        }

        return () => {
            // Restore on unmount
            html.style.overflow = "";
            html.style.height = "";
            body.style.overflow = "";
            body.style.height = "";
            if (main) {
                main.style.overflow = "";
                main.style.height = "";
            }
        };
    }, []);

    return <div className="w-full">{children}</div>;
}
