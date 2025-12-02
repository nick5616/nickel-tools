"use client";

import React from "react";
import { DesktopOS } from "@/components/desktop/DesktopOS";
import { MobileOS } from "@/components/mobile/MobileOS";
import { useDeviceType } from "@/app/hooks/useDeviceType";

export default function Home() {
    const isMobile = useDeviceType();

    return isMobile ? <MobileOS /> : <DesktopOS />;
}
