import SmartPiano from "@/components/tools/smart-piano";
import type { Metadata } from "next";
import posthog from "posthog-js";

export const metadata: Metadata = {
    title: "Smart Piano | Nickel Tools",
    description:
        "An online piano that uses the key you're in and the musical context to suggest the next notes to play.",
    alternates: {
        canonical: "/smart-piano",
    },
};

export default function SmartPianoPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Tool Container */}
            <div className="max-w-[1600px] mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="text-sm text-slate-500 mb-4">
                    <a
                        href="/"
                        className="hover:text-blue-600"
                        onClick={() =>
                            posthog.capture("breadcrumb_link_clicked", {
                                destination: "/",
                                text: "Home",
                            })
                        }
                    >
                        Home
                    </a>
                    <span className="mx-2">/</span>
                    <span className="text-slate-900 font-medium">
                        Smart Piano
                    </span>
                </div>

                {/* The Client Component */}
                <SmartPiano />

                {/* SEO Content Section (Below the fold) */}
                <div className="max-w-3xl mx-auto mt-20 prose prose-slate">
                    <h1>Smart Piano</h1>
                    <p>
                        Welcome to the <strong>Nickel Tools Smart Piano</strong>.
                        This interactive piano uses musical theory to provide
                        intelligent suggestions based on the key you're playing
                        in and the context of your recent notes.
                    </p>

                    <h3>Features</h3>
                    <ul>
                        <li>
                            <strong>Tension Tracking:</strong> The piano
                            calculates musical tension in real-time based on
                            intervals, key relationships, and note stability.
                        </li>
                        <li>
                            <strong>Smart Suggestions:</strong> Notes are
                            color-coded to show which ones will create tension,
                            resolution, or remain neutral based on your current
                            musical context.
                        </li>
                        <li>
                            <strong>Chord Suggestions:</strong> Get intelligent
                            chord recommendations that fit the key and your
                            current musical progression.
                        </li>
                        <li>
                            <strong>Interval Recognition:</strong> See the
                            musical intervals between notes as you play, helping
                            you understand the relationships between notes.
                        </li>
                    </ul>

                    <h3>How to use</h3>
                    <p>
                        Select a key (C Major, G Major, etc.) and start playing
                        notes. The piano will track your musical tension and
                        suggest notes that will create resolution, tension, or
                        remain neutral. Click on chord buttons to play full
                        chords that fit your selected key.
                    </p>
                </div>
            </div>
        </div>
    );
}
