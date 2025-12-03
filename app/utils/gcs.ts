/**
 * Utility functions for working with Google Cloud Storage
 */

const GCS_BUCKET = 'artandmedia';
const GCS_BASE_URL = 'https://storage.cloud.google.com';

/**
 * Constructs a public GCS URL from bucket, folder, and filename
 */
export function constructGCSUrl(folder: string, filename: string): string {
  // Remove leading/trailing slashes and normalize
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
  const normalizedFilename = filename.replace(/^\/+/, '');
  
  return `${GCS_BASE_URL}/${GCS_BUCKET}/${normalizedFolder}/${normalizedFilename}`;
}

/**
 * Maps folder names from the app to GCS folder paths
 */
export function getGCSFolderPath(folder: 'digital-art' | 'paintings' | 'sketches'): string {
  const folderMap: Record<string, string> = {
    'digital-art': 'digitalart',
    'paintings': 'paintings',
    'sketches': 'sketches',
  };
  
  return folderMap[folder] || folder;
}

/**
 * Fetches all files from a GCS folder
 */
export async function listGCSFolder(folder: 'digital-art' | 'paintings' | 'sketches'): Promise<{
  folder: string;
  files: Array<{
    name: string;
    filename: string;
    url: string;
    contentType?: string;
    size?: number;
    timeCreated?: string;
    updated?: string;
  }>;
  count: number;
}> {
  const gcsFolderPath = getGCSFolderPath(folder);
  
  const response = await fetch(`/api/gcs/list?folder=${encodeURIComponent(gcsFolderPath)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch GCS folder: ${response.statusText}`);
  }
  
  return response.json();
}

