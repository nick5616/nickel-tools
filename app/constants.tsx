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
    Music,
    Brain,
    Video,
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
    backgroundScreenshotPath?: string;
};

export const PROJECTS: Project[] = [
    {
        id: "portfolio",
        name: "nicolasbelovoskey.com",
        subtitle:
            "Immersive first-person art and software engineering portfolio, with interactive games and experiences thrown in for fun. Built in Three.js.",
        icon: <Gamepad2 className="w-4 h-4" />,
        href: "https://nicolasbelovoskey.com",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
        backgroundScreenshotPath: "/project-screenshots/3dportfolio.png",
    },
    {
        id: "friendex",
        name: "friendex.online",
        subtitle:
            "A pokédex for your friends. Built for Mobile. Prototyped on Web.",
        icon: <Users className="w-4 h-4" />,
        href: "https://friendex.online",
        type: "EXTERNAL",
        category: "SOCIAL TOOL",
        status: "OPERATIONAL",
        backgroundScreenshotPath: "/project-screenshots/friendex.png",
    },
    {
        id: "videogamequest",
        name: "videogamequest.me",
        subtitle:
            "Convert journal entries into video game quests, and live your life like an RPG.",
        icon: <BookOpen className="w-4 h-4" />,
        href: "https://videogamequest.me",
        type: "EXTERNAL",
        category: "AI / PRODUCTIVITY",
        status: "OPERATIONAL",
        backgroundScreenshotPath: "/project-screenshots/videogamequest.png",
    },
    {
        id: "tierlistify",
        name: "tierlistify.com",
        subtitle:
            "Rank anything, optimized for your phone. I built it because I thought the Tiermaker mobile site could use some improvement. ",
        icon: <Layers className="w-4 h-4" />,
        href: "https://tierlistify.com",
        type: "EXTERNAL",
        category: "SOCIAL APP",
        status: "OPERATIONAL",
        backgroundScreenshotPath:
            "/project-screenshots/tierlistifytierlist.png",
    },
    {
        id: "resume-builder",
        name: "Online LaTeX Resume Builder",
        subtitle: "WASM-powered LaTeX compiler. Zero config, total privacy.",
        icon: <FileText className="w-4 h-4" />,
        href: "/resume-editor",
        type: "INTERNAL",
        category: "ENGINEERING",
        status: "OPERATIONAL",
        backgroundScreenshotPath: "/project-screenshots/latex.png",
    },
    {
        id: "color-engine",
        name: "Advanced Color Scheme Generator",
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
        name: "Choice Picker",
        subtitle: "SPIN THE WHEEL...",
        icon: <Cpu className="w-4 h-4" />,
        href: "#",
        type: "INTERNAL",
        category: "UTILITY",
        status: "CONCEPT",
    },
    {
        id: "passionfruit",
        name: "Passionfruit",
        subtitle:
            "Conveniently track and understand all the projects you are working on",
        icon: <Layers className="w-4 h-4" />,
        href: "https://github.com/nick5616/universe",
        type: "EXTERNAL",
        category: "CREATIVE PRODUCTIVITY",
        status: "OPERATIONAL",
        backgroundScreenshotPath: "/project-screenshots/passionfruit.png",
    },
    {
        id: "smart-piano",
        name: "Smart Piano",
        subtitle:
            "An online piano that uses the key you're in and the musical context to suggest the next notes to play",
        icon: <Music className="w-4 h-4" />,
        href: "#",
        type: "INTERNAL",
        category: "MUSIC",
        status: "IN_DEVELOPMENT",
    },
    {
        id: "brains-games-gauntlet",
        name: "Brains Games Gauntlet",
        subtitle:
            "A series of games designed to improve mental math, working memory, creativity, etc",
        icon: <Brain className="w-4 h-4" />,
        href: "#",
        type: "INTERNAL",
        category: "EDUCATION / GAMING",
        status: "IN_DEVELOPMENT",
    },
    {
        id: "chaos",
        name: "CHAOS",
        subtitle:
            "Counter-Strike Highlight Analysis and Organization System. A tool that batch processes video game footage and filters noteworthy in-game moments using machine learning (OCR, Speech-To-Text) (Desktop app on hiatus).",
        icon: <Video className="w-4 h-4" />,
        href: "https://github.com/nick5616/CHAOS",
        type: "EXTERNAL",
        category: "ML / VIDEO",
        status: "IN_DEVELOPMENT",
        backgroundScreenshotPath: "/project-screenshots/chaos.png",
    },
];
