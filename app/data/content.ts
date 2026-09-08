import React from "react";
import { BatchAnalyzerDescription } from "@/components/descriptions/BatchAnalyzerDescription";

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

// Which display layer(s) should render this item. This is the single place
// that decides "which array of projects" each page needs to pull from —
// add a surface here instead of copying the entry into a page-local list.
export type Surface =
  | "desktop"
  | "software-portfolio"
  | "art-portfolio"
  | "ux-portfolio";

// Fields only the /portfolio/* pages care about. Kept nested (rather than
// flattened onto BaseContent) so the desktop/mobile OS components — which
// only ever read the base fields — don't need to know this exists.
export interface PortfolioMeta {
  description?: string; // overrides `description` on portfolio pages only, if set
  why?: string;
  tech?: string[]; // technology/medium chip list (freeform; normalize at render time if a page needs strict Technology/Tag typing)
  tags?: string[]; // categorization chip list (freeform; separate from the desktop-facing `tags` field below)
  frontendSource?: string;
  backendSource?: string;
  color?: string; // tailwind gradient classes (art/ux decorative blob)
  borderColor?: string;
  blobColor?: string; // hex color (art/ux decorative blob)
  dateLabel?: string; // human-friendly date override, e.g. "Sometime in like Oct 2025"
  artGrouping?: "primary" | "collection"; // art-portfolio only: which section to render in
}

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
  hasContentfulDescription?: boolean; // If true, modal shows React component instead of description
  contentfulDescription?: ContentfulDescriptionComponent; // React component to render in modal
  surfaces: Surface[];
  portfolio?: PortfolioMeta;
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
  windowWidth?: number; // Custom window width (overrides default)
  windowHeight?: number; // Custom window height (overrides default)
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

// Type for contentful description renderer (defined after Content to avoid circular reference)
export type ContentfulDescriptionComponent = React.ComponentType<{
  content: Content;
}>;

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
    "Machine Learning": "🧪",
    Video: "🎬",
    "Social App": "📱",
  };
  return iconMap[category] || "📄";
}

// The master content array — single source of truth for the desktop/mobile OS
// and for the software, art, and UX portfolio pages. Every project lives here
// exactly once; the `surfaces` field says which page(s) render it, and the
// `portfolio` field holds the extra copy those pages need.
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
      title: "nicolebelovoskey.com",
      description:
        "Immersive first-person art and software engineering portfolio, with interactive games and experiences thrown in for fun. Built in Three.js.",
      thumbnail: "/project-screenshots/3dportfolio.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://nicolebelovoskey.com",
      openInNewTab: true,
      dateAdded: "2023-01-15",
      featured: true,
      tags: ["three.js", "portfolio", "interactive"],
      surfaces: ["desktop", "ux-portfolio"],
      portfolio: {
        why: "I wanted to create a portfolio that was more than just a collection of links. The first-person 3D experience makes exploring my work feel like an adventure, and it showcases both my technical skills and creative vision in one cohesive experience.",
        tech: ["Three.js", "WebGL", "JavaScript"],
        tags: ["3D Design", "Interactive Design"],
        color: "from-violet-500/20 to-fuchsia-500/20",
        borderColor: "border-violet-400/30",
        blobColor: "#8b5cf6",
      },
    },
    {
      id: "3d-website",
      type: "external",
      title: "3D Website",
      description:
        "I made a first person 3D environment on the web, where the user can walk around, sprint, jump, collect rupees, view my art in a digital upscale museum, see my software projects as if they are physically walking up to them, draw a picture and submit it, with the potential to see it hung up on the wall, interact with an omnipotent and deriding computer from the cartoon 'Courage the Cowardly Dog', Relax in a tranquil forest, or Practice multiplication in a 3D adaptation of 'Meteor Multiplication'.",
      thumbnail: "/project-screenshots/3dportfolio.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://nicolebelovoskey.com",
      openInNewTab: true,
      dateAdded: "2025-01-01",
      featured: false,
      tags: ["three.js", "3d", "portfolio", "interactive"],
      surfaces: ["software-portfolio"],
      portfolio: {
        why: "I wanted this website to feel like a place you could inhabit rather than a page you scroll. Building a fully explorable 3D world pushed my skills across graphics programming, spatial UX, and browser performance. It was fun. Also I wanted it to exist. Isn't that reason enough?",
        tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/3d-portfolio-website",
        dateLabel: "Jan 2025",
      },
    },
    {
      id: "friendex",
      type: "external",
      title: "friendex.online",
      description:
        "A pokédex for your friends—a mobile-first social app that lets you collect and organize information about the people in your life. Built with a focus on delightful mobile interactions and intuitive navigation.",
      thumbnail: "/project-screenshots/friendex.png",
      category: "Social Tools",
      status: "operational",
      url: "https://friendex.online",
      openInNewTab: true,
      dateAdded: "2023-03-20",
      featured: false,
      tags: ["social", "mobile", "web"],
      surfaces: ["desktop", "software-portfolio", "ux-portfolio"],
      portfolio: {
        why: "I created friendex because I wanted a fun, gamified way to remember details about friends. The pokédex metaphor makes it engaging, and the mobile-first design ensures it's easy to use on the go when you're actually with people.",
        tech: ["TypeScript", "React"],
        tags: [
          "Mobile-First",
          "Social App",
          "Web Development",
          "Responsive UI",
        ],
        frontendSource: "https://github.com/nick5616/friendex",
        dateLabel: "Oct 2025",
        color: "from-blue-500/20 to-cyan-500/20",
        borderColor: "border-blue-400/30",
        blobColor: "#3b82f6",
      },
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
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I built videogamequest because I wanted to make productivity and journaling more engaging. By framing life events as RPG quests, it adds a layer of fun and motivation to tracking your progress and achieving goals.",
        tech: [
          "TypeScript",
          "React",
          "Tailwind CSS",
          "Framer Motion",
          "Nest.js",
          "Node.js",
        ],
        tags: [
          "AI Integration",
          "Productivity Tools",
          "Gamification",
          "Journaling",
        ],
        dateLabel: "June 2025",
      },
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
      surfaces: ["desktop", "software-portfolio", "ux-portfolio"],
      portfolio: {
        why: "I built tierlistify because I was frustrated with how poorly existing tier list tools worked on mobile. I wanted to create something that felt native to touch interfaces, with smooth drag-and-drop interactions and a clean, focused UI.",
        tech: ["TypeScript", "React"],
        tags: [
          "Mobile UX",
          "Touch Interactions",
          "Drag & Drop",
          "Progressive Web App",
        ],
        frontendSource: "https://github.com/nick5616/tierlistify",
        dateLabel: "Sep 2025",
        color: "from-purple-500/20 to-pink-500/20",
        borderColor: "border-purple-400/30",
        blobColor: "#a855f7",
      },
    },
    {
      id: "resume-builder",
      type: "internal",
      title: "Online LaTeX Resume Builder",
      description: "WASM-powered LaTeX compiler. Zero config, total privacy.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Engineering",
      status: "operational",
      route: "/resume-editor",
      openInModal: false,
      dateAdded: "2023-06-15",
      featured: true,
      tags: ["latex", "wasm", "tools"],
      surfaces: ["desktop"],
    },
    {
      id: "color-engine",
      type: "internal",
      title: "Advanced Color Scheme Generator",
      description:
        "Algorithmic palette generator based on harmonic color theory. Generate and export theme JSON.",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "Design System",
      status: "operational",
      route: "/advanced-color-scheme-generator",
      dateAdded: "2024-01-01",
      windowHeight: 700,
      featured: false,
      tags: ["design", "colors", "algorithm"],
      surfaces: ["desktop", "ux-portfolio"],
      portfolio: {
        why: "I built this because I was tired of manually creating color palettes and wanted a tool that could generate harmonious color schemes based on established color theory principles. It's particularly useful for creating accessible, visually pleasing design systems with proper contrast ratios.",
        tech: ["TypeScript", "React", "Canvas API", "Next.js"],
        tags: ["Color Theory Algorithms"],
        color: "from-indigo-500/20 to-purple-500/20",
        borderColor: "border-indigo-400/30",
        blobColor: "#6366f1",
      },
    },
    {
      id: "choice-engine",
      type: "internal",
      title: "Choice Picker",
      description:
        "Spin the wheel to make decisions! Add your options and let chance decide.",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "Utility",
      status: "operational",
      route: "/choice-picker",
      dateAdded: "2024-01-01",
      featured: false,
      tags: ["utility", "random", "decision"],
      surfaces: ["desktop"],
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
      url: "https://yieldpassionfruit.netlify.app",
      openInNewTab: true,
      dateAdded: "2023-07-20",
      featured: false,
      tags: ["productivity", "tracking", "github"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I have a lot of infrequent hobbies that I like to switch between. I noticed I was feeling overwhelmed by all the projects I was working on, so I built Passionfruit to help me keep track of them in a way that wouldn't stifle my creativity.",
        tech: ["TypeScript", "React", "LLM APIs"],
        tags: ["AI Integration", "Project Management", "Productivity Tools"],
        frontendSource: "https://github.com/nick5616/universe",
        dateLabel: "Nov 2025",
      },
    },
    {
      id: "life-graph",
      type: "external",
      title: "Life Graph",
      description:
        "A 3D visualization of your life — map experiences, milestones, and relationships across time.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Creative Productivity",
      status: "operational",
      url: "https://yieldpassionfruit.netlify.app/life-graph",
      openInNewTab: false,
      dateAdded: "2026-04-10",
      featured: false,
      tags: ["3d", "visualization", "life", "interactive"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted to model relationships between my goals and their prerequisites, and how my goals are related to each other. I've made it generic so you can use it for your own goals. It's intended to include basic foundational behaviors like sleeping and eating well, since that's how you're at your best.",
        tech: ["TypeScript", "React", "Three.js", "WebGL", "LLM APIs"],
        tags: ["AI Integration", "3D Design", "Interactive Design"],
        frontendSource:
          "https://github.com/nick5616/universe/blob/main/src/pages/LifeGraphPage.tsx",
        dateLabel: "Mar 2026",
      },
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
      windowWidth: 1400,
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted to create a tool that helps people learn music theory through play. Instead of just showing scales or chords, Smart Piano provides real-time musical guidance, making it easier to create pleasing melodies even if you're not an expert musician.",
        tech: ["TypeScript", "React", "Web Audio API", "Next.js"],
        tags: ["Music Theory Algorithms"],
        frontendSource: "https://github.com/nick5616/nickel-tools",
        dateLabel: "Nov 2025",
      },
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
      surfaces: ["desktop", "art-portfolio"],
      portfolio: {
        why: "I created saucedog.art as a dedicated space to showcase my digital art work. It represents a period of intense creative exploration where I was learning new techniques, developing my style, and creating pieces that combined my interests in technology and art.",
        tech: [
          "Digital Art",
          "Illustration",
          "Character Design",
          "Visual Storytelling",
        ],
        artGrouping: "primary",
        color: "from-rose-500/20 to-pink-500/20",
        borderColor: "border-rose-400/30",
        blobColor: "#f43f5e",
      },
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
      surfaces: ["desktop"],
    },
    {
      id: "plasma-sphere",
      type: "external",
      title: "Plasma Sphere",
      description:
        "Like that one toy. Hold click and drag on the ball to attract the electricity! Desktop and mobile.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Experiments",
      status: "operational",
      url: "https://sphere.saucedog.art",
      openInNewTab: false,
      dateAdded: "2026-04-10",
      featured: false,
      tags: ["3d", "webgl", "interactive", "three.js"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I absolutely adore electricity and wanted to create a 3D environment that allows you to play with it. I've been fascinated with physical phenomena like electricity and magnetism, and how the basis of computers is manipulating an electron using a difference in electromagnetic force to make a transistor, which can be used to make logic gates, which can be used to make circuits, which can be used to make arithmetic logic units. With the inclusion of a clock and memory, you can create an entire computer architecture. On the newly formed computer, you can run programs directly on the hardware (baremetal) using binary instructions written for that computer architecture, or you could write a hardware abstraction layer that transpiles a common higher level language like assembly into the language the computer speaks. You can also write a language that's more readable to coders, that compiles into assembly, which is then translated into instructions for your computer! Using that higher level language, developers can move quickly and develop operating systems for a computer. Operating systems make it easier to write programs for  the computer, because they handle the allocation of computer resources (they talk to the computer so your program doesn't have to worry about that). They also provide the illusion of isolation, meaning a software program written for an OS does not know other programs exist, and doesn't need to worry about playing nice with the hundreds of other applications running on the computer. The browser is a program on the OS. And this website is written for the browser! And it's all powered by 100 billion electrons jumping from one side of a microscopic germanium-doped silicon trough to the other.",
        tech: ["JavaScript", "Three.js", "WebGL"],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/plasma-sphere",
        dateLabel: "Apr 2026",
      },
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
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "As a Counter-Strike player, I wanted to automatically find and organize my best plays from hours of gameplay footage. Manually scrubbing through videos is tedious, so I built CHAOS to use ML to detect kills, callouts, and other significant moments automatically.",
        tech: ["Python"],
        tags: [
          "Machine Learning",
          "OCR",
          "Speech-to-Text",
          "Video Processing",
          "Computer Vision",
        ],
        frontendSource: "https://github.com/nick5616/CHAOS",
        dateLabel: "Oct 2025",
      },
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
      surfaces: ["desktop"],
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
      surfaces: ["desktop"],
    },
    {
      id: "settings",
      type: "internal",
      title: "Settings",
      description: "System preferences and customization",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "Utility",
      status: "operational",
      windowHeight: 700,
      route: "/settings",
      dateAdded: "2024-01-01",
      featured: false,
      surfaces: ["desktop"],
    },
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
      surfaces: ["desktop", "art-portfolio"],
      portfolio: {
        why: "I wanted to create a dedicated space for my digital art pieces, separate from other mediums. Digital art allows for experimentation with color, composition, and style in ways that traditional media can't always achieve.",
        tech: [
          "Digital Illustration",
          "Procreate",
          "Photoshop",
          "Digital Painting",
        ],
        artGrouping: "primary",
        color: "from-orange-500/20 to-amber-500/20",
        borderColor: "border-orange-400/30",
        blobColor: "#f97316",
      },
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
      surfaces: ["desktop", "art-portfolio"],
      portfolio: {
        why: "Working with physical paint and canvas provides a different creative experience than digital art. These paintings capture moments of experimentation with color, texture, and form in a more traditional medium.",
        tech: ["Acrylic Paint", "Watercolor", "Traditional Media", "Canvas"],
        artGrouping: "primary",
        color: "from-red-500/20 to-rose-500/20",
        borderColor: "border-red-400/30",
        blobColor: "#ef4444",
      },
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
      surfaces: ["desktop", "art-portfolio"],
      portfolio: {
        why: "Sketches are where ideas start. I keep this collection to show the process behind finished pieces and to celebrate the value of quick, experimental work. Sometimes the best ideas come from these loose, unpolished drawings.",
        tech: ["Pencil", "Pen & Ink", "Charcoal", "Sketching"],
        artGrouping: "primary",
        color: "from-amber-500/20 to-yellow-500/20",
        borderColor: "border-amber-400/30",
        blobColor: "#f59e0b",
      },
    },
    {
      id: "art-lefthanded",
      type: "internal",
      title: "Left-Handed Art",
      description: "Art created only using my left hand",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "Art",
      status: "operational",
      route: "/art-gallery/lefthanded",
      dateAdded: "2024-01-01",
      featured: false,
      surfaces: ["desktop", "art-portfolio"],
      portfolio: { artGrouping: "collection" },
    },
    {
      id: "art-miscellaneous",
      type: "internal",
      title: "Miscellaneous",
      description: "A collection of miscellaneous artwork and creative pieces",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "Art",
      status: "operational",
      route: "/art-gallery/miscellaneous",
      dateAdded: "2024-01-01",
      featured: false,
      windowHeight: 700,
      surfaces: ["desktop", "art-portfolio"],
      portfolio: { artGrouping: "collection" },
    },
    {
      id: "art-notesappart",
      type: "internal",
      title: "Notes App Art",
      description: "Art created in note-taking apps and other digital tools",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "Art",
      status: "operational",
      route: "/art-gallery/notesappart",
      dateAdded: "2024-01-01",
      featured: false,
      surfaces: ["desktop", "art-portfolio"],
      portfolio: { artGrouping: "collection" },
    },
    {
      id: "pokemon-or-technology",
      type: "internal",
      title: "Pokemon or Technology",
      description:
        "Test your knowledge! Can you tell the difference between a Pokémon name and a technology term?",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "Games",
      status: "operational",
      route: "/pokemon-or-technology",
      dateAdded: "2024-01-01",
      featured: false,
      tags: ["games", "quiz", "pokemon", "technology"],
      windowWidth: 300,
      windowHeight: 400,
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "One day I observed Pokemon and Technology have similar sounding names, so I made this quiz game.",
        tech: ["TypeScript", "React", "Next.js"],
        dateLabel: "Sometime in like Oct 2025",
      },
    },
    {
      id: "audio-to-midi",
      type: "internal",
      title: "Audio → MIDI",
      description:
        "Convert audio to MIDI using the YIN pitch detection algorithm. Drop in a WAV or MP3, tune BPM and quantization, then download the MIDI file.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Music",
      status: "operational",
      route: "/audio-to-midi",
      openInModal: false,
      dateAdded: "2026-04-16",
      featured: false,
      tags: ["music", "midi", "audio", "pitch-detection"],
      windowWidth: 720,
      windowHeight: 800,
      surfaces: ["desktop"],
    },
    {
      id: "song-visualizer",
      type: "external",
      title: "Song Visualizer",
      description:
        "Visualize music as animated particles, waveforms, geometry, and spectrum effects. Upload an MP3 or connect a mic for real-time visuals with customizable color, speed, and intensity.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Music",
      status: "operational",
      url: "https://music.nickeltools.dev/song-visualizer/",
      openInNewTab: true,
      dateAdded: "2026-04-17",
      featured: false,
      tags: ["music", "visualization", "audio", "creative"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted a way to see my music, not just hear it. Building real-time audio visualization in the browser with the Web Audio API and Canvas was a satisfying way to connect the sonic and the visual.",
        tech: ["JavaScript", "Web Audio API", "Canvas API", "HTML", "CSS"],
        tags: ["Music Theory Algorithms", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/song-visualizer",
        dateLabel: "Apr 2026",
      },
    },
    {
      id: "pitch-hero",
      type: "external",
      title: "Pitch Hero",
      description:
        "Sing or play a MIDI keyboard to match scrolling notes as they cross the target line. Trains pitch accuracy with real-time microphone or MIDI input scoring.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Music",
      status: "operational",
      url: "https://music.nickeltools.dev/pitch-hero/",
      openInNewTab: true,
      dateAdded: "2026-04-17",
      featured: false,
      tags: ["music", "pitch", "training", "midi", "interactive"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted an interactive way to train pitch accuracy that felt more like a game than an exercise. Building the pitch detection and scrolling note renderer from scratch was a great deep-dive into the Web Audio API.",
        tech: ["JavaScript", "Web Audio API", "Canvas API", "HTML", "CSS"],
        tags: ["Music Theory Algorithms", "Interactive Design", "Real-time"],
        frontendSource: "https://github.com/nick5616/song-visualizer",
        dateLabel: "Apr 2026",
      },
    },
    {
      id: "smart-midi-recorder",
      type: "external",
      title: "Smart MIDI Recorder",
      description:
        "Record MIDI keyboard input with musical context — key, scale, and suggested next notes displayed in real time to guide improvisation.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Music",
      status: "operational",
      url: "https://music.nickeltools.dev/smart-midi-recorder/",
      openInNewTab: true,
      dateAdded: "2026-04-17",
      featured: false,
      tags: ["music", "midi", "improv", "piano", "interactive"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: 'I play piano and wanted a tool that would help me improvise more confidently by surfacing the "right" notes for the key I\'m in, while still capturing what I was playing.',
        tech: ["JavaScript", "Web Audio API", "HTML", "CSS"],
        tags: ["Music Theory Algorithms", "Interactive Design", "Real-time"],
        frontendSource: "https://github.com/nick5616/song-visualizer",
        dateLabel: "Apr 2026",
      },
    },
    {
      id: "batch-analyzer",
      type: "external",
      title: "Batch Analyzer",
      description:
        "Batch analyze product images by sending the same queries (like 'How many books are in the image?') to each image in the batch. Plug and play with your own LLM.",
      thumbnail: "/project-screenshots/latex.png", // Placeholder
      category: "AI / Productivity",
      status: "operational",
      url: "https://batch-analyzer.netlify.app/",
      openInNewTab: true,
      dateAdded: "2024-01-15",
      featured: false,
      tags: ["ai", "image-analysis", "batch-processing", "llm"],
      hasContentfulDescription: true,
      contentfulDescription: BatchAnalyzerDescription,
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "While working on product analysis tasks, I found myself repeatedly asking the same questions about different images. This tool automates that workflow, allowing teams to analyze entire product catalogs efficiently with custom LLM integrations.",
        tech: ["TypeScript", "React", "LLM APIs"],
        tags: ["Image Processing", "Batch Processing"],
        frontendSource: "https://github.com/nick5616/batch-item-analyzer",
        dateLabel: "Dec 2025",
      },
    },
    {
      id: "the-circle",
      type: "external",
      title: "The Circle",
      description:
        "A single persistent global room where up to 8 people can be on camera and mic at once via WebRTC mesh. Everyone else joins as audience. No accounts, no room codes, no database.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Social Tools",
      status: "operational",
      url: "https://live.saucedog.art/",
      openInNewTab: true,
      dateAdded: "2026-04-01",
      featured: false,
      tags: ["webrtc", "real-time", "video", "social"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted to build something that felt genuinely real-time — not just a chat box but actual live video between strangers. Wiring together WebRTC peer connections, Django Channels signaling, and Redis-backed room state from scratch was the challenge. Note: visit the site directly — it won't work embedded in an iframe.",
        tech: [
          "React",
          "TypeScript",
          "Django",
          "WebSockets",
          "WebRTC",
          "Redis",
          "Docker",
        ],
        tags: ["Real-time", "Web Development"],
        frontendSource: "https://github.com/nick5616/the-circle",
        backendSource: "https://github.com/nick5616/the-circle",
        dateLabel: "Apr 2026",
      },
    },
    {
      id: "nickel-tools",
      type: "external",
      title: "Nickel Tools",
      description:
        "A browser-based desktop OS experience with a swipeable mobile mode, app grid, app tray, and full-screen app windows.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Engineering",
      status: "operational",
      url: "https://nickeltools.dev/desktop",
      openInNewTab: true,
      dateAdded: "2025-11-01",
      featured: false,
      tags: ["next.js", "react", "typescript"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: 'I wanted a website that was "a website of websites" so I could/can give any little web thing I build a home 💖 I also wanted somewhere to put my art. A desktop OS seemed like the perfect container since the average users can explore apps within a desktop OS.',
        tech: ["TypeScript", "React", "Next.js"],
        tags: ["Interactive Design"],
        frontendSource: "https://github.com/nick5616/nickel-tools",
        dateLabel: "Nov 2025",
      },
    },
    {
      id: "sw-viz",
      type: "external",
      title: "Star Wars Ship Costs Visualizer",
      description:
        "Interactive data visualization of Star Wars starship costs from the SWAPI dataset. Explore and compare iconic ships from X-wings to Star Destroyers.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Experiments",
      status: "operational",
      url: "https://star-wars-spending-viz.netlify.app",
      openInNewTab: true,
      dateAdded: "2023-11-01",
      featured: false,
      tags: ["data-viz", "star-wars", "react", "nivo"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "A fun excuse to combine a beloved universe with data viz. Pulling from the Star Wars API and rendering comparative cost breakdowns made for a satisfying mix of frontend charting work and backend data wrangling.",
        tech: ["React", "TypeScript", "Nivo", "Nest.js", "Node.js"],
        tags: ["Data Visualization", "Web Development"],
        frontendSource: "https://github.com/nick5616/sw-viz-fe",
        backendSource: "https://github.com/nick5616/sw-viz-be",
        dateLabel: "Nov 2023",
      },
    },
    {
      id: "voice-lab",
      type: "external",
      title: "VoiceLab",
      description:
        "Python desktop app for singers to track and analyze vocal performance across takes. Measures pitch, resonance, weight, brightness, and consistency.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Machine Learning",
      status: "operational",
      url: "https://github.com/nick5616/VoiceLab",
      openInNewTab: true,
      dateAdded: "2025-12-01",
      featured: false,
      tags: ["python", "audio", "ml", "music"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted objective feedback on my singing practice rather than relying purely on ear. Tracking metrics across takes makes it easy to see what's actually improving.",
        tech: ["Python"],
        tags: ["Machine Learning"],
        frontendSource: "https://github.com/nick5616/VoiceLab",
        dateLabel: "Dec 2025",
      },
    },
    {
      id: "art-room",
      type: "external",
      title: "Art Room",
      description:
        "A 3D art gallery room inside the holodeck where paintings are displayed on walls you can approach and step back from.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://nicolebelovoskey.com/holodeck/art",
      openInNewTab: true,
      dateAdded: "2026-02-01",
      featured: false,
      tags: ["three.js", "webgl", "art", "3d"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted a way to display 2D art in a spatial context — mounting pieces on walls you can approach and step back from changes how you experience them compared to a flat grid.",
        tech: [
          "TypeScript",
          "React",
          "Three.js",
          "React-Three-Fiber",
          "WebGL",
          "Go",
          "Google Cloud Storage",
          "Docker",
        ],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/3d-portfolio-website",
        backendSource: "https://github.com/nick5616/holodeck-art-api",
        dateLabel: "Feb 2026",
      },
    },
    {
      id: "courage-computer",
      type: "external",
      title: "Courage Computer Room",
      description:
        "An interactive 3D retro computer lab environment inside the holodeck. Inspired by the aesthetic of early personal computing and Courage the Cowardly Dog.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://nicolebelovoskey.com/holodeck/courage-the-cowardly-dog",
      openInNewTab: true,
      dateAdded: "2025-11-01",
      featured: false,
      tags: ["three.js", "webgl", "interactive", "3d"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted to capture the feeling of a classic computer room as an inhabitable space. It was a chance to blend 3D environmental storytelling with web technology in a way that feels nostalgic and playful.",
        tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/3d-portfolio-website",
        dateLabel: "Nov 2025",
      },
    },
    {
      id: "math-room",
      type: "external",
      title: "Math Room",
      description:
        "An immersive 3D room for mathematical visualization — equations, shapes, and concepts brought to life as explorable objects inside the holodeck.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://nicolebelovoskey.com/holodeck/math",
      openInNewTab: true,
      dateAdded: "2025-01-01",
      featured: false,
      tags: ["three.js", "webgl", "math", "3d"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "Math is inherently spatial and I wanted to explore what it looks like to present mathematical ideas as environments rather than notation on a page.",
        tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/3d-portfolio-website",
        dateLabel: "Jan 2025",
      },
    },
    {
      id: "art-museum",
      type: "external",
      title: "Art Museum",
      description:
        "A large-scale 3D museum experience inside the holodeck — a multi-room virtual gallery housing a curated collection you can browse at your own pace.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://nicolebelovoskey.com/art-gallery",
      openInNewTab: true,
      dateAdded: "2025-01-01",
      featured: false,
      tags: ["three.js", "webgl", "art", "3d"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "Scaling up from the art room into a full museum allowed me to think about wayfinding, pacing, and spatial narrative at a larger architectural scale — all within the browser.",
        tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/3d-portfolio-website",
        dateLabel: "Jan 2025",
      },
    },
    {
      id: "software-showroom",
      type: "external",
      title: "Software Showroom",
      description:
        "Walk up to screens in a 3D environment and interact with my projects. Press escape for your cursor.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://nicolebelovoskey.com/software",
      openInNewTab: true,
      dateAdded: "2025-01-01",
      featured: false,
      tags: ["three.js", "webgl", "portfolio", "3d"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "It seemed like a really sci-fi way to showcase my projects.",
        tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/3d-portfolio-website",
        dateLabel: "Jan 2025",
      },
    },
    {
      id: "sre-dashboard",
      type: "external",
      title: "SRE Dashboard",
      description:
        "SRE dashboard for monitoring services, incidents, and logs. Python/Flask backend serves hypermedia via HTMX, frontend built with Lit web components.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Engineering",
      status: "operational",
      url: "https://sre.nickeltools.dev",
      openInNewTab: true,
      dateAdded: "2025-09-01",
      featured: false,
      tags: ["python", "flask", "htmx", "lit", "sre"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted to explore a stack that leans into the platform instead of abstracting away from it. HTMX lets the server own state and return HTML fragments directly, cutting out a lot of client-side complexity. Lit is what web components always should have been — lightweight, declarative, and framework-agnostic. I don't think enough people know how powerful the native component model has become.",
        tech: ["Python", "Lit", "HTMX", "Flask"],
        tags: ["SRE", "Dashboard"],
        frontendSource: "https://github.com/nick5616/lit-htmxperiments",
        dateLabel: "Sep 2025",
      },
    },
    {
      id: "sphere-website",
      type: "external",
      title: "Sphere Website",
      description:
        "A vanilla Three.js website built around a rotating 3D sphere — the hello world of 3D web graphics.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Immersive Web",
      status: "operational",
      url: "https://tiny-sorbet-aefcf4.netlify.app/",
      openInNewTab: true,
      dateAdded: "2023-11-01",
      featured: false,
      tags: ["three.js", "webgl", "javascript"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted to get my hands dirty with Three.js and WebGL for the first time. A sphere is the hello world of 3D.",
        tech: ["JavaScript", "Three.js", "WebGL"],
        tags: ["3D Design", "Interactive Design"],
        frontendSource: "https://github.com/nick5616/sphere-website",
        dateLabel: "Nov 2023",
      },
    },
    {
      id: "boards",
      type: "external",
      title: "Boards",
      description: "boards.saucedog.art",
      thumbnail: "/project-screenshots/latex.png",
      category: "Experiments",
      status: "operational",
      url: "https://boards.saucedog.art",
      openInNewTab: true,
      dateAdded: "2026-05-01",
      featured: false,
      tags: [],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "",
        tech: [],
        tags: [],
        frontendSource: "https://github.com/nick5616/boards",
      },
    },
    {
      id: "wizard-wars",
      type: "external",
      title: "Wizard Wars",
      description: "wizardwars.saucedog.art",
      thumbnail: "/project-screenshots/latex.png",
      category: "Games",
      status: "operational",
      url: "https://wizardwars.saucedog.art",
      openInNewTab: true,
      dateAdded: "2026-05-01",
      featured: false,
      tags: [],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "",
        tech: [],
        tags: [],
        frontendSource: "https://github.com/nick5616/wizard-wars",
      },
    },
    {
      id: "new-media-website",
      type: "external",
      title: "New Media Class Website",
      description:
        "My first real website — a 2019 college class assignment exploring what kinds of media I consume and polling classmates on the same.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Experiments",
      status: "operational",
      url: "https://new-media-college-class.netlify.app/",
      openInNewTab: true,
      dateAdded: "2019-10-01",
      featured: false,
      tags: ["html", "css", "javascript"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "It was a class assignment, but it was also genuinely my first real website. Everyone starts somewhere.",
        tech: ["HTML", "CSS", "JavaScript"],
        frontendSource: "https://github.com/nick5616/newMediaWebsite",
        dateLabel: "Oct 2019",
      },
    },
    {
      id: "routine",
      type: "external",
      title: "Routine",
      description:
        "An accessible online routine with dynamic generation of WCAG AAA compliant analogous color schemes.",
      thumbnail: "/project-screenshots/latex.png",
      category: "Design System",
      status: "operational",
      url: "http://nick5616.github.io/routine",
      openInNewTab: true,
      dateAdded: "2020-03-01",
      featured: false,
      tags: ["accessibility", "color-theory", "javascript"],
      surfaces: ["desktop", "software-portfolio"],
      portfolio: {
        why: "I wanted to explore algorithmic color theory while building something genuinely useful — a routine tool that generates harmonious, fully accessible palettes on the fly.",
        tech: ["JavaScript"],
        tags: ["Design System", "Accessibility"],
        frontendSource: "https://github.com/nick5616/routine",
        dateLabel: "Mar 2020",
      },
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

// The single place every portfolio/desktop page should pull its project list
// from — filter by which surface is rendering, instead of keeping a
// page-local copy of the array.
export function getContentBySurface(surface: Surface): Content[] {
  return NICKEL_SYSTEM.content.filter((item) =>
    item.surfaces.includes(surface)
  );
}
