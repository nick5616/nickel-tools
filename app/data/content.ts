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
    // true keeps the entry off every surface (desktop OS, portfolio pages,
    // sitemap, llms.txt). It still shows up in this file, and this repo is
    // public, so don't put anything here you wouldn't want read.
    hide: boolean;
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
//
// Not listed yet, waiting on details (what did I actually build there?):
//   iHeartMedia (intern + part-time), Story Health, 66degrees (tech lead),
//   DoorDash, Integrate, USAFacts (contract).
export const NICKEL_SYSTEM: NickelSystem = {
  version: "1.1.0",
  content: [
    // -----------------------------------------------------------------------
    // Immersive web
    // -----------------------------------------------------------------------
    {
      id: "portfolio",
      hide: false,
      title: "nicolebelovoskey.com",
      description:
        "My art and software portfolio as a first-person 3D world you can walk around in, with games and little experiences hidden inside. Built in Three.js.",
      url: "https://nicolebelovoskey.com",
      category: "Immersive Web",
      date: "2025-01",
      thumbnail: "/project-screenshots/3dportfolio.png",
      why: "I wanted my portfolio to feel like a place you visit instead of a list of links you skim. Walking through it should feel like exploring, and it shows the technical side and the creative side of me in one place.",
      tech: [
        "Three.js",
        "WebGL",
        "React-Three-Fiber",
        "TypeScript",
        "JavaScript",
        "Go",
        "Google Cloud Platform",
      ],
      tags: ["3D Design", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software", "design"],
      softwareOverride: {
        title: "Nicole's World",
        description:
          "A first-person 3D world on the web. You can walk, sprint, and jump around, collect gems, browse my art in a fancy digital museum, walk right up to my software projects, draw a picture and submit it (it might end up hanging on the wall), get roasted by the omnipotent computer from Courage the Cowardly Dog, chill in a quiet forest, or practice multiplication in a 3D take on Meteor Multiplication.",
        why: "I wanted this website to feel like a place you could inhabit rather than a page you scroll. Making a world you can actually walk around in meant working through graphics programming, spatial UX, and keeping it all running smoothly in a browser. It was fun. Also I wanted it to exist. Isn't that reason enough?",
        tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      },
    },
    {
      id: "art-room",
      hide: false,
      title: "Art Room",
      description:
        "A gallery room inside the holodeck where my paintings hang on the walls. Walk up close to look at the brushwork or step back to see the whole piece.",
      url: "https://nicolebelovoskey.com/holodeck/art",
      category: "Immersive Web",
      date: "2026-02",
      why: "Art looks different on a wall than in a grid of thumbnails. Being able to approach a piece and step away from it changes how you experience it, and I wanted that in the browser. The art is served from a small Go API backed by Cloud Storage.",
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
      tags: ["3D Design", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      backendSource: "https://github.com/nick5616/holodeck-art-api",
      surfaces: ["desktop", "software"],
    },
    {
      id: "art-museum",
      hide: false,
      title: "Art Museum",
      description:
        "A multi-room virtual museum inside the holodeck that holds my art collection. Wander through it at your own pace.",
      url: "https://nicolebelovoskey.com/art-gallery",
      category: "Immersive Web",
      date: "2025-01",
      why: "Going from one room to a whole museum meant thinking like an architect: how people find their way around, how pacing works from room to room, and what story the layout tells. All inside a browser tab.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "software-showroom",
      hide: false,
      title: "Software Showroom",
      description:
        "Walk up to screens in a 3D room and use my projects right there on them. Press escape to get your cursor back.",
      url: "https://nicolebelovoskey.com/software",
      category: "Immersive Web",
      date: "2025-01",
      why: "It seemed like a really sci-fi way to showcase my projects.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "courage-computer",
      hide: false,
      title: "Courage Computer Room",
      description:
        "A retro computer lab inside the holodeck, starring the smug, all-knowing computer from Courage the Cowardly Dog.",
      url: "https://nicolebelovoskey.com/holodeck/courage-the-cowardly-dog",
      category: "Immersive Web",
      date: "2025-11",
      why: "I wanted to capture the feeling of an old computer room as a space you can stand in. It's environmental storytelling with a lot of nostalgia, and a computer that's mean to you.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "math-room",
      hide: false,
      title: "Math Room",
      description:
        "A 3D room inside the holodeck where equations, shapes, and math concepts are objects you can walk around and explore.",
      url: "https://nicolebelovoskey.com/holodeck/math",
      category: "Immersive Web",
      date: "2025-01",
      why: "Math is spatial. I wanted to see what it looks like when a math idea is an environment instead of notation on a page.",
      tech: ["TypeScript", "React", "Three.js", "React-Three-Fiber", "WebGL"],
      tags: ["3D Design", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/3d-portfolio-website",
      surfaces: ["desktop", "software"],
    },
    {
      id: "plasma-sphere",
      hide: false,
      title: "Plasma Sphere",
      description:
        "Like that one toy. Hold click and drag on the ball to attract the electricity! Desktop and mobile.",
      url: "https://sphere.saucedog.art",
      category: "Experiments",
      date: "2026-04",
      why: "I absolutely adore electricity and wanted to create a 3D environment that allows you to play with it. I've been fascinated with physical phenomena like electricity and magnetism, and how the basis of computers is manipulating an electron using a difference in electromagnetic force to make a transistor, which can be used to make logic gates, which can be used to make circuits, which can be used to make arithmetic logic units. With the inclusion of a clock and memory, you can create an entire computer architecture. On the newly formed computer, you can run programs directly on the hardware (baremetal) using binary instructions written for that computer architecture, or you could write a hardware abstraction layer that transpiles a common higher level language like assembly into the language the computer speaks. You can also write a language that's more readable to coders, that compiles into assembly, which is then translated into instructions for your computer! Using that higher level language, developers can move quickly and develop operating systems for a computer. Operating systems make it easier to write programs for the computer, because they handle the allocation of computer resources (they talk to the computer so your program doesn't have to worry about that). They also provide the illusion of isolation, meaning a software program written for an OS does not know other programs exist, and doesn't need to worry about playing nice with the hundreds of other applications running on the computer. The browser is a program on the OS. And this website is written for the browser! And it's all powered by 100 billion electrons jumping from one side of a microscopic germanium-doped silicon trough to the other.",
      tech: ["JavaScript", "Three.js", "WebGL"],
      tags: [
        "3D Design",
        "Interactive Design",
        "Touch Interactions",
        "Physics",
        "Open Source",
      ],
      source: "https://github.com/nick5616/plasma-sphere",
      surfaces: ["desktop", "software", "design"],
      desktopOnly: { openInNewTab: false },
    },
    {
      id: "sphere-website",
      hide: false,
      title: "Sphere Website",
      description:
        "A vanilla Three.js site built around a spinning 3D sphere. The hello world of 3D on the web.",
      url: "https://tiny-sorbet-aefcf4.netlify.app/",
      category: "Immersive Web",
      date: "2023-11",
      why: "I wanted to get my hands dirty with Three.js and WebGL for the first time. A sphere is the hello world of 3D.",
      tech: ["JavaScript", "Three.js", "WebGL"],
      tags: ["3D Design", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/sphere-website",
      surfaces: ["desktop", "software"],
    },

    // -----------------------------------------------------------------------
    // Product UI, mobile, and social
    // -----------------------------------------------------------------------
    {
      id: "tierlistify",
      hide: false,
      title: "tierlistify",
      description:
        "Rank anything, made for your phone. Drag items into tiers with your thumb and share the result.",
      url: "https://tierlistify.com",
      category: "Social App",
      date: "2025-09",
      thumbnail: "/project-screenshots/tierlistifytierlist.png",
      why: "I thought the Tiermaker mobile site could use some improvement. Dragging things between tiers on a phone was frustrating, so I built one where touch is the main way you use it, not an afterthought, with a clean UI that stays out of the way of the ranking.",
      tech: ["TypeScript", "React"],
      tags: [
        "Mobile UX",
        "Touch Interactions",
        "Drag & Drop",
        "Progressive Web App",
        "Open Source",
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
      id: "friendex",
      hide: false,
      title: "Friendex",
      description:
        "A pokédex for your friends. A zany, mobile-first app for collecting and organizing what you know about the people in your life.",
      url: "https://friendex.online",
      category: "Social Tools",
      date: "2025-10",
      thumbnail: "/project-screenshots/friendex.png",
      why: "I wanted a fun way to remember the details about my friends that felt like a game, not a contacts app. The pokédex idea makes filling it in feel like collecting, and I designed it phone-first because that's what you have on you when you're out with people.",
      tech: ["TypeScript", "React", "Firebase Auth"],
      tags: [
        "Mobile-First",
        "Social App",
        "Web Development",
        "Responsive UI",
        "Open Source",
      ],
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
      hide: false,
      title: "RPG Quests",
      description:
        "Write a journal entry and get it back as video game quests, so you can live your life like an RPG.",
      // TODO: the link and the previews point at different domains
      // (rpg-quests.netlify.app vs videogamequest.me). Pick the live one.
      url: "https://rpg-quests.netlify.app/",
      category: "AI / Productivity",
      date: "2025-06",
      thumbnail: "/project-screenshots/videogamequest.png",
      why: "I wanted journaling and getting things done to feel more like playing a game. Turning what you write into quests gives you something to chase, and finishing one feels like leveling up instead of crossing off a chore.",
      tech: [
        "TypeScript",
        "React",
        "Tailwind CSS",
        "Framer Motion",
        "Nest.js",
        "Node.js",
        "LLM APIs",
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
      id: "passionfruit",
      hide: false,
      title: "Passionfruit",
      description:
        "Keep track of every project you're working on in one place, without it feeling like a work tracker.",
      url: "https://yieldpassionfruit.netlify.app",
      category: "Creative Productivity",
      date: "2025-11",
      thumbnail: "/project-screenshots/passionfruit.png",
      why: "I have a lot of hobbies that I bounce between. I was getting overwhelmed by how many projects I had going, so I built Passionfruit to keep track of them in a way that wouldn't stifle my creativity.",
      tech: ["TypeScript", "React"],
      tags: ["Project Management", "Productivity Tools", "Open Source"],
      source: "https://github.com/nick5616/universe",
      surfaces: ["desktop", "software"],
    },
    {
      id: "life-graph",
      hide: false,
      title: "Life Network",
      description:
        "Your life's goals as a 3D network: what depends on what, what to prioritize, and how it all connects.",
      url: "https://yieldpassionfruit.netlify.app/life-graph",
      category: "Creative Productivity",
      date: "2026-03",
      why: "I wanted to see how my goals relate to each other and what has to happen first. It's generic so you can map your own. It's meant to include basic foundational behaviors like sleeping and eating well, since that's how you're at your best.",
      tech: ["TypeScript", "React", "Three.js", "WebGL"],
      tags: [
        "AI Integration",
        "3D Design",
        "Interactive Design",
        "Data Visualization",
        "Open Source",
      ],
      source:
        "https://github.com/nick5616/universe/blob/main/src/pages/LifeGraphPage.tsx",
      surfaces: ["desktop", "software"],
      desktopOnly: { openInNewTab: false },
    },
    {
      id: "the-circle",
      hide: false,
      title: "The Circle",
      description:
        "One persistent global room where up to 8 people can be on camera and mic at once over a WebRTC mesh. Everyone else watches as the audience. No accounts, no room codes, no database.",
      url: "https://live.saucedog.art/",
      category: "Social Tools",
      date: "2026-04",
      why: "I wanted something that felt truly live. Not a chat box, but actual video with strangers. Wiring up WebRTC peer connections, Django Channels signaling, and Redis room state from scratch was the challenge. (Visit it directly. It won't work inside an iframe.)",
      tech: [
        "React",
        "TypeScript",
        "Django",
        "WebSockets",
        "WebRTC",
        "Redis",
        "Docker",
      ],
      tags: ["Real-time", "Web Development", "Open Source"],
      source: "https://github.com/nick5616/the-circle",
      surfaces: ["desktop", "software"],
      portfolioOnly: { preview: "none" },
    },
    {
      id: "nickel-tools",
      hide: false,
      title: "Nickel Tools",
      description:
        "A desktop OS in your browser: app grid, app tray, draggable windows, and a swipeable mobile mode. Every little web thing I make lives here.",
      url: "https://nickeltools.dev/desktop",
      category: "Engineering",
      date: "2025-11",
      why: 'I wanted a website that was "a website of websites" so I could/can give any little web thing I build a home 💖 I also wanted somewhere to put my art. A desktop OS seemed like the perfect container since pretty much everyone already knows how to get around one.',
      tech: ["TypeScript", "React", "Next.js"],
      tags: [
        "Interactive Design",
        "Responsive UI",
        "Touch Interactions",
        "Open Source",
      ],
      source: "https://github.com/nick5616/nickel-tools",
      surfaces: ["desktop", "software", "design"],
      desktopOnly: { title: "Nickel Tools (INCEPTION!!!)" },
    },
    {
      id: "boards",
      // Hidden until it has a real description and a why.
      hide: true,
      title: "Boards",
      description: "boards.saucedog.art",
      url: "https://boards.saucedog.art",
      category: "Experiments",
      date: "2026-05",
      tags: ["Open Source"],
      source: "https://github.com/nick5616/boards",
      surfaces: ["desktop", "software"],
    },

    // -----------------------------------------------------------------------
    // Design systems and color
    // -----------------------------------------------------------------------
    {
      id: "color-engine",
      hide: false,
      title: "Advanced Color Scheme Generator",
      description:
        "Generates color palettes from color theory harmonies and exports them as theme JSON you can drop straight into a project.",
      route: "/advanced-color-scheme-generator",
      category: "Design System",
      why: "I was tired of picking palettes by hand. I wanted something that starts from real color theory and keeps contrast in check, so what comes out is usable in a design system and not just pretty.",
      tech: ["TypeScript", "React", "Canvas API", "Next.js"],
      tags: ["Color Theory Algorithms", "Design System", "Accessibility"],
      surfaces: ["desktop", "design"],
      desktopOnly: { windowHeight: 700 },
    },
    {
      id: "routine",
      hide: false,
      title: "Routine",
      description:
        "A daily routine page that generates analogous color schemes on the fly, every one of them WCAG AAA compliant.",
      url: "https://nick5616.github.io/routine/",
      category: "Design System",
      date: "2020-03",
      why: "I wanted to play with algorithmic color theory while making something I'd actually use. Getting palettes to stay harmonious and still pass the strictest contrast level was the fun constraint.",
      tech: ["JavaScript"],
      tags: [
        "Design System",
        "Accessibility",
        "Color Theory Algorithms",
        "Open Source",
      ],
      source: "https://github.com/nick5616/routine",
      surfaces: ["desktop", "software", "design"],
    },

    // -----------------------------------------------------------------------
    // Music and audio
    // -----------------------------------------------------------------------
    {
      id: "smart-piano",
      hide: false,
      title: "Smart Piano",
      description:
        "An online piano that looks at the key you're in and what you just played, then suggests good next notes.",
      route: "/smart-piano",
      category: "Music",
      date: "2025-11",
      thumbnail: "/project-screenshots/smartpiano.png",
      why: "I wanted a way to learn music theory by playing instead of memorizing scales. The suggestions help you make something that sounds nice even if you're not an expert yet.",
      tech: ["TypeScript", "React", "Web Audio API", "Next.js"],
      tags: ["Music Theory Algorithms", "Interactive Design", "Open Source"],
      source: "https://github.com/nick5616/nickel-tools",
      surfaces: ["desktop", "software"],
      desktopOnly: { windowWidth: 1400 },
    },
    {
      id: "midimuse",
      // TODO: if this is the same thing as Smart Piano, merge the two entries.
      hide: true,
      title: "MidiMuse",
      description:
        "A piano roll in the browser where you place notes and chords, and it suggests combinations that fit the key. Exports to MIDI.",
      route: "#",
      category: "Music",
      status: "in-development",
      why: "Next up: hover to preview how a note or chord sounds, and a sliding window of musical context so suggestions follow the phrase and not just the key.",
      tags: ["Music Theory Algorithms", "MIDI", "Interactive Design"],
      surfaces: ["desktop", "software"],
    },
    {
      id: "smart-midi-recorder",
      hide: false,
      title: "Smart MIDI Recorder",
      description:
        "Records what you play on a MIDI keyboard and shows the key, the scale, and good next notes in real time to help you improvise.",
      url: "https://music.nickeltools.dev/smart-midi-recorder/",
      category: "Music",
      date: "2026-04",
      why: 'I play piano and wanted help improvising with more confidence. It surfaces the "right" notes for the key I\'m in while still capturing everything I play.',
      tech: ["JavaScript", "Web Audio API", "HTML", "CSS"],
      tags: [
        "Music Theory Algorithms",
        "Interactive Design",
        "Real-time",
        "MIDI",
        "Open Source",
      ],
      source: "https://github.com/nick5616/song-visualizer",
      surfaces: ["desktop", "software"],
    },
    {
      id: "pitch-hero",
      hide: false,
      title: "Pitch Hero",
      description:
        "Sing or play a MIDI keyboard to hit scrolling notes as they cross the target line. Scores your pitch accuracy in real time from your mic or keyboard.",
      url: "https://music.nickeltools.dev/pitch-hero/",
      category: "Music",
      date: "2026-04",
      why: "I wanted pitch training to feel like a rhythm game instead of an exercise. I built the pitch detection and the scrolling note renderer from scratch on the Web Audio API.",
      tech: ["JavaScript", "Web Audio API", "Canvas API", "HTML", "CSS"],
      tags: [
        "Music Theory Algorithms",
        "Interactive Design",
        "Real-time",
        "MIDI",
        "Pitch Detection",
        "Gamification",
        "Open Source",
      ],
      source: "https://github.com/nick5616/song-visualizer",
      surfaces: ["desktop", "software", "design"],
    },
    {
      id: "song-visualizer",
      hide: false,
      title: "Song Visualizer",
      description:
        "Turns music into animated particles, waveforms, geometry, and spectrum effects. Upload an MP3 or use your mic, then tweak the color, speed, and intensity.",
      url: "https://music.nickeltools.dev/song-visualizer/",
      category: "Music",
      date: "2026-04",
      why: "I wanted to see my music, not just hear it. Hooking the Web Audio API up to a canvas and watching a track turn into motion in real time never gets old.",
      tech: ["JavaScript", "Web Audio API", "Canvas API", "HTML", "CSS"],
      tags: [
        "Audio Processing",
        "Interactive Design",
        "Real-time",
        "Animation",
        "Open Source",
      ],
      source: "https://github.com/nick5616/song-visualizer",
      surfaces: ["desktop", "software"],
    },
    {
      id: "audio-to-midi",
      hide: false,
      title: "Audio → MIDI",
      description:
        "Converts audio to MIDI with the YIN pitch detection algorithm. Drop in a WAV or MP3, tune the BPM and quantization, then download the MIDI file.",
      route: "/audio-to-midi",
      category: "Music",
      date: "2026-04-16",
      tags: ["Audio Processing", "Pitch Detection", "MIDI"],
      surfaces: ["desktop"],
      desktopOnly: { windowWidth: 720, windowHeight: 800 },
    },
    {
      id: "voice-lab",
      hide: false,
      title: "VoiceLab",
      description:
        "A Python desktop app for singers that tracks vocal performance across takes. Measures pitch, resonance, weight, brightness, and consistency.",
      url: "https://github.com/nick5616/VoiceLab",
      category: "Machine Learning",
      date: "2025-12",
      why: "I wanted objective feedback on my singing practice instead of relying only on my ear. Tracking the numbers across takes makes it easy to see what's actually improving.",
      tech: ["Python"],
      tags: [
        "Machine Learning",
        "Audio Processing",
        "Pitch Detection",
        "Open Source",
      ],
      source: "https://github.com/nick5616/VoiceLab",
      surfaces: ["desktop", "software"],
      portfolioOnly: { preview: "none" },
    },
    {
      id: "bird-dog",
      // TODO: add a link (SoundCloud, Spotify, etc.) before unhiding.
      hide: true,
      title: "Bird Dog",
      description:
        "Songs and beats I produce in Ableton under the name Bird Dog.",
      route: "#",
      category: "Music",
      mediums: ["Music Production"],
      tech: ["Ableton Live"],
      surfaces: ["desktop"],
    },

    // -----------------------------------------------------------------------
    // ML, computer vision, video, and data
    // -----------------------------------------------------------------------
    {
      id: "chaos",
      hide: false,
      title: "CHAOS",
      description:
        "Counter-Strike Highlight Analysis and Organization System. Point it at hours of gameplay footage and it finds the moments worth keeping (kills, funny voice chat, good conversations) and clips them for you. Runs entirely on your own machine.",
      url: "https://github.com/nick5616/CHAOS",
      category: "Machine Learning",
      // TODO: push the October 2026 rewrite before featuring this.
      date: "2026-10",
      thumbnail: "/project-screenshots/chaos.png",
      why: "I have 700+ GB of my own Counter-Strike footage from 10+ years of playing and making videos, and scrubbing through it by hand was never going to happen. The rewrite made it a lot faster and more accurate. Classical computer vision does most of the work and OCR only runs on small crops. It samples every couple of seconds, then binary searches for the exact frame of a kill, which was the big speed win. An audio tagger catches laughter in voice chat, Whisper adds burned-in subtitles, and a resource planner sizes the workers from each model's measured memory so it doesn't eat my whole computer. It can resume where it left off, recompute only what changed, and throttle itself while I'm gaming. No LLMs, no cloud calls.",
      tech: ["Python", "PyQt6", "OpenCV", "PyTorch", "Whisper", "FFmpeg"],
      tags: [
        "Machine Learning",
        "Computer Vision",
        "OCR",
        "Speech-to-Text",
        "Audio Processing",
        "Video Processing",
        "Batch Processing",
        "Open Source",
      ],
      source: "https://github.com/nick5616/CHAOS",
      surfaces: ["desktop", "software"],
      portfolioOnly: { preview: "none" },
    },
    {
      id: "chaos-reels",
      hide: true,
      title: "CHAOS Reels",
      description:
        "An idea built on top of CHAOS: an LLM directs edits of my real clips into short vertical reels. No generated pixels, just smarter editing.",
      route: "#",
      category: "Video",
      status: "experimental",
      tech: ["Python", "LLM APIs", "FFmpeg"],
      tags: ["Video Processing", "AI Integration"],
      surfaces: ["desktop", "software"],
    },
    {
      id: "batch-analyzer",
      hide: false,
      title: "Batch Analyzer",
      description:
        "Ask the same questions (like 'How many books are in this image?') about a whole batch of product images at once. Bring your own LLM.",
      url: "https://batch-analyzer.netlify.app/",
      category: "AI / Productivity",
      date: "2025-12",
      why: "While doing product image analysis work, I kept asking the same questions about image after image. This lets you write the questions once and run them across an entire batch, with whichever model you want.",
      tech: ["TypeScript", "React", "LLM APIs"],
      tags: [
        "Image Processing",
        "Batch Processing",
        "AI Integration",
        "Open Source",
      ],
      source: "https://github.com/nick5616/batch-item-analyzer",
      surfaces: ["desktop", "software"],
      desktopOnly: { contentfulDescription: BatchAnalyzerDescription },
    },
    {
      id: "me-timelines",
      // Private, for my own use. Hidden on purpose.
      hide: true,
      title: "Me Timelines",
      description:
        "A local app that goes through a big set of my photos and automatically makes side-by-side comparisons across time, matching face and pose so each pair lines up, with dates labeled.",
      route: "#",
      category: "Machine Learning",
      tech: ["Python", "FastAPI"],
      tags: ["Computer Vision", "Image Processing"],
      surfaces: ["desktop"],
    },
    {
      id: "cs-videos",
      // TODO: add the YouTube channel link before unhiding.
      hide: true,
      title: "Counter-Strike Videos",
      description:
        "About ten years of editing and publishing my own Counter-Strike clips on YouTube.",
      route: "#",
      category: "Video",
      mediums: ["Video Editing"],
      tags: ["Video Processing"],
      surfaces: ["desktop"],
    },
    {
      id: "sw-viz",
      hide: false,
      title: "Star Wars Ship Costs Visualizer",
      description:
        "An interactive chart of what Star Wars starships cost, from X-wings to Star Destroyers, using the SWAPI dataset.",
      url: "https://star-wars-spending-viz.netlify.app",
      category: "Experiments",
      date: "2023-11",
      why: "A fun excuse to mix Star Wars with data viz. I pulled the ship data from the Star Wars API, cleaned it up on a Nest backend, and charted it so you can compare ships side by side.",
      tech: ["React", "TypeScript", "Nivo", "Nest.js", "Node.js"],
      tags: ["Data Visualization", "Web Development", "Open Source"],
      source: "https://github.com/nick5616/sw-viz-fe",
      backendSource: "https://github.com/nick5616/sw-viz-be",
      surfaces: ["desktop", "software"],
    },

    // -----------------------------------------------------------------------
    // Engineering and tools
    // -----------------------------------------------------------------------
    {
      id: "sre-dashboard",
      hide: false,
      title: "SRE Dashboard",
      description:
        "A dashboard for monitoring services, incidents, and logs. A Python/Flask backend serves hypermedia through HTMX, and the frontend is Lit web components.",
      url: "https://sre.nickeltools.dev",
      category: "Engineering",
      date: "2025-09",
      why: "I wanted to try a stack that leans into the platform instead of abstracting it away. HTMX lets the server own state and send back HTML fragments, which cuts out a lot of client-side complexity. Lit is what web components always should have been: lightweight, declarative, and framework-agnostic. I don't think enough people know how powerful the native component model has gotten.",
      tech: ["Python", "Lit", "HTMX", "Flask"],
      tags: [
        "SRE",
        "Dashboard",
        "Data Visualization",
        "Developer Tools",
        "Open Source",
      ],
      source: "https://github.com/nick5616/lit-htmxperiments",
      surfaces: ["desktop", "software"],
    },
    {
      id: "resume-builder",
      hide: false,
      title: "Online LaTeX Resume Builder",
      description:
        "A LaTeX resume editor that compiles in your browser with WebAssembly. Nothing to set up, and your resume never leaves your machine.",
      route: "/resume-editor",
      category: "Engineering",
      date: "2023-06",
      thumbnail: "/project-screenshots/latex.png",
      tech: ["LaTeX", "WebAssembly"],
      surfaces: ["desktop"],
    },
    {
      id: "factory-orchestrator",
      hide: false,
      title: "Factory Orchestrator",
      description:
        "A test harness device makers use on the factory floor to flash and test Windows on their hardware. I helped build it at Microsoft and helped open-source it.",
      url: "https://github.com/microsoft/FactoryOrchestrator",
      category: "Engineering",
      // TODO: add the year.
      why: "This was my Microsoft internship. Besides the app itself, I worked with Ted, a tech writer, on the product docs and the open-source announcement. It's still my go-to story for working with someone outside engineering.",
      tech: ["C#", "UWP", "XAML"],
      tags: ["Open Source", "Developer Tools"],
      source: "https://github.com/microsoft/FactoryOrchestrator",
      surfaces: ["desktop", "software"],
      portfolioOnly: { preview: "none" },
    },
    {
      id: "amex-onboarding-validation",
      // Internal work, nothing to link to. Probably better on the resume.
      hide: true,
      title: "Card Onboarding Validation Service",
      description:
        "A Spring Boot microservice that validates form data for commercial credit card onboarding, built during my American Express internship.",
      route: "#",
      category: "Engineering",
      tech: ["Java", "Spring Boot"],
      surfaces: ["software"],
    },
    {
      id: "interview-tracker",
      hide: true,
      title: "Interview Tracker",
      description:
        "Two tools in one for job searching. A case-manager view follows every interview process from first recruiter message to outcome, with inline notes and fast add and edit. A learning view balances the CS topics I'm studying. Folding sections keep everything scannable, and every dropdown is editable in the app instead of hardcoded.",
      route: "#",
      category: "AI / Productivity",
      status: "in-development",
      why: "I wanted a real three-tier app with a proper backend, not a client talking straight to a database, and deployments that run end to end from scripts in the repo.",
      tech: ["TypeScript", "React", "Firebase Auth", "Google Cloud Platform"],
      tags: ["Productivity Tools", "Project Management"],
      surfaces: ["desktop", "software"],
    },

    // -----------------------------------------------------------------------
    // Games and education
    // -----------------------------------------------------------------------
    {
      id: "wizard-wars",
      hide: false,
      title: "Wizard Wars",
      description:
        "A 3D multiplayer wizard first-person shooter that runs in your browser. Nothing to download, just open it and play.",
      url: "https://wizardwars.saucedog.art",
      category: "Games",
      date: "2026-05",
      // TODO: add a why.
      tech: ["WebRTC", "Three.js", "React", "React-Three-Fiber"],
      tags: [
        "Multiplayer",
        "Real-time",
        "3D Design",
        "Physics",
        "Open Source",
      ],
      source: "https://github.com/nick5616/wizard-wars",
      surfaces: ["desktop", "software"],
    },
    {
      id: "cosmic-connect-four",
      hide: true,
      title: "Cosmic Connect Four",
      description:
        "Multiplayer Connect Four in space, in some alternate dimension. The board rotates up toward you, you hold the chip and dangle it over the slot, then drop it and watch it fall. It should feel like playing Connect Four with God.",
      route: "#",
      category: "Games",
      status: "in-development",
      tech: ["Three.js", "React-Three-Fiber", "WebGL"],
      tags: [
        "Multiplayer",
        "3D Design",
        "Physics",
        "Animation",
        "Interactive Design",
      ],
      surfaces: ["desktop", "software", "design"],
    },
    {
      id: "brains-games-gauntlet",
      hide: true,
      title: "The Gauntlet",
      description:
        "A 10-minute daily brain workout: ten one-minute rounds with short breaks, in a quirky hand-drawn style. It trains things that help in real life, like working memory and mental math, and includes rounds where you remember something early and get quizzed on it at the end.",
      route: "#",
      category: "Education",
      status: "in-development",
      why: "I want a daily ritual that makes you sharper in real life, not just better at the app. Right now every game is playable on its own so I can tell which ones are actually good, and the curated daily set comes after that. I also want learning tracks people actually want, like picking up a new alphabet (learning Cyrillic was so fun).",
      tags: ["Brain Training", "Gamification"],
      surfaces: ["desktop", "software"],
    },
    {
      id: "pokemon-or-technology",
      hide: false,
      title: "Pokemon or Technology",
      description:
        "Test your knowledge! Can you tell a Pokémon name from a technology term?",
      route: "/pokemon-or-technology",
      category: "Games",
      date: "2025-10",
      why: "One day I noticed Pokémon and technology have similar sounding names, so I made this quiz game.",
      tech: ["TypeScript", "React", "Next.js"],
      tags: ["Quiz"],
      surfaces: ["desktop", "software"],
      desktopOnly: { windowWidth: 300, windowHeight: 400 },
      softwareOverride: { date: "Sometime in like Oct 2025" },
    },
    {
      id: "choice-engine",
      hide: false,
      title: "Choice Picker",
      description:
        "Spin the wheel to make decisions! Add your options and let chance decide.",
      route: "/choice-picker",
      category: "Utility",
      surfaces: ["desktop"],
    },
    {
      id: "cs2-workshop",
      hide: true,
      title: "CS2 Workshop Experiments",
      description:
        "Messing around with making Counter-Strike 2 Workshop maps and weapon skins.",
      route: "#",
      category: "Gaming",
      status: "experimental",
      tags: ["3D Design"],
      surfaces: ["desktop"],
    },
    {
      id: "new-media-website",
      hide: false,
      title: "New Media Class Website",
      description:
        "My first real website, from a 2019 college class. It explores the media I consume and polls my classmates on theirs.",
      url: "https://new-media-college-class.netlify.app/",
      category: "Experiments",
      date: "2019-10",
      why: "It was a class assignment, but it was also genuinely my first real website. Everyone starts somewhere.",
      tech: ["HTML", "CSS", "JavaScript"],
      tags: ["Open Source"],
      source: "https://github.com/nick5616/newMediaWebsite",
      surfaces: ["desktop", "software"],
    },

    // -----------------------------------------------------------------------
    // Art
    // -----------------------------------------------------------------------
    {
      id: "saucedog-art",
      hide: false,
      title: "saucedog.art",
      description:
        "My art portfolio from 2022 to 2023: digital art, illustration, and character design.",
      url: "https://saucedog.art",
      category: "Art",
      date: "2023-02",
      thumbnail: "/project-screenshots/oldartportfolio.png",
      why: "This covers a stretch where I was learning a lot of new techniques and figuring out my style, so it got a site of its own.",
      mediums: [
        "Digital Art",
        "Illustration",
        "Character Design",
        "Visual Storytelling",
      ],
      tags: ["Portfolio"],
      surfaces: ["desktop", "art"],
    },
    {
      id: "art-digital-art",
      hide: false,
      title: "Digital Art",
      description: "Gallery of digital artwork",
      route: "/art-gallery/digital-art",
      category: "Art",
      why: "Digital is where I experiment the most with color, composition, and style, since trying something and undoing it costs nothing.",
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
          "Digital illustrations and paintings, mostly made in Procreate and Photoshop.",
      },
    },
    {
      id: "art-paintings",
      hide: false,
      title: "Paintings",
      description: "Gallery of paintings",
      route: "/art-gallery/paintings",
      category: "Art",
      why: "Real paint is slower and more physical than digital, and these are me experimenting with color and texture that way.",
      mediums: ["Acrylic Paint", "Watercolor", "Traditional Media", "Canvas"],
      surfaces: ["desktop", "art"],
      artOverride: {
        description:
          "Paintings in acrylic, watercolor, and other physical media.",
      },
    },
    {
      id: "art-sketches",
      hide: false,
      title: "Sketches",
      description: "Gallery of sketches",
      route: "/art-gallery/sketches",
      category: "Art",
      why: "Sketches are where ideas start. I keep the loose, unfinished stuff around because it shows how I actually work.",
      mediums: [
        "Pencil",
        "Pen & Ink",
        "Charcoal",
        "Sketching",
        "Figure Drawing",
      ],
      surfaces: ["desktop", "art"],
      artOverride: {
        description:
          "Sketches, studies, figure drawing, and quick drawings. The raw material behind everything else.",
      },
    },
    {
      id: "art-lefthanded",
      hide: false,
      title: "Left-Handed Art",
      description: "Art created only using my left hand",
      route: "/art-gallery/lefthanded",
      category: "Art",
      why: "I'm working on becoming ambidextrous, and drawing is a good way to practice.",
      surfaces: ["desktop", "art"],
      portfolioOnly: { artGrouping: "collection" },
      artOverride: {
        description: "Art made using only my left hand.",
      },
    },
    {
      id: "art-miscellaneous",
      hide: false,
      title: "Miscellaneous",
      description: "A collection of miscellaneous artwork and creative pieces",
      route: "/art-gallery/miscellaneous",
      category: "Art",
      surfaces: ["desktop", "art"],
      desktopOnly: { windowHeight: 700 },
      portfolioOnly: { artGrouping: "collection" },
      artOverride: {
        description:
          "Art that doesn't fit anywhere else: experiments, one-offs, and whatever I felt like making.",
      },
    },
    {
      id: "art-notesappart",
      hide: false,
      title: "Notes App Art",
      description: "Art created in note-taking apps and other digital tools",
      route: "/art-gallery/notesappart",
      category: "Art",
      surfaces: ["desktop", "art"],
      portfolioOnly: { artGrouping: "collection" },
      artOverride: {
        description:
          "Drawings made in notes apps and other tools that were never meant for art. Working inside their limits is half the fun.",
      },
    },

    // -----------------------------------------------------------------------
    // System windows
    // -----------------------------------------------------------------------
    {
      id: "about",
      hide: false,
      title: "About Nickel OS",
      description: "System information and bio",
      route: "/about",
      category: "Utility",
      surfaces: ["desktop"],
    },
    {
      id: "contact",
      hide: false,
      title: "Contact",
      description: "Get in touch",
      route: "/contact",
      category: "Utility",
      surfaces: ["desktop"],
    },
    {
      id: "settings",
      hide: false,
      title: "Settings",
      description: "System preferences and customization",
      route: "/settings",
      category: "Utility",
      surfaces: ["desktop"],
      desktopOnly: { windowHeight: 700 },
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

// Everything below reads from this, so `hide: true` removes an entry from
// every surface at once.
const VISIBLE_CONTENT: ContentEntry[] = NICKEL_SYSTEM.content.filter(
  (entry) => !entry.hide,
);

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
const DESKTOP_CONTENT: Content[] = VISIBLE_CONTENT.filter((entry) =>
  entry.surfaces.includes("desktop"),
).map(toDesktopContent);

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
  return VISIBLE_CONTENT.filter((entry) =>
    entry.surfaces.includes(surface),
  ).map((entry) => toPortfolioProject(entry, surface));
}
