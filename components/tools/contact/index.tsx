"use client";

import React from 'react';
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react';

export default function Contact() {
  return (
    <div className="h-full w-full overflow-auto bg-white dark:bg-zinc-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Contact</h1>
        
        <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
          <p className="text-lg leading-relaxed">
            Get in touch! I'm always open to discussing new projects, creative ideas, or opportunities.
          </p>

          <div className="space-y-4">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Contact Methods</h2>
              
              <div className="space-y-3">
                <a
                  href="mailto:your-email@example.com"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                    <Mail size={20} className="text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-white">Email</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">your-email@example.com</div>
                  </div>
                </a>

                <a
                  href="https://github.com/nick5616"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                    <Github size={20} className="text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-white">GitHub</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">github.com/nick5616</div>
                  </div>
                  <ExternalLink size={16} className="text-zinc-400" />
                </a>

                <a
                  href="https://linkedin.com/in/nicolasbelovoskey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                    <Linkedin size={20} className="text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-white">LinkedIn</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">linkedin.com/in/nicolasbelovoskey</div>
                  </div>
                  <ExternalLink size={16} className="text-zinc-400" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              I typically respond within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

