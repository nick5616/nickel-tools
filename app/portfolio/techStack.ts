// Common tech stack options for portfolio filtering
export const TECH_STACK_OPTIONS = [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Python",
    "WebAssembly",
    "LaTeX",
    "Web Audio API",
    "LLM APIs",
    "Machine Learning",
    "OCR",
    "Speech-to-Text",
    "Video Processing",
    "Computer Vision",
    "Image Processing",
    "Batch Processing",
    "Three.js",
    "WebGL",
    "Canvas API",
    "Music Theory Algorithms",
    "Color Theory Algorithms",
    "Mobile-First",
    "Mobile UX",
    "Touch Interactions",
    "Drag & Drop",
    "Progressive Web App",
    "AI Integration",
    "Productivity Tools",
    "Gamification",
    "Journaling",
    "Project Management",
    "Social App",
    "Web Development",
    "Responsive UI",
    "3D Design",
    "Interactive Design",
] as const;

export type TechStackOption = (typeof TECH_STACK_OPTIONS)[number];

// Helper function to normalize tech tags to match the standard list
export function normalizeTechTag(tag: string): string | null {
    // Try exact match first
    if (TECH_STACK_OPTIONS.includes(tag as TechStackOption)) {
        return tag;
    }

    // Try case-insensitive match
    const normalized = TECH_STACK_OPTIONS.find(
        (option) => option.toLowerCase() === tag.toLowerCase()
    );
    if (normalized) {
        return normalized;
    }

    // Try partial matches for common variations
    const partialMatches: Record<string, TechStackOption> = {
        "mobile-first design": "Mobile-First",
        "mobile-first": "Mobile-First",
        "mobile first": "Mobile-First",
        "social ux": "Social App",
        "social app": "Social App",
        "responsive ui": "Responsive UI",
        responsive: "Responsive UI",
        "web development": "Web Development",
        "web dev": "Web Development",
        "productivity tools": "Productivity Tools",
        productivity: "Productivity Tools",
        "project management": "Project Management",
        "3d design": "3D Design",
        "interactive design": "Interactive Design",
        interactive: "Interactive Design",
        "ai integration": "AI Integration",
        ai: "AI Integration",
    };

    const lowerTag = tag.toLowerCase();
    for (const [key, value] of Object.entries(partialMatches)) {
        if (lowerTag.includes(key) || key.includes(lowerTag)) {
            return value;
        }
    }

    // If no match found, return null (tag won't be filterable but will still display)
    return null;
}
