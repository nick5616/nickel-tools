import { useState, useEffect, useRef, useCallback } from "react";

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
                } else {
                    setStatus("error");
                    setErrorLog(result.log || "Compilation failed");
                }
            } catch (error: any) {
                setStatus("error");
                setErrorLog(error.message || "Unknown error");
            }
        },
        [status]
    );

    return { pdfUrl, status, errorLog, compile };
};
