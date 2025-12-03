// Core content types
export type ContentType = "external" | "internal" | "media" | "collection";
export type Status =
    | "operational"
    | "in-development"
    | "experimental"
    | "archived";
export type Category =
    | "Engineering"
    | "Music"
    | "Art"
    | "Immersive Web"
    | "Social Tools"
    | "AI / Productivity"
    | "Games"
    | "Experiments"
    | "Design System"
    | "Utility"
    | "Creative Productivity"
    | "Education"
    | "Gaming"
    | "Machine Learning"
    | "Video"
    | "Social App";

interface BaseContent {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: Category;
    status: Status;
    dateAdded: string;
    featured?: boolean;
    tags?: string[];
}

export interface ExternalLink extends BaseContent {
    type: "external";
    url: string;
    openInNewTab: boolean;
}

export interface InternalApp extends BaseContent {
    type: "internal";
    route: string; // Next.js route
    openInModal?: boolean; // For tools that work in popups
}

export interface MediaItem extends BaseContent {
    type: "media";
    mediaType: "image" | "video" | "3d-model";
    mediaUrl: string;
    dimensions?: { width: number; height: number };
}

export interface Collection extends BaseContent {
    type: "collection";
    items: string[]; // IDs of other content items
}

export type Content = ExternalLink | InternalApp | MediaItem | Collection;

// The master content array
export interface NickelSystem {
    version: string;
    categories: Category[];
    content: Content[];
    featured: string[]; // IDs for dock/featured section
    desktopWallpaper?: string;
}

// Helper function to get icon name from category
export function getCategoryIcon(category: Category): string {
    const iconMap: Record<Category, string> = {
        Engineering: "💻",
        Music: "🎹",
        Art: "🎨",
        "Immersive Web": "🌐",
        "Social Tools": "👥",
        "AI / Productivity": "🤖",
        Games: "🎮",
        Experiments: "⚗️",
        "Design System": "🎨",
        Utility: "🔧",
        "Creative Productivity": "📊",
        Education: "🧠",
        Gaming: "🎮",
        "Machine Learning": "�",
        Video: "🎬",
        "Social App": "📱",
    };
    return iconMap[category] || "📄";
}

// Migrated content from app/constants.tsx
export const NICKEL_SYSTEM: NickelSystem = {
    version: "1.0.0",
    categories: [
        "Engineering",
        "Music",
        "Art",
        "Immersive Web",
        "Social Tools",
        "AI / Productivity",
        "Games",
        "Experiments",
        "Design System",
        "Utility",
        "Creative Productivity",
        "Education",
        "Gaming",
        "Machine Learning",
        "Video",
        "Social App",
    ],
    content: [
        {
            id: "portfolio",
            type: "external",
            title: "nicolasbelovoskey.com",
            description:
                "Immersive first-person art and software engineering portfolio, with interactive games and experiences thrown in for fun. Built in Three.js.",
            thumbnail: "/project-screenshots/3dportfolio.png",
            category: "Immersive Web",
            status: "operational",
            url: "https://nicolasbelovoskey.com",
            openInNewTab: true,
            dateAdded: "2023-01-15",
            featured: true,
            tags: ["three.js", "portfolio", "interactive"],
        },
        {
            id: "friendex",
            type: "external",
            title: "friendex.online",
            description:
                "A pokédex for your friends. Built for Mobile. Prototyped on Web.",
            thumbnail: "/project-screenshots/friendex.png",
            category: "Social Tools",
            status: "operational",
            url: "https://friendex.online",
            openInNewTab: true,
            dateAdded: "2023-03-20",
            featured: false,
            tags: ["social", "mobile", "web"],
        },
        {
            id: "videogamequest",
            type: "external",
            title: "videogamequest.me",
            description:
                "Convert journal entries into video game quests, and live your life like an RPG.",
            thumbnail: "/project-screenshots/videogamequest.png",
            category: "AI / Productivity",
            status: "operational",
            url: "https://videogamequest.me",
            openInNewTab: true,
            dateAdded: "2023-05-10",
            featured: false,
            tags: ["productivity", "rpg", "journaling"],
        },
        {
            id: "tierlistify",
            type: "external",
            title: "tierlistify.com",
            description:
                "Rank anything, optimized for your phone. I built it because I thought the Tiermaker mobile site could use some improvement.",
            thumbnail: "/project-screenshots/tierlistifytierlist.png",
            category: "Social App",
            status: "operational",
            url: "https://tierlistify.com",
            openInNewTab: true,
            dateAdded: "2023-04-05",
            featured: false,
            tags: ["social", "mobile", "ranking"],
        },
        {
            id: "resume-builder",
            type: "internal",
            title: "Online LaTeX Resume Builder",
            description:
                "WASM-powered LaTeX compiler. Zero config, total privacy.",
            thumbnail: "/project-screenshots/latex.png",
            category: "Engineering",
            status: "operational",
            route: "/resume-editor",
            openInModal: false,
            dateAdded: "2023-06-15",
            featured: true,
            tags: ["latex", "wasm", "tools"],
        },
        {
            id: "color-engine",
            type: "internal",
            title: "Advanced Color Scheme Generator",
            description:
                "Algorithmic palette generator based on harmonic color theory.",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Design System",
            status: "in-development",
            route: "#",
            dateAdded: "2024-01-01",
            featured: false,
            tags: ["design", "colors", "algorithm"],
        },
        {
            id: "choice-engine",
            type: "internal",
            title: "Choice Picker",
            description: "SPIN THE WHEEL...",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Utility",
            status: "experimental",
            route: "#",
            dateAdded: "2024-01-01",
            featured: false,
            tags: ["utility", "random"],
        },
        {
            id: "passionfruit",
            type: "external",
            title: "Passionfruit",
            description:
                "Conveniently track and understand all the projects you are working on",
            thumbnail: "/project-screenshots/passionfruit.png",
            category: "Creative Productivity",
            status: "operational",
            url: "https://github.com/nick5616/universe",
            openInNewTab: true,
            dateAdded: "2023-07-20",
            featured: false,
            tags: ["productivity", "tracking", "github"],
        },
        {
            id: "smart-piano",
            type: "internal",
            title: "Smart Piano",
            description:
                "An online piano that uses the key you're in and the musical context to suggest the next notes to play",
            thumbnail: "/project-screenshots/smartpiano.png",
            category: "Music",
            status: "operational",
            route: "/smart-piano",
            openInModal: false,
            dateAdded: "2023-08-10",
            featured: true,
            tags: ["music", "piano", "interactive"],
        },
        {
            id: "saucedog-art",
            type: "external",
            title: "saucedog.art",
            description:
                "My art portfolio from 2022-2023. A collection of digital art, illustrations, and creative projects.",
            thumbnail: "/project-screenshots/oldartportfolio.png",
            category: "Art",
            status: "operational",
            url: "https://saucedog.art",
            openInNewTab: true,
            dateAdded: "2023-02-01",
            featured: true,
            tags: ["art", "portfolio", "digital"],
        },
        {
            id: "brains-games-gauntlet",
            type: "internal",
            title: "Brains Games Gauntlet",
            description:
                "A series of games designed to improve mental math, working memory, creativity, etc",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Education",
            status: "in-development",
            route: "#",
            dateAdded: "2024-01-01",
            featured: false,
            tags: ["games", "education", "brain-training"],
        },
        {
            id: "chaos",
            type: "external",
            title: "CHAOS",
            description:
                "Counter-Strike Highlight Analysis and Organization System. A tool that batch processes video game footage and filters noteworthy in-game moments using machine learning (OCR, Speech-To-Text) (Desktop app on hiatus).",
            thumbnail: "/project-screenshots/chaos.png",
            category: "Machine Learning",
            status: "operational",
            url: "https://github.com/nick5616/CHAOS",
            openInNewTab: true,
            dateAdded: "2023-09-15",
            featured: false,
            tags: ["ml", "video", "gaming", "github"],
        },
        // System windows
        {
            id: "about",
            type: "internal",
            title: "About Nickel OS",
            description: "System information and bio",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Utility",
            status: "operational",
            route: "/about",
            dateAdded: "2024-01-01",
            featured: false,
        },
        {
            id: "contact",
            type: "internal",
            title: "Contact",
            description: "Get in touch",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Utility",
            status: "operational",
            route: "/contact",
            dateAdded: "2024-01-01",
            featured: false,
        },
        {
            id: "settings",
            type: "internal",
            title: "Settings",
            description: "System preferences and customization",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Utility",
            status: "operational",
            route: "/settings",
            dateAdded: "2024-01-01",
            featured: false,
        },
        // Art galleries (stubbed for GCP integration)
        {
            id: "art-digital-art",
            type: "internal",
            title: "Digital Art",
            description: "Gallery of digital artwork",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Art",
            status: "operational",
            route: "/art-gallery/digital-art",
            dateAdded: "2024-01-01",
            featured: false,
        },
        {
            id: "art-paintings",
            type: "internal",
            title: "Paintings",
            description: "Gallery of paintings",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Art",
            status: "operational",
            route: "/art-gallery/paintings",
            dateAdded: "2024-01-01",
            featured: false,
        },
        {
            id: "art-sketches",
            type: "internal",
            title: "Sketches",
            description: "Gallery of sketches",
            thumbnail: "/project-screenshots/latex.png", // Placeholder
            category: "Art",
            status: "operational",
            route: "/art-gallery/sketches",
            dateAdded: "2024-01-01",
            featured: false,
        },
    ],
    featured: ["resume-builder", "smart-piano", "portfolio", "saucedog-art"],
};

// Helper functions
export function getContentById(id: string): Content | undefined {
    return NICKEL_SYSTEM.content.find((item) => item.id === id);
}

export function getFeaturedContent(): Content[] {
    return NICKEL_SYSTEM.featured
        .map((id) => getContentById(id))
        .filter((item): item is Content => item !== undefined);
}

export function getContentByCategory(category: Category): Content[] {
    return NICKEL_SYSTEM.content.filter((item) => item.category === category);
}

export function getAllContent(): Content[] {
    return NICKEL_SYSTEM.content;
}
