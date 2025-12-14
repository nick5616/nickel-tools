"use client";

import React, { Suspense } from "react";
import { DesktopOS } from "@/components/desktop/DesktopOS";
import { MobileOS } from "@/components/mobile/MobileOS";
import { useDeviceType } from "@/app/hooks/useDeviceType";

function DesktopOSWithSuspense() {
    return (
        <Suspense
            fallback={
                <div className="h-screen w-screen bg-[rgb(var(--bg-desktop))]" />
            }
        >
            <DesktopOS />
        </Suspense>
    );
}

export default function AppPage() {
    const isMobile = useDeviceType();

    return isMobile ? <MobileOS /> : <DesktopOSWithSuspense />;
}
