// Shared spring presets so every surface moves with the same physics.
export const springs = {
    // Windows, sheets, app launches
    window: { type: "spring", stiffness: 380, damping: 34, mass: 0.9 },
    // Popovers, menus, small panels
    snappy: { type: "spring", stiffness: 520, damping: 36 },
    // Hover/press feedback on icons
    press: { type: "spring", stiffness: 600, damping: 28 },
    // Dock magnification
    dock: { mass: 0.1, stiffness: 170, damping: 14 },
} as const;

export interface OriginRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function rectOf(el: Element | null | undefined): OriginRect | undefined {
    if (!el) return undefined;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
}
