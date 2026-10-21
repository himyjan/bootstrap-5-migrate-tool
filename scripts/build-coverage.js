'use strict';

/**
 * Builds the "Migration coverage" section of the test pages.
 *
 * The section lists every class name, data attribute and CDN link that the
 * migrate tool touches in the direction of the page. The names are shown as
 * text and applied to the element, so the test pages cover the complete
 * migration table.
 *
 * Run it with: `npm run coverage`
 */

const fs = require('fs');
const path = require('path');

const { BS3_TO_BS4_CLASS_RULES, BS4_TO_BS5_CLASS_RULES, BS4_DATA_ATTRIBUTES } = require('../lib/bootstrap-migration');

const ROOT = path.join(__dirname, '..');

const START_MARKER = '<!-- migration-coverage:start -->';
const END_MARKER = '<!-- migration-coverage:end -->';

/** Sample values for the prefix rules, e.g. `ml-*` becomes `ml-3`. */
const PREFIX_SAMPLES = {
  'border-left-': '0',
  'border-right-': '0',
  'border-start-': '0',
  'border-end-': '0',
};

/** Expands a prefix rule into a concrete class name. */
function expand(value) {
  if (!value.endsWith('*')) {
    return value;
  }
  const prefix = value.slice(0, -1);
  return `${prefix}${PREFIX_SAMPLES[prefix] ?? '3'}`;
}

/** The test pages and the migration table they cover. */
const PAGES = [
  {
    file: 'src3to4/index.html',
    version: 3,
    rules: BS3_TO_BS4_CLASS_RULES,
    side: 'from',
    dataAttributes: [],
  },
  {
    file: 'src4to3/index.html',
    version: 4,
    rules: BS3_TO_BS4_CLASS_RULES,
    side: 'to',
    dataAttributes: [],
  },
  {
    file: 'src/index.html',
    version: 4,
    rules: BS4_TO_BS5_CLASS_RULES,
    side: 'from',
    dataAttributes: BS4_DATA_ATTRIBUTES,
  },
  {
    file: 'src5to4/index.html',
    version: 5,
    rules: BS4_TO_BS5_CLASS_RULES,
    side: 'to',
    dataAttributes: BS4_DATA_ATTRIBUTES,
  },
];

/** All CDN links of the supported providers for a Bootstrap version. */
function cdnLinks(version) {
  const packageName = version > 3 ? 'bootstrap' : 'twitter-bootstrap';
  return [
    `https://cdn.jsdelivr.net/npm/bootstrap@${version}/dist/css/bootstrap.min.css`,
    `https://cdn.jsdelivr.net/npm/bootstrap@${version}/dist/js/bootstrap.bundle.min.js`,
    `https://unpkg.com/bootstrap@${version}/dist/css/bootstrap.min.css`,
    `https://unpkg.com/bootstrap/${version}/dist/js/bootstrap.bundle.min.js`,
    `https://stackpath.bootstrapcdn.com/bootstrap/${version}/css/bootstrap.min.css`,
    `https://stackpath.bootstrapcdn.com/bootstrap/${version}/js/bootstrap.bundle.min.js`,
    `https://maxcdn.bootstrapcdn.com/bootstrap/${version}/css/bootstrap.min.css`,
    `https://maxcdn.bootstrapcdn.com/bootstrap/${version}/js/bootstrap.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/${packageName}/${version}/css/bootstrap.min.css`,
    `https://cdnjs.cloudflare.com/ajax/libs/${packageName}/${version}/js/bootstrap.bundle.min.js`,
  ];
}

/** Builds the HTML of the coverage section. */
function buildSection(page, indentation) {
  const pad = (depth) => indentation + '  '.repeat(depth);
  const classes = page.rules.map((rule) => expand(page.side === 'from' ? rule.from : rule.to));
  /** Classes that are removed in the target version are not used on the page. */
  const uniqueClasses = [...new Set(classes)].filter(Boolean).sort();
  const attributes = page.dataAttributes.map((name) => (page.version > 4 ? `data-bs-${name}` : `data-${name}`));

  const lines = [];
  lines.push(START_MARKER);
  lines.push(`${pad(1)}<h2 class="mt-5" id="migration-coverage">Migration coverage</h2>`);
  lines.push(`${pad(1)}<p class="lead">`);
  lines.push(
    `${pad(2)}This page uses Bootstrap ${page.version} class names. Every class name, data attribute and CDN link that the migrate tool updates when it migrates this page is listed below. The name is shown as text and applied to the element.`,
  );
  lines.push(`${pad(1)}</p>`);
  lines.push('');
  lines.push(`${pad(1)}<h3 class="h4">Class names</h3>`);
  lines.push(`${pad(1)}<div class="bs-component">`);
  lines.push(`${pad(2)}<p class="small">`);
  for (const className of uniqueClasses) {
    lines.push(`${pad(3)}<code class="${className}">${className}</code>`);
  }
  lines.push(`${pad(2)}</p>`);
  lines.push(`${pad(1)}</div>`);

  if (attributes.length) {
    lines.push('');
    lines.push(`${pad(1)}<h3 class="h4">Data attributes</h3>`);
    lines.push(`${pad(1)}<div class="bs-component">`);
    lines.push(`${pad(2)}<p class="small">`);
    for (const attribute of attributes) {
      lines.push(`${pad(3)}<code ${attribute}="example">${attribute}</code>`);
    }
    lines.push(`${pad(2)}</p>`);
    lines.push(`${pad(1)}</div>`);
  }

  lines.push('');
  lines.push(`${pad(1)}<h3 class="h4">CDN links</h3>`);
  lines.push(`${pad(1)}<div class="bs-component">`);
  lines.push(`${pad(2)}<p class="small">`);
  for (const link of cdnLinks(page.version)) {
    lines.push(`${pad(3)}<code>${link}</code>`);
  }
  lines.push(`${pad(2)}</p>`);
  lines.push(`${pad(1)}</div>`);
  lines.push(END_MARKER);

  return lines.join('\n');
}

/** Replaces the coverage section of a test page. */
function updatePage(page) {
  const file = path.join(ROOT, page.file);
  const content = fs.readFileSync(file, 'utf8');

  let updated;
  if (content.includes(START_MARKER) && content.includes(END_MARKER)) {
    const start = content.indexOf(START_MARKER);
    const end = content.indexOf(END_MARKER) + END_MARKER.length;
    const indentation = content.slice(0, start).match(/[ \t]*$/)[0];
    updated = content.slice(0, start) + buildSection(page, indentation) + content.slice(end);
  } else {
    const end = content.lastIndexOf('</main>');
    if (end === -1) {
      throw new Error(`Could not find the end of the main element in ${page.file}`);
    }
    const indentation = content.slice(0, end).match(/[ \t]*$/)[0];
    updated = content.slice(0, end) + buildSection(page, indentation) + '\n' + content.slice(end);
  }

  fs.writeFileSync(file, updated);
  console.log(`Updated ${page.file}`);
}

PAGES.forEach(updatePage);
