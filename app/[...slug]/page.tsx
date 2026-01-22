"use client";

import React, { Suspense, use } from "react";
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

interface AppPageProps {
    params?: Promise<{ slug?: string[] }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function AppPage(props: AppPageProps) {
    // Unwrap params and searchParams if they exist (Next.js 15+)
    const params = props.params ? use(props.params) : undefined;
    const searchParams = props.searchParams
        ? use(props.searchParams)
        : undefined;

    const isMobile = useDeviceType();

    return isMobile ? <MobileOS /> : <DesktopOSWithSuspense />;
}
