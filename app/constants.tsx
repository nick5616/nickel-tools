import {
    FileText,
    Search,
    Gamepad2,
    Layers,
    BookOpen,
    Users,
    Palette,
    Cpu,
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
            "Immersive first-person sandbox, with interactive games and experiences. Built in Three.js and React. Built for fun.",
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
        href: "/smart-piano",
        type: "INTERNAL",
        category: "MUSIC",
        status: "OPERATIONAL",
        backgroundScreenshotPath: "/project-screenshots/smartpiano.png",
    },
    {
        id: "saucedog-art",
        name: "saucedog.art",
        subtitle:
            "My art portfolio from 2022-2023. A collection of digital art, illustrations, and creative projects.",
        icon: <Palette className="w-4 h-4" />,
        href: "https://saucedog.art",
        type: "EXTERNAL",
        category: "ART",
        status: "OPERATIONAL",
        backgroundScreenshotPath: "/project-screenshots/oldartportfolio.png",
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
        id: "boards",
        name: "boards.saucedog.art",
        subtitle: "",
        icon: <Gamepad2 className="w-4 h-4" />,
        href: "https://boards.saucedog.art",
        type: "EXTERNAL",
        category: "WEB",
        status: "OPERATIONAL",
    },
    {
        id: "wizard-wars",
        name: "wizardwars.saucedog.art",
        subtitle: "",
        icon: <Gamepad2 className="w-4 h-4" />,
        href: "https://wizardwars.saucedog.art",
        type: "EXTERNAL",
        category: "WEB",
        status: "OPERATIONAL",
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
    {
        id: "3d-website",
        name: "nicolebelovoskey.com",
        subtitle:
            "First-person 3D environment on the web — walk around, collect rupees, view art in a museum, interact with exhibits, and more.",
        icon: <Gamepad2 className="w-4 h-4" />,
        href: "https://nicolebelovoskey.com",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "the-circle",
        name: "The Circle",
        subtitle:
            "A single persistent global room. Up to 8 people on camera via WebRTC mesh — everyone else watches and chats.",
        icon: <Users className="w-4 h-4" />,
        href: "https://live.saucedog.art/",
        type: "EXTERNAL",
        category: "SOCIAL / REAL-TIME",
        status: "OPERATIONAL",
    },
    {
        id: "life-graph",
        name: "Life Graph",
        subtitle:
            "A 3D visualization of your life goals and their relationships.",
        icon: <Brain className="w-4 h-4" />,
        href: "https://yieldpassionfruit.netlify.app/life-graph",
        type: "EXTERNAL",
        category: "AI / PRODUCTIVITY",
        status: "OPERATIONAL",
    },
    {
        id: "sphere",
        name: "Plasma Sphere",
        subtitle:
            "Like that one toy. Hold click and drag to attract the electricity. Desktop and mobile.",
        icon: <Cpu className="w-4 h-4" />,
        href: "https://sphere.saucedog.art",
        type: "EXTERNAL",
        category: "INTERACTIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "nickel-tools",
        name: "Nickel Tools",
        subtitle:
            "A browser-based desktop OS experience with a swipeable mobile mode, app grid, app tray, and full-screen app windows.",
        icon: <Layers className="w-4 h-4" />,
        href: "https://nickeltools.dev/desktop",
        type: "EXTERNAL",
        category: "ENGINEERING",
        status: "OPERATIONAL",
    },
    {
        id: "sw-viz",
        name: "Star Wars Ship Costs Visualizer",
        subtitle:
            "Interactive data visualization of Star Wars starship costs from the SWAPI dataset.",
        icon: <Search className="w-4 h-4" />,
        href: "https://star-wars-spending-viz.netlify.app",
        type: "EXTERNAL",
        category: "DATA VISUALIZATION",
        status: "OPERATIONAL",
    },
    {
        id: "voice-lab",
        name: "VoiceLab",
        subtitle:
            "Python desktop app for singers to track pitch, resonance, weight, brightness, and consistency across takes.",
        icon: <Music className="w-4 h-4" />,
        href: "https://github.com/nick5616/VoiceLab",
        type: "EXTERNAL",
        category: "ML / AUDIO",
        status: "OPERATIONAL",
    },
    {
        id: "batch-analyzer",
        name: "Batch Analyzer",
        subtitle:
            "Batch process product images by sending the same LLM queries to each image in a catalog.",
        icon: <Layers className="w-4 h-4" />,
        href: "https://batch-analyzer.netlify.app/",
        type: "EXTERNAL",
        category: "AI / PRODUCTIVITY",
        status: "OPERATIONAL",
    },
    {
        id: "art-room",
        name: "Art Room",
        subtitle:
            "A 3D art gallery room inside the holodeck — paintings mounted on walls you can approach and step back from.",
        icon: <Palette className="w-4 h-4" />,
        href: "https://nicolebelovoskey.com/holodeck/art",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "courage-computer",
        name: "Courage Computer Room",
        subtitle:
            "An interactive 3D retro computer lab environment inside the holodeck. Inspired by Courage the Cowardly Dog.",
        icon: <Cpu className="w-4 h-4" />,
        href: "https://nicolebelovoskey.com/holodeck/courage-the-cowardly-dog",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "math-room",
        name: "Math Room",
        subtitle:
            "An immersive 3D room for mathematical visualization — equations and shapes as explorable objects.",
        icon: <Brain className="w-4 h-4" />,
        href: "https://nicolebelovoskey.com/holodeck/math",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "art-museum",
        name: "Art Museum",
        subtitle:
            "A large-scale 3D museum experience inside the holodeck — multi-room virtual gallery you can browse at your own pace.",
        icon: <Palette className="w-4 h-4" />,
        href: "https://nicolebelovoskey.com/art-gallery",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "software-showroom",
        name: "Software Showroom",
        subtitle:
            "Walk up to screens in a 3D environment and interact with my projects. Press escape for your cursor.",
        icon: <Gamepad2 className="w-4 h-4" />,
        href: "https://nicolebelovoskey.com/software",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "sre-dashboard",
        name: "SRE Dashboard",
        subtitle:
            "Python/Flask backend with HTMX hypermedia and Lit web components — leaning into the platform instead of abstracting away from it.",
        icon: <Cpu className="w-4 h-4" />,
        href: "https://sre.nickeltools.dev",
        type: "EXTERNAL",
        category: "ENGINEERING",
        status: "OPERATIONAL",
    },
    {
        id: "sphere-website",
        name: "Sphere Website",
        subtitle:
            "A vanilla Three.js website built around a rotating 3D sphere — the hello world of 3D.",
        icon: <Cpu className="w-4 h-4" />,
        href: "https://tiny-sorbet-aefcf4.netlify.app/",
        type: "EXTERNAL",
        category: "IMMERSIVE WEB",
        status: "OPERATIONAL",
    },
    {
        id: "song-visualizer",
        name: "Song Visualizer",
        subtitle:
            "Visualize music as animated particles, waveforms, geometry, and spectrum effects. Upload MP3 or use mic.",
        icon: <Music className="w-4 h-4" />,
        href: "https://music.nickeltools.dev/song-visualizer/",
        type: "EXTERNAL",
        category: "MUSIC",
        status: "OPERATIONAL",
    },
    {
        id: "pitch-hero",
        name: "Pitch Hero",
        subtitle:
            "Sing or play MIDI to match scrolling notes — real-time pitch detection scores your accuracy.",
        icon: <Music className="w-4 h-4" />,
        href: "https://music.nickeltools.dev/pitch-hero/",
        type: "EXTERNAL",
        category: "MUSIC",
        status: "OPERATIONAL",
    },
    {
        id: "smart-midi-recorder",
        name: "Smart MIDI Recorder",
        subtitle:
            "Record MIDI with live musical context — key, scale, and harmonically suggested next notes in real time.",
        icon: <Music className="w-4 h-4" />,
        href: "https://music.nickeltools.dev/smart-midi-recorder/",
        type: "EXTERNAL",
        category: "MUSIC",
        status: "OPERATIONAL",
    },
    {
        id: "pokemon-or-technology",
        name: "Pokemon or Technology",
        subtitle:
            "Quiz yourself on what is a Pokemon and what is a Technology.",
        icon: <Gamepad2 className="w-4 h-4" />,
        href: "/pokemon-or-technology",
        type: "INTERNAL",
        category: "GAMING",
        status: "OPERATIONAL",
    },
    {
        id: "new-media-website",
        name: "New Media Class Website",
        subtitle:
            "My first real website — a 2019 college class assignment exploring media consumption.",
        icon: <FileText className="w-4 h-4" />,
        href: "https://new-media-college-class.netlify.app/",
        type: "EXTERNAL",
        category: "WEB",
        status: "OPERATIONAL",
    },
    {
        id: "routine",
        name: "Routine",
        subtitle:
            "An accessible online routine with dynamic WCAG AAA compliant analogous color schemes.",
        icon: <Palette className="w-4 h-4" />,
        href: "http://nick5616.github.io/routine",
        type: "EXTERNAL",
        category: "DESIGN SYSTEM",
        status: "OPERATIONAL",
    },
];
