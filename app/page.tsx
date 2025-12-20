"use client";

import React, { Suspense } from "react";
import { DesktopOS } from "@/components/desktop/DesktopOS";
import { MobileOS } from "@/components/mobile/MobileOS";
import { useDeviceType } from "@/app/hooks/useDeviceType";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { useAllImagesLoaded } from "@/app/hooks/useImageLoader";

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

function OSContent() {
    const isMobile = useDeviceType();
    const allImagesLoaded = useAllImagesLoaded();

    return (
        <>
            <SplashScreen isLoading={!allImagesLoaded} />
            {isMobile ? <MobileOS /> : <DesktopOSWithSuspense />}
        </>
    );
}

export default function Home() {
    return <OSContent />;
}
