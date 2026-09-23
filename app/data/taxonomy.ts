// The fixed vocabularies for project metadata in content.ts. Entries can only
// use values listed here (TypeScript rejects anything else), which keeps
// spelling consistent and makes every field reliably filterable.
//
// To add a new option, append it to the relevant list below.

export const CATEGORIES = [
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
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = [
  "operational",
  "in-development",
  "experimental",
  "archived",
] as const;
export type Status = (typeof STATUSES)[number];

// Where an entry is rendered: the desktop/mobile OS, or one of the
// /portfolio/* pages ("design" is /portfolio/ux).
export const SURFACES = ["desktop", "software", "design", "art"] as const;
export type Surface = (typeof SURFACES)[number];
export type PortfolioSurface = Exclude<Surface, "desktop">;

// Programming languages, frameworks, libraries, platforms, and APIs.
export const TECHNOLOGIES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "HTML",
  "CSS",
  "React",
  "Next.js",
  "Nest.js",
  "Node.js",
  "Tailwind CSS",
  "Framer Motion",
  "Firebase Auth",
  "Nivo",
  "Lit",
  "HTMX",
  "Flask",
  "Django",
  "Three.js",
  "React-Three-Fiber",
  "WebGL",
  "Canvas API",
  "Web Audio API",
  "WebAssembly",
  "LaTeX",
  "LLM APIs",
  "WebSockets",
  "WebRTC",
  "Redis",
  "Docker",
  "Google Cloud Platform",
  "Google Cloud Storage",
] as const;
export type Technology = (typeof TECHNOLOGIES)[number];

// Art materials, tools, and techniques (the art-side counterpart to tech).
export const MEDIUMS = [
  "Digital Art",
  "Digital Illustration",
  "Digital Painting",
  "Illustration",
  "Character Design",
  "Visual Storytelling",
  "Procreate",
  "Photoshop",
  "Acrylic Paint",
  "Watercolor",
  "Traditional Media",
  "Canvas",
  "Pencil",
  "Pen & Ink",
  "Charcoal",
  "Sketching",
] as const;
export type Medium = (typeof MEDIUMS)[number];

// Features, design patterns, algorithms, and other attributes.
export const TAGS = [
  "Machine Learning",
  "Computer Vision",
  "OCR",
  "Speech-to-Text",
  "Video Processing",
  "Image Processing",
  "Audio Processing",
  "Pitch Detection",
  "MIDI",
  "Batch Processing",
  "Music Theory Algorithms",
  "Color Theory Algorithms",
  "AI Integration",
  "Mobile-First",
  "Mobile UX",
  "Responsive UI",
  "Touch Interactions",
  "Drag & Drop",
  "Progressive Web App",
  "Web Development",
  "3D Design",
  "Interactive Design",
  "Design System",
  "Accessibility",
  "Real-time",
  "Data Visualization",
  "Dashboard",
  "SRE",
  "Social App",
  "Productivity Tools",
  "Project Management",
  "Journaling",
  "Gamification",
  "Quiz",
  "Brain Training",
  "Portfolio",
] as const;
export type Tag = (typeof TAGS)[number];
