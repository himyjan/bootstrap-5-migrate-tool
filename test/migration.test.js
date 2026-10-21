const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { BS3_TO_BS4_CLASS_RULES, BS4_TO_BS5_CLASS_RULES, BS4_DATA_ATTRIBUTES, getMigration, migrateContent } = require('../lib/bootstrap-migration');

/** Reads one of the test pages. */
function readPage(file) {
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
}

/** Collects the class tokens of every `class` attribute of a page. */
function classAttributes(content) {
  const attributes = [];
  const pattern = /\sclass\s*=\s*(["'])([^"']*)\1/g;
  let match = pattern.exec(content);
  while (match !== null) {
    attributes.push(match[2].trim().split(/\s+/).filter(Boolean));
    match = pattern.exec(content);
  }
  return attributes;
}

/** Checks that a class (or a group of classes) is used on a page. */
function coversClass(attributes, value) {
  if (value.endsWith('*')) {
    const prefix = value.slice(0, -1);
    return attributes.some((tokens) => tokens.some((token) => token.length > prefix.length && token.startsWith(prefix)));
  }
  const parts = value.split(/\s+/).filter(Boolean);
  return attributes.some((tokens) => parts.every((part) => tokens.includes(part)));
}

/** Runs a migration on a plain HTML snippet. */
function migrate(html, from, to) {
  return migrateContent(html, getMigration(from, to));
}

/** Runs a migration on the class attribute of a tag. */
function migrateClass(classValue, from, to) {
  const result = migrate(`<div class="${classValue}"></div>`, from, to);
  const match = result.content.match(/class="([^"]*)"/);
  return match ? match[1] : '';
}

const isReversible = (rule) => !rule.oneWay && !rule.alias;

test('the Bootstrap 3/4 and 4/5 class maps are 1:1', () => {
  for (const [rules, label] of [
    [BS3_TO_BS4_CLASS_RULES, 'Bootstrap 3/4'],
    [BS4_TO_BS5_CLASS_RULES, 'Bootstrap 4/5'],
  ]) {
    const sources = rules.map((rule) => rule.from);
    const targets = rules.filter(isReversible).map((rule) => rule.to);
    assert.strictEqual(new Set(sources).size, sources.length, `${label} has duplicate source classes`);
    assert.strictEqual(new Set(targets).size, targets.length, `${label} has duplicate target classes`);
  }
});

test('the Bootstrap 3 -> 4 migration renames the classes of the official migration guide', () => {
  const expected = {
    'alert-dismissable': 'alert-dismissible',
    'btn-default': 'btn-secondary',
    'img-responsive': 'img-fluid',
    'img-rounded': 'rounded',
    'img-circle': 'rounded-circle',
    'pull-left': 'float-left',
    'pull-right': 'float-right',
    'center-block': 'mx-auto',
    'hidden-print': 'd-print-none',
    'visible-print-block': 'd-print-block',
    'navbar-default': 'navbar-light',
    'navbar-inverse': 'navbar-dark',
    'navbar-toggle': 'navbar-toggler',
    'navbar-fixed-top': 'fixed-top',
    'navbar-static-top': 'sticky-top',
    label: 'badge',
    'label-default': 'badge-secondary',
    panel: 'card',
    'panel-heading': 'card-header',
    'panel-title': 'card-title',
    'panel-body': 'card-body',
    'panel-footer': 'card-footer',
    'panel-group': 'accordion',
    divider: 'dropdown-divider',
    'table-condensed': 'table-sm',
    'control-label': 'col-form-label',
    'input-lg': 'form-control-lg',
    'input-sm': 'form-control-sm',
    'help-block': 'form-text',
    'form-control-static': 'form-control-plaintext',
    'has-error': 'is-invalid',
    'has-success': 'is-valid',
    checkbox: 'form-check',
    'checkbox-inline': 'form-check-inline',
    'input-group-addon': 'input-group-text',
    'input-group-btn': 'input-group-append',
    'left carousel-control': 'carousel-control-prev',
    'right carousel-control': 'carousel-control-next',
    'icon-prev': 'carousel-control-prev-icon',
    'icon-next': 'carousel-control-next-icon',
    item: 'carousel-item',
    'fade in': 'fade show',
    in: 'show',
    'progress-bar-success': 'progress-bar bg-success',
    'progress-bar-striped active': 'progress-bar-striped progress-bar-animated',
    'col-xs-6': 'col-6',
    'col-xs-offset-6': 'offset-6',
    'col-sm-offset-6': 'offset-sm-6',
  };

  for (const [from, to] of Object.entries(expected)) {
    assert.strictEqual(migrateClass(from, 3, 4), to, `.${from} should become .${to}`);
  }
});

test('the Bootstrap 4 -> 5 migration renames the classes of the official migration guide', () => {
  const expected = {
    'no-gutters': 'g-0',
    'thead-light': 'table-light',
    'thead-dark': 'table-dark',
    'pre-scrollable': 'overflow-y-scroll',
    'float-left': 'float-start',
    'float-right': 'float-end',
    'float-sm-left': 'float-sm-start',
    'border-left': 'border-start',
    'border-right': 'border-end',
    'rounded-left': 'rounded-start',
    'rounded-right': 'rounded-end',
    'text-left': 'text-start',
    'text-sm-right': 'text-sm-end',
    'ml-3': 'ms-3',
    'mr-auto': 'me-auto',
    'pl-2': 'ps-2',
    'pr-2': 'pe-2',
    'font-weight-bold': 'fw-bold',
    'font-weight-lighter': 'fw-lighter',
    'font-italic': 'fst-italic',
    'text-monospace': 'font-monospace',
    'rounded-sm': 'rounded-1',
    'rounded-lg': 'rounded-3',
    'embed-responsive': 'ratio',
    'embed-responsive-16by9': 'ratio-16x9',
    'embed-responsive-1by1': 'ratio-1x1',
    'embed-responsive-21by9': 'ratio-21x9',
    'embed-responsive-4by3': 'ratio-4x3',
    'sr-only': 'visually-hidden',
    'sr-only-focusable': 'visually-hidden-focusable',
    'custom-control-input': 'form-check-input',
    'custom-control-label': 'form-check-label',
    'custom-select': 'form-select',
    'custom-select-sm': 'form-select-sm',
    'custom-select-lg': 'form-select-lg',
    'custom-range': 'form-range',
    'badge-pill': 'rounded-pill',
    'badge-primary': 'text-bg-primary',
    'badge-dark': 'text-bg-dark',
    close: 'btn-close',
    'btn-block': 'd-grid',
    'dropdown-menu-left': 'dropdown-menu-start',
    'dropdown-menu-right': 'dropdown-menu-end',
    dropleft: 'dropstart',
    dropright: 'dropend',
    width: 'collapse-horizontal',
  };

  for (const [from, to] of Object.entries(expected)) {
    assert.strictEqual(migrateClass(from, 4, 5), to, `.${from} should become .${to}`);
  }
});

test('every reversible class rename is restored by the reverse migration', () => {
  for (const [rules, from, to] of [
    [BS3_TO_BS4_CLASS_RULES, 3, 4],
    [BS4_TO_BS5_CLASS_RULES, 4, 5],
  ]) {
    for (const rule of rules.filter(isReversible)) {
      const migrated = migrateClass(rule.from, from, to);
      assert.strictEqual(migrated, rule.to, `.${rule.from} should become .${rule.to}`);

      const restored = migrateClass(migrated, to, from);
      assert.strictEqual(restored, rule.from, `.${rule.to} should become .${rule.from} again`);
    }
  }
});

test('aliases are migrated to the class of their canonical rule', () => {
  assert.strictEqual(migrateClass('radio', 3, 4), 'form-check');
  assert.strictEqual(migrateClass('radio-inline', 3, 4), 'form-check-inline');
  assert.strictEqual(migrateClass('visible-xs-block', 3, 4), 'd-block d-sm-none');
  assert.strictEqual(migrateClass('custom-control custom-radio', 4, 5), 'form-check');
  assert.strictEqual(migrateClass('form-control-range', 4, 5), 'form-range');
});

test('classes that only exist in one version are not touched by the reverse migration', () => {
  assert.strictEqual(migrateClass('btn-xs', 3, 4), 'btn-sm');
  assert.strictEqual(migrateClass('btn-sm', 4, 3), 'btn-sm');
  assert.strictEqual(migrateClass('form-group', 4, 5), 'mb-3');
  assert.strictEqual(migrateClass('mb-3', 5, 4), 'mb-3');
  assert.strictEqual(migrateClass('media', 4, 5), 'd-flex');
  assert.strictEqual(migrateClass('d-flex', 5, 4), 'd-flex');
});

test('data attributes are namespaced in Bootstrap 5 and restored in Bootstrap 4', () => {
  const html = '<button data-toggle="modal" data-target="#example" data-dismiss="modal" data-parent="#list">x</button>';
  const migrated = migrate(html, 4, 5);
  assert.ok(migrated.content.includes('data-bs-toggle="modal"'));
  assert.ok(migrated.content.includes('data-bs-target="#example"'));
  assert.ok(migrated.content.includes('data-bs-dismiss="modal"'));
  assert.ok(migrated.content.includes('data-bs-parent="#list"'));
  assert.strictEqual(migrated.counts.dataAttributes, 4);

  const restored = migrate(migrated.content, 5, 4);
  assert.strictEqual(restored.content, html);
});

test('data attributes that do not exist in Bootstrap 4 are kept', () => {
  const html = '<div data-bs-theme="dark" data-bs-toggle="dropdown">x</div>';
  const migrated = migrate(html, 5, 4);
  assert.ok(migrated.content.includes('data-bs-theme="dark"'));
  assert.ok(migrated.content.includes('data-toggle="dropdown"'));
});

test('the CDN links keep their provider and get the latest version of the target major version', () => {
  const providers = [
    ['https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css'],
    ['https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js'],
    ['https://stackpath.bootstrapcdn.com/bootstrap/4.6.2/css/bootstrap.min.css', 'https://stackpath.bootstrapcdn.com/bootstrap/5.3.8/css/bootstrap.min.css'],
    ['https://stackpath.bootstrapcdn.com/bootstrap/4.6.2/js/bootstrap.js', 'https://stackpath.bootstrapcdn.com/bootstrap/5.3.8/js/bootstrap.js'],
    ['https://maxcdn.bootstrapcdn.com/bootstrap/4.6.2/css/bootstrap.min.css', 'https://maxcdn.bootstrapcdn.com/bootstrap/5.3.8/css/bootstrap.min.css'],
    ['https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/css/bootstrap.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.8/css/bootstrap.min.css'],
    ['https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/js/bootstrap.bundle.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.8/js/bootstrap.bundle.min.js'],
    ['https://unpkg.com/bootstrap@4.6.2/dist/css/bootstrap.min.css', 'https://unpkg.com/bootstrap@5.3.8/dist/css/bootstrap.min.css'],
    ['https://unpkg.com/bootstrap/4.6.2/dist/css/bootstrap.min.css', 'https://unpkg.com/bootstrap/5.3.8/dist/css/bootstrap.min.css'],
  ];

  for (const [url, expected] of providers) {
    const migrated = migrate(`<link href="${url}" rel="stylesheet" />`, 4, 5);
    assert.ok(migrated.content.includes(expected), `${url} should become ${expected}`);
    assert.strictEqual(migrated.counts.cdnLinks, 1);
  }
});

test('the CDN links are restored by the reverse migration', () => {
  const html = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet" />';
  const migrated = migrate(html, 4, 5);
  assert.ok(migrated.content.includes('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css'));

  const restored = migrate(migrated.content, 5, 4);
  assert.ok(restored.content.includes('https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css'));
});

test('CDN links of another Bootstrap version are not touched', () => {
  const html = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css" rel="stylesheet" />';
  const migrated = migrate(html, 4, 5);
  assert.strictEqual(migrated.content, html);
  assert.strictEqual(migrated.counts.cdnLinks, 0);
});

test('a Bootstrap 4 page survives a 4 -> 5 -> 4 round trip', () => {
  const html = [
    '<div class="container">',
    '  <div class="row">',
    '    <div class="col-md-6 ml-3 mr-auto">',
    '      <span class="badge badge-pill badge-primary">New</span>',
    '      <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');

  const migrated = migrate(html, 4, 5);
  assert.ok(migrated.content.includes('class="col-md-6 ms-3 me-auto"'));
  assert.ok(migrated.content.includes('class="badge rounded-pill text-bg-primary"'));
  assert.ok(migrated.content.includes('class="btn-close"'));

  const restored = migrate(migrated.content, 5, 4);
  assert.strictEqual(restored.content, html);
});

test('a Bootstrap 3 page survives a 3 -> 4 -> 3 round trip', () => {
  const html = [
    '<div class="container">',
    '  <div class="row">',
    '    <div class="col-xs-12 col-sm-6">',
    '      <span class="label label-default">New</span>',
    '      <div class="panel">',
    '        <div class="panel-body">Hello</div>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');

  const migrated = migrate(html, 3, 4);
  assert.ok(migrated.content.includes('class="col-12 col-sm-6"'));
  assert.ok(migrated.content.includes('class="badge badge-secondary"'));
  assert.ok(migrated.content.includes('class="card"'));

  const restored = migrate(migrated.content, 4, 3);
  assert.strictEqual(restored.content, html);
});

test('classes that were dropped without a replacement are removed', () => {
  assert.strictEqual(migrateClass('panel panel-default', 3, 4), 'card');
  assert.strictEqual(migrateClass('panel panel-primary', 3, 4), 'card border-primary');
  assert.strictEqual(migrateClass('custom-file', 4, 5), '');
  assert.strictEqual(migrateClass('input-group-append', 4, 5), '');
  assert.strictEqual(migrateClass('card-deck', 4, 5), '');
  assert.strictEqual(migrateClass('text-justify', 4, 5), '');
  assert.strictEqual(migrateClass('embed-responsive-item', 4, 5), '');
});

test('the close button markup is migrated to the Bootstrap 5 background image', () => {
  const html = '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
  const migrated = migrate(html, 4, 5);
  assert.strictEqual(migrated.content, '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>');

  const restored = migrate(migrated.content, 5, 4);
  assert.strictEqual(restored.content, html);
});

test('the test pages cover every class of the migration tables', () => {
  const pages = [
    { file: 'src3to4/index.html', rules: BS3_TO_BS4_CLASS_RULES, side: 'from' },
    { file: 'src4to3/index.html', rules: BS3_TO_BS4_CLASS_RULES, side: 'to' },
    { file: 'src/index.html', rules: BS4_TO_BS5_CLASS_RULES, side: 'from' },
    { file: 'src5to4/index.html', rules: BS4_TO_BS5_CLASS_RULES, side: 'to' },
  ];

  for (const page of pages) {
    const attributes = classAttributes(readPage(page.file));
    const missing = page.rules.map((rule) => (page.side === 'from' ? rule.from : rule.to)).filter((value) => value && !coversClass(attributes, value));

    assert.deepStrictEqual(missing, [], `${page.file} does not cover: ${missing.join(', ')}`);
  }
});

test('the classes that are removed in the target version are not used on the page', () => {
  const pages = [
    { file: 'src4to3/index.html', rules: BS3_TO_BS4_CLASS_RULES },
    { file: 'src5to4/index.html', rules: BS4_TO_BS5_CLASS_RULES },
  ];

  for (const page of pages) {
    const attributes = classAttributes(readPage(page.file));
    const removed = page.rules.filter((rule) => rule.to === '').map((rule) => rule.from);

    for (const value of removed) {
      assert.ok(!coversClass(attributes, value), `${page.file} should not use ${value}`);
    }
  }
});

test('the test pages cover every renamed data attribute', () => {
  const bs4 = readPage('src/index.html');
  const bs5 = readPage('src5to4/index.html');

  for (const name of BS4_DATA_ATTRIBUTES) {
    assert.ok(bs4.includes(`data-${name}=`), `src/index.html should use data-${name}`);
    assert.ok(bs5.includes(`data-bs-${name}=`), `src5to4/index.html should use data-bs-${name}`);
  }
});

test('the test pages cover every CDN provider', () => {
  const providers = ['cdn.jsdelivr.net/npm/bootstrap', 'unpkg.com/bootstrap', 'stackpath.bootstrapcdn.com/bootstrap', 'maxcdn.bootstrapcdn.com/bootstrap'];

  for (const file of ['src/index.html', 'src3to4/index.html', 'src4to3/index.html', 'src5to4/index.html']) {
    const content = readPage(file);
    for (const provider of providers) {
      assert.ok(content.includes(provider), `${file} should link to ${provider}`);
    }
  }

  /** Bootstrap 3 is published as `twitter-bootstrap` on cdnjs. */
  assert.ok(readPage('src3to4/index.html').includes('cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap'));
  for (const file of ['src/index.html', 'src4to3/index.html', 'src5to4/index.html']) {
    assert.ok(readPage(file).includes('cdnjs.cloudflare.com/ajax/libs/bootstrap'), `${file} should link to cdnjs`);
  }
});

test('the one way rules are applied in the forward direction only', () => {
  for (const [rules, from, to] of [
    [BS3_TO_BS4_CLASS_RULES, 3, 4],
    [BS4_TO_BS5_CLASS_RULES, 4, 5],
  ]) {
    for (const rule of rules.filter((rule) => rule.oneWay)) {
      const migrated = migrateClass(rule.from, from, to);
      assert.strictEqual(migrated, rule.to, `.${rule.from} should become ${rule.to ? '.' + rule.to : '(removed)'}`);

      const restored = migrateClass(migrated, to, from);
      assert.notStrictEqual(restored, rule.from, `.${rule.from} should not be restored by the reverse migration`);
    }
  }
});

test('the alias rules are migrated to the class of their canonical rule', () => {
  for (const [rules, from, to] of [
    [BS3_TO_BS4_CLASS_RULES, 3, 4],
    [BS4_TO_BS5_CLASS_RULES, 4, 5],
  ]) {
    for (const rule of rules.filter((rule) => rule.alias)) {
      const migrated = migrateClass(rule.from, from, to);
      assert.strictEqual(migrated, rule.to, `.${rule.from} should become .${rule.to}`);
    }
  }
});

test('the README documents every one way rule and alias', () => {
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');

  /** The README writes a group of classes either with spaces or with dots. */
  const isDocumented = (value) => [`.${value}`, `.${value.split(' ').join('.')}`].some((name) => readme.includes(name));

  for (const rules of [BS3_TO_BS4_CLASS_RULES, BS4_TO_BS5_CLASS_RULES]) {
    for (const rule of rules.filter((rule) => rule.oneWay || rule.alias)) {
      assert.ok(isDocumented(rule.from), `the README should document .${rule.from}`);
      if (rule.to) {
        assert.ok(isDocumented(rule.to), `the README should document .${rule.to}`);
      }
    }
  }
});

test('the data attributes are renamed in the JavaScript selectors too', () => {
  const html = `<script>$('[data-toggle="popover"]').popover();</script>`;
  const migrated = migrate(html, 4, 5);
  assert.ok(migrated.content.includes(`$('[data-bs-toggle="popover"]')`));
});

test('the integrity hash of a CDN link is not updated', () => {
  const html = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" integrity="sha384-old-hash" rel="stylesheet">';
  const migrated = migrate(html, 4, 5);
  assert.ok(migrated.content.includes('bootstrap@5.3.8/dist/css/bootstrap.min.css'));
  assert.ok(migrated.content.includes('integrity="sha384-old-hash"'));
});

test('the list of renamed data attributes covers the Bootstrap 4 plugins', () => {
  for (const name of [
    'toggle',
    'target',
    'parent',
    'dismiss',
    'spy',
    'slide',
    'slide-to',
    'ride',
    'interval',
    'offset',
    'placement',
    'content',
    'html',
    'trigger',
    'container',
    'delay',
    'boundary',
    'autohide',
    'backdrop',
    'keyboard',
    'pause',
    'wrap',
    'template',
    'title',
    'animation',
  ]) {
    assert.ok(BS4_DATA_ATTRIBUTES.includes(name), `data-${name} should be renamed`);
  }
});
