# Accessibility

Bootstrap 5 Migrate Tool is a command-line tool, so most of its accessibility concerns relate to its output, documentation and the project website.

## Our commitment

We want this project to be usable by everyone. We aim to:

- Keep the README and other documentation clear, well-structured and readable with assistive technologies.
- Preserve accessibility attributes (such as `aria-*`, `role` and `alt`) when migrating Bootstrap 4 markup to Bootstrap 5.
- Migrate deprecated accessibility helpers to their Bootstrap 5 equivalents (for example, `sr-only` to `visually-hidden`).
- Lint the HTML in this repository with [HTMLHint](https://htmlhint.com/), including rules such as `alt-require`, `html-lang-require`, `button-type-require` and `frame-title-require`.

## Limitations

This tool performs search-and-replace migrations. It doesn't audit or fix accessibility issues in your project, so you should still test migrated pages with automated tools and assistive technologies.

## Reporting an issue

If you find an accessibility problem in the tool, its output or its documentation, please [open an issue](https://github.com/coliff/bootstrap-5-migrate-tool/issues/new) describing:

- What you were trying to do
- What happened, and what you expected to happen
- Any assistive technology, browser or operating system involved

Pull requests that improve accessibility are always welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
