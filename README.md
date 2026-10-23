# App Store screenshot preflight

A small, dependency-free Node.js check for iOS and iPadOS screenshot sets. Run it on your own files before opening App Store Connect or add it to CI. It checks PNG/JPEG headers, pixel dimensions for current iPhone and iPad display classes, PNG alpha/transparency, and Apple's limit of ten screenshots per device size. Files stay on your machine.

## Run it

Requires Node.js 22 or newer.

```sh
git clone https://github.com/koalin5/app-store-screenshot-preflight.git
node app-store-screenshot-preflight/cli.mjs ./screenshots/en-US ./screenshots/fr-FR
```

Pass each language folder separately. Only image files immediately inside each folder are checked; nested folders are not scanned. The command exits with status 1 if a file needs attention, which makes it suitable for a CI step:

```yaml
- name: Check App Store screenshots
  run: node tools/app-store-screenshot-preflight/cli.mjs screenshots/en-US screenshots/fr-FR
```

Copy `cli.mjs` into `tools/app-store-screenshot-preflight/` in your own repository for that example. The script uses no packages or network calls.

The check covers current iPhone and iPad display classes, including portrait and rotated landscape dimensions. It does not cover every historical device, Mac, Apple TV, Vision Pro, iPhone Duo, screenshot content, file decoding or App Review policy. A pass is a preflight signal, not an acceptance guarantee. For a visual file-by-file check that also suggests a matching export size, use [StoreStudio's free browser validator](https://storestudio.app/tools/screenshot-size-validator/?utm_source=github&utm_medium=referral&utm_campaign=screenshot_preflight). If you still need to create the set, [open StoreStudio's free editor](https://app.storestudio.app/?template=starter&utm_source=github&utm_medium=referral&utm_campaign=screenshot_preflight#studio).

Source: [Apple's screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/), checked October 23, 2026. Review the current App Store Connect wells for your app before uploading.

## Develop

```sh
node --test test.mjs
```

MIT license. StoreStudio is not affiliated with Apple.
