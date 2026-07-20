# Blocktopus

Blocktopus is a growing toolbox of display modes for native Gutenberg blocks (`core/gallery`, `core/group`) — no new block types, no leaving the native editor, no learning curve.

## Concept

Most carousel/slider plugins bolt on their own custom block that sits awkwardly next to your existing content, dragging in heavy JS and a design that clashes with the theme. Blocktopus does the opposite: pick a block you already use — Gallery, Group — flip a toggle in its Inspector, and its front-end output transforms. The block itself stays 100% native and editable; nothing changes about how you write content.

Blocktopus is an octopus growing new arms over time: today it's Carousel, tomorrow more display modes will join the same toolbox, each just as simple to turn on.

**Carousel, available today** — turns a Gallery or Group block into a clean, minimalist carousel (via [Splide.js](https://splidejs.com/)), with settings:
- Enable/disable Carousel mode
- Number of visible slides per page
- Autoplay
- Infinite loop

More arms are coming: Accordion, Masonry... are on the roadmap, each following the same pattern (pick a block, flip a toggle). See `CONTEXT.md` and `docs/adr/` for the project's vocabulary and architecture decisions.

## Installing in WordPress

The plugin must be **built before** being installed — the `build/` folder (compiled JS/CSS assets) is not versioned in the git repo.

### From this repo (development)

```bash
composer install
npm install
npm run build
```

Then copy (or symlink) the plugin folder into `wp-content/plugins/` of your WordPress install, e.g.:

```bash
cp -R . /path/to/wordpress/wp-content/plugins/blocktopus
```

Then activate the plugin from the WordPress admin (**Plugins**).

### From a GitHub ZIP archive

If you download the code via GitHub's "Code → Download ZIP" button, the `build/` folder will be missing (it's in `.gitignore`). You'll need to generate it yourself:

1. Place the extracted folder in `wp-content/plugins/`
2. From that folder, run `npm install && npm run build`
3. Activate the plugin in the WordPress admin

### Requirements

- WordPress 6.2+
- PHP 7.4+
- Node.js (to build the JS/CSS assets)

## Usage

1. In the editor, select a **Gallery** or **Group** block
2. In the Inspector (sidebar panel), open the **Blocktopus Carousel** panel
3. Enable the "Enable Carousel mode" toggle
4. Adjust the number of visible slides, autoplay, and infinite loop to your needs

The carousel rendering only applies on the front end — editing the block in the editor stays unchanged.

## Development

```bash
composer install       # PHP dependencies (tests only)
npm install             # JS dependencies

npm run start           # JS build in watch mode
npm run build           # production JS build

composer test-setup     # downloads the WordPress core needed by PHP tests (once)
composer test           # PHP tests (PHPUnit + Brain Monkey)
npm run test:unit       # JS tests (Jest)
```

### WordPress.org release

```bash
bin/build-wporg-package.sh   # generates dist/blocktopus-<version>.zip (runtime only)
```

## Structure

```
blocktopus.php                          # Plugin bootstrap
includes/
├── interface-transform.php             # Blocktopus_Transform contract
├── class-module-registry.php           # Explicit Module registry
├── class-assets.php                    # Conditional front-end asset enqueue
├── class-render.php                    # Generic render dispatch (render_block)
└── modules/carousel/                   # Carousel module
src/
├── index.js                            # Editor entry (generic attributes, Carousel controls)
├── frontend/carousel-init.js           # Splide.js front-end init
└── modules/carousel/                   # Carousel module logic + Inspector Controls
```

## License

GPL-2.0-or-later
