"use client";

import posthog from "posthog-js";

interface BreadcrumbProps {
    currentPage: string;
    trackClick?: boolean;
}

export default function Breadcrumb({
    currentPage,
    trackClick = false,
}: BreadcrumbProps) {
    return (
        <div className="text-sm text-slate-500 mb-4">
            <a
                href="/"
                className="hover:text-blue-600"
                onClick={() => {
                    if (trackClick) {
                        posthog.capture("breadcrumb_link_clicked", {
                            destination: "/",
                            text: "Home",
                        });
                    }
                }}
            >
                Home
            </a>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">{currentPage}</span>
        </div>
    );
}
