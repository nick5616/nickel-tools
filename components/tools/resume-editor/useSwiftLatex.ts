import { useState, useEffect, useRef, useCallback } from "react";
import posthog from 'posthog-js';

declare global {
    interface Window {
        SwiftLaTeX: any;
    }
}

export const useSwiftLatex = () => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<
        "idle" | "loading" | "compiling" | "error" | "ready"
    >("idle");
    const [errorLog, setErrorLog] = useState<string>("");
    const engineRef = useRef<any>(null);

    useEffect(() => {
        // Dynamically load SwiftLaTeX from CDN
        setStatus("loading");

        const script = document.createElement("script");
        script.src =
            "https://cdn.jsdelivr.net/npm/swiftlatex@1/dist/swiftlatex.js";
        script.async = true;

        script.onload = async () => {
            try {
                // Initialize the engine
                const engine = new window.SwiftLaTeX.PdfTeXEngine();
                await engine.loadEngine();
                engineRef.current = engine;
                setStatus("idle");
            } catch (error) {
                console.error("Failed to load SwiftLaTeX:", error);
                setStatus("error");
                setErrorLog("Failed to load LaTeX engine");
            }
        };

        script.onerror = () => {
            setStatus("error");
            setErrorLog("Failed to load SwiftLaTeX script");
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const compile = useCallback(
        async (latexSource: string) => {
            if (!engineRef.current || status === "loading") return;

            setStatus("compiling");
            setErrorLog("");

            try {
                // Write the main.tex file
                engineRef.current.writeFile("main.tex", latexSource);

                // Compile
                engineRef.current.setEngineMainFile("main.tex");
                const result = await engineRef.current.compileLaTeX();

                if (result.pdf) {
                    // Convert Uint8Array to blob
                    const blob = new Blob([result.pdf], {
                        type: "application/pdf",
                    });
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    setStatus("ready");
                    posthog.capture('latex_compiled', {
                        success: true,
                        source_length: latexSource.length
                    });
                } else {
                    setStatus("error");
                    const errorMessage = result.log || "Compilation failed";
                    setErrorLog(errorMessage);
                    posthog.capture('latex_compiled', {
                        success: false,
                        source_length: latexSource.length,
                        error_log: errorMessage
                    });
                }
            } catch (error: any) {
                setStatus("error");
                const errorMessage = error.message || "Unknown error";
                setErrorLog(errorMessage);
                posthog.capture('latex_compiled', {
                    success: false,
                    source_length: latexSource.length,
                    error_log: errorMessage
                });
            }
        },
        [status]
    );

    return { pdfUrl, status, errorLog, compile };
};
