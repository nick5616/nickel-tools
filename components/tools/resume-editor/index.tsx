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
        PdfTeXEngine?: new () => LaTeXEngineInstance;
        XeTeXEngine?: new () => LaTeXEngineInstance;
        SwiftLaTeX: any;
    }
}

interface LaTeXEngineInstance {
    loadEngine(): Promise<void>;
    writeMemFSFile?(filename: string, content: string | Uint8Array): void;
    writeFile?(filename: string, content: string | Uint8Array): void;
    makeMemFSFolder?(folder: string): void;
    setEngineMainFile(filename: string): void;
    compileLaTeX(): Promise<{
        pdf?: Uint8Array;
        log?: string;
        status?: number;
    }>;
}

type CompilerType = "pdftex" | "xetex" | "lualatex";

export default function ResumeEditor() {
    const [latexSource, setLatexSource] = useState("");
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [compilationLog, setCompilationLog] = useState("");
    const [showLog, setShowLog] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [engineLoaded, setEngineLoaded] = useState(false);
    const [engineError, setEngineError] = useState("");
    const [saveStatus, setSaveStatus] = useState("");
    const [compiler, setCompiler] = useState<CompilerType>("pdftex");
    const [mainFileName, setMainFileName] = useState<string>("main.tex");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const projectFolderInputRef = useRef<HTMLInputElement>(null);
    const engineRef = useRef<LaTeXEngineInstance | null>(null);

    useEffect(() => {
        loadEngine(compiler);
        const saved = localStorage.getItem("latex-resume");
        if (saved) {
            setLatexSource(saved);
        } else {
            setLatexSource(DEFAULT_TEMPLATE);
        }
    }, []);

    // Reload engine when compiler changes
    useEffect(() => {
        if (compiler) {
            loadEngine(compiler);
        }
    }, [compiler]);

    const loadEngine = async (engineType: CompilerType) => {
        try {
            setEngineLoaded(false);
            engineRef.current = null;

            if (engineType === "pdftex") {
                // Load PdfTeX engine
                if (!window.PdfTeXEngine) {
                    const script = document.createElement("script");
                    script.src = "/20-02-2022/PdfTeXEngine.js";
                    script.async = true;

                    script.onload = async () => {
                        try {
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
                                "Failed to initialize PdfTeX engine: " +
                                    err.message
                            );
                            console.error("Engine initialization error:", err);
                        }
                    };

                    script.onerror = (error) => {
                        console.error("Script load error:", error);
                        setEngineError(
                            "Failed to load PdfTeX engine from local files."
                        );
                    };

                    document.body.appendChild(script);
                } else {
                    const engine = new window.PdfTeXEngine();
                    await engine.loadEngine();
                    engineRef.current = engine;
                    setEngineLoaded(true);
                }
            } else if (engineType === "xetex") {
                // Load XeTeX engine
                if (!window.XeTeXEngine) {
                    const script = document.createElement("script");
                    script.src = "/20-02-2022/XeTeXEngine.js";
                    script.async = true;

                    script.onload = async () => {
                        try {
                            if (!window.XeTeXEngine) {
                                throw new Error(
                                    "XeTeXEngine not found after script load"
                                );
                            }

                            const engine = new window.XeTeXEngine();
                            await engine.loadEngine();

                            engineRef.current = engine;
                            setEngineLoaded(true);
                        } catch (err: any) {
                            setEngineError(
                                "Failed to initialize XeTeX engine: " +
                                    err.message
                            );
                            console.error("Engine initialization error:", err);
                        }
                    };

                    script.onerror = (error) => {
                        console.error("Script load error:", error);
                        setEngineError(
                            "Failed to load XeTeX engine from local files."
                        );
                    };

                    document.body.appendChild(script);
                } else {
                    const engine = new window.XeTeXEngine();
                    await engine.loadEngine();
                    engineRef.current = engine;
                    setEngineLoaded(true);
                }
            } else {
                setEngineError(
                    `Compiler "${engineType}" is not yet supported.`
                );
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
            // Use the stored main file name (defaults to "main.tex" for textarea editing)
            if (engine.writeMemFSFile) {
                engine.writeMemFSFile(mainFileName, latexSource);
            } else if (engine.writeFile) {
                engine.writeFile(mainFileName, latexSource);
            } else {
                throw new Error("No write method available on engine");
            }

            // Set main file and compile
            engine.setEngineMainFile(mainFileName);
            const result = await engine.compileLaTeX();

            // Get compilation log
            if (result.log) {
                setCompilationLog(result.log);
            }

            // Check if compilation was successful
            // For XeTeX, status 0 means success even if PDF might be in result.pdf
            // For pdfTeX, we check result.pdf directly
            const isSuccess =
                result.pdf ||
                (result.status !== undefined && result.status === 0);

            if (isSuccess && result.pdf) {
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
                    compiler: compiler,
                });
            } else if (result.status === 0 && !result.pdf) {
                // Compilation succeeded but no PDF - might be XDV that needs conversion
                setEngineError(
                    "Compilation succeeded but PDF not generated. Check the log for details."
                );
                setShowLog(true);
                posthog.capture("latex_compiled", {
                    success: false,
                    source_length: latexSource.length,
                    error_log: "PDF not generated",
                    compiler: compiler,
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
                    compiler: compiler,
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
    }, [latexSource, mainFileName, compiler]);

    // Auto-compile disabled - user must click "Compile Now" button
    // useEffect(() => {
    //     if (!engineLoaded || !latexSource) return;
    //
    //     const timer = setTimeout(() => {
    //         compileLatex();
    //     }, 1500); // Compile 1.5 seconds after user stops typing
    //
    //     return () => clearTimeout(timer);
    // }, [latexSource, engineLoaded, compileLatex]);

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
            setMainFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === "string") {
                    setLatexSource(e.target.result);
                }
            };
            reader.readAsText(file);
        }
    };

    // Upload all files from a project folder to the virtual filesystem
    const uploadProjectFiles = async (
        files: FileList,
        mainFileName: string = "resume.tex"
    ): Promise<void> => {
        if (!engineRef.current) {
            throw new Error("Engine not loaded");
        }

        const engine = engineRef.current;
        const fileMap = new Map<string, File>();

        // Build a map of all files with their relative paths
        for (const file of Array.from(files)) {
            const path = file.webkitRelativePath || file.name;
            fileMap.set(path, file);
        }

        // Find the common root directory (the folder name)
        // This is the first directory component that all files share
        let rootDir = "";
        const paths = Array.from(fileMap.keys());
        if (paths.length > 0) {
            const firstPath = paths[0];
            const firstSlash = firstPath.indexOf("/");
            if (firstSlash !== -1) {
                rootDir = firstPath.substring(0, firstSlash);
            }
        }

        // Strip the root directory from all paths
        const normalizedPaths = new Map<string, File>();
        for (const [path, file] of fileMap.entries()) {
            let normalizedPath = path;
            if (rootDir && path.startsWith(rootDir + "/")) {
                normalizedPath = path.substring(rootDir.length + 1);
            }
            normalizedPaths.set(normalizedPath, file);
        }

        // Also normalize the main file name
        let normalizedMainFile = mainFileName;
        if (rootDir && mainFileName.startsWith(rootDir + "/")) {
            normalizedMainFile = mainFileName.substring(rootDir.length + 1);
        }

        // Create directories and upload files
        const directories = new Set<string>();
        for (const path of normalizedPaths.keys()) {
            const dir = path.substring(0, path.lastIndexOf("/"));
            if (dir) {
                directories.add(dir);
            }
        }

        // Create all directories first
        for (const dir of directories) {
            if (engine.makeMemFSFolder) {
                engine.makeMemFSFolder(dir);
            }
        }

        // Upload all files
        const uploadPromises = Array.from(normalizedPaths.entries()).map(
            async ([path, file]) => {
                const isTextFile =
                    path.endsWith(".tex") ||
                    path.endsWith(".cls") ||
                    path.endsWith(".sty") ||
                    path.endsWith(".def") ||
                    path.endsWith(".cfg");

                if (isTextFile) {
                    // Read as text
                    return new Promise<void>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            if (typeof e.target?.result === "string") {
                                if (engine.writeMemFSFile) {
                                    engine.writeMemFSFile(
                                        path,
                                        e.target.result
                                    );
                                } else if (engine.writeFile) {
                                    engine.writeFile(path, e.target.result);
                                }
                                resolve();
                            } else {
                                reject(
                                    new Error(`Failed to read ${path} as text`)
                                );
                            }
                        };
                        reader.onerror = () =>
                            reject(new Error(`Failed to read ${path}`));
                        reader.readAsText(file);
                    });
                } else {
                    // Read as binary (fonts, images, etc.)
                    return new Promise<void>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            if (e.target?.result instanceof ArrayBuffer) {
                                const uint8Array = new Uint8Array(
                                    e.target.result
                                );
                                if (engine.writeMemFSFile) {
                                    engine.writeMemFSFile(path, uint8Array);
                                } else if (engine.writeFile) {
                                    engine.writeFile(path, uint8Array);
                                }
                                resolve();
                            } else {
                                reject(
                                    new Error(
                                        `Failed to read ${path} as binary`
                                    )
                                );
                            }
                        };
                        reader.onerror = () =>
                            reject(new Error(`Failed to read ${path}`));
                        reader.readAsArrayBuffer(file);
                    });
                }
            }
        );

        await Promise.all(uploadPromises);

        // Set the main file (using normalized path)
        engine.setEngineMainFile(normalizedMainFile);
    };

    // Upload a project folder (without compiling)
    const uploadProjectFolder = useCallback(
        async (files: FileList, mainFileName: string = "resume.tex") => {
            if (!engineRef.current) {
                setEngineError("Engine not loaded yet. Please wait...");
                return;
            }

            setEngineError("");

            try {
                // Normalize the main file name (remove root directory if present)
                // This matches the normalization done in uploadProjectFiles
                let normalizedMainFile = mainFileName;
                const paths = Array.from(files).map(
                    (f) => f.webkitRelativePath || f.name
                );
                if (paths.length > 0) {
                    const firstPath = paths[0];
                    const firstSlash = firstPath.indexOf("/");
                    if (firstSlash !== -1) {
                        const rootDir = firstPath.substring(0, firstSlash);
                        if (mainFileName.startsWith(rootDir + "/")) {
                            normalizedMainFile = mainFileName.substring(
                                rootDir.length + 1
                            );
                        }
                    }
                }

                // Upload all files to virtual filesystem
                await uploadProjectFiles(files, mainFileName);

                // Store the normalized main file name for compilation
                setMainFileName(normalizedMainFile);

                // Update latexSource to show the main file content (optional)
                // This helps users see what will be compiled
                const mainFile = Array.from(files).find((f) => {
                    const path = f.webkitRelativePath || f.name;
                    // Normalize the path (remove root directory if present)
                    let normalizedPath = path;
                    const firstSlash = path.indexOf("/");
                    if (firstSlash !== -1) {
                        const rootDir = path.substring(0, firstSlash);
                        if (path.startsWith(rootDir + "/")) {
                            normalizedPath = path.substring(rootDir.length + 1);
                        }
                    }
                    // Match against normalized main file name
                    return normalizedPath === normalizedMainFile;
                });
                if (mainFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (typeof e.target?.result === "string") {
                            setLatexSource(e.target.result);
                        }
                    };
                    reader.readAsText(mainFile);
                }

                posthog.capture("latex_project_uploaded", {
                    file_count: files.length,
                    compiler: compiler,
                });
            } catch (err: any) {
                setEngineError("Upload error: " + err.message);
                posthog.capture("latex_project_uploaded", {
                    success: false,
                    file_count: files.length,
                    error_log: err.message || "Unknown error",
                    compiler: compiler,
                });
            }
        },
        [compiler]
    );

    // Compile a project folder (legacy - kept for backwards compatibility)
    const compileProjectFolder = useCallback(
        async (files: FileList, mainFileName: string = "resume.tex") => {
            if (!engineRef.current) {
                setEngineError("Engine not loaded yet. Please wait...");
                return;
            }

            setIsCompiling(true);
            setCompilationLog("");
            setEngineError("");

            try {
                // Upload all files to virtual filesystem
                await uploadProjectFiles(files, mainFileName);

                // Compile
                const result = await engineRef.current.compileLaTeX();

                // Get compilation log
                if (result.log) {
                    setCompilationLog(result.log);
                }

                // Check if compilation was successful
                // For XeTeX, status 0 means success even if PDF might be in result.pdf
                // For pdfTeX, we check result.pdf directly
                const isSuccess =
                    result.pdf ||
                    (result.status !== undefined && result.status === 0);

                if (isSuccess && result.pdf) {
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

                    posthog.capture("latex_project_compiled", {
                        success: true,
                        file_count: files.length,
                        compiler: compiler,
                    });
                } else if (result.status === 0 && !result.pdf) {
                    // Compilation succeeded but no PDF - might be XDV that needs conversion
                    setEngineError(
                        "Compilation succeeded but PDF not generated. Check the log for details."
                    );
                    setShowLog(true);
                    posthog.capture("latex_project_compiled", {
                        success: false,
                        file_count: files.length,
                        error_log: "PDF not generated",
                        compiler: compiler,
                    });
                } else {
                    setEngineError(
                        "Compilation failed. Check the log for details."
                    );
                    setShowLog(true);
                    posthog.capture("latex_project_compiled", {
                        success: false,
                        file_count: files.length,
                        error_log: result.log || "Unknown error",
                        compiler: compiler,
                    });
                }
            } catch (err: any) {
                setEngineError("Compilation error: " + err.message);
                setShowLog(true);
                posthog.capture("latex_project_compiled", {
                    success: false,
                    file_count: files.length,
                    error_log: err.message || "Unknown error",
                });
            } finally {
                setIsCompiling(false);
            }
        },
        []
    );

    const loadProjectFolder = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            // Find the main .tex file (resume.tex, main.tex, or first .tex file)
            let mainFile = "resume.tex";
            const texFiles = Array.from(files).filter((f) =>
                f.name.endsWith(".tex")
            );
            if (texFiles.length > 0) {
                const resumeFile = texFiles.find(
                    (f) => f.name === "resume.tex" || f.name === "main.tex"
                );
                mainFile = resumeFile
                    ? resumeFile.webkitRelativePath || resumeFile.name
                    : texFiles[0].webkitRelativePath || texFiles[0].name;
            }

            // Just upload files, don't compile automatically
            uploadProjectFolder(files, mainFile);
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
        <div className="flex flex-col h-[850px] border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-900 shadow-xl">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 p-4 flex items-center justify-between shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                        LaTeX Resume Editor
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                        {engineLoaded ? (
                            <span className="text-green-600 dark:text-green-400">
                                ✓ Real LaTeX compiler loaded
                            </span>
                        ) : (
                            <span className="text-orange-600 dark:text-orange-400">
                                ⏳ Loading LaTeX engine...
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={saveToLocalStorage}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition shadow-sm"
                        title="Save to browser storage"
                    >
                        <Save size={18} />
                        Save
                        {saveStatus && <span className="text-xs">✓</span>}
                    </button>
                    <button
                        onClick={() => setShowLog(!showLog)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 dark:bg-zinc-700 text-white rounded hover:bg-gray-700 dark:hover:bg-zinc-600 transition shadow-sm"
                    >
                        {showLog ? <Eye size={18} /> : <Code size={18} />}
                        {showLog ? "Preview" : "Log"}
                    </button>
                    <button
                        onClick={downloadPDF}
                        disabled={!pdfUrl}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-sm disabled:bg-gray-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed"
                        title="Download PDF"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 p-3 flex items-center gap-3">
                <select
                    value={compiler}
                    onChange={(e) =>
                        setCompiler(e.target.value as CompilerType)
                    }
                    disabled={isCompiling}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 transition disabled:bg-gray-200 dark:disabled:bg-zinc-900 disabled:cursor-not-allowed"
                    title="Select LaTeX compiler"
                >
                    <option value="pdftex">pdfTeX</option>
                    <option value="xetex">XeTeX</option>
                    <option value="lualatex" disabled>
                        LuaLaTeX (Coming soon)
                    </option>
                </select>
                <button
                    onClick={compileLatex}
                    disabled={!engineLoaded || isCompiling}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 dark:bg-blue-600 text-white border border-blue-600 dark:border-blue-700 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition disabled:bg-gray-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed"
                >
                    {isCompiling ? "Compiling..." : "Compile Now"}
                </button>
                <button
                    onClick={downloadLatex}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
                    title="Download .tex file"
                >
                    <FileText size={16} />
                    Download .tex
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
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
                    onClick={() => projectFolderInputRef.current?.click()}
                    disabled={!engineLoaded || isCompiling}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500 dark:bg-purple-600 text-white border border-purple-600 dark:border-purple-700 rounded hover:bg-purple-600 dark:hover:bg-purple-500 transition disabled:bg-gray-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed"
                    title="Upload Overleaf project folder"
                >
                    <Upload size={16} />
                    Upload Project
                </button>
                <input
                    ref={projectFolderInputRef}
                    type="file"
                    multiple
                    onChange={loadProjectFolder}
                    className="hidden"
                />
                <button
                    onClick={resetToTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
                    title="Reset to default template"
                >
                    <Trash2 size={16} />
                    Reset
                </button>
                <div className="ml-auto text-xs text-gray-600 dark:text-zinc-400 flex items-center gap-2">
                    {isCompiling && (
                        <span className="animate-pulse">⚙️ Compiling...</span>
                    )}
                    {!isCompiling && pdfUrl && (
                        <span className="text-green-600 dark:text-green-400">
                            ✓ Compiled successfully
                        </span>
                    )}
                    <span>• Click "Compile Now" to compile</span>
                </div>
            </div>

            {/* Error banner */}
            {engineError && (
                <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3 flex items-center gap-2 text-red-800 dark:text-red-300">
                    <AlertCircle size={18} />
                    <span className="text-sm">{engineError}</span>
                    <button
                        onClick={() => setEngineError("")}
                        className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor */}
                <div className="w-1/2 border-r border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col">
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 font-semibold text-sm text-gray-700 dark:text-zinc-300 flex items-center justify-between">
                        <span>LaTeX Source</span>
                        <span className="text-xs font-normal text-gray-500 dark:text-zinc-500">
                            {latexSource.length} characters
                        </span>
                    </div>
                    <textarea
                        value={latexSource}
                        onChange={(e) => setLatexSource(e.target.value)}
                        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                        spellCheck={false}
                        placeholder="Start typing your LaTeX resume here..."
                    />
                </div>

                {/* Preview / Log */}
                <div className="w-1/2 bg-gray-100 dark:bg-zinc-900 overflow-auto flex flex-col">
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 font-semibold text-sm text-gray-700 dark:text-zinc-300">
                        {showLog ? "Compilation Log" : "PDF Preview"}
                    </div>
                    {showLog ? (
                        <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 m-4 rounded border border-gray-300 dark:border-zinc-700 flex-1 overflow-auto">
                            {compilationLog ||
                                "No compilation log yet. Make changes to trigger compilation."}
                        </pre>
                    ) : (
                        <div className="flex-1 p-4">
                            {pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full border-2 border-gray-300 dark:border-zinc-700 rounded shadow-lg bg-white dark:bg-zinc-800"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-zinc-400">
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
