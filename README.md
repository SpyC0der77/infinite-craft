# Infinite Craft

A browser-based element-combining game inspired by Infinite Craft. Start with Water, Fire, Earth, and Wind, then drag elements onto the workspace and drop one onto another to discover a new element.

[Live demo](https://open-craft.vercel.app)

## What it does

- Drag and move elements on a freeform workspace.
- Search the sidebar for discovered elements.
- Combination results come from `infiniteback.org` through `corsproxy.io`.

## Run locally

Use Node.js 18.18+ and npm.

```bash
git clone https://github.com/SpyC0der77/infinite-craft.git
cd infinite-craft
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm run start` | Serve a production build |

The `lint` script calls the legacy `next lint` command. To run ESLint directly with the included flat config, use `npx eslint .`.

Run `build` before `start`.

## Dependencies and limitations

Discoveries live in React state and reset when the page reloads. Combining elements requires both external services to be available. No API key is configured in this repo.

## Source layout

- [`src/components/DropArea.tsx`](src/components/DropArea.tsx): Workspace and combination requests.
- [`src/context/ElementsContext.tsx`](src/context/ElementsContext.tsx): Starting elements and discoveries.
- [`src/components/Sidebar.tsx`](src/components/Sidebar.tsx): Element list and search.
