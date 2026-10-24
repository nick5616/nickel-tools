import YoutubeToMp3 from "@/components/tools/youtube-to-mp3";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

const TITLE = "YouTube to MP3 Converter – Free, Fast, No Ads";
const DESCRIPTION =
    "Convert YouTube videos to MP3 for free. Paste a link and download high quality 192 kbps audio in seconds. No ads, no sign-up, no pop-ups.";

export const metadata: Metadata = {
    // Root layout is a client component, so the base for relative URLs is set here.
    metadataBase: new URL("https://nickeltools.dev"),
    title: `${TITLE} | Nickel Tools`,
    description: DESCRIPTION,
    keywords: [
        "youtube to mp3",
        "youtube to mp3 converter",
        "youtube mp3 downloader",
        "convert youtube to mp3",
        "youtube audio downloader",
        "yt to mp3",
    ],
    alternates: {
        canonical: "/youtube-to-mp3",
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: "/youtube-to-mp3",
        siteName: "Nickel Tools",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: TITLE,
        description: DESCRIPTION,
    },
};

const FAQ = [
    {
        q: "How do I convert a YouTube video to MP3?",
        a: "Copy the video's link from the address bar or the Share button, paste it above, and press Convert to MP3. The MP3 downloads automatically when it's ready.",
    },
    {
        q: "Is it free?",
        a: "Yes. There are no ads, no accounts, and no limits beyond a one-hour maximum video length.",
    },
    {
        q: "What quality is the MP3?",
        a: "192 kbps, which is at or above the quality of the audio YouTube streams. The file is tagged with the video's title and channel.",
    },
    {
        q: "Does it work with playlist, mix, Shorts and youtu.be links?",
        a: "Yes. Watch links, youtu.be short links, Shorts, and links from a playlist or mix all work. Only the video in the link is converted, not the whole playlist.",
    },
    {
        q: "Does it work on iPhone and Android?",
        a: "Yes. It runs in any modern browser on phones, tablets, and computers. Nothing to install.",
    },
];

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebApplication",
            name: "YouTube to MP3 Converter",
            url: "https://nickeltools.dev/youtube-to-mp3",
            description: DESCRIPTION,
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        {
            "@type": "FAQPage",
            mainEntity: FAQ.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
            })),
        },
    ],
};

export default function YoutubeToMp3Page() {
    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Breadcrumb currentPage="YouTube to MP3" />

                <h1 className="text-2xl sm:text-3xl font-semibold text-center mt-8">
                    YouTube to MP3 Converter
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-2">
                    Paste a link, get an MP3. Free, no ads, no sign-up.
                </p>

                <YoutubeToMp3 />

                <div className="max-w-xl mx-auto mt-16 text-sm text-neutral-600 dark:text-neutral-400 space-y-8">
                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            How to convert YouTube to MP3
                        </h2>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Copy the link of a YouTube video.</li>
                            <li>Paste it into the box above.</li>
                            <li>
                                Press <strong>Convert to MP3</strong>. The file
                                downloads when it&apos;s ready.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            FAQ
                        </h2>
                        <dl className="space-y-4">
                            {FAQ.map(({ q, a }) => (
                                <div key={q}>
                                    <dt className="font-medium text-neutral-900 dark:text-neutral-100">
                                        {q}
                                    </dt>
                                    <dd className="mt-1">{a}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <p className="text-xs">
                        Only download audio you own or have permission to use.
                    </p>
                </div>
            </div>
        </div>
    );
}
