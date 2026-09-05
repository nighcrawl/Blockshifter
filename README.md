# Blockshifter

WordPress plugin adding alternate front-end display modes to native Gutenberg blocks (`core/gallery`, `core/group`) — no new block types, no custom editor UI beyond Inspector Controls.

## Modules

- **Carousel** — renders the block as a carousel via [Splide.js](https://splidejs.com/). Settings: enable/disable, slides per page, autoplay, infinite loop.
- **Masonry** — renders the block as a CSS Grid masonry layout, no third-party library. Settings: enable/disable, columns (Group only — Gallery keeps its own native Columns control). Gap comes from each block's native Gap setting.

Both modules only affect front-end rendering (`render_block`); the block itself stays fully native in the editor. See `CONTEXT.md` and `docs/adr/` for vocabulary and architecture decisions.

## Installing in WordPress

The easiest way to install Blockshifter is from the WordPress plugin directory: https://wordpress.org/plugins/blockshifter/ — search for "Blockshifter" in **Plugins > Add New**, or upload the ZIP directly.

The sections below are for installing from this repo instead, which requires a build step — the `build/` folder (compiled JS/CSS assets) is not versioned in the git repo.

### From this repo (development)

```bash
composer install
npm install
npm run build
```

Then copy (or symlink) the plugin folder into `wp-content/plugins/` of your WordPress install, e.g.:

```bash
cp -R . /path/to/wordpress/wp-content/plugins/blockshifter
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

### Carousel

1. In the editor, select a **Gallery** or **Group** block
2. In the Inspector (sidebar panel), open the **Blockshifter Carousel** panel
3. Enable the "Enable Carousel mode" toggle
4. Adjust the number of visible slides, autoplay, and infinite loop to your needs

### Masonry

1. In the editor, select a **Gallery** or **Group** block
2. In the Inspector (sidebar panel), open the **Blockshifter Masonry** panel
3. Enable the "Enable Masonry mode" toggle
4. On a Group, set the number of columns (Gallery keeps its own native Columns control); set spacing via the block's native **Gap** setting on either block

### Editor Preview

While a Module is enabled, the editor canvas renders a live preview of the front-end output (Carousel or Masonry layout) instead of the block's default appearance, plus a "Shifted" badge on the block toolbar to indicate a Module is active.

## Telemetry

Blockshifter includes fully opt-in, anonymous usage telemetry — disabled by default. See the Privacy section of `readme.txt` for what is (and isn't) collected, and how to enable/disable it from **Settings > Blockshifter**.

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
bin/build-wporg-package.sh   # generates dist/blockshifter-<version>.zip (runtime only)
```

## Structure

```
blockshifter.php                          # Plugin bootstrap
includes/
├── interface-transform.php             # Blockshifter_Transform contract
├── class-module-registry.php           # Explicit Module registry
├── class-assets.php                    # Conditional front-end asset enqueue
├── class-render.php                    # Generic render dispatch (render_block)
└── modules/
    ├── carousel/                       # Carousel module
    └── masonry/                        # Masonry module
src/
├── index.js                            # Editor entry (generic attributes, Carousel/Masonry controls)
├── frontend/carousel-init.js           # Splide.js front-end init
├── frontend/masonry-init.js            # Masonry front-end init (CSS Grid span calc)
└── modules/
    ├── carousel/                       # Carousel module logic + Inspector Controls
    └── masonry/                        # Masonry module logic + Inspector Controls
```

## License

GPL-2.0-or-later
