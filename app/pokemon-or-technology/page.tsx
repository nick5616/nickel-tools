import PokemonTechQuiz from "@/components/tools/pokemon-or-technology";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
    title: "Pokemon or Technology | Nickel Tools",
    description:
        "Test your knowledge! Can you tell the difference between a Pokémon name and a technology term?",
    alternates: {
        canonical: "/pokemon-or-technology",
    },
};

export default function PokemonOrTechnologyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Tool Container */}
            <div className="max-w-[1600px] mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <Breadcrumb
                    currentPage="Pokemon or Technology"
                    trackClick={true}
                />

                {/* The Client Component */}
                <PokemonTechQuiz />

                {/* SEO Content Section (Below the fold) */}
                <div className="max-w-3xl mx-auto mt-20 prose prose-slate">
                    <h1>Pokemon or Technology Quiz</h1>
                    <p>
                        Welcome to the <strong>Pokemon or Technology Quiz</strong>
                        . This fun game tests your knowledge by asking you to
                        identify whether a given name belongs to a Pokémon or a
                        technology term.
                    </p>

                    <h3>How to Play</h3>
                    <ul>
                        <li>
                            You'll be shown a name and asked to guess if it's a
                            Pokémon or a Technology term
                        </li>
                        <li>
                            Each game consists of 20 randomly selected questions
                            from a database of 100 items (50 Pokémon, 50
                            Technology terms)
                        </li>
                        <li>
                            Get instant feedback on whether your guess was
                            correct
                        </li>
                        <li>
                            Track your score and see how well you did at the end
                        </li>
                    </ul>

                    <h3>Features</h3>
                    <ul>
                        <li>
                            <strong>Randomized Questions:</strong> Each game
                            features a different set of 20 questions
                        </li>
                        <li>
                            <strong>Progress Tracking:</strong> See your progress
                            through the game with a visual progress bar
                        </li>
                        <li>
                            <strong>Score Display:</strong> Track your score in
                            real-time as you play
                        </li>
                        <li>
                            <strong>Instant Feedback:</strong> Get immediate
                            feedback on each answer with visual indicators
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

