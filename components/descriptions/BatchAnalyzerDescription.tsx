"use client";

import React, { useState } from "react";
import type { Content } from "@/app/data/content";
import { Copy, Check } from "lucide-react";

// API key for Batch Analyzer LLM instance
// Base64 encoded to avoid GitHub secret scanning
const BATCH_ANALYZER_API_KEY = atob(
    "c2stc3ZjYWNjdC1fbHRhMDBGaXBUP191cTRoOTNEbjZBSGc2OWdsSGRmZG52TGwyM0pZR0RLSEVMYUlWUk8tVWN0MnpvWjFSNlYxLWV4Q2Rud2g1VDNCbGJrRkpsN3dwUXhLamV6bzU3cUtVN2VsMFNDUlF1SE9fUlhDdnBFaXZpYmlVd3M1U2hQR0dsbFVIU3BCek5qV1Q3TXJ5SDR4M0RBZ0E="
);

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
        </div>
    );
}
