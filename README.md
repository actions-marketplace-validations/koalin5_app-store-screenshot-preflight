# App Store screenshot preflight

A small, dependency-free Node.js check for iOS and iPadOS screenshot sets. Run it on your own files before opening App Store Connect or add it to CI. It checks PNG/JPEG headers, pixel dimensions for current iPhone and iPad display classes including both iPhone Duo displays, PNG alpha/transparency, and Apple's limit of ten screenshots per device size. Files stay on your machine.

## Run it in GitHub Actions

Add a step after checkout. Each line in `paths` is a file or one locale folder; nested device folders are scanned too. Files stay on the GitHub runner. A failed check fails the workflow with the filename and reason.

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Check App Store screenshots
    uses: koalin5/app-store-screenshot-preflight@v1
    with:
      paths: |
        screenshots/en-US
        screenshots/fr-FR
      required_sizes: |
        1320x2868
```

The action installs Node.js 22 for its check. `required_sizes` is optional: use it to catch a missing direct upload file for a display well you intend to fill. Each selected size must have a valid, opaque PNG or JPEG in **each** `paths` entry, so pass one locale root per line. The check does not assume which wells Apple requires for your app; Apple may scale another supported size when your interface is consistent. It scans all nested PNG/JPEG files and requires at least one image. The ten-file limit is assessed within each containing folder and device class.

## Run the CLI

Requires Node.js 22 or newer.

```sh
git clone https://github.com/koalin5/app-store-screenshot-preflight.git
node app-store-screenshot-preflight/cli.mjs --require-size 1320x2868 -- ./screenshots/en-US ./screenshots/fr-FR
```

Pass each language root separately when using `--require-size`; repeat that flag for more display wells. Nested device folders are scanned. The command exits with status 1 if a file needs attention, which makes it suitable for a CI step:

```yaml
- name: Check App Store screenshots
  run: node tools/app-store-screenshot-preflight/cli.mjs screenshots/en-US screenshots/fr-FR
```

Copy `cli.mjs` into `tools/app-store-screenshot-preflight/` in your own repository for that example. The script uses no packages or network calls.

The check covers current iPhone and iPad display classes, including portrait and rotated landscape dimensions. Apple's specifications say iPhone Duo screenshots become required in April 2027 for apps using the iOS 27.1 SDK or later. This checker does not cover every historical device, Mac, Apple TV, Vision Pro, screenshot content, file decoding or App Review policy. A pass is a preflight signal, not an acceptance guarantee. For a visual file-by-file check and an upload-well plan, use [StoreStudio's free browser checker](https://storestudio.app/tools/screenshot-size-validator/?utm_source=github&utm_medium=referral&utm_campaign=screenshot_preflight). When the files pass, [compare how their first three images read at compact size](https://storestudio.app/tools/app-store-search-preview/?utm_source=github&utm_medium=referral&utm_campaign=screenshot_preflight); the images stay in the browser tab. If you need to create a set, [open StoreStudio's free editor](https://app.storestudio.app/?template=starter&utm_source=github&utm_medium=referral&utm_campaign=screenshot_preflight#studio). The editor supports separate, exact-size iPhone Duo [outer](https://app.storestudio.app/?template=starter&target=iphone-duo-outer&utm_source=github&utm_medium=referral&utm_campaign=screenshot_preflight#studio) and [inner](https://app.storestudio.app/?template=starter&target=iphone-duo-inner&utm_source=github&utm_medium=referral&utm_campaign=screenshot_preflight#studio) display projects. Review each design; the two display shapes are not derived from one another.

Preparing separate screenshot sets for Apple custom product pages? [Plan each page's approved keyword intent and first three screenshots](https://storestudio.app/tools/custom-product-page-planner/) before exporting variants. This free browser planner does not connect to App Store Connect or publish a page.

Source: [Apple's screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/), checked October 26, 2026. Review the current App Store Connect wells for your app before uploading.

## Develop

```sh
node --test test.mjs
```

MIT license. StoreStudio is not affiliated with Apple.
