"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface SlideInProps {
    children: ReactNode;
    from?: "left" | "right";
    delay?: number;
    className?: string;
}

export default function SlideIn({
    children,
    from = "left",
    delay = 0,
    className = "",
}: SlideInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (delay > 0) {
                        setTimeout(() => setIsVisible(true), delay);
                    } else {
                        setIsVisible(true);
                    }
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: "-50px 0px" }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    const slideClass = from === "left"
        ? "translate-x-[-60px] opacity-0"
        : "translate-x-[60px] opacity-0";

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                isVisible ? "translate-x-0 opacity-100" : slideClass
            } ${className}`}
        >
            {children}
        </div>
    );
}
