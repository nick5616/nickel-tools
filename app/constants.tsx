import {
    FileText,
    Search,
    ArrowUpRight,
    Gamepad2,
    Layers,
    BookOpen,
    Users,
    Palette,
    Cpu,
    Command,
} from "lucide-react";

export type Project = {
    id: string;
    name: string;
    subtitle: string;
    icon: React.ReactNode;
    href: string;
    type: "EXTERNAL" | "INTERNAL";
    category: string;
    status: "OPERATIONAL" | "IN_DEVELOPMENT" | "CONCEPT";
};

export const PROJECTS: Project[] = [
    {
        id: "portfolio",
        name: "3D_PORTFOLIO",
        subtitle: "Immersive first-person environment built in Three.js.",
        icon: <Gamepad2 className="w-4 h-4" />,
        href: "https://nicolasbelovoskey.com",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "friendex",
        name: "FRIENDEX",
        subtitle: "A personal CRM and compendium for your social circle.",
        icon: <Users className="w-4 h-4" />,
        href: "https://friendex.online",
        type: "EXTERNAL",
        category: "SOCIAL TOOL",
        status: "OPERATIONAL",
    },
    {
        id: "videogamequest",
        name: "VIDEOGAMEQUEST",
        subtitle: "Gamified journaling engine using AI to narrate your life.",
        icon: <BookOpen className="w-4 h-4" />,
        href: "https://videogamequest.me",
        type: "EXTERNAL",
        category: "AI / PRODUCTIVITY",
        status: "OPERATIONAL",
    },
    {
        id: "tierlistify",
        name: "TIERLISTIFY",
        subtitle:
            "Rank, sort, and share anything. The definitive tier list app.",
        icon: <Layers className="w-4 h-4" />,
        href: "https://tierlistify.com",
        type: "EXTERNAL",
        category: "SOCIAL APP",
        status: "OPERATIONAL",
    },
    {
        id: "resume-builder",
        name: "RESUME_FABRICATOR",
        subtitle: "WASM-powered LaTeX compiler. Zero config, total privacy.",
        icon: <FileText className="w-4 h-4" />,
        href: "/resume-editor",
        type: "INTERNAL",
        category: "ENGINEERING",
        status: "OPERATIONAL",
    },
    {
        id: "color-engine",
        name: "CHROMATIC_ENGINE",
        subtitle:
            "Algorithmic palette generator based on harmonic color theory.",
        icon: <Palette className="w-4 h-4" />,
        href: "#",
        type: "INTERNAL",
        category: "DESIGN SYSTEM",
        status: "IN_DEVELOPMENT",
    },
    {
        id: "choice-engine",
        name: "ENTROPY_GENERATOR",
        subtitle: "Weighted random selection for indecisive moments.",
        icon: <Cpu className="w-4 h-4" />,
        href: "#",
        type: "INTERNAL",
        category: "UTILITY",
        status: "CONCEPT",
    },
];
