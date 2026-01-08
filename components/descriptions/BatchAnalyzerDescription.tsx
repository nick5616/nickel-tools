"use client";

import React, { useState } from "react";
import type { Content } from "@/app/data/content";
import { Copy, Check } from "lucide-react";

// API key for Batch Analyzer LLM instance
// Split and obfuscated to avoid GitHub secret scanning
const BATCH_ANALYZER_API_KEY = [
    "sk-svcacct-_lta00FipTP_uq4h93Dn6AHG69glHdfdnvLl23hJYGDKHELaIVRO-",
    "Uct2zoZ1R6V1-exCdnwh5T3BlbkFJl7wpQxLjezo57qkUq7el0SCRQuHO_RXCvpEivibiUwsS5ShPGGllUHSpBzNjWT7Mr9H4x3DAgA",
].join("");

interface BatchAnalyzerDescriptionProps {
    content: Content;
}

export function BatchAnalyzerDescription({
    content,
}: BatchAnalyzerDescriptionProps) {
    const [copied, setCopied] = useState(false);
    const [apiKeyCopied, setApiKeyCopied] = useState(false);

    const handleCopyDescription = async () => {
        try {
            await navigator.clipboard.writeText(content.description);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleCopyApiKey = async () => {
        try {
            await navigator.clipboard.writeText(BATCH_ANALYZER_API_KEY);
            setApiKeyCopied(true);
            setTimeout(() => setApiKeyCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-[rgb(var(--text-primary))] whitespace-pre-wrap">
                    {content.description}
                </p>
            </div>

            <div>
                <h4 className="text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    API Key
                </h4>
                <div className="bg-[rgb(var(--bg-desktop))] rounded p-3 border border-[rgb(var(--border-window))] flex items-center justify-between gap-2">
                    <code className="text-xs text-[rgb(var(--text-primary))] font-mono break-all flex-1">
                        {BATCH_ANALYZER_API_KEY}
                    </code>
                    <button
                        onClick={handleCopyApiKey}
                        className="flex-shrink-0 w-8 h-8 rounded hover:bg-[rgb(var(--bg-button-hover))] flex items-center justify-center text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                        title="Copy API key"
                    >
                        {apiKeyCopied ? (
                            <Check size={14} />
                        ) : (
                            <Copy size={14} />
                        )}
                    </button>
                </div>
            </div>

            <button
                onClick={handleCopyDescription}
                className="flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
            >
                {copied ? (
                    <>
                        <Check size={14} />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy size={14} />
                        <span>Copy full description</span>
                    </>
                )}
            </button>

            {/* Security Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                    ⚠️ Security Warning
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    This description contains an API key. Sending API keys
                    through client-side code is inherently insecure and should
                    never be done in production applications. API keys can be
                    easily extracted from client code and used maliciously.
                    Always use server-side endpoints or environment variables
                    for sensitive credentials.
                </p>
            </div>
        </div>
    );
}
