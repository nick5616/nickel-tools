/**
 * Utility functions for working with Google Cloud Storage
 */

const GCS_BUCKET = "artandmedia";
const GCS_BASE_URL = "https://storage.cloud.google.com";

// Simple in-memory cache for folder listings (lives for the lifetime of the JS runtime)
// This avoids re-querying GCS every time the gallery is opened in the same session.
const folderCache: Record<
    string,
    {
        folder: string;
        files: Array<{
            name: string;
            filename: string;
            url: string;
            contentType?: string;
            size?: number;
            created?: string;
            description?: string;
        }>;
        count: number;
    }
> = {};

/**
 * Constructs a public GCS URL from bucket, folder, and filename
 */
export function constructGCSUrl(folder: string, filename: string): string {
    // Remove leading/trailing slashes and normalize
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
    const normalizedFilename = filename.replace(/^\/+/, "");

    return `${GCS_BASE_URL}/${GCS_BUCKET}/${normalizedFolder}/${normalizedFilename}`;
}

/**
 * Maps folder names from the app to GCS folder paths
 */
export function getGCSFolderPath(
    folder:
        | "digital-art"
        | "paintings"
        | "sketches"
        | "lefthanded"
        | "miscellaneous"
        | "notesappart"
): string {
    const folderMap: Record<string, string> = {
        "digital-art": "digitalart",
        paintings: "paintings",
        sketches: "sketches",
        lefthanded: "lefthanded",
        miscellaneous: "miscellaneous",
        notesappart: "notesappart",
    };

    return folderMap[folder] || folder;
}

/**
 * Fetches all files from a GCS folder
 */
export async function listGCSFolder(
    folder:
        | "digital-art"
        | "paintings"
        | "sketches"
        | "lefthanded"
        | "miscellaneous"
        | "notesappart"
): Promise<{
    folder: string;
    files: Array<{
        name: string;
        filename: string;
        url: string;
        contentType?: string;
        size?: number;
        created?: string; // Custom metadata field, only present if set
        description?: string; // Optional description from metadata
        private?: string; // Optional private flag from metadata
    }>;
    count: number;
}> {
    const gcsFolderPath = getGCSFolderPath(folder);

    // Use cached result if available
    if (folderCache[gcsFolderPath]) {
        return folderCache[gcsFolderPath];
    }

    const response = await fetch(
        `/api/gcs/list?folder=${encodeURIComponent(gcsFolderPath)}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch GCS folder: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result for this folder path
    folderCache[gcsFolderPath] = data;

    return data;
}
