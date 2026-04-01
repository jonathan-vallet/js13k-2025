# JS13K Electron

Monorepo for JS13K competition games, each packaged as a standalone Electron desktop app. Each game (HTML, CSS, JS, assets) must compress into a ZIP under **13,312 bytes (13 KB)**.

Uses gulp to concat JS, minify assets...

## Games

- **Witchcat** — an open-world adventure game with seasonal mechanics (JS13K 2025)

## Installing

Node v20+ required.

```bash
npm install
```

## Running a game (browser)

Launch a local dev server with live reload:

```bash
npm run dev:witchcat
```

Other commands:

| Command | Description |
|---|---|
| `npm run dev:witchcat` | Dev server with live reload |
| `npm run watch:witchcat` | Watch files and rebuild (no server) |
| `npm run zip:witchcat` | Production build: minify, concatenate, ZIP |
| `npm run zip-only:witchcat` | Re-create ZIP from already-built dist |

All commands also work via gulp directly with `--game=<name>`:

```bash
npx gulp default --game=witchcat
npx gulp zip --game=witchcat
```

## Running a game (Electron)

Build the game and launch it in Electron:

```bash
npm run electron:dev:witchcat
```

Package as a desktop installer:

```bash
npm run electron:build:witchcat
```

## Coding for JS13K

Create/update files in `games/<game>/src/` folder.

- Use functions instead of objects, for a better minification of JS and takes less place (so more place for more content).
- Use global variables (there is a closure to keep the game environment).

In `src/js`, files are prefixed with numbers to set the loading order.

## Generate your final game

1. `npm run zip:witchcat` — creates the zip file and concatenates css/js in a single html file
2. Go to https://lifthrasiir.github.io/roadroller/ and paste `<script>` content from `games/witchcat/dist/index.html`. Replace it with the output eval.
3. `npm run zip-only:witchcat` — re-create the zip under 13 KB

Your `game.zip` file will be generated in the game's `dist/` and `zip/` folders.
