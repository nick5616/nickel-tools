"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import posthog from "posthog-js";
import {
    Download,
    Eye,
    Code,
    FileText,
    Save,
    Upload,
    Trash2,
    AlertCircle,
} from "lucide-react";
import { DEFAULT_TEMPLATE } from "./constants";

declare global {
    interface Window {
        PdfTeXEngine?: new () => PdfTeXEngineInstance;
        SwiftLaTeX: any;
    }
}

interface PdfTeXEngineInstance {
    loadEngine(): Promise<void>;
    writeMemFSFile?(filename: string, content: string): void;
    writeFile?(filename: string, content: string): void;
    setEngineMainFile(filename: string): void;
    compileLaTeX(): Promise<{
        pdf?: Uint8Array;
        log?: string;
    }>;
}

export default function ResumeEditor() {
    const [latexSource, setLatexSource] = useState("");
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [compilationLog, setCompilationLog] = useState("");
    const [showLog, setShowLog] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [engineLoaded, setEngineLoaded] = useState(false);
    const [engineError, setEngineError] = useState("");
    const [saveStatus, setSaveStatus] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const engineRef = useRef<PdfTeXEngineInstance | null>(null);

    useEffect(() => {
        loadEngine();
        const saved = localStorage.getItem("latex-resume");
        if (saved) {
            setLatexSource(saved);
        } else {
            setLatexSource(DEFAULT_TEMPLATE);
        }
    }, []);

    const loadEngine = async () => {
        try {
            // Load SwiftLaTeX from local files in public directory
            if (!window.PdfTeXEngine) {
                const script = document.createElement("script");
                // Load from local files in public/20-02-2022/
                script.src = "/20-02-2022/PdfTeXEngine.js";
                script.async = true;

                script.onload = async () => {
                    try {
                        // PdfTeXEngine should be available globally after script loads
                        if (!window.PdfTeXEngine) {
                            throw new Error(
                                "PdfTeXEngine not found after script load"
                            );
                        }

                        const engine = new window.PdfTeXEngine();
                        await engine.loadEngine();

                        engineRef.current = engine;
                        setEngineLoaded(true);
                    } catch (err: any) {
                        setEngineError(
                            "Failed to initialize LaTeX engine: " + err.message
                        );
                        console.error("Engine initialization error:", err);
                    }
                };

                script.onerror = (error) => {
                    console.error("Script load error:", error);
                    setEngineError(
                        "Failed to load LaTeX engine from local files. Please ensure PdfTeXEngine.js is in the public/20-02-2022/ directory."
                    );
                };

                document.body.appendChild(script);
            } else {
                // Engine already loaded
                const engine = new window.PdfTeXEngine();
                await engine.loadEngine();

                engineRef.current = engine;
                setEngineLoaded(true);
            }
        } catch (err: any) {
            setEngineError("Error loading engine: " + err.message);
            console.error("Load engine error:", err);
        }
    };

    const compileLatex = useCallback(async () => {
        if (!engineRef.current) {
            setEngineError("Engine not loaded yet. Please wait...");
            return;
        }
        setIsCompiling(true);
        setCompilationLog("");

        try {
            const engine = engineRef.current;

            // Write the LaTeX file to the virtual filesystem
            // Support both API formats for compatibility
            if (engine.writeMemFSFile) {
                engine.writeMemFSFile("main.tex", latexSource);
            } else if (engine.writeFile) {
                engine.writeFile("main.tex", latexSource);
            } else {
                throw new Error("No write method available on engine");
            }

            // Set main file and compile
            engine.setEngineMainFile("main.tex");
            const result = await engine.compileLaTeX();

            // Get compilation log
            if (result.log) {
                setCompilationLog(result.log);
            }

            // Check if compilation was successful
            if (result.pdf) {
                // Convert PDF bytes to blob URL
                const pdfBlob = new Blob([result.pdf as BlobPart], {
                    type: "application/pdf",
                });
                const url = URL.createObjectURL(pdfBlob);

                // Revoke old URL if it exists
                setPdfUrl((prevUrl) => {
                    if (prevUrl) {
                        URL.revokeObjectURL(prevUrl);
                    }
                    return url;
                });

                posthog.capture("latex_compiled", {
                    success: true,
                    source_length: latexSource.length,
                });
            } else {
                setEngineError(
                    "Compilation failed. Check the log for details."
                );
                setShowLog(true);
                posthog.capture("latex_compiled", {
                    success: false,
                    source_length: latexSource.length,
                    error_log: result.log || "Unknown error",
                });
            }
        } catch (err: any) {
            setEngineError("Compilation error: " + err.message);
            setShowLog(true);
            posthog.capture("latex_compiled", {
                success: false,
                source_length: latexSource.length,
                error_log: err.message || "Unknown error",
            });
        } finally {
            setIsCompiling(false);
        }
    }, [latexSource]);

    // Auto-compile on source change (debounced)
    useEffect(() => {
        if (!engineLoaded || !latexSource) return;

        const timer = setTimeout(() => {
            compileLatex();
        }, 1500); // Compile 1.5 seconds after user stops typing

        return () => clearTimeout(timer);
    }, [latexSource, engineLoaded, compileLatex]);

    const saveToLocalStorage = () => {
        localStorage.setItem("latex-resume", latexSource);
        setSaveStatus("Saved!");
        setTimeout(() => setSaveStatus(""), 2000);
    };

    const downloadPDF = () => {
        if (!pdfUrl) return;
        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = "resume.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadLatex = () => {
        const blob = new Blob([latexSource], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.tex";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const loadLatexFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === "string") {
                    setLatexSource(e.target.result);
                }
            };
            reader.readAsText(file);
        }
    };

    const resetToTemplate = () => {
        if (
            window.confirm(
                "Reset to default template? Your current work will be lost unless saved."
            )
        ) {
            posthog.capture("resume-reset-to-template");
            setLatexSource(DEFAULT_TEMPLATE);
            localStorage.removeItem("latex-resume");
        }
    };

    return (
        <div className="flex flex-col h-[850px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-xl">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        LaTeX Resume Editor
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {engineLoaded ? (
                            <span className="text-green-600">
                                ✓ Real LaTeX compiler loaded
                            </span>
                        ) : (
                            <span className="text-orange-600">
                                ⏳ Loading LaTeX engine...
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={saveToLocalStorage}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition shadow-sm"
                        title="Save to browser storage"
                    >
                        <Save size={18} />
                        Save
                        {saveStatus && <span className="text-xs">✓</span>}
                    </button>
                    <button
                        onClick={() => setShowLog(!showLog)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition shadow-sm"
                    >
                        {showLog ? <Eye size={18} /> : <Code size={18} />}
                        {showLog ? "Preview" : "Log"}
                    </button>
                    <button
                        onClick={downloadPDF}
                        disabled={!pdfUrl}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title="Download PDF"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-3">
                <button
                    onClick={compileLatex}
                    disabled={!engineLoaded || isCompiling}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white border border-blue-600 rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isCompiling ? "Compiling..." : "Compile Now"}
                </button>
                <button
                    onClick={downloadLatex}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                    title="Download .tex file"
                >
                    <FileText size={16} />
                    Download .tex
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                    title="Load .tex file"
                >
                    <Upload size={16} />
                    Load .tex
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".tex"
                    onChange={loadLatexFile}
                    className="hidden"
                />
                <button
                    onClick={resetToTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-red-600"
                    title="Reset to default template"
                >
                    <Trash2 size={16} />
                    Reset
                </button>
                <div className="ml-auto text-xs text-gray-600 flex items-center gap-2">
                    {isCompiling && (
                        <span className="animate-pulse">⚙️ Compiling...</span>
                    )}
                    {!isCompiling && pdfUrl && (
                        <span className="text-green-600">
                            ✓ Compiled successfully
                        </span>
                    )}
                    <span>• Auto-compiles 1.5s after typing</span>
                </div>
            </div>

            {/* Error banner */}
            {engineError && (
                <div className="bg-red-50 border-b border-red-200 p-3 flex items-center gap-2 text-red-800">
                    <AlertCircle size={18} />
                    <span className="text-sm">{engineError}</span>
                    <button
                        onClick={() => setEngineError("")}
                        className="ml-auto text-red-600 hover:text-red-800"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor */}
                <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
                    <div className="p-3 bg-gray-100 border-b border-gray-200 font-semibold text-sm text-gray-700 flex items-center justify-between">
                        <span>LaTeX Source</span>
                        <span className="text-xs font-normal text-gray-500">
                            {latexSource.length} characters
                        </span>
                    </div>
                    <textarea
                        value={latexSource}
                        onChange={(e) => setLatexSource(e.target.value)}
                        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                        spellCheck={false}
                        placeholder="Start typing your LaTeX resume here..."
                    />
                </div>

                {/* Preview / Log */}
                <div className="w-1/2 bg-gray-100 overflow-auto flex flex-col">
                    <div className="p-3 bg-gray-100 border-b border-gray-200 font-semibold text-sm text-gray-700">
                        {showLog ? "Compilation Log" : "PDF Preview"}
                    </div>
                    {showLog ? (
                        <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words bg-white m-4 rounded border border-gray-300 flex-1 overflow-auto">
                            {compilationLog ||
                                "No compilation log yet. Make changes to trigger compilation."}
                        </pre>
                    ) : (
                        <div className="flex-1 p-4">
                            {pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full border-2 border-gray-300 rounded shadow-lg bg-white"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <p className="text-lg mb-2">
                                            {!engineLoaded
                                                ? "⏳ Loading LaTeX engine..."
                                                : "📄 Waiting for compilation..."}
                                        </p>
                                        <p className="text-sm">
                                            {engineLoaded
                                                ? "Edit the LaTeX source to trigger compilation"
                                                : "This may take a few seconds"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
