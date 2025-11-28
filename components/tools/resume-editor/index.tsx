"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Download,
    Play,
    FileText,
    Save,
    Upload,
    Trash2,
    AlertCircle,
    RefreshCw,
    Loader,
} from "lucide-react";
import { DEFAULT_TEMPLATE } from "./constants";
import { useSwiftLatex } from "./useSwiftLatex";

export default function ResumeEditor() {
    const [latexSource, setLatexSource] = useState(DEFAULT_TEMPLATE);
    const [saveStatus, setSaveStatus] = useState("");

    const { pdfUrl, status, errorLog, compile } = useSwiftLatex();

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("latex-resume");
        if (saved) setLatexSource(saved);
    }, []);

    const saveToLocalStorage = () => {
        localStorage.setItem("latex-resume", latexSource);
        setSaveStatus("Saved!");
        setTimeout(() => setSaveStatus(""), 2000);
    };

    const handleCompile = () => {
        compile(latexSource);
    };

    const downloadLatex = () => {
        const blob = new Blob([latexSource], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.tex";
        a.click();
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
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    LaTeX Editor
                    {status === "loading" && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                            Loading Engine...
                        </span>
                    )}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleCompile}
                        disabled={
                            status === "compiling" || status === "loading"
                        }
                        className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition shadow-sm text-sm font-medium disabled:opacity-50"
                    >
                        {status === "compiling" ? (
                            <RefreshCw className="animate-spin" size={16} />
                        ) : (
                            <Play size={16} fill="currentColor" />
                        )}
                        {status === "compiling" ? "Compiling..." : "Compile"}
                    </button>

                    <button
                        onClick={saveToLocalStorage}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition shadow-sm text-sm"
                    >
                        <Save size={16} /> Save{" "}
                        {saveStatus && <span className="text-xs">✓</span>}
                    </button>

                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            download="resume.pdf"
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm text-sm"
                        >
                            <Download size={16} /> Download PDF
                        </a>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-3">
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
                    />
                </div>

                {/* PDF Viewer (Right) */}
                <div className="w-1/2 bg-slate-100 flex flex-col">
                    {status === "loading" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                            <Loader className="animate-spin w-8 h-8 text-indigo-600" />
                            <p className="font-medium">
                                Loading LaTeX engine...
                            </p>
                            <p className="text-xs text-slate-400">
                                This happens once per session
                            </p>
                        </div>
                    )}

                    {status === "compiling" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                            <RefreshCw className="animate-spin w-8 h-8 text-indigo-600" />
                            <p>Compiling LaTeX...</p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex-1 p-4 overflow-auto bg-red-50 text-red-900 font-mono text-xs">
                            <div className="flex items-center gap-2 mb-2 font-bold text-red-700">
                                <AlertCircle size={16} /> Compilation Error
                            </div>
                            <pre className="whitespace-pre-wrap">
                                {errorLog}
                            </pre>
                        </div>
                    )}

                    {status === "ready" && pdfUrl && (
                        <iframe
                            src={`${pdfUrl}#toolbar=0&view=FitH`}
                            className="w-full h-full bg-white"
                            title="PDF Preview"
                        />
                    )}

                    {status === "idle" && !pdfUrl && (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            <p>Click "Compile" to generate PDF</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
