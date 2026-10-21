'use strict';

/**
 * Bootstrap migration tables and the shared migration engine.
 *
 * Every migration (3 -> 4, 4 -> 3, 4 -> 5 and 5 -> 4) is driven by the tables
 * in this file. The reverse migrations re-use the very same tables with the
 * `from` and `to` sides swapped, which keeps both directions in sync and makes
 * them exact 1:1 mirrors of each other.
 *
 * The class tables are based on the official migration guides:
 * - Bootstrap 3 -> 4: https://getbootstrap.com/docs/4.0/migration/
 * - Bootstrap 4 -> 5: https://getbootstrap.com/docs/5.3/migration/
 */

/** The latest release of every Bootstrap major version. */
const CDN_VERSIONS = {
  3: '3.4.1',
  4: '4.6.2',
  5: '5.3.8',
};

/**
 * The CDN providers the tool knows about. The provider of a link is kept, only
 * the version of the Bootstrap release is updated. The first group holds the
 * part of the URL in front of the version, the second one the file name.
 */
const CDN_URL_PATTERNS = [
  // jsDelivr
  /(https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@)(\d+\.\d+\.\d+)(\/dist\/(?:css|js)\/bootstrap(?:\.bundle)?(?:\.min)?\.(?:css|js))/g,
  // unpkg
  /(https:\/\/unpkg\.com\/bootstrap[@/])(\d+\.\d+\.\d+)(\/(?:dist\/)?(?:css|js)\/bootstrap(?:\.bundle)?(?:\.min)?\.(?:css|js))/g,
  // StackPath and MaxCDN
  /(https:\/\/(?:stackpath|maxcdn)\.bootstrapcdn\.com\/bootstrap\/)(\d+\.\d+\.\d+)(\/(?:css|js)\/bootstrap(?:\.bundle)?(?:\.min)?\.(?:css|js))/g,
];

/** cdnjs, Bootstrap 3 is published as `twitter-bootstrap`. */
const CDNJS_URL_PATTERN =
  /(https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/)(twitter-bootstrap|bootstrap)(\/)(\d+\.\d+\.\d+)(\/(?:dist\/)?(?:css|js)\/bootstrap(?:\.bundle)?(?:\.min)?\.(?:css|js))/g;

/**
 * Official Bootstrap 3 -> 4 class renames.
 *
 * `from` holds the Bootstrap 3 classes, `to` the Bootstrap 4 classes. Both
 * sides are space separated class tokens, e.g. `left carousel-control`.
 *
 * `oneWay` marks rules that can not be reversed. The official guide lists the
 * Bootstrap 3 class as dropped and the replacement already exists in
 * Bootstrap 3 with a different meaning, so reversing it would break the
 * markup (e.g. `.btn-xs` -> `.btn-sm`, `.navbar-form` -> `.form-inline`).
 *
 * `alias` marks an alternative Bootstrap 3 spelling that ends up in the same
 * place as another rule (e.g. `.radio` and `.checkbox` both become
 * `.form-check`). The first rule of a group is the canonical one and is the
 * class the reverse migration restores.
 */
const BS3_TO_BS4_CLASS_RULES = [
  // Alerts
  { from: 'alert-dismissable', to: 'alert-dismissible' },
  // Buttons
  { from: 'btn-default', to: 'btn-secondary' },
  { from: 'btn-xs', to: 'btn-sm', oneWay: true },
  { from: 'btn-group-xs', to: 'btn-group-sm', oneWay: true },
  // Images
  { from: 'img-responsive', to: 'img-fluid' },
  { from: 'img-rounded', to: 'rounded' },
  { from: 'img-circle', to: 'rounded-circle' },
  { from: 'thumbnail', to: 'img-thumbnail', oneWay: true },
  // Floats and alignment
  { from: 'pull-left', to: 'float-left' },
  { from: 'pull-right', to: 'float-right' },
  { from: 'center-block', to: 'mx-auto' },
  // Print utilities
  { from: 'hidden-print', to: 'd-print-none' },
  { from: 'visible-print-block', to: 'd-print-block' },
  { from: 'visible-print-inline', to: 'd-print-inline' },
  { from: 'visible-print-inline-block', to: 'd-print-inline-block' },
  // Responsive display utilities
  { from: 'hidden-xs', to: 'd-none d-sm-block' },
  { from: 'hidden-sm', to: 'd-sm-none d-md-block' },
  { from: 'hidden-md', to: 'd-md-none d-lg-block' },
  { from: 'hidden-lg', to: 'd-lg-none d-xl-block' },
  { from: 'visible-xs', to: 'd-block d-sm-none' },
  { from: 'visible-sm', to: 'd-none d-sm-block d-md-none' },
  { from: 'visible-md', to: 'd-none d-md-block d-lg-none' },
  { from: 'visible-lg', to: 'd-none d-lg-block d-xl-none' },
  { from: 'visible-xs-block', to: 'd-block d-sm-none', alias: true },
  { from: 'visible-sm-block', to: 'd-none d-sm-block d-md-none', alias: true },
  { from: 'visible-md-block', to: 'd-none d-md-block d-lg-none', alias: true },
  { from: 'visible-lg-block', to: 'd-none d-lg-block d-xl-none', alias: true },
  { from: 'visible-xs-inline-block', to: 'd-inline-block d-sm-none' },
  { from: 'visible-sm-inline-block', to: 'd-none d-sm-inline-block d-md-none' },
  { from: 'visible-md-inline-block', to: 'd-none d-md-inline-block d-lg-none' },
  { from: 'visible-lg-inline-block', to: 'd-none d-lg-inline-block d-xl-none' },
  { from: 'visible-xs-inline', to: 'd-inline d-sm-none' },
  { from: 'visible-sm-inline', to: 'd-none d-sm-inline d-md-none' },
  { from: 'visible-md-inline', to: 'd-none d-md-inline d-lg-none' },
  { from: 'visible-lg-inline', to: 'd-none d-lg-inline d-xl-none' },
  // Navbars
  { from: 'navbar-default', to: 'navbar-light' },
  { from: 'navbar-inverse', to: 'navbar-dark' },
  { from: 'navbar-toggle', to: 'navbar-toggler' },
  { from: 'navbar-fixed-top', to: 'fixed-top' },
  { from: 'navbar-fixed-bottom', to: 'fixed-bottom' },
  { from: 'navbar-static-top', to: 'sticky-top' },
  { from: 'navbar-form', to: 'form-inline', oneWay: true },
  { from: 'navbar-left', to: 'mr-auto', oneWay: true },
  { from: 'navbar-right', to: 'ml-auto', oneWay: true },
  // Labels and badges
  { from: 'label', to: 'badge' },
  { from: 'label-default', to: 'badge-secondary' },
  { from: 'label-primary', to: 'badge-primary' },
  { from: 'label-success', to: 'badge-success' },
  { from: 'label-info', to: 'badge-info' },
  { from: 'label-warning', to: 'badge-warning' },
  { from: 'label-danger', to: 'badge-danger' },
  // Panels became cards
  { from: 'panel', to: 'card' },
  { from: 'panel-heading', to: 'card-header' },
  { from: 'panel-title', to: 'card-title' },
  { from: 'panel-body', to: 'card-body' },
  { from: 'panel-footer', to: 'card-footer' },
  { from: 'panel-group', to: 'accordion' },
  /** The contextual panel classes were dropped, the border utilities replace them. */
  { from: 'panel-default', to: '', oneWay: true },
  { from: 'panel-primary', to: 'border-primary' },
  { from: 'panel-success', to: 'border-success' },
  { from: 'panel-info', to: 'border-info' },
  { from: 'panel-warning', to: 'border-warning' },
  { from: 'panel-danger', to: 'border-danger' },
  // Tables and dropdowns
  { from: 'table-condensed', to: 'table-sm' },
  { from: 'divider', to: 'dropdown-divider' },
  // Forms
  { from: 'control-label', to: 'col-form-label' },
  { from: 'input-lg', to: 'form-control-lg' },
  { from: 'input-sm', to: 'form-control-sm' },
  { from: 'help-block', to: 'form-text' },
  { from: 'form-control-static', to: 'form-control-plaintext' },
  { from: 'has-error', to: 'is-invalid' },
  { from: 'has-success', to: 'is-valid' },
  { from: 'checkbox', to: 'form-check' },
  { from: 'radio', to: 'form-check', alias: true },
  { from: 'checkbox-inline', to: 'form-check-inline' },
  { from: 'radio-inline', to: 'form-check-inline', alias: true },
  { from: 'input-group-addon', to: 'input-group-text' },
  { from: 'input-group-btn', to: 'input-group-append' },
  // Progress bars
  { from: 'progress-bar-success', to: 'progress-bar bg-success' },
  { from: 'progress-bar-info', to: 'progress-bar bg-info' },
  { from: 'progress-bar-warning', to: 'progress-bar bg-warning' },
  { from: 'progress-bar-danger', to: 'progress-bar bg-danger' },
  { from: 'progress-bar-striped active', to: 'progress-bar-striped progress-bar-animated' },
  // Carousel
  { from: 'left carousel-control', to: 'carousel-control-prev' },
  { from: 'right carousel-control', to: 'carousel-control-next' },
  { from: 'icon-prev', to: 'carousel-control-prev-icon' },
  { from: 'icon-next', to: 'carousel-control-next-icon' },
  { from: 'item', to: 'carousel-item' },
  { from: 'fade in', to: 'fade show' },
  { from: 'in', to: 'show' },
];

/** The grid was re-organized in Bootstrap 4: the `xs` infix was dropped and the offsets moved. */
for (let size = 1; size <= 12; size++) {
  BS3_TO_BS4_CLASS_RULES.push({ from: `col-xs-${size}`, to: `col-${size}` });
}
for (let size = 0; size <= 12; size++) {
  BS3_TO_BS4_CLASS_RULES.push({ from: `col-xs-offset-${size}`, to: `offset-${size}` });
  BS3_TO_BS4_CLASS_RULES.push({ from: `col-sm-offset-${size}`, to: `offset-sm-${size}` });
  BS3_TO_BS4_CLASS_RULES.push({ from: `col-md-offset-${size}`, to: `offset-md-${size}` });
  BS3_TO_BS4_CLASS_RULES.push({ from: `col-lg-offset-${size}`, to: `offset-lg-${size}` });
}

/**
 * Official Bootstrap 4 -> 5 class renames.
 *
 * `from` holds the Bootstrap 4 classes, `to` the Bootstrap 5 classes.
 * `oneWay` and `alias` work exactly like in the Bootstrap 3 -> 4 table.
 */
const BS4_TO_BS5_CLASS_RULES = [
  // Grid and gutters
  { from: 'no-gutters', to: 'g-0' },
  // The media object was dropped, replicate it with the flex utilities
  { from: 'media', to: 'd-flex', oneWay: true },
  { from: 'media-body', to: 'flex-grow-1', oneWay: true },
  // Tables
  { from: 'thead-light', to: 'table-light' },
  { from: 'thead-dark', to: 'table-dark' },
  // Scrollable preformatted blocks
  { from: 'pre-scrollable', to: 'overflow-y-scroll' },
  // Directional utilities became logical properties (RTL support)
  { from: 'float-left', to: 'float-start' },
  { from: 'float-sm-left', to: 'float-sm-start' },
  { from: 'float-md-left', to: 'float-md-start' },
  { from: 'float-lg-left', to: 'float-lg-start' },
  { from: 'float-xl-left', to: 'float-xl-start' },
  { from: 'float-right', to: 'float-end' },
  { from: 'float-sm-right', to: 'float-sm-end' },
  { from: 'float-md-right', to: 'float-md-end' },
  { from: 'float-lg-right', to: 'float-lg-end' },
  { from: 'float-xl-right', to: 'float-xl-end' },
  { from: 'border-left', to: 'border-start' },
  { from: 'border-right', to: 'border-end' },
  { from: 'border-left-*', to: 'border-start-*' },
  { from: 'border-right-*', to: 'border-end-*' },
  { from: 'rounded-left', to: 'rounded-start' },
  { from: 'rounded-right', to: 'rounded-end' },
  { from: 'text-left', to: 'text-start' },
  { from: 'text-sm-left', to: 'text-sm-start' },
  { from: 'text-md-left', to: 'text-md-start' },
  { from: 'text-lg-left', to: 'text-lg-start' },
  { from: 'text-xl-left', to: 'text-xl-start' },
  { from: 'text-right', to: 'text-end' },
  { from: 'text-sm-right', to: 'text-sm-end' },
  { from: 'text-md-right', to: 'text-md-end' },
  { from: 'text-lg-right', to: 'text-lg-end' },
  { from: 'text-xl-right', to: 'text-xl-end' },
  { from: 'ml-*', to: 'ms-*' },
  { from: 'mr-*', to: 'me-*' },
  { from: 'pl-*', to: 'ps-*' },
  { from: 'pr-*', to: 'pe-*' },
  // Typography
  { from: 'font-weight-bold', to: 'fw-bold' },
  { from: 'font-weight-bolder', to: 'fw-bolder' },
  { from: 'font-weight-light', to: 'fw-light' },
  { from: 'font-weight-lighter', to: 'fw-lighter' },
  { from: 'font-weight-normal', to: 'fw-normal' },
  { from: 'font-italic', to: 'fst-italic' },
  { from: 'text-monospace', to: 'font-monospace' },
  { from: 'text-hide', to: 'd-none', oneWay: true },
  // Border radius
  { from: 'rounded-sm', to: 'rounded-1' },
  { from: 'rounded-lg', to: 'rounded-3' },
  // Responsive embed helpers became ratio helpers
  { from: 'embed-responsive-16by9', to: 'ratio-16x9' },
  { from: 'embed-responsive-1by1', to: 'ratio-1x1' },
  { from: 'embed-responsive-21by9', to: 'ratio-21x9' },
  { from: 'embed-responsive-4by3', to: 'ratio-4x3' },
  { from: 'embed-responsive-item', to: '', oneWay: true },
  { from: 'embed-responsive', to: 'ratio' },
  // Screen reader helpers
  { from: 'sr-only sr-only-focusable', to: 'visually-hidden-focusable' },
  { from: 'sr-only-focusable', to: 'visually-hidden-focusable', alias: true },
  { from: 'sr-only', to: 'visually-hidden' },
  // Forms
  { from: 'custom-control custom-checkbox', to: 'form-check', oneWay: true },
  { from: 'custom-control custom-radio', to: 'form-check', alias: true },
  { from: 'custom-control custom-switch', to: 'form-check form-switch', oneWay: true },
  { from: 'custom-control-input', to: 'form-check-input', oneWay: true },
  { from: 'custom-control-label', to: 'form-check-label', oneWay: true },
  { from: 'custom-select-sm', to: 'form-select-sm' },
  { from: 'custom-select-lg', to: 'form-select-lg' },
  { from: 'custom-select', to: 'form-select' },
  { from: 'custom-range', to: 'form-range' },
  { from: 'form-control-range', to: 'form-range', alias: true },
  { from: 'form-control-file', to: 'form-control', oneWay: true },
  { from: 'custom-file-input', to: 'form-control', oneWay: true },
  { from: 'custom-file-label', to: 'form-label' },
  { from: 'custom-file', to: '', oneWay: true },
  { from: 'form-group', to: 'mb-3', oneWay: true },
  { from: 'form-row', to: 'row', oneWay: true },
  { from: 'form-inline', to: 'd-flex align-items-center', oneWay: true },
  // Input group wrappers were dropped
  { from: 'input-group-append', to: '', oneWay: true },
  { from: 'input-group-prepend', to: '', oneWay: true },
  // Badges
  { from: 'badge-pill', to: 'rounded-pill' },
  { from: 'badge-primary', to: 'text-bg-primary' },
  { from: 'badge-secondary', to: 'text-bg-secondary' },
  { from: 'badge-success', to: 'text-bg-success' },
  { from: 'badge-danger', to: 'text-bg-danger' },
  { from: 'badge-warning', to: 'text-bg-warning' },
  { from: 'badge-info', to: 'text-bg-info' },
  { from: 'badge-light', to: 'text-bg-light' },
  { from: 'badge-dark', to: 'text-bg-dark' },
  // Close button
  { from: 'close', to: 'btn-close' },
  // Buttons
  { from: 'btn-block', to: 'd-grid' },
  // Dropdowns
  { from: 'dropdown-menu-left', to: 'dropdown-menu-start' },
  { from: 'dropdown-menu-sm-left', to: 'dropdown-menu-sm-start' },
  { from: 'dropdown-menu-md-left', to: 'dropdown-menu-md-start' },
  { from: 'dropdown-menu-lg-left', to: 'dropdown-menu-lg-start' },
  { from: 'dropdown-menu-xl-left', to: 'dropdown-menu-xl-start' },
  { from: 'dropdown-menu-right', to: 'dropdown-menu-end' },
  { from: 'dropdown-menu-sm-right', to: 'dropdown-menu-sm-end' },
  { from: 'dropdown-menu-md-right', to: 'dropdown-menu-md-end' },
  { from: 'dropdown-menu-lg-right', to: 'dropdown-menu-lg-end' },
  { from: 'dropdown-menu-xl-right', to: 'dropdown-menu-xl-end' },
  { from: 'dropleft', to: 'dropstart' },
  { from: 'dropright', to: 'dropend' },
  // Cards
  { from: 'card-deck', to: '', oneWay: true },
  { from: 'card-columns', to: '', oneWay: true },
  // Jumbotron
  { from: 'jumbotron-fluid', to: 'rounded-0 px-0' },
  { from: 'jumbotron', to: 'bg-light mb-4 rounded-2 py-5 px-3' },
  // Typography helpers
  { from: 'text-justify', to: '', oneWay: true },
  // Horizontal collapsing (added in Bootstrap 5.1)
  { from: 'width', to: 'collapse-horizontal' },
];

/**
 * Bootstrap 4 data attributes. All JavaScript plugin data attributes were
 * namespaced with `data-bs-` in Bootstrap 5.
 */
const BS4_DATA_ATTRIBUTES = [
  'animation',
  'autohide',
  'backdrop',
  'boundary',
  'container',
  'content',
  'custom-class',
  'delay',
  'dismiss',
  'display',
  'html',
  'interval',
  'keyboard',
  'method',
  'offset',
  'parent',
  'pause',
  'placement',
  'popper-config',
  'reference',
  'ride',
  'selector',
  'slide',
  'slide-to',
  'spy',
  'target',
  'template',
  'title',
  'toggle',
  'touch',
  'trigger',
  'wrap',
];

/**
 * Markup rules that can not be expressed as a class rename. They are only
 * applied in the forward direction.
 */
const BS4_TO_BS5_MARKUP_RULES = [
  {
    /** Bootstrap 5 styles `<select>` elements with `.form-select`. */
    pattern: /<select\b([^>]*)\bclass\s*=\s*(["'])([^"']*)\2([^>]*)>/gi,
    classRules: [
      { from: 'form-control-lg', to: 'form-select-lg' },
      { from: 'form-control-sm', to: 'form-select-sm' },
      { from: 'form-control', to: 'form-select' },
    ],
  },
  {
    /** The Bootstrap 5 close button uses a background image instead of the `&times;` character. */
    pattern: /(<button\b[^>]*\bclass\s*=\s*(["'])[^"']*\bbtn-close\b[^"']*\2[^>]*>)([\s\S]*?)(<\/button>)/gi,
    replace: function (match, open, quote, content, close) {
      const cleaned = content.replace(/<span aria-hidden="true">&times;<\/span>/g, '');
      if (cleaned === content) {
        return match;
      }
      return `${open}${cleaned}${close}`;
    },
  },
];

/** Markup rules for the reverse direction. */
const BS5_TO_BS4_MARKUP_RULES = [
  {
    /** The Bootstrap 4 close button uses the `&times;` character. */
    pattern: /(<button\b[^>]*\bclass\s*=\s*(["'])[^"']*\bclose\b[^"']*\2[^>]*>)([\s\S]*?)(<\/button>)/gi,
    replace: function (match, open, quote, content, close) {
      if (content.trim()) {
        return match;
      }
      return `${open}<span aria-hidden="true">&times;</span>${close}`;
    },
  },
];

/** Matches a `class` attribute of a HTML tag. */
const CLASS_ATTRIBUTE_PATTERN = /(\sclass\s*=\s*)(["'])([^"']*)\2/gi;

/** Splits a class attribute value into its single class tokens. */
function tokenize(value) {
  return String(value).trim().split(/\s+/).filter(Boolean);
}

/** A rule ending with `*` matches every class that starts with the given prefix. */
function isPrefixRule(from) {
  return from.endsWith('*');
}

/**
 * Sorts the rules so that the most specific ones are applied first: rules that
 * match several class tokens come before rules that match a single token and
 * prefix rules are applied last.
 */
function sortRules(rules) {
  return rules.slice().sort((a, b) => {
    const aPrefix = isPrefixRule(a.from) ? 1 : 0;
    const bPrefix = isPrefixRule(b.from) ? 1 : 0;
    if (aPrefix !== bPrefix) {
      return aPrefix - bPrefix;
    }
    const aTokens = tokenize(a.from).length;
    const bTokens = tokenize(b.from).length;
    if (aTokens !== bTokens) {
      return bTokens - aTokens;
    }
    if (a.from.length !== b.from.length) {
      return b.from.length - a.from.length;
    }
    return a.from.localeCompare(b.from);
  });
}

/**
 * Checks that a class map is 1:1: every source class is used once and every
 * target class of a reversible rule is used once.
 */
function validateRules(rules, label) {
  const sources = new Set();
  const targets = new Set();
  const allTargets = new Set(rules.map((rule) => rule.to));

  for (const rule of rules) {
    if (sources.has(rule.from)) {
      throw new Error(`${label} class map must be 1:1, duplicate source class: ${rule.from}`);
    }
    sources.add(rule.from);

    if (rule.alias && !allTargets.has(rule.to)) {
      throw new Error(`${label} class map must be 1:1, alias without matching rule: ${rule.from} -> ${rule.to}`);
    }

    if (!rule.oneWay && !rule.alias) {
      if (targets.has(rule.to)) {
        throw new Error(`${label} class map must be 1:1, duplicate target class: ${rule.to}`);
      }
      targets.add(rule.to);
    }
  }

  return rules;
}

/**
 * Builds the rules for the opposite direction: `from` and `to` are swapped and
 * all rules that can not be reversed are dropped.
 */
function reverseRules(rules) {
  return rules.filter((rule) => !rule.oneWay && !rule.alias).map((rule) => ({ from: rule.to, to: rule.from }));
}

/**
 * Searches the class tokens for a group of tokens that matches the given rule.
 * The tokens do not have to be in the same order but they have to be next to
 * each other.
 */
function findTokenGroup(tokens, parts) {
  if (!parts.length || parts.length > tokens.length) {
    return -1;
  }

  const needed = parts.slice().sort().join('\0');
  for (let index = 0; index + parts.length <= tokens.length; index++) {
    const window = tokens.slice(index, index + parts.length);
    if (window.slice().sort().join('\0') === needed) {
      return index;
    }
  }
  return -1;
}

/**
 * Applies the class rules to the value of a `class` attribute.
 */
function applyClassRules(classValue, rules) {
  const tokens = tokenize(classValue);
  if (!tokens.length) {
    return { value: classValue, count: 0 };
  }

  let count = 0;
  for (const rule of rules) {
    if (isPrefixRule(rule.from)) {
      const prefix = rule.from.slice(0, -1);
      const replacement = rule.to.slice(0, -1);
      let changed = false;
      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.length > prefix.length && token.startsWith(prefix)) {
          tokens[index] = replacement + token.slice(prefix.length);
          changed = true;
        }
      }
      if (changed) {
        count++;
      }
      continue;
    }

    const fromParts = tokenize(rule.from);
    const toParts = tokenize(rule.to);
    let index = findTokenGroup(tokens, fromParts);
    let guard = 0;
    while (index !== -1 && guard <= tokens.length) {
      tokens.splice(index, fromParts.length, ...toParts);
      count++;
      guard++;
      index = findTokenGroup(tokens, fromParts);
    }
  }

  if (count === 0) {
    return { value: classValue, count: 0 };
  }

  return { value: tokens.join(' '), count };
}

/**
 * Updates the version of the Bootstrap CDN links. The provider and the file
 * name of the link are kept, only the version of the Bootstrap release is
 * replaced with the latest release of the target major version.
 */
function replaceBootstrapCdn(content, fromMajor, toVersion, onChange) {
  const toMajor = Number(toVersion.split('.')[0]);
  let result = content;

  for (const pattern of CDN_URL_PATTERNS) {
    result = result.replace(pattern, function (match, prefix, version, file) {
      if (Number(version.split('.')[0]) !== Number(fromMajor)) {
        return match;
      }
      onChange();
      return `${prefix}${toVersion}${file}`;
    });
  }

  result = result.replace(CDNJS_URL_PATTERN, function (match, base, name, slash, version, file) {
    if (Number(version.split('.')[0]) !== Number(fromMajor)) {
      return match;
    }
    onChange();
    const packageName = toMajor > 3 ? 'bootstrap' : 'twitter-bootstrap';
    return `${base}${packageName}${slash}${toVersion}${file}`;
  });

  return result;
}

/**
 * Renames the data attributes of the JavaScript plugins, e.g. `data-toggle`
 * becomes `data-bs-toggle` in Bootstrap 5.
 */
function replaceDataAttributes(content, fromPrefix, toPrefix, names, onChange) {
  const pattern = new RegExp(`\\b${fromPrefix}([a-z0-9-]+)=`, 'g');
  return content.replace(pattern, function (match, name) {
    if (!names.includes(name)) {
      return match;
    }
    onChange();
    return `${toPrefix}${name}=`;
  });
}

/**
 * Migrates the content of a file from one Bootstrap major version to another.
 */
function migrateContent(content, migration) {
  const counts = { classes: 0, dataAttributes: 0, cdnLinks: 0 };
  let result = content;

  result = replaceBootstrapCdn(result, migration.from, migration.cdnVersion, function () {
    counts.cdnLinks++;
  });

  if (migration.dataAttributes.length) {
    result = replaceDataAttributes(result, migration.dataAttributePrefix.from, migration.dataAttributePrefix.to, migration.dataAttributes, function () {
      counts.dataAttributes++;
    });
  }

  result = result.replace(CLASS_ATTRIBUTE_PATTERN, function (match, prefix, quote, classValue) {
    const applied = applyClassRules(classValue, migration.classRules);
    if (!applied.count) {
      return match;
    }
    counts.classes += applied.count;
    if (!applied.value) {
      return '';
    }
    return `${prefix}${quote}${applied.value}${quote}`;
  });

  for (const rule of migration.markupRules) {
    result = result.replace(rule.pattern, function (match, ...groups) {
      if (rule.replace) {
        const replaced = rule.replace(match, ...groups);
        if (replaced !== match) {
          counts.classes++;
        }
        return replaced;
      }

      const classValue = groups[2];
      const applied = applyClassRules(classValue, rule.classRules);
      if (!applied.count) {
        return match;
      }
      counts.classes += applied.count;
      return `<select${groups[0]}class=${groups[1]}${applied.value}${groups[1]}${groups[3]}>`;
    });
  }

  return { content: result, counts };
}

const MIGRATIONS = {
  '3>4': {
    from: 3,
    to: 4,
    cdnVersion: CDN_VERSIONS[4],
    classRules: sortRules(BS3_TO_BS4_CLASS_RULES),
    dataAttributes: [],
    dataAttributePrefix: { from: 'data-', to: 'data-bs-' },
    markupRules: [],
  },
  '4>3': {
    from: 4,
    to: 3,
    cdnVersion: CDN_VERSIONS[3],
    classRules: sortRules(reverseRules(BS3_TO_BS4_CLASS_RULES)),
    dataAttributes: [],
    dataAttributePrefix: { from: 'data-', to: 'data-' },
    markupRules: [],
  },
  '4>5': {
    from: 4,
    to: 5,
    cdnVersion: CDN_VERSIONS[5],
    classRules: sortRules(BS4_TO_BS5_CLASS_RULES),
    dataAttributes: BS4_DATA_ATTRIBUTES,
    dataAttributePrefix: { from: 'data-', to: 'data-bs-' },
    markupRules: BS4_TO_BS5_MARKUP_RULES,
  },
  '5>4': {
    from: 5,
    to: 4,
    cdnVersion: CDN_VERSIONS[4],
    classRules: sortRules(reverseRules(BS4_TO_BS5_CLASS_RULES)),
    dataAttributes: BS4_DATA_ATTRIBUTES,
    dataAttributePrefix: { from: 'data-bs-', to: 'data-' },
    markupRules: BS5_TO_BS4_MARKUP_RULES,
  },
};

validateRules(BS3_TO_BS4_CLASS_RULES, 'Bootstrap 3/4');
validateRules(BS4_TO_BS5_CLASS_RULES, 'Bootstrap 4/5');

/** Returns the migration table for the given Bootstrap versions. */
function getMigration(from, to) {
  const migration = MIGRATIONS[`${from}>${to}`];
  if (!migration) {
    throw new Error(`Unsupported Bootstrap migration: ${from} -> ${to}`);
  }
  return migration;
}

module.exports = {
  BS3_TO_BS4_CLASS_RULES,
  BS4_TO_BS5_CLASS_RULES,
  BS4_DATA_ATTRIBUTES,
  CDN_VERSIONS,
  applyClassRules,
  getMigration,
  migrateContent,
  reverseRules,
  validateRules,
};
