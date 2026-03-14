# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A VuePress static site that serves as a recipe book ("Receitas da Wivian"). All recipes are written in Portuguese and stored as Markdown in `docs/README.md`.

## Commands

```bash
# Local dev server with hot reload
npm run docs:dev

# Build static site for production
npm run docs:build
```

## Architecture

- **Single-page content**: All recipes live in `docs/README.md` — there is no routing or separate pages per recipe.
- **VuePress 1.x**: Config at `docs/.vuepress/config.js`. Sidebar is set to `auto` via frontmatter, so section headings become nav entries automatically.
- **PWA plugin**: `@vuepress/plugin-pwa` is enabled; the manifest is at `docs/.vuepress/public/manifest.json`.
- **Recipe format**: Each recipe follows the pattern: `## Recipe Name` → `### Ingredientes` → `### Modo de preparo`, with emoji styling and optional `::: details Referências` blocks.
