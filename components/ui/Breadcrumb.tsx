"use client";

import { useEffect, useState } from "react";

interface BreadcrumbProps {
    currentPage: string;
    trackClick?: boolean;
}

export default function Breadcrumb({
    currentPage,
    trackClick = false,
}: BreadcrumbProps) {
    const [isInIframe, setIsInIframe] = useState(false);
    useEffect(() => {
        // Check if we're running inside an iframe
        setIsInIframe(window.self !== window.top);
    }, []);

    // Hide breadcrumb when in iframe
    if (isInIframe) {
        console.log("returning null");
        return null;
    }

    return (
        <div className="text-sm text-slate-500 mb-4">
            <a
                href="/"
                className="hover:text-blue-600"
                onClick={() => {
                    void trackClick;
                }}
            >
                Home
            </a>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">{currentPage}</span>
        </div>
    );
}
