import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.nextUrl.hostname;

    // Only the root redirects — the portfolio iframes load internal app
    // routes (e.g. /pokemon-or-technology) from this same host.
    if (
        hostname.includes("nicolebelovoskey") &&
        request.nextUrl.pathname === "/"
    ) {
        return NextResponse.redirect(new URL("/portfolio/software", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
