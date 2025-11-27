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
        '<div style="text-align: center; margin-bottom: 10px;">'
    );
    html = html.replace(/\\end\{center\}/g, "</div>");

    // Lists
    html = html.replace(
        /\\begin\{itemize\}.*?/g,
        '<ul style="margin: 4px 0 8px 0; padding-left: 20px; list-style-type: disc;">'
    );
    html = html.replace(/\\end\{itemize\}/g, "</ul>");
    html = html.replace(/\\item\s*/g, '<li style="margin-bottom: 2px;">');

    // 3. Spacing & Layout (Fixing the run-on text issues)
    // Convert \\ to breaks
    html = html.replace(/\\\\(\s*\[.*?\[)?/g, "<br/>");
    // vspace - make it a block to force separation
    html = html.replace(
        /\\vspace\{[\s\S]*?\}/g,
        '<div style="height: 12px;"></div>'
    );

    // noindent - just remove it
    html = html.replace(/\\noindent/g, "");

    // hfill - float right
    html = html.replace(
        /\\hfill\s*([^\n\\<]*)/g,
        '<span style="float: right;">$1</span>'
    );

    // 4. Text Formatting
    html = html.replace(
        /\{\\Large\s+\\textbf\{([\s\S]*?)\}\}/g,
        '<span style="font-size: 22px; font-weight: bold; line-height: 1.2;">$1</span>'
    );

    // Section Headers (\textbf{\large ...})
    html = html.replace(
        /\\textbf\{\\large\s+([\s\S]*?)\}/g,
        // CHANGED: Increased padding-bottom to 5px, added margin-top 24px for breathing room
        '<div style="font-size: 16px; font-weight: bold; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3;">$1</div>'
    );

    // Formatting wrappers
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
