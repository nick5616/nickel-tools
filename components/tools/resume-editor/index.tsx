"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { parseLatexToHtml } from "./utils";

export default function ResumeEditor() {
    const [latexSource, setLatexSource] = useState(DEFAULT_TEMPLATE);
    const [htmlOutput, setHtmlOutput] = useState("");
    const [showSource, setShowSource] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("latex-resume");
        if (saved) setLatexSource(saved);
    }, []);

    useEffect(() => {
        const html = parseLatexToHtml(latexSource);
        setHtmlOutput(html);
    }, [latexSource]);

    const saveToLocalStorage = () => {
        localStorage.setItem("latex-resume", latexSource);
        setSaveStatus("Saved!");
        setTimeout(() => setSaveStatus(""), 2000);
    };

    const handleDownloadPDF = async () => {
        const html2pdf = (await import("html2pdf.js")).default;

        if (!previewRef.current) return;
        setIsExporting(true);

        const element = previewRef.current;

        const opt = {
            margin: 0,
            filename: "resume.pdf",
            // FIX: Add 'as const' here so TS knows it's exactly "jpeg"
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            // FIX: Add 'as const' here for strict typing on units/format if needed,
            // though usually image.type is the main complainer.
            jsPDF: {
                unit: "in" as const,
                format: "letter" as const,
                orientation: "portrait" as const,
            },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                setIsExporting(false);
            });
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
                if (typeof e.target?.result === "string")
                    setLatexSource(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const resetToTemplate = () => {
        if (window.confirm("Reset to default template?")) {
            setLatexSource(DEFAULT_TEMPLATE);
            localStorage.removeItem("latex-resume");
        }
    };

    return (
        <div className="flex flex-col h-[850px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-xl">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    Editor Workspace
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={saveToLocalStorage}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition shadow-sm text-sm"
                    >
                        <Save size={16} /> Save{" "}
                        {saveStatus && <span className="text-xs">✓</span>}
                    </button>
                    <button
                        onClick={() => setShowSource(!showSource)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition shadow-sm text-sm"
                    >
                        {showSource ? <Eye size={16} /> : <Code size={16} />}{" "}
                        {showSource ? "Preview" : "HTML"}
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm text-sm disabled:opacity-50"
                    >
                        <Download size={16} />{" "}
                        {isExporting ? "Generating..." : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-3 z-10">
                <button
                    onClick={downloadLatex}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                    <FileText size={14} /> Download .tex
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                    <Upload size={14} /> Load .tex
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
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition text-red-600"
                >
                    <Trash2 size={14} /> Reset
                </button>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor (Left) */}
                <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
                    <textarea
                        value={latexSource}
                        onChange={(e) => setLatexSource(e.target.value)}
                        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed text-gray-800"
                        spellCheck={false}
                        placeholder="Type LaTeX here..."
                    />
                </div>

                {/* Preview (Right) - The "Paper" View */}
                <div className="w-1/2 bg-slate-200 overflow-auto flex justify-center p-8">
                    {showSource ? (
                        <pre className="w-full h-full p-4 text-xs font-mono whitespace-pre-wrap break-words bg-white rounded border border-gray-300 text-gray-800">
                            {htmlOutput}
                        </pre>
                    ) : (
                        <div className="relative">
                            {/* Paper Visual Representation */}
                            <div
                                ref={previewRef}
                                className="bg-white shadow-2xl text-black"
                                style={{
                                    width: "8.5in",
                                    minHeight: "11in",
                                    // THIS IS YOUR MARGIN.
                                    // It creates internal padding inside the white box.
                                    padding: "0.5in",
                                    boxSizing: "border-box", // Ensures padding pushes content in, not box out
                                    fontFamily: "'Times New Roman', serif",
                                    fontSize: "11pt",
                                    lineHeight: "1.4",
                                }}
                            >
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: htmlOutput,
                                    }}
                                />
                            </div>

                            {/* Page Break Marker */}
                            <div className="absolute top-[11in] w-full border-b-2 border-dashed border-red-300 pointer-events-none flex items-center justify-end">
                                <span className="bg-red-100 text-red-500 text-[10px] px-1 rounded font-bold">
                                    PAGE 1 END
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
