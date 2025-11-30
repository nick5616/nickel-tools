# Event tracking report

This document lists all PostHog events that have been automatically added to your Next.js application.

## Events by File

### app/page.tsx

- **searched-projects**: Fired when a user types in the project search bar.
- **project-card-clicked**: Fired when a user clicks on a project card to navigate to it.

### app/smart-piano/page.tsx

- **breadcrumb_link_clicked**: Fired when the user clicks the 'Home' link in the breadcrumb navigation.

### components/tools/resume-editor/index.tsx

- **resume-compiled**: User clicked the 'Compile' button to generate a PDF from the LaTeX source.
- **resume-reset-to-template**: User confirmed and reset the resume editor content to the default template.

### components/tools/resume-editor/useSwiftLatex.ts

- **latex_compiled**: Fired when a user attempts to compile their LaTeX source code into a PDF. Tracks the success or failure of the compilation, the source code length, and any error messages.

### components/tools/smart-piano/index.tsx

- **piano_key_changed**: Fired when a user selects a new musical key from the dropdown menu.
- **piano_smart_mode_toggled**: Fired when a user clicks the 'Smart' button to toggle smart suggestions.
- **piano_chord_played**: Fired when a user clicks on one of the suggested chord buttons.


## Events still awaiting implementation
- (human: you can fill these in)
---

## Next Steps

1. Review the changes made to your files
2. Test that events are being captured correctly
3. Create insights and dashboards in PostHog
4. Make a list of events we missed above. Knock them out yourself, or give this file to an agent.

Learn more about what to measure with PostHog and why: https://posthog.com/docs/new-to-posthog/getting-hogpilled
