import React from "react";
import { BatchAnalyzerDescription } from "@/components/descriptions/BatchAnalyzerDescription";

import type {
  Category,
  Medium,
  PortfolioSurface,
  Status,
  Surface,
  Tag,
  Technology,
} from "./taxonomy";

// Vocabularies live in taxonomy.ts; re-exported so pages can import from here.
export * from "./taxonomy";

// Core content types
export type ContentType = "external" | "internal" | "media" | "collection";

// ---------------------------------------------------------------------------
// Authoring shape — what you write in NICKEL_SYSTEM.content below
// ---------------------------------------------------------------------------

// Metadata every surface reads. Write it once on the entry; to change any of
// it for a single surface, set the same key inside that surface's override
// (e.g. `designOverride: { description: "..." }`).
export interface ProjectDetails {
  title: string;
  description: string;
  category: Category;
  status?: Status; // defaults to "operational"
  date?: string; // "YYYY-MM" or "YYYY-MM-DD" (sortable); any other text is shown verbatim
  thumbnail?: string;
  why?: string;
  tech?: Technology[];
  mediums?: Medium[]; // art materials/techniques
  tags?: Tag[];
  source?: string; // repo link (the frontend one, if there are two)
  backendSource?: string;
}

// Settings only the desktop/mobile OS uses.
export interface DesktopOnly {
  title?: string; // replaces the entry title on the desktop only
  openInNewTab?: boolean; // external links only; defaults to true
  windowWidth?: number;
  windowHeight?: number;
  contentfulDescription?: ContentfulDescriptionComponent; // React component shown in the window's info modal
}

// Settings only the portfolio pages use.
export interface PortfolioOnly {
  // Software portfolio preview. Default: one desktop-sized iframe (or the 3D
  // frame for holodeck/sphere URLs). "none" hides it; mobileScreens shows
  // side-by-side phone iframes of the given URLs.
  preview?: "none" | { mobileScreens: string[] };
  artGrouping?: "primary" | "collection"; // art portfolio section; defaults to "primary"
}

type EntryLink =
  | { url: string; route?: never }
  | { route: string; url?: never };

export type ContentEntry = ProjectDetails &
  EntryLink & {
    id: string;
    surfaces: Surface[];
    desktopOnly?: DesktopOnly;
    portfolioOnly?: PortfolioOnly;
    desktopOverride?: Partial<ProjectDetails>;
    softwareOverride?: Partial<ProjectDetails>;
    designOverride?: Partial<ProjectDetails>;
    artOverride?: Partial<ProjectDetails>;
  };

// ---------------------------------------------------------------------------
// Resolved shapes — what the pages and components receive
// ---------------------------------------------------------------------------

interface BaseContent {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: Category;
  status: Status;
  date?: string;
  featured?: boolean;
  why?: string;
  tech?: Technology[];
  mediums?: Medium[];
  tags?: Tag[];
  source?: string;
  backendSource?: string;
  hasContentfulDescription?: boolean; // If true, modal shows React component instead of description
  contentfulDescription?: ContentfulDescriptionComponent; // React component to render in modal
}

export interface ExternalLink extends BaseContent {
  type: "external";
  url: string;
  openInNewTab: boolean;
}

export interface InternalApp extends BaseContent {
  type: "internal";
  route: string; // Next.js route
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

export interface PortfolioProject extends Omit<
  ProjectDetails,
  "status" | "tech" | "mediums" | "tags"
> {
  id: string;
  status: Status;
  tech: Technology[];
  mediums: Medium[];
  tags: Tag[];
  url?: string;
  route?: string;
  preview?: PortfolioOnly["preview"];
  artGrouping: NonNullable<PortfolioOnly["artGrouping"]>;
}

export interface NickelSystem {
  version: string;
  content: ContentEntry[];
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
// and for the software, design, and art portfolio pages. Every project lives
// here exactly once; `surfaces` says which page(s) render it.
export const NICKEL_SYSTEM: NickelSystem = {
  version: "1.0.0",
  content: [
    {
      id: "portfolio",
      title: "nicolebelovoskey.com",
      description:
        "Immersive first-person art and software engineering portfolio, with interactive games and experiences thrown in for fun. Built in Three.js.",
      url: "https://nicolebelovoskey.com",
      category: "Immersive Web",
      date: "2025-01",
      thumbnail: "/project-screenshots/3dportfolio.png",
      why: "I wanted to create a portfolio that was more than just a collection of links. The first-person 3D experience makes exploring my work feel like an adventure, and it showcases both my technical skills and creative vision in one cohesive experience.",
      tech: [
        "Three.js",
        "WebGL",
        "React-Three-Fiber",
        "TypeScript",
        "JavaScript",
        "Go",
        "Google Cloud Platform",
      ],
      tags: ["3D Design", "Interactive Design"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software", "design"],
      softwareOverride: {
        title: "Nicole's World",
        description:
          "I made a first person 3D environment on the web, where the user can walk around, sprint, jump, collect gems, view my art in a digital upscale museum, see my software projects as if they are physically walking up to them, draw a picture and submit it, with the potential to see it hung up on the wall, interact with an omnipotent and deriding computer from the cartoon 'Courage the Cowardly Dog', Relax in a tranquil forest, or practice multiplication in a 3D adaptation of 'Meteor Multiplication'.",
        why: "I wanted this website to feel like a place you could inhabit rather than a page you scroll. Building a fully explorable 3D world pushed my skills across graphics programming, spatial UX, and browser performance. It was fun. Also I wanted it to exist. Isn't that reason enough?",
        tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      },
    },
    {
      id: "friendex",
      title: "Friendex",
      description:
        "A pokédex for your friends. A zany mobile-first social app that lets you collect and organize information about the people in your life. Built with a focus on delightful mobile interactions and intuitive navigation.",
      url: "https://friendex.online",
      category: "Social Tools",
      date: "2025-10",
      thumbnail: "/project-screenshots/friendex.png",
      why: "I created Friendex because I wanted a fun, gamified way to remember details about friends. The pokédex metaphor makes it engaging, and the mobile-first design ensures it's social",
      tech: ["TypeScript", "React", "Firebase Auth"],
      tags: ["Mobile-First", "Social App", "Web Development", "Responsive UI"],
      source: "https://github.com/nick5616/friendex",
      surfaces: ["desktop", "software", "design"],
      portfolioOnly: {
        preview: {
          mobileScreens: [
            "https://friendex.online/",
            "https://friendex.online/demo",
          ],
        },
      },
    },
    {
      id: "videogamequest",
      title: "RPG Quests",
      description:
        "Convert journal entries into video game quests, and live your life like an RPG.",
      url: "https://rpg-quests.netlify.app/",
      category: "AI / Productivity",
      date: "2025-06",
      thumbnail: "/project-screenshots/videogamequest.png",
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
      surfaces: ["desktop", "software"],
      portfolioOnly: {
        preview: {
          mobileScreens: [
            "https://videogamequest.me/",
            "https://videogamequest.me/demo",
          ],
        },
      },
    },
    {
      id: "tierlistify",
      title: "tierlistify",
      description:
        "Rank anything, optimized for your phone. I built it because I thought the Tiermaker mobile site could use some improvement.",
      url: "https://tierlistify.com",
      category: "Social App",
      date: "2025-09",
      thumbnail: "/project-screenshots/tierlistifytierlist.png",
      why: "I built tierlistify because I was frustrated with how poorly existing tier list tools worked on mobile. I wanted to create something that felt native to touch interfaces, with smooth drag-and-drop interactions and a clean, focused UI.",
      tech: ["TypeScript", "React"],
      tags: [
        "Mobile UX",
        "Touch Interactions",
        "Drag & Drop",
        "Progressive Web App",
      ],
      source: "https://github.com/nick5616/tierlistify",
      surfaces: ["desktop", "software", "design"],
      portfolioOnly: {
        preview: {
          mobileScreens: [
            "https://tierlistify.com/init",
            "https://tierlistify.com/creation/1776295779582",
          ],
        },
      },
    },
    {
      id: "resume-builder",
      title: "Online LaTeX Resume Builder",
      description: "WASM-powered LaTeX compiler. Zero config, total privacy.",
      route: "/resume-editor",
      category: "Engineering",
      date: "2023-06",
      thumbnail: "/project-screenshots/latex.png",
      tech: ["LaTeX", "WebAssembly"],
      surfaces: ["desktop"],
    },
    {
      id: "color-engine",
      title: "Advanced Color Scheme Generator",
      description:
        "Algorithmic palette generator based on harmonic color theory. Generate and export theme JSON.",
      route: "/advanced-color-scheme-generator",
      category: "Design System",
      why: "I built this because I was tired of manually creating color palettes and wanted a tool that could generate harmonious color schemes based on established color theory principles. It's particularly useful for creating accessible, visually pleasing design systems with proper contrast ratios.",
      tech: ["TypeScript", "React", "Canvas API", "Next.js"],
      tags: ["Color Theory Algorithms"],
      surfaces: ["desktop", "design"],
      desktopOnly: { windowHeight: 700 },
    },
    {
      id: "choice-engine",
      title: "Choice Picker",
      description:
        "Spin the wheel to make decisions! Add your options and let chance decide.",
      route: "/choice-picker",
      category: "Utility",
      surfaces: ["desktop"],
    },
    {
      id: "passionfruit",
      title: "Passionfruit",
      description:
        "Conveniently track and understand all the projects you are working on",
      url: "https://yieldpassionfruit.netlify.app",
      category: "Creative Productivity",
      date: "2025-11",
      thumbnail: "/project-screenshots/passionfruit.png",
      why: "I have a lot of infrequent hobbies that I like to switch between. I noticed I was feeling overwhelmed by all the projects I was working on, so I built Passionfruit to help me keep track of them in a way that wouldn't stifle my creativity.",
      tech: ["TypeScript", "React"],
      tags: ["Project Management", "Productivity Tools"],
      source: "https://github.com/nick5616/universe",
      surfaces: ["desktop", "software"],
    },
    {
      id: "life-graph",
      title: "Life Network",
      description:
        "A 3D visualization of your life's goals, prioritization, and dependencies",
      url: "https://yieldpassionfruit.netlify.app/life-graph",
      category: "Creative Productivity",
      date: "2026-03",
      why: "I wanted to model relationships between my goals and their prerequisites, and how my goals are related to each other. I've made it generic so you can use it for your own goals. It's intended to include basic foundational behaviors like sleeping and eating well, since that's how you're at your best.",
      tech: ["TypeScript", "React", "Three.js", "WebGL"],
      tags: ["AI Integration", "3D Design", "Interactive Design"],
      source:
        "https://github.com/nick5616/universe/blob/main/src/pages/LifeGraphPage.tsx",
      surfaces: ["desktop", "software"],
      desktopOnly: { openInNewTab: false },
    },
    {
      id: "smart-piano",
      title: "Smart Piano",
      description:
        "An online piano that uses the key you're in and the musical context to suggest the next notes to play",
      route: "/smart-piano",
      category: "Music",
      date: "2025-11",
      thumbnail: "/project-screenshots/smartpiano.png",
      why: "I wanted to create a tool that helps people learn music theory through play. Instead of just showing scales or chords, Smart Piano provides real-time musical guidance, making it easier to create pleasing melodies even if you're not an expert musician.",
      tech: ["TypeScript", "React", "Web Audio API", "Next.js"],
      tags: ["Music Theory Algorithms"],
      source: "https://github.com/nick5616/nickel-tools",
      surfaces: ["desktop", "software"],
      desktopOnly: { windowWidth: 1400 },
    },
    {
      id: "saucedog-art",
      title: "saucedog.art",
      description:
        "My art portfolio from 2022-2023. A collection of digital art, illustrations, and creative projects.",
      url: "https://saucedog.art",
      category: "Art",
      date: "2023-02",
      thumbnail: "/project-screenshots/oldartportfolio.png",
      why: "I created saucedog.art as a dedicated space to showcase my digital art work. It represents a period of intense creative exploration where I was learning new techniques, developing my style, and creating pieces that combined my interests in technology and art.",
      mediums: [
        "Digital Art",
        "Illustration",
        "Character Design",
        "Visual Storytelling",
      ],
      tags: ["Portfolio"],
      surfaces: ["desktop", "art"],
      artOverride: {
        description:
          "My digital art portfolio from 2022-2023, featuring a collection of digital illustrations, character designs, and creative experiments. A showcase of my journey exploring digital art and visual storytelling.",
      },
    },
    {
      id: "brains-games-gauntlet",
      title: "Brains Games Gauntlet",
      description:
        "A series of games designed to improve mental math, working memory, creativity, etc",
      route: "#",
      category: "Education",
      status: "in-development",
      tags: ["Brain Training"],
      surfaces: ["desktop"],
    },
    {
      id: "plasma-sphere",
      title: "Plasma Sphere",
      description:
        "Like that one toy. Hold click and drag on the ball to attract the electricity! Desktop and mobile.",
      url: "https://sphere.saucedog.art",
      category: "Experiments",
      date: "2026-04",
      why: "I absolutely adore electricity and wanted to create a 3D environment that allows you to play with it. I've been fascinated with physical phenomena like electricity and magnetism, and how the basis of computers is manipulating an electron using a difference in electromagnetic force to make a transistor, which can be used to make logic gates, which can be used to make circuits, which can be used to make arithmetic logic units. With the inclusion of a clock and memory, you can create an entire computer architecture. On the newly formed computer, you can run programs directly on the hardware (baremetal) using binary instructions written for that computer architecture, or you could write a hardware abstraction layer that transpiles a common higher level language like assembly into the language the computer speaks. You can also write a language that's more readable to coders, that compiles into assembly, which is then translated into instructions for your computer! Using that higher level language, developers can move quickly and develop operating systems for a computer. Operating systems make it easier to write programs for  the computer, because they handle the allocation of computer resources (they talk to the computer so your program doesn't have to worry about that). They also provide the illusion of isolation, meaning a software program written for an OS does not know other programs exist, and doesn't need to worry about playing nice with the hundreds of other applications running on the computer. The browser is a program on the OS. And this website is written for the browser! And it's all powered by 100 billion electrons jumping from one side of a microscopic germanium-doped silicon trough to the other.",
      tech: ["JavaScript", "Three.js", "WebGL"],
      tags: ["3D Design", "Interactive Design"],
      source: "https://github.com/nick5616/plasma-sphere",
      surfaces: ["desktop", "software"],
      desktopOnly: { openInNewTab: false },
    },
    {
      id: "chaos",
      title: "CHAOS",
      description:
        "Counter-Strike Highlight Analysis and Organization System. A tool that batch processes video game footage and filters noteworthy in-game moments using machine learning (OCR, Speech-To-Text) (Desktop app on hiatus).",
      url: "https://github.com/nick5616/CHAOS",
      category: "Machine Learning",
      date: "2025-10",
      thumbnail: "/project-screenshots/chaos.png",
      why: "As a Counter-Strike player, I wanted to automatically find and organize my best plays from hours of gameplay footage. Manually scrubbing through videos is tedious, so I built CHAOS to use ML to detect kills, callouts, and other significant moments automatically.",
      tech: ["Python"],
      tags: [
        "Machine Learning",
        "OCR",
        "Speech-to-Text",
        "Video Processing",
        "Computer Vision",
      ],
      source: "https://github.com/nick5616/CHAOS",
      surfaces: ["desktop", "software"],
      portfolioOnly: { preview: "none" },
    },
    // System windows
    {
      id: "about",
      title: "About Nickel OS",
      description: "System information and bio",
      route: "/about",
      category: "Utility",
      surfaces: ["desktop"],
    },
    {
      id: "contact",
      title: "Contact",
      description: "Get in touch",
      route: "/contact",
      category: "Utility",
      surfaces: ["desktop"],
    },
    {
      id: "settings",
      title: "Settings",
      description: "System preferences and customization",
      route: "/settings",
      category: "Utility",
      surfaces: ["desktop"],
      desktopOnly: { windowHeight: 700 },
    },
    // Art galleries
    {
      id: "art-digital-art",
      title: "Digital Art",
      description: "Gallery of digital artwork",
      route: "/art-gallery/digital-art",
      category: "Art",
      why: "I wanted to create a dedicated space for my digital art pieces, separate from other mediums. Digital art allows for experimentation with color, composition, and style in ways that traditional media can't always achieve.",
      mediums: [
        "Digital Illustration",
        "Procreate",
        "Photoshop",
        "Digital Painting",
      ],
      surfaces: ["desktop", "art"],
      artOverride: {
        title: "Digital Art Gallery",
        description:
          "A curated collection of digital artwork created using various tools and techniques. From detailed illustrations to abstract compositions, this gallery showcases the breadth of my digital art practice.",
      },
    },
    {
      id: "art-paintings",
      title: "Paintings",
      description: "Gallery of paintings",
      route: "/art-gallery/paintings",
      category: "Art",
      why: "Working with physical paint and canvas provides a different creative experience than digital art. These paintings capture moments of experimentation with color, texture, and form in a more traditional medium.",
      mediums: ["Acrylic Paint", "Watercolor", "Traditional Media", "Canvas"],
      surfaces: ["desktop", "art"],
      artOverride: {
        description:
          "Traditional paintings created with acrylics, watercolors, and other physical media. This collection represents my work with traditional art forms and the tactile experience of working with physical materials.",
      },
    },
    {
      id: "art-sketches",
      title: "Sketches",
      description: "Gallery of sketches",
      route: "/art-gallery/sketches",
      category: "Art",
      why: "Sketches are where ideas start. I keep this collection to show the process behind finished pieces and to celebrate the value of quick, experimental work. Sometimes the best ideas come from these loose, unpolished drawings.",
      mediums: ["Pencil", "Pen & Ink", "Charcoal", "Sketching"],
      surfaces: ["desktop", "art"],
      artOverride: {
        description:
          "A collection of sketches, studies, and quick drawings. These pieces represent the foundation of my art practice—the raw ideas, experiments, and practice that inform my finished work.",
      },
    },
    {
      id: "art-lefthanded",
      title: "Left-Handed Art",
      description: "Art created only using my left hand",
      route: "/art-gallery/lefthanded",
      category: "Art",
      surfaces: ["desktop", "art"],
      portfolioOnly: { artGrouping: "collection" },
      artOverride: {
        description:
          "A unique collection of artwork created exclusively using my left hand. This constraint-based project explores how limitations can lead to creative breakthroughs and new artistic expressions.",
      },
    },
    {
      id: "art-miscellaneous",
      title: "Miscellaneous",
      description: "A collection of miscellaneous artwork and creative pieces",
      route: "/art-gallery/miscellaneous",
      category: "Art",
      surfaces: ["desktop", "art"],
      desktopOnly: { windowHeight: 700 },
      portfolioOnly: { artGrouping: "collection" },
      artOverride: {
        description:
          "A collection of miscellaneous artwork and creative pieces that don't fit into other categories—experiments, one-offs, and creative explorations.",
      },
    },
    {
      id: "art-notesappart",
      title: "Notes App Art",
      description: "Art created in note-taking apps and other digital tools",
      route: "/art-gallery/notesappart",
      category: "Art",
      surfaces: ["desktop", "art"],
      portfolioOnly: { artGrouping: "collection" },
      artOverride: {
        description:
          "Art created in note-taking apps and other digital tools not typically used for art. These pieces embrace the limitations and unique qualities of these platforms.",
      },
    },
    {
      id: "pokemon-or-technology",
      title: "Pokemon or Technology",
      description:
        "Test your knowledge! Can you tell the difference between a Pokémon name and a technology term?",
      route: "/pokemon-or-technology",
      category: "Games",
      date: "2025-10",
      why: "One day I observed Pokemon and Technology have similar sounding names, so I made this quiz game.",
      tech: ["TypeScript", "React", "Next.js"],
      tags: ["Quiz"],
      surfaces: ["desktop", "software"],
      desktopOnly: { windowWidth: 300, windowHeight: 400 },
      softwareOverride: { date: "Sometime in like Oct 2025" },
    },
    {
      id: "audio-to-midi",
      title: "Audio → MIDI",
      description:
        "Convert audio to MIDI using the YIN pitch detection algorithm. Drop in a WAV or MP3, tune BPM and quantization, then download the MIDI file.",
      route: "/audio-to-midi",
      category: "Music",
      date: "2026-04-16",
      tags: ["Audio Processing", "Pitch Detection", "MIDI"],
      surfaces: ["desktop"],
      desktopOnly: { windowWidth: 720, windowHeight: 800 },
    },
    {
      id: "song-visualizer",
      title: "Song Visualizer",
      description:
        "Visualize music as animated particles, waveforms, geometry, and spectrum effects. Upload an MP3 or connect a mic for real-time visuals with customizable color, speed, and intensity.",
      url: "https://music.nickeltools.dev/song-visualizer/",
      category: "Music",
      date: "2026-04",
      why: "I wanted a way to see my music, not just hear it. Building real-time audio visualization in the browser with the Web Audio API and Canvas was a satisfying way to connect the sonic and the visual.",
      tech: ["JavaScript", "Web Audio API", "Canvas API", "HTML", "CSS"],
      tags: ["Music Theory Algorithms", "Interactive Design"],
      source: "https://github.com/nick5616/song-visualizer",
      surfaces: ["desktop", "software"],
    },
    {
      id: "pitch-hero",
      title: "Pitch Hero",
      description:
        "Sing or play a MIDI keyboard to match scrolling notes as they cross the target line. Trains pitch accuracy with real-time microphone or MIDI input scoring.",
      url: "https://music.nickeltools.dev/pitch-hero/",
      category: "Music",
      date: "2026-04",
      why: "I wanted an interactive way to train pitch accuracy that felt more like a game than an exercise. Building the pitch detection and scrolling note renderer from scratch was a great deep-dive into the Web Audio API.",
      tech: ["JavaScript", "Web Audio API", "Canvas API", "HTML", "CSS"],
      tags: [
        "Music Theory Algorithms",
        "Interactive Design",
        "Real-time",
        "MIDI",
      ],
      source: "https://github.com/nick5616/song-visualizer",
      surfaces: ["desktop", "software"],
    },
    {
      id: "smart-midi-recorder",
      title: "Smart MIDI Recorder",
      description:
        "Record MIDI keyboard input with musical context — key, scale, and suggested next notes displayed in real time to guide improvisation.",
      url: "https://music.nickeltools.dev/smart-midi-recorder/",
      category: "Music",
      date: "2026-04",
      why: 'I play piano and wanted a tool that would help me improvise more confidently by surfacing the "right" notes for the key I\'m in, while still capturing what I was playing.',
      tech: ["JavaScript", "Web Audio API", "HTML", "CSS"],
      tags: [
        "Music Theory Algorithms",
        "Interactive Design",
        "Real-time",
        "MIDI",
      ],
      source: "https://github.com/nick5616/song-visualizer",
      surfaces: ["desktop", "software"],
    },
    {
      id: "batch-analyzer",
      title: "Batch Analyzer",
      description:
        "Batch analyze product images by sending the same queries (like 'How many books are in the image?') to each image in the batch. Plug and play with your own LLM.",
      url: "https://batch-analyzer.netlify.app/",
      category: "AI / Productivity",
      date: "2025-12",
      why: "While working on product analysis tasks, I found myself repeatedly asking the same questions about different images. This tool automates that workflow, allowing teams to analyze entire product catalogs efficiently with custom LLM integrations.",
      tech: ["TypeScript", "React", "LLM APIs"],
      tags: ["Image Processing", "Batch Processing"],
      source: "https://github.com/nick5616/batch-item-analyzer",
      surfaces: ["desktop", "software"],
      desktopOnly: { contentfulDescription: BatchAnalyzerDescription },
    },
    {
      id: "the-circle",
      title: "The Circle",
      description:
        "A single persistent global room where up to 8 people can be on camera and mic at once via WebRTC mesh. Everyone else joins as audience. No accounts, no room codes, no database.",
      url: "https://live.saucedog.art/",
      category: "Social Tools",
      date: "2026-04",
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
      source: "https://github.com/nick5616/the-circle",
      surfaces: ["desktop", "software"],
      portfolioOnly: { preview: "none" },
    },
    {
      id: "wizard-wars",
      title: "Wizard Wars",
      description:
        "A 3D multiplayer wizard FPS (first person shooter) game on the web. You don't need to download anything to play!",
      url: "https://wizardwars.saucedog.art",
      category: "Games",
      date: "2026-05",
      tech: ["WebRTC", "Three.js", "React", "React-Three-Fiber"],
      source: "https://github.com/nick5616/wizard-wars",
      surfaces: ["desktop", "software"],
    },
    {
      id: "nickel-tools",
      title: "Nickel Tools",
      description:
        "A browser-based desktop OS experience with a swipeable mobile mode, app grid, app tray, and full-screen app windows.",
      url: "https://nickeltools.dev/desktop",
      category: "Engineering",
      date: "2025-11",
      why: 'I wanted a website that was "a website of websites" so I could/can give any little web thing I build a home 💖 I also wanted somewhere to put my art. A desktop OS seemed like the perfect container since the average users can explore apps within a desktop OS.',
      tech: ["TypeScript", "React", "Next.js"],
      tags: ["Interactive Design"],
      source: "https://github.com/nick5616/nickel-tools",
      surfaces: ["desktop", "software"],
      desktopOnly: { title: "Nickel Tools (INCEPTION!!!)" },
    },
    {
      id: "sw-viz",
      title: "Star Wars Ship Costs Visualizer",
      description:
        "Interactive data visualization of Star Wars starship costs from the SWAPI dataset. Explore and compare iconic ships from X-wings to Star Destroyers.",
      url: "https://star-wars-spending-viz.netlify.app",
      category: "Experiments",
      date: "2023-11",
      why: "A fun excuse to combine a beloved universe with data viz. Pulling from the Star Wars API and rendering comparative cost breakdowns made for a satisfying mix of frontend charting work and backend data wrangling.",
      tech: ["React", "TypeScript", "Nivo", "Nest.js", "Node.js"],
      tags: ["Data Visualization", "Web Development"],
      source: "https://github.com/nick5616/sw-viz-fe",
      backendSource: "https://github.com/nick5616/sw-viz-be",
      surfaces: ["desktop", "software"],
    },
    {
      id: "voice-lab",
      title: "VoiceLab",
      description:
        "Python desktop app for singers to track and analyze vocal performance across takes. Measures pitch, resonance, weight, brightness, and consistency.",
      url: "https://github.com/nick5616/VoiceLab",
      category: "Machine Learning",
      date: "2025-12",
      why: "I wanted objective feedback on my singing practice rather than relying purely on ear. Tracking metrics across takes makes it easy to see what's actually improving.",
      tech: ["Python"],
      tags: ["Machine Learning"],
      source: "https://github.com/nick5616/VoiceLab",
      surfaces: ["desktop", "software"],
      portfolioOnly: { preview: "none" },
    },
    {
      id: "art-room",
      title: "Art Room",
      description:
        "A 3D art gallery room inside the holodeck where paintings are displayed on walls you can approach and step back from.",
      url: "https://nicolebelovoskey.com/holodeck/art",
      category: "Immersive Web",
      date: "2026-02",
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
      source: "https://github.com/nick5616/3d-portfolio-website",
      backendSource: "https://github.com/nick5616/holodeck-art-api",
      surfaces: ["desktop", "software"],
    },
    {
      id: "courage-computer",
      title: "Courage Computer Room",
      description:
        "An interactive 3D retro computer lab environment inside the holodeck. Inspired by the aesthetic of early personal computing and Courage the Cowardly Dog.",
      url: "https://nicolebelovoskey.com/holodeck/courage-the-cowardly-dog",
      category: "Immersive Web",
      date: "2025-11",
      why: "I wanted to capture the feeling of a classic computer room as an inhabitable space. It was a chance to blend 3D environmental storytelling with web technology in a way that feels nostalgic and playful.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "math-room",
      title: "Math Room",
      description:
        "An immersive 3D room for mathematical visualization — equations, shapes, and concepts brought to life as explorable objects inside the holodeck.",
      url: "https://nicolebelovoskey.com/holodeck/math",
      category: "Immersive Web",
      date: "2025-01",
      why: "Math is inherently spatial and I wanted to explore what it looks like to present mathematical ideas as environments rather than notation on a page.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "art-museum",
      title: "Art Museum",
      description:
        "A large-scale 3D museum experience inside the holodeck — a multi-room virtual gallery housing a curated collection you can browse at your own pace.",
      url: "https://nicolebelovoskey.com/art-gallery",
      category: "Immersive Web",
      date: "2025-01",
      why: "Scaling up from the art room into a full museum allowed me to think about wayfinding, pacing, and spatial narrative at a larger architectural scale — all within the browser.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "software-showroom",
      title: "Software Showroom",
      description:
        "Walk up to screens in a 3D environment and interact with my projects. Press escape for your cursor.",
      url: "https://nicolebelovoskey.com/software",
      category: "Immersive Web",
      date: "2025-01",
      why: "It seemed like a really sci-fi way to showcase my projects.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "sre-dashboard",
      title: "SRE Dashboard",
      description:
        "SRE dashboard for monitoring services, incidents, and logs. Python/Flask backend serves hypermedia via HTMX, frontend built with Lit web components.",
      url: "https://sre.nickeltools.dev",
      category: "Engineering",
      date: "2025-09",
      why: "I wanted to explore a stack that leans into the platform instead of abstracting away from it. HTMX lets the server own state and return HTML fragments directly, cutting out a lot of client-side complexity. Lit is what web components always should have been — lightweight, declarative, and framework-agnostic. I don't think enough people know how powerful the native component model has become.",
      tech: ["Python", "Lit", "HTMX", "Flask"],
      tags: ["SRE", "Dashboard"],
      source: "https://github.com/nick5616/lit-htmxperiments",
      surfaces: ["desktop", "software"],
    },
    {
      id: "sphere-website",
      title: "Sphere Website",
      description:
        "A vanilla Three.js website built around a rotating 3D sphere — the hello world of 3D web graphics.",
      url: "https://tiny-sorbet-aefcf4.netlify.app/",
      category: "Immersive Web",
      date: "2023-11",
      why: "I wanted to get my hands dirty with Three.js and WebGL for the first time. A sphere is the hello world of 3D.",
      tech: ["JavaScript", "Three.js", "WebGL"],
      tags: ["3D Design", "Interactive Design"],
      source: "https://github.com/nick5616/sphere-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "boards",
      title: "Boards",
      description: "boards.saucedog.art",
      url: "https://boards.saucedog.art",
      category: "Experiments",
      date: "2026-05",
      source: "https://github.com/nick5616/boards",
      surfaces: ["desktop", "software"],
    },
    {
      id: "new-media-website",
      title: "New Media Class Website",
      description:
        "My first real website — a 2019 college class assignment exploring what kinds of media I consume and polling classmates on the same.",
      url: "https://new-media-college-class.netlify.app/",
      category: "Experiments",
      date: "2019-10",
      why: "It was a class assignment, but it was also genuinely my first real website. Everyone starts somewhere.",
      tech: ["HTML", "CSS", "JavaScript"],
      source: "https://github.com/nick5616/newMediaWebsite",
      surfaces: ["desktop", "software"],
    },
    {
      id: "routine",
      title: "Routine",
      description:
        "An accessible online routine with dynamic generation of WCAG AAA compliant analogous color schemes.",
      url: "https://nick5616.github.io/routine/",
      category: "Design System",
      date: "2020-03",
      why: "I wanted to explore algorithmic color theory while building something genuinely useful — a routine tool that generates harmonious, fully accessible palettes on the fly.",
      tech: ["JavaScript"],
      tags: ["Design System", "Accessibility"],
      source: "https://github.com/nick5616/routine",
      surfaces: ["desktop", "software"],
    },
  ],
  featured: ["resume-builder", "smart-piano", "portfolio", "saucedog-art"],
};

// ---------------------------------------------------------------------------
// Resolvers — merge shared fields with the surface's override
// ---------------------------------------------------------------------------

const OVERRIDE_KEY = {
  desktop: "desktopOverride",
  software: "softwareOverride",
  design: "designOverride",
  art: "artOverride",
} as const satisfies Record<Surface, keyof ContentEntry>;

function detailsFor(entry: ContentEntry, surface: Surface): ProjectDetails {
  const {
    title,
    description,
    category,
    status,
    date,
    thumbnail,
    why,
    tech,
    mediums,
    tags,
    source,
    backendSource,
  } = entry;
  return {
    title,
    description,
    category,
    status,
    date,
    thumbnail,
    why,
    tech,
    mediums,
    tags,
    source,
    backendSource,
    ...entry[OVERRIDE_KEY[surface]],
  };
}

function toDesktopContent(entry: ContentEntry): Content {
  const d = detailsFor(entry, "desktop");
  const base = {
    id: entry.id,
    title: entry.desktopOnly?.title ?? d.title,
    description: d.description,
    thumbnail: d.thumbnail,
    category: d.category,
    status: d.status ?? "operational",
    date: d.date,
    featured: NICKEL_SYSTEM.featured.includes(entry.id),
    why: d.why,
    tech: d.tech,
    mediums: d.mediums,
    tags: d.tags,
    source: d.source,
    backendSource: d.backendSource,
    hasContentfulDescription: !!entry.desktopOnly?.contentfulDescription,
    contentfulDescription: entry.desktopOnly?.contentfulDescription,
  };
  if (entry.route !== undefined) {
    return {
      ...base,
      type: "internal",
      route: entry.route,
      windowWidth: entry.desktopOnly?.windowWidth,
      windowHeight: entry.desktopOnly?.windowHeight,
    };
  }
  return {
    ...base,
    type: "external",
    url: entry.url,
    openInNewTab: entry.desktopOnly?.openInNewTab ?? true,
  };
}

function toPortfolioProject(
  entry: ContentEntry,
  surface: PortfolioSurface,
): PortfolioProject {
  const d = detailsFor(entry, surface);
  return {
    ...d,
    id: entry.id,
    status: d.status ?? "operational",
    tech: d.tech ?? [],
    mediums: d.mediums ?? [],
    tags: d.tags ?? [],
    url: entry.url,
    route: entry.route,
    preview: entry.portfolioOnly?.preview,
    artGrouping: entry.portfolioOnly?.artGrouping ?? "primary",
  };
}

// Resolved once so callers get a stable array reference.
const DESKTOP_CONTENT: Content[] = NICKEL_SYSTEM.content
  .filter((entry) => entry.surfaces.includes("desktop"))
  .map(toDesktopContent);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2025-10" / "2025-10-03" → "Oct 2025"; anything else is returned as-is.
export function formatDate(date: string): string {
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(date);
  const month = match && MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : date;
}

// Helper functions — desktop/mobile OS
export function getContentById(id: string): Content | undefined {
  return DESKTOP_CONTENT.find((item) => item.id === id);
}

export function getFeaturedContent(): Content[] {
  return NICKEL_SYSTEM.featured
    .map((id) => getContentById(id))
    .filter((item): item is Content => item !== undefined);
}

export function getContentByCategory(category: Category): Content[] {
  return DESKTOP_CONTENT.filter((item) => item.category === category);
}

export function getAllContent(): Content[] {
  return DESKTOP_CONTENT;
}

// Helper functions — metadata filtering (works on desktop Content and
// PortfolioProject alike)
type ListKey = "tech" | "mediums" | "tags";
type ListValue<K extends ListKey> = NonNullable<ProjectDetails[K]>[number];

export type MetadataFilter = {
  categories?: ReadonlySet<Category>;
  statuses?: ReadonlySet<Status>;
} & { [K in ListKey]?: ReadonlySet<ListValue<K>> };

type Filterable = Pick<ProjectDetails, "category" | "status" | ListKey>;

// True when the item has ANY selected value in ANY field (inclusive OR), or
// when nothing is selected at all.
export function matchesMetadata(
  item: Filterable,
  filter: MetadataFilter,
): boolean {
  const checks: [ReadonlySet<string> | undefined, readonly string[]][] = [
    [filter.categories, [item.category]],
    [filter.statuses, [item.status ?? "operational"]],
    [filter.tech, item.tech ?? []],
    [filter.mediums, item.mediums ?? []],
    [filter.tags, item.tags ?? []],
  ];
  const active = checks.filter(([selected]) => selected && selected.size > 0);
  return (
    active.length === 0 ||
    active.some(([selected, values]) => values.some((v) => selected!.has(v)))
  );
}

// The values of `key` actually used by `items`, most common first — i.e. the
// options worth showing in a filter UI.
export function getMetadataOptions<K extends ListKey>(
  items: Pick<ProjectDetails, K>[],
  key: K,
): ListValue<K>[] {
  const counts = new Map<ListValue<K>, number>();
  for (const item of items) {
    for (const value of (item[key] ?? []) as ListValue<K>[]) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
}

// Helper functions — portfolio pages
export function getPortfolioProjects(
  surface: PortfolioSurface,
): PortfolioProject[] {
  return NICKEL_SYSTEM.content
    .filter((entry) => entry.surfaces.includes(surface))
    .map((entry) => toPortfolioProject(entry, surface));
}
