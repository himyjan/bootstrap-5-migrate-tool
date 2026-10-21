# Bootstrap Migrate Tool

[![LICENSE: MIT](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://raw.githubusercontent.com/coliff/bootstrap-5-migrate-tool/main/LICENSE)
[![GitHub Super-Linter](https://github.com/coliff/bootstrap-5-migrate-tool/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)
[![GitHub stars image](https://img.shields.io/github/stars/coliff/bootstrap-5-migrate-tool.svg?label=GitHub%20Stars)](https://github.com/coliff/bootstrap-5-migrate-tool)

A command-line script designed to help you migrate your Bootstrap projects between Bootstrap 3, 4 and 5. It uses gulp with gulp-replace to replace class names within your folder of HTML pages/templates.

## Features

- Migrates Bootstrap 3 to 4, Bootstrap 4 to 3, Bootstrap 4 to 5 and Bootstrap 5 to 4
- Every migration is driven by the same table as its counterpart: the reverse migration uses the table with the class names swapped, so a `4 -> 5 -> 4` round trip gives you the original file back (except for the classes that the official guide lists as dropped, see [How the 1:1 reverse works](#how-the-11-reverse-works))
- All class names and data attributes are based on the official Bootstrap migration guides
- Replaces deprecated components (such as `.jumbotron` and `.media`) with utility classes
- Renames all the data attributes (such as `data-toggle` and `data-target`) to the new names
- Updates the version of all Bootstrap CDN links (cdnjs, jsdelivr, maxcdn, stackpath and unpkg) to the latest release of the target Bootstrap version, the CDN provider of the link is kept
- Options to overwrite the existing files in place or save the migrated files to a different folder
- Can convert not only HTML files but also ASP, CSHTML, EJS, ERB, HBS, JSP, PHP, VUE, and other template files
- Provides a summary of the changes made

## Usage

Clone this repo and then run the following command:

```bash
npm install
```

Copy your HTML templates to the `src` folder.

Then run the following command to start the migration:

```bash
npx gulp migrate
```

The migrated HTML templates will overwrite the files in place by default. If you want to keep the original files, you can use the `--dest` flag to specify a destination folder. See the [Options](#options) section for more details.

### Available tasks

| Task                   | Migration        | Demo input | Demo output     |
| ---------------------- | ---------------- | ---------- | --------------- |
| `npx gulp migrate`     | Bootstrap 4 to 5 | `src/`     | `dest/src/`     |
| `npx gulp migrate5to4` | Bootstrap 5 to 4 | `src5to4/` | `dest/src5to4/` |
| `npx gulp migrate3to4` | Bootstrap 3 to 4 | `src3to4/` | `dest/src3to4/` |
| `npx gulp migrate4to3` | Bootstrap 4 to 3 | `src4to3/` | `dest/src4to3/` |

Read the official migration guides here:

- [Migrating to Bootstrap 5](https://getbootstrap.com/docs/5.3/migration/) (Bootstrap 4 to 5)
- [Migrating to Bootstrap 4](https://getbootstrap.com/docs/4.0/migration/) (Bootstrap 3 to 4)

## Options

Options that may be set via CLI flags.
For example: `npx gulp migrate  --src "./src-dir" --overwrite --verbose`

- `src: './src'` - string that will be passed to the gulp {@link src} function
- `dest: ./`- string that will be passed to the gulp {@link dest} function
- `overwrite: true` - overwrite the existing files in place. **Cannot be used with --dest flag**
- `verbose: true`- print the path of each generated / modified file to the console
- `defaultFileGlob: '**/*.{asp,aspx,cshtml,gohtml,gotmpl,ejs,erb,hbs,html,htm,js,jsp,php,ts,twig,vue}'` - default glob for files to search in. Default: Search all folder and files recursively

## Demo

- Input: [Bootstrap 4 HTML template](https://coliff.github.io/bootstrap-5-migrate-tool/src/index.html)
- Output: [Bootstrap 5 HTML template](https://coliff.github.io/bootstrap-5-migrate-tool/dest/src/index.html)

### Test pages

Every test page has a "Migration coverage" section that lists all the class names, data attributes and CDN links the migrate tool updates in that direction. The names are shown as text and applied to the element, so the test pages cover the complete migration table:

| Test page            | Bootstrap version | Migration direction |
| -------------------- | ----------------- | ------------------- |
| `src/index.html`     | 4                 | 4 to 5              |
| `src5to4/index.html` | 5                 | 5 to 4              |
| `src3to4/index.html` | 3                 | 3 to 4              |
| `src4to3/index.html` | 4                 | 4 to 3              |

The section is generated from the migration tables. Run `npm run coverage` after you add a rule to update the test pages, the test suite fails when a rule is not covered by the test pages.

`npm test` runs ESLint, Prettier, the unit tests and regenerates the demo pages in `dest/`.

## How the 1:1 reverse works

All class renames live in one table per Bootstrap version in [`lib/bootstrap-migration.js`](lib/bootstrap-migration.js):

- `BS3_TO_BS4_CLASS_RULES` holds the renames of the official [Bootstrap 4 migration guide](https://getbootstrap.com/docs/4.0/migration/)
- `BS4_TO_BS5_CLASS_RULES` holds the renames of the official [Bootstrap 5 migration guide](https://getbootstrap.com/docs/5.3/migration/)

The reverse migration re-uses the same table with `from` and `to` swapped. Each table is validated on startup: every source class and every target class may only be used once, so a rename can never be applied twice or shadow another one.

### One way rules

The rules below are marked as `oneWay`. They are classes that the official guide lists as dropped, where the replacement already exists in the source version with a different meaning. Reversing them would change unrelated markup (every `.row` would become a `.form-row` for example), so they are only applied in the forward direction:

**Bootstrap 3 to 4**

| Forward rule                      | Reason                                                                     |
| --------------------------------- | -------------------------------------------------------------------------- |
| `.btn-xs` → `.btn-sm`             | `.btn-sm` is the small button in Bootstrap 3, not the extra small one      |
| `.btn-group-xs` → `.btn-group-sm` | `.btn-group-sm` is the small group in Bootstrap 3, not the extra small one |
| `.thumbnail` → `.img-thumbnail`   | `.img-thumbnail` is the same style as `.thumbnail` in Bootstrap 3.4        |
| `.navbar-form` → `.form-inline`   | `.form-inline` is the inline form in Bootstrap 3, not the navbar form      |
| `.navbar-left` → `.mr-auto`       | `.mr-auto` is a general margin utility in Bootstrap 4                      |
| `.navbar-right` → `.ml-auto`      | `.ml-auto` is a general margin utility in Bootstrap 4                      |
| `.panel-default` → removed        | Bootstrap 4 has no default panel                                           |

**Bootstrap 4 to 5**

| Forward rule                                                | Reason                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| `.media` → `.d-flex`                                        | `.d-flex` is a general flex utility in Bootstrap 4           |
| `.media-body` → `.flex-grow-1`                              | `.flex-grow-1` is a general flex utility in Bootstrap 4      |
| `.text-hide` → `.d-none`                                    | `.d-none` is a general display utility in Bootstrap 4        |
| `.embed-responsive-item` → removed                          | the ratio helper needs no class on the child element         |
| `.custom-control custom-checkbox` → `.form-check`           | `.form-check` is the native checkbox style in Bootstrap 4    |
| `.custom-control custom-switch` → `.form-check.form-switch` | Bootstrap 4 has no `.form-switch`                            |
| `.custom-control-input` → `.form-check-input`               | `.form-check-input` is the native input style in Bootstrap 4 |
| `.custom-control-label` → `.form-check-label`               | `.form-check-label` is the native label style in Bootstrap 4 |
| `.form-control-file` → `.form-control`                      | `.form-control` is the general input style in Bootstrap 4    |
| `.custom-file-input` → `.form-control`                      | `.form-control` is the general input style in Bootstrap 4    |
| `.custom-file` → removed                                    | Bootstrap 5 puts `.form-control` on the file input           |
| `.form-group` → `.mb-3`                                     | `.mb-3` is a general margin utility in Bootstrap 4           |
| `.form-row` → `.row`                                        | `.row` is the general grid row in Bootstrap 4                |
| `.form-inline` → `.d-flex.align-items-center`               | `.d-flex` is a general flex utility in Bootstrap 4           |
| `.input-group-append` → removed                             | Bootstrap 5 uses the input group children directly           |
| `.input-group-prepend` → removed                            | Bootstrap 5 uses the input group children directly           |
| `.card-deck` → removed                                      | Bootstrap 5 uses the grid instead                            |
| `.card-columns` → removed                                   | Bootstrap 5 uses Masonry instead                             |
| `.text-justify` → removed                                   | the utility was removed in Bootstrap 5                       |

### Alias rules

The rules below are marked as `alias`. They are alternative spellings that end up in the same place as another rule, e.g. `.radio` and `.checkbox` both become `.form-check`. The reverse migration restores the first rule of such a group:

| Alias                                                | Canonical rule                                              |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| `.radio` → `.form-check`                             | `.checkbox` → `.form-check`                                 |
| `.radio-inline` → `.form-check-inline`               | `.checkbox-inline` → `.form-check-inline`                   |
| `.visible-xs-block` → `.d-block.d-sm-none`           | `.visible-xs` → `.d-block.d-sm-none`                        |
| `.visible-sm-block` → `.d-none.d-sm-block.d-md-none` | `.visible-sm` → `.d-none.d-sm-block.d-md-none`              |
| `.visible-md-block` → `.d-none.d-md-block.d-lg-none` | `.visible-md` → `.d-none.d-md-block.d-lg-none`              |
| `.visible-lg-block` → `.d-none.d-lg-block.d-xl-none` | `.visible-lg` → `.d-none.d-lg-block.d-xl-none`              |
| `.custom-control custom-radio` → `.form-check`       | `.custom-control custom-checkbox` → `.form-check`           |
| `.form-control-range` → `.form-range`                | `.custom-range` → `.form-range`                             |
| `.sr-only-focusable` → `.visually-hidden-focusable`  | `.sr-only sr-only-focusable` → `.visually-hidden-focusable` |

## Post-migration Tips

### Migrating to Bootstrap 5

- Use the [Bootstrap Deprecated Classes browser extension](https://github.com/julien-deramond/bootstrap-deprecated-classes-extension) on your site post migration to see if anything is missed
- The tool renames the data attributes of the JavaScript plugins, including the jQuery selectors in your scripts, e.g. `$('[data-toggle="tooltip"]')` becomes `$('[data-bs-toggle="tooltip"]')`
- Bootstrap 5 dropped the jQuery dependency, you can remove the jQuery script tag
- Note that Bootstrap v5 no longer includes print styles. Consider using: [Bootstrap Print CSS](https://github.com/coliff/bootstrap-print-css)
- Bootstrap has issues with Windows Contrast themes. Consider using: [Bootstrap Forced Colors CSS](https://github.com/coliff/bootstrap-forced-colors-css)
- You probably don't need to support Internet Explorer 11 anymore, but if you do consider using: [Bootstrap-ie11](https://github.com/coliff/bootstrap-ie11)
- If you used negative margins/padding classes (e.g, `.mt-n1` or `.pb-n2`) note that Bootstrap 5 disables them by default, so they are not included in the Bootstrap CSS CDN. You may want to enable `$enable-negative-margins` in your own build
- Bootstrap 5 removed the `.input-group-prepend` and `.input-group-append` wrappers. The tool removes the classes, so if you migrate back to Bootstrap 4 you have to add the wrappers again around the buttons and the input group texts

### Migrating to Bootstrap 4

- The tool renames the classes, but a few components need additional markup. Bootstrap 4 requires the `.page-item` and `.page-link` classes in the pagination, the `.breadcrumb-item` class in the breadcrumbs and the `.list-group-item-action` class on the links of a list group
- The Bootstrap 4 grid added the `sm` breakpoint and dropped the `xs` infix, so the grid classes shift by one breakpoint (`.col-xs-6` becomes `.col-6`, `.col-md-6` in Bootstrap 3 is `.col-lg-6` in Bootstrap 4)
- Bootstrap 4 dropped the Glyphicons icon font. Use [Bootstrap Icons](https://icons.getbootstrap.com/) or another icon set instead
- Bootstrap 4 dropped Internet Explorer 9 and below, Internet Explorer 10 is the oldest supported browser

### Migrating back to Bootstrap 3

- Bootstrap 3 has no `xs` grid tier, its smallest tier starts at 768px. The `col-*` classes of Bootstrap 4 become `col-xs-*` classes in Bootstrap 3, but the column sizes do not match exactly
- Bootstrap 3 has no bundle build of the JavaScript file. A `bootstrap.bundle.min.js` link stays a bundle link, it just points to a file that does not exist in Bootstrap 3

### For every migration

- The tool only updates the version of the CDN links, the provider and the file name of the link are kept. If your link has an `integrity` attribute, the hash is no longer valid and has to be updated
- The tool updates the class names, the data attributes and the CDN links. Everything else, like the JavaScript of your page or the markup of a component, has to be checked by hand
