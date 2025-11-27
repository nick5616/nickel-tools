export const DEFAULT_TEMPLATE = String.raw`\documentclass{article}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}

\pagestyle{empty}

\begin{document}

\begin{center}
{\Large \textbf{Nick Name}} \\
\vspace{2mm}
(555) 123-4567 | nick@example.com | github.com/nickel | linkedin.com/in/nickel
\end{center}

\vspace{4mm}

\noindent\textbf{\large EXPERIENCE}
\vspace{2mm}

\noindent\textbf{Senior Developer} \hfill Jan 2024 -- Present \\
\textit{Tech Corp} \hfill San Francisco, CA \\
\vspace{1mm}
\begin{itemize}[leftmargin=*, itemsep=1pt]
\item \textbf{Optimized} core rendering engine reducing load times by 40\%
\item \textbf{Led} a team of 5 engineers to ship the Nickel Tools platform
\item Implement feature that achieved \textbf{99\% uptime}
\end{itemize}

\vspace{4mm}

\noindent\textbf{\large SKILLS}
\vspace{2mm}

\noindent\textbf{Languages:} JavaScript, TypeScript, Python, Java \\
\textbf{Frontend:} React, Next.js, Tailwind CSS \\
\textbf{Backend:} Node.js, PostgreSQL

\end{document}`;