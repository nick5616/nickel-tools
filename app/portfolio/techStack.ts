// Technologies - actual programming languages, frameworks, libraries, and APIs
export const TECHNOLOGIES = [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Python",
    "WebAssembly",
    "LaTeX",
    "Web Audio API",
    "LLM APIs",
    "Three.js",
    "WebGL",
    "Canvas API",
] as const;

// Tags - categories, features, design patterns, algorithms, processing types, and other attributes
export const TAGS = [
    "Machine Learning",
    "OCR",
    "Speech-to-Text",
    "Video Processing",
    "Computer Vision",
    "Image Processing",
    "Batch Processing",
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

// Legacy: Keep for backward compatibility during migration
export const TECH_STACK_OPTIONS = [...TECHNOLOGIES, ...TAGS] as const;

export type Technology = (typeof TECHNOLOGIES)[number];
export type Tag = (typeof TAGS)[number];
export type TechStackOption = (typeof TECH_STACK_OPTIONS)[number];

// Helper function to normalize technology tags to match the standard list
export function normalizeTechnology(tag: string): Technology | null {
    // Try exact match first
    if (TECHNOLOGIES.includes(tag as Technology)) {
        return tag as Technology;
    }

    // Try case-insensitive match
    const normalized = TECHNOLOGIES.find(
        (option) => option.toLowerCase() === tag.toLowerCase()
    );
    if (normalized) {
        return normalized;
    }

    // If no match found, return null
    return null;
}

// Helper function to normalize tag strings to match the standard list
export function normalizeTag(tag: string): Tag | null {
    // Try exact match first
    if (TAGS.includes(tag as Tag)) {
        return tag as Tag;
    }

    // Try case-insensitive match
    const normalized = TAGS.find(
        (option) => option.toLowerCase() === tag.toLowerCase()
    );
    if (normalized) {
        return normalized;
    }

    // Try partial matches for common variations
    const partialMatches: Record<string, Tag> = {
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

// Legacy: Keep for backward compatibility during migration
export function normalizeTechTag(tag: string): TechStackOption | null {
    const tech = normalizeTechnology(tag);
    if (tech) return tech;
    const tagResult = normalizeTag(tag);
    if (tagResult) return tagResult;
    return null;
}
