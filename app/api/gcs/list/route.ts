import { NextRequest, NextResponse } from "next/server";

// GCS configuration
const GCS_BUCKET = "artandmedia";
const GCS_PUBLIC_URL = "https://storage.googleapis.com";
const GCS_API_BASE = `https://storage.googleapis.com/storage/v1/b/${GCS_BUCKET}/o`;

interface GCSObject {
    name: string;
    bucket: string;
    contentType?: string;
    size?: string;
    timeCreated?: string;
    updated?: string;
    metadata?: {
        [key: string]: string;
    };
}

interface GCSListResponse {
    items?: GCSObject[];
    nextPageToken?: string;
}

/**
 * Lists all objects in a GCS folder (prefix)
 * Since the bucket is public, we can query it directly
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const folder = searchParams.get("folder");

        if (!folder) {
            return NextResponse.json(
                { error: "Folder parameter is required" },
                { status: 400 }
            );
        }

        // Construct the prefix (folder path in GCS)
        // Ensure it ends with / if it doesn't already
        const prefix = folder.endsWith("/") ? folder : `${folder}/`;

        // Build the API URL with prefix filter and request metadata fields
        // fields parameter requests specific fields to reduce response size
        const fields = "items(name,contentType,size,timeCreated,metadata)";
        const apiUrl = `${GCS_API_BASE}?prefix=${encodeURIComponent(
            prefix
        )}&delimiter=/&fields=${encodeURIComponent(fields)}`;

        // Fetch from GCS JSON API
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("GCS API error:", response.status, errorText);
            return NextResponse.json(
                { error: `Failed to fetch from GCS: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data: GCSListResponse = await response.json();

        // Transform GCS objects to our format
        const files = (data.items || []).map((item) => {
            // Extract filename from full path
            const filename = item.name.split("/").pop() || item.name;

            // Construct the public URL (using storage.googleapis.com format)
            const publicUrl = `${GCS_PUBLIC_URL}/${GCS_BUCKET}/${item.name}`;

            // Extract custom metadata if it exists
            const createdDate = item.metadata?.created;
            const description = item.metadata?.description;
            const privateFlag = item.metadata?.private;

            return {
                name: item.name,
                filename,
                url: publicUrl,
                contentType: item.contentType,
                size: item.size ? parseInt(item.size, 10) : undefined,
                created: createdDate, // Only include if it exists in metadata
                timeCreated: item.timeCreated, // GCS timeCreated field
                description, // Optional description field
                private: privateFlag, // Optional private flag from metadata
            };
        });

        // Sort in reverse chronological order (newest first)
        // Items with created metadata always come before items without it
        const sortedFiles = files.sort((a, b) => {
            const hasCreatedA = !!a.created;
            const hasCreatedB = !!b.created;
            
            // If one has created and the other doesn't, prioritize the one with created
            if (hasCreatedA && !hasCreatedB) {
                return -1; // a comes before b
            }
            if (!hasCreatedA && hasCreatedB) {
                return 1; // b comes before a
            }
            
            // Both have created or both don't - sort by date
            // Get sort dates - prefer created metadata, fall back to timeCreated
            const dateA = a.created 
                ? new Date(a.created).getTime() 
                : (a.timeCreated ? new Date(a.timeCreated).getTime() : 0);
            const dateB = b.created 
                ? new Date(b.created).getTime() 
                : (b.timeCreated ? new Date(b.timeCreated).getTime() : 0);
            
            // Reverse chronological: newest first (descending order)
            return dateB - dateA;
        });

        return NextResponse.json({
            folder,
            files: sortedFiles,
            count: sortedFiles.length,
        });
    } catch (error) {
        console.error("Error listing GCS objects:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

