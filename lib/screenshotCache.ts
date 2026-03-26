/**
 * Screenshot cache backed by localStorage.
 *
 * Two-tier TTL:
 *   - DISPLAY_TTL  (7 days)  — use cached data URL without any network request
 *   - CHECK_INTERVAL (24 hrs) — in background, re-fetch and compare; nullify if changed
 *
 * CORS note: we load the image via <canvas> + crossOrigin="anonymous" so we can
 * extract the data URL.  If the image server doesn't allow CORS (canvas taint),
 * we gracefully fall back to using the plain URL with no caching.
 */

const CACHE_PREFIX = "screenshot_v1_";
const DISPLAY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
    dataUrl: string;
    fetchedAt: number;
    lastCheckedAt: number;
}

function key(url: string) {
    return CACHE_PREFIX + url;
}

function read(url: string): CacheEntry | null {
    try {
        const raw = localStorage.getItem(key(url));
        return raw ? (JSON.parse(raw) as CacheEntry) : null;
    } catch {
        return null;
    }
}

function write(url: string, entry: CacheEntry) {
    try {
        localStorage.setItem(key(url), JSON.stringify(entry));
    } catch {
        // localStorage full — skip silently
    }
}

function remove(url: string) {
    try {
        localStorage.removeItem(key(url));
    } catch {}
}

/**
 * Load an image URL → base64 data URL via canvas.
 * Returns null if CORS prevents canvas readback or the fetch fails.
 */
function loadAsDataUrl(url: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext("2d")?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            } catch {
                // Canvas tainted by CORS — can't extract data URL
                resolve(null);
            }
        };

        img.onerror = () => resolve(null);
        // Cache-bust so the image origin always sees the full request
        img.src = url + (url.includes("?") ? "&" : "?") + "_cb=" + Date.now();
    });
}

export interface ScreenshotResult {
    /** Data URL once resolved; null while the initial fetch is in-flight */
    src: string | null;
    /** True while the initial fetch is in-flight (only when nothing is cached) */
    loading: boolean;
}

type Listener = (result: ScreenshotResult) => void;

/** Small per-URL state machine to coordinate concurrent callers */
interface UrlState {
    result: ScreenshotResult;
    listeners: Set<Listener>;
    backgroundCheckScheduled: boolean;
}

const states = new Map<string, UrlState>();

function notify(url: string) {
    const s = states.get(url);
    if (!s) return;
    for (const fn of s.listeners) fn(s.result);
}

function setResult(url: string, result: ScreenshotResult) {
    const s = states.get(url);
    if (!s) return;
    s.result = result;
    notify(url);
}

/**
 * Perform a background freshness check.
 * If the screenshot has changed: update localStorage + notify listeners.
 * If it's the same: just bump lastCheckedAt.
 */
async function backgroundCheck(url: string, storedDataUrl: string) {
    const fresh = await loadAsDataUrl(url);
    if (!fresh) return; // Network/CORS failure — leave cache as-is

    const now = Date.now();

    if (fresh !== storedDataUrl) {
        // Content changed — update entry and push new image to listeners
        const entry: CacheEntry = {
            dataUrl: fresh,
            fetchedAt: now,
            lastCheckedAt: now,
        };
        write(url, entry);
        setResult(url, { src: fresh, loading: false });
    } else {
        // Same content — just refresh the check timestamp
        const existing = read(url);
        if (existing) {
            write(url, { ...existing, lastCheckedAt: now });
        }
    }
}

/**
 * Subscribe to the screenshot for `screenshotUrl`.
 * Calls `listener` immediately with the current result (or loading state),
 * and again whenever the result updates (background check, initial fetch).
 * Returns an unsubscribe function.
 */
export function subscribeScreenshot(
    screenshotUrl: string,
    listener: Listener
): () => void {
    let state = states.get(screenshotUrl);

    if (!state) {
        const entry = read(screenshotUrl);
        const now = Date.now();

        if (entry && now - entry.fetchedAt < DISPLAY_TTL_MS) {
            // Cache hit — use immediately
            state = {
                result: { src: entry.dataUrl, loading: false },
                listeners: new Set(),
                backgroundCheckScheduled: false,
            };
            states.set(screenshotUrl, state);

            // Schedule background freshness check if overdue
            if (now - entry.lastCheckedAt > CHECK_INTERVAL_MS) {
                state.backgroundCheckScheduled = true;
                setTimeout(
                    () => backgroundCheck(screenshotUrl, entry.dataUrl),
                    5_000
                );
            }
        } else {
            // Cache miss or expired — start loading
            if (entry) remove(screenshotUrl); // evict stale entry

            state = {
                result: { src: null, loading: true },
                listeners: new Set(),
                backgroundCheckScheduled: false,
            };
            states.set(screenshotUrl, state);

            // Initial fetch
            loadAsDataUrl(screenshotUrl).then((dataUrl) => {
                const now = Date.now();
                if (dataUrl) {
                    write(screenshotUrl, {
                        dataUrl,
                        fetchedAt: now,
                        lastCheckedAt: now,
                    });
                    setResult(screenshotUrl, { src: dataUrl, loading: false });
                } else {
                    // CORS blocked — fall back to plain URL, no caching
                    setResult(screenshotUrl, {
                        src: screenshotUrl,
                        loading: false,
                    });
                }
            });
        }
    }

    state.listeners.add(listener);
    // Fire immediately with current state
    listener(state.result);

    return () => {
        state!.listeners.delete(listener);
        // Clean up the shared state if nobody is listening
        if (state!.listeners.size === 0) {
            states.delete(screenshotUrl);
        }
    };
}
