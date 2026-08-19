<!--
Draft for https://blockshifter.dev/privacy — to be published on the marketing site.
Content only, no plugin code here.
-->

# Privacy Policy — Blockshifter

## What Blockshifter never does

Blockshifter never collects, tracks or transmits **any data by default**. No network request is ever sent by the plugin until you explicitly enable telemetry in **Settings > Blockshifter**.

## What telemetry sends, if you enable it

Once a week, and immediately after you enable it, your site sends a small anonymous report to `api.blockshifter.dev`:

| Field | Example | Detail |
|---|---|---|
| `installation_id` | `550e8400-e29b-...` | A randomly generated UUID, not tied to your identity or your site's URL |
| `plugin_version` | `0.3.0` | Installed Blockshifter version |
| `wordpress_version` | `6.9` | WordPress version |
| `php_version` | `8.3` | PHP version |
| `features` | `{ "carousel": true, "masonry": false }` | Which Blockshifter modules are detected in use on your site |

## What we never receive

- The content of your pages or posts
- Your site's URL or domain name
- Your name, email, or any information about the site's administrators/users
- Your IP address is not stored in telemetry data

## Why

This data is only used to understand how many installations actually use Blockshifter, and which modules (Carousel, Masonry, and future ones) get adopted — so we can prioritize what to build next based on real usage rather than guesswork.

## Opting out

You can disable telemetry at any time from **Settings > Blockshifter**. Disabling it immediately stops all data collection and sending; your installation identifier is kept (but unused) as long as the plugin stays installed, and permanently deleted if you uninstall Blockshifter.

## Contact

For any question about this policy: [to be filled in — contact email or link].
