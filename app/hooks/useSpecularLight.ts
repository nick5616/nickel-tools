"use client";

import { useEffect } from "react";

/**
 * Drives the global light source (--light-x / --light-y, each -1..1) that
 * tiles and metallic surfaces use for their specular highlight. Follows the
 * pointer on desktop and device tilt on phones that report it without a
 * permission prompt.
 */
export function useSpecularLight() {
    useEffect(() => {
        const root = document.documentElement;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        let frame = 0;
        let x = 0;
        let y = 0;
        const commit = () => {
            frame = 0;
            root.style.setProperty("--light-x", x.toFixed(3));
            root.style.setProperty("--light-y", y.toFixed(3));
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(commit);
        };

        const onPointerMove = (e: PointerEvent) => {
            x = (e.clientX / window.innerWidth) * 2 - 1;
            y = (e.clientY / window.innerHeight) * 2 - 1;
            schedule();
        };
        const onOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma === null || e.beta === null) return;
            x = Math.max(-1, Math.min(1, e.gamma / 35));
            y = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
            schedule();
        };

        window.addEventListener("pointermove", onPointerMove, {
            passive: true,
        });
        window.addEventListener("deviceorientation", onOrientation);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("deviceorientation", onOrientation);
        };
    }, []);
}
