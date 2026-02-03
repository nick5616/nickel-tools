"use client";

import Link from "next/link";

export default function PortfolioPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
            <div className="flex flex-col items-center justify-center min-h-screen px-8 py-16">
                <h1 className="mb-16 text-5xl md:text-7xl font-bold font-bbh-bartle text-center text-white">
                    What do you want to know more about?
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    <Link
                        href="/portfolio/ux"
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/30 p-12 hover:scale-105 transition-transform duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <h2 className="text-xl md:text-2xl font-bold font-bbh-bartle text-white relative z-10 text-center">
                            Design
                        </h2>
                    </Link>

                    <Link
                        href="/portfolio/software"
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-400/30 p-12 hover:scale-105 transition-transform duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <h2 className="text-xl md:text-2xl font-bold font-bbh-bartle text-white relative z-10 text-center">
                            Software
                        </h2>
                    </Link>

                    <Link
                        href="/portfolio/art"
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-400/30 p-12 hover:scale-105 transition-transform duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <h2 className="text-xl md:text-2xl font-bold font-bbh-bartle text-white relative z-10 text-center">
                            Art
                        </h2>
                    </Link>
                </div>
            </div>
        </div>
    );
}
