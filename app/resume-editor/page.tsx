import ResumeEditor from "@/components/tools/resume-editor";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "LaTeX Resume Editor | Nickel Tools",
    description:
        "Free browser-based LaTeX resume builder. Export to PDF instantly without installing software.",
    alternates: {
        canonical: "/resume-editor",
    },
};

export default function ResumePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Tool Container */}
            <div className="max-w-[1600px] mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="text-sm text-slate-500 mb-4">
                    <a href="/" className="hover:text-blue-600">
                        Home
                    </a>
                    <span className="mx-2">/</span>
                    <span className="text-slate-900 font-medium">
                        Resume Editor
                    </span>
                </div>

                {/* The Client Component */}
                <ResumeEditor />

                {/* SEO Content Section (Below the fold) */}
                <div className="max-w-3xl mx-auto mt-20 prose prose-slate">
                    <h1>Free LaTeX Resume Editor</h1>
                    <p>
                        Welcome to the{" "}
                        <strong>Nickel Tools Resume Editor</strong>. This tool
                        allows you to write resumes using LaTeX syntax and see
                        the results in real-time, all within your browser.
                    </p>

                    <h3>Why use this tool?</h3>
                    <ul>
                        <li>
                            <strong>No Installation:</strong> Traditional LaTeX
                            requires installing gigabytes of software (TexLive,
                            MacTex). This runs entirely in Chrome/Edge/Firefox.
                        </li>
                        <li>
                            <strong>ATS Friendly:</strong> LaTeX generates
                            clean, structured PDFs that Applicant Tracking
                            Systems can read easily.
                        </li>
                        <li>
                            <strong>Privacy Focused:</strong> Unlike other
                            resume builders, your data is stored in your
                            browser's <code>LocalStorage</code>. It is never
                            sent to a server.
                        </li>
                    </ul>

                    <h3>How to use</h3>
                    <p>
                        Simply edit the LaTeX code on the left side. The preview
                        on the right will update automatically. When you are
                        finished, click <strong>Export PDF</strong> to download
                        your resume.
                    </p>
                </div>
            </div>
        </div>
    );
}
