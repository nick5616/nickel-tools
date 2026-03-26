import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.nextUrl.hostname;

    if (hostname.includes("nicolebelovoskey")) {
        return NextResponse.redirect(new URL("/portfolio/software", request.url));
    }

    return NextResponse.next();
}
