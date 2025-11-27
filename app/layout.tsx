import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Wrench } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Nickel Tools | Free Developer Utilities",
    description:
        "A suite of free, client-side tools for developers and creators. Built by Nickel.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
            >
                {/* Navigation */}
                <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center gap-2">
                                <a
                                    href="/"
                                    className="flex items-center gap-2 group"
                                >
                                    <div className="bg-slate-900 text-white p-1.5 rounded-lg group-hover:bg-blue-600 transition-colors">
                                        <Wrench size={20} />
                                    </div>
                                    <span className="text-xl font-bold tracking-tight text-slate-900">
                                        Nickel
                                        <span className="text-slate-500">
                                            Tools
                                        </span>
                                    </span>
                                </a>
                            </div>
                            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
                                <a
                                    href="/"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    All Tools
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    About Nickel
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="flex-grow">{children}</main>

                {/* Footer */}
                <footer className="bg-white border-t border-slate-200 mt-auto">
                    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} Nickel Tools. Built
                            with Next.js & React.
                        </p>
                        <div className="flex gap-4">
                            {/* You can add your GitHub/Socials here later */}
                            <span className="text-xs text-slate-400">
                                Element 28
                            </span>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
