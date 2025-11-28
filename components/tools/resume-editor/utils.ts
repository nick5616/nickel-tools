// Helper to convert LaTeX units to Pixels (approximate for screen/PDF)
const parseSize = (latexSize: string): string => {
    const num = parseFloat(latexSize);
    if (isNaN(num)) return "12px"; // Default fallback

    if (latexSize.includes("mm")) return `${num * 3.78}px`; // 1mm ≈ 3.78px
    if (latexSize.includes("cm")) return `${num * 37.8}px`;
    if (latexSize.includes("in")) return `${num * 96}px`;
    if (latexSize.includes("pt")) return `${num * 1.33}px`;
    if (latexSize.includes("em")) return `${num * 16}px`;

    return "12px";
};

export const parseLatexToHtml = (latexSource: string): string => {
    if (!latexSource) return "";

    let html = latexSource;

    // 1. Remove Preamble
    html = html.replace(/\\documentclass[\s\S]*?\{[\s\S]*?\}/g, "");
    html = html.replace(/\\usepackage[\s\S]*?\{[\s\S]*?\}/g, "");
    html = html.replace(/\\pagestyle\{[\s\S]*?\}/g, "");
    html = html.replace(/\\begin\{document\}/g, "");
    html = html.replace(/\\end\{document\}/g, "");

    // 2. Environments
    html = html.replace(
        /\\begin\{center\}/g,
        '<div style="text-align: center; margin-bottom: 16px;">'
    );
    html = html.replace(/\\end\{center\}/g, "</div>");

    // Lists
    html = html.replace(
        new RegExp("\\\\begin\\{itemize\\}(\\s*\\x5B.*?\\x5D)?", "g"),
        '<ul style="margin: 0; padding-left: 24px; list-style-type: disc;">'
    );
    html = html.replace(/\\end\{itemize\}/g, "</ul>");

    // List Items
    html = html.replace(
        /\\item\s*/g,
        '<li style="margin-bottom: 4px; padding-left: 4px;">'
    );

    // 3. Spacing & Layout

    // Newlines
    html = html.replace(
        new RegExp("\\\\\\\\(\\s*\\x5B.*?\\x5D)?", "g"),
        "<br/>"
    );

    // SMART VSPACE: Captures the value inside { } and uses it
    html = html.replace(/\\vspace\{([^}]+)\}/g, (match, size) => {
        const px = parseSize(size);
        return `<div style="height: ${px};"></div>`;
    });

    // noindent
    html = html.replace(/\\noindent/g, "");

    // hfill
    html = html.replace(
        /\\hfill\s*([^\n\\<]*)/g,
        '<span style="float: right;">$1</span>'
    );

    // 4. Text Formatting

    // Large Name
    html = html.replace(
        /\{\\Large\s+\\textbf\{([\s\S]*?)\}\}/g,
        '<span style="font-size: 24px; font-weight: bold; line-height: 1.2; display: inline-block; margin-bottom: 4px;">$1</span>'
    );

    // SECTION HEADERS - The Fix
    // We use padding-bottom AND border-bottom.
    // We use display: block to ensure it takes full width.
    html = html.replace(
        /\\textbf\{\\large\s+([\s\S]*?)\}/g,
        '<div style="display: block; font-size: 16px; font-weight: bold; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #000; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">$1</div>'
    );

    // Wrappers
    html = html.replace(/\\textbf\{([\s\S]*?)\}/g, "<strong>$1</strong>");
    html = html.replace(/\\textit\{([\s\S]*?)\}/g, "<em>$1</em>");
    html = html.replace(
        /\{\\large\s+([\s\S]*?)\}/g,
        '<span style="font-size: 16px; font-weight: bold;">$1</span>'
    );
    html = html.replace(/\\large\s+/g, "");

    // 5. Symbols
    html = html.replace(/\\#/g, "#");
    html = html.replace(/\\\$/g, "$");
    html = html.replace(/\\%/g, "%");
    html = html.replace(/\\_/g, "_");
    html = html.replace(/\\&/g, "&");

    // 6. Cleanup
    html = html.replace(/\{([^{}]*)\}/g, "$1");
    html = html.replace(/\n\n+/g, "\n");

    return html.trim();
};
