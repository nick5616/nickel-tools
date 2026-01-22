import ChoicePicker from "@/components/tools/choice-picker";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
    title: "Choice Picker | Nickel Tools",
    description:
        "Spin the wheel to make decisions! Add your options and let chance decide.",
    alternates: {
        canonical: "/choice-picker",
    },
};

export default function ChoicePickerPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Tool Container */}
            <div className="max-w-[1600px] mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <Breadcrumb currentPage="Choice Picker" trackClick={true} />

                {/* The Client Component */}
                <ChoicePicker />

                {/* SEO Content Section (Below the fold) */}
                <div className="max-w-3xl mx-auto mt-20 prose prose-slate">
                    <h1>Choice Picker</h1>
                    <p>
                        Welcome to the <strong>Choice Picker</strong>. This
                        interactive decision-making tool helps you make choices
                        by spinning a beautiful animated wheel. Perfect for when
                        you can&apos;t decide between multiple options!
                    </p>

                    <h3>Features</h3>
                    <ul>
                        <li>
                            <strong>Custom Options:</strong> Add as many options
                            as you need to make your decision
                        </li>
                        <li>
                            <strong>Context Information:</strong> Add optional
                            context labels and information to display during the
                            spin
                        </li>
                        <li>
                            <strong>Beautiful Animations:</strong> Enjoy smooth,
                            visually appealing spinning animations with particle
                            effects
                        </li>
                        <li>
                            <strong>Auto-Save:</strong> Your options and context
                            are automatically saved in your browser
                        </li>
                    </ul>

                    <h3>How to use</h3>
                    <p>
                        Start by adding your options in the input screen. You
                        need at least 2 options to spin. Optionally, add context
                        information that will be displayed at the top during the
                        spin. Once you&apos;re ready, click &quot;Let&apos;s
                        Spin!&quot; and then hit the &quot;SPIN!&quot; button to
                        see the wheel in action. The selected option will be
                        highlighted when the spin completes.
                    </p>
                </div>
            </div>
        </div>
    );
}
