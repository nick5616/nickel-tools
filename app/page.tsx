import Link from "next/link";
import { FileText, Calculator, Palette, Search } from "lucide-react";

export default function Home() {
    // As you build more tools, you just add them to this array
    const tools = [
        {
            name: "LaTeX Resume Editor",
            description:
                "Build ATS-friendly resumes with real-time preview. No LaTeX installation required.",
            icon: <FileText className="w-6 h-6 text-blue-600" />,
            href: "/resume-editor",
            tag: "Productivity",
        },
        // Placeholder for your next tool
        {
            name: "Inflation Calculator",
            description:
                "Calculate the value of the dollar over time using CPI data.",
            icon: <Calculator className="w-6 h-6 text-green-600" />,
            href: "#",
            tag: "Finance",
            comingSoon: true,
        },
        {
            name: "Contrast Checker",
            description:
                "Ensure your web colors meet WCAG accessibility standards.",
            icon: <Palette className="w-6 h-6 text-purple-600" />,
            href: "#",
            tag: "Design",
            comingSoon: true,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-4">
                    Useful tools,{" "}
                    <span className="text-blue-600">simplified.</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    A collection of free, privacy-focused utilities for
                    developers and creators. No logins, no paywalls, just code.
                </p>

                {/* Search Bar Visual */}
                <div className="mt-8 max-w-md mx-auto relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-full leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                        placeholder="Search for a tool..."
                        readOnly // Make functional later
                    />
                </div>
            </div>

            {/* Tool Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.name}
                        href={tool.href}
                        className={`block group relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                            tool.comingSoon
                                ? "opacity-60 cursor-not-allowed pointer-events-none"
                                : ""
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                {tool.icon}
                            </div>
                            <span
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                    tool.comingSoon
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                            >
                                {tool.comingSoon ? "Coming Soon" : tool.tag}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {tool.name}
                        </h3>
                        <p className="text-slate-500 text-sm">
                            {tool.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
