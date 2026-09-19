const replace = require('gulp-replace');
const { src, dest } = require('gulp');

/**
 * Options that may be set via cli flags \
 * For example: \
 * `npx gulp migrate  --src "./src-dir" --overwrite --verbose` */
const DEFAULT_OPTIONS = {
  /** string that will be passed to the gulp {@link src} function */
  src: './src',
  /** string that will be passed to the gulp {@link dest} function */
  dest: `./`,
  /** overwrite the existing files in place. **Cannot be used with --dest flag** */
  overwrite: true,
  /** print the path of each generated / modified file to the console */
  verbose: true,
  /** Default glob for files to search in. Default: Search all folder and files recursively */
  defaultFileGlob: '**/*.{asp,aspx,cshtml,gohtml,gotmpl,ejs,erb,hbs,html,htm,js,jsp,php,ts,twig,vue}',
};

const BS3_CDN_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css';
const BS3_CDN_JS = 'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/js/bootstrap.min.js';
const BS4_CDN_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css';
const BS4_CDN_JS = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js';
const BS4_CDN_BUNDLE = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js';
const BS5_CDN_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css';
const BS5_CDN_JS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.min.js';
const BS5_CDN_BUNDLE = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js';

/** Official Bootstrap 3 <-> 4 class renames. Each pair is unique so 3to4 and 4to3 are inverses. */
function buildBs3ToBs4ClassMap() {
  const map = [
    ['alert-dismissable', 'alert-dismissible'],
    ['btn-default', 'btn-secondary'],
    ['btn-xs', 'btn-sm'],
    ['btn-group-xs', 'btn-group-sm'],
    ['img-responsive', 'img-fluid'],
    ['img-rounded', 'rounded'],
    ['img-circle', 'rounded-circle'],
    ['pull-left', 'float-left'],
    ['pull-right', 'float-right'],
    ['center-block', 'mx-auto'],
    ['hidden-print', 'd-print-none'],
    ['visible-print-block', 'd-print-block'],
    ['visible-print-inline', 'd-print-inline'],
    ['visible-print-inline-block', 'd-print-inline-block'],
    ['hidden-xs', 'd-none d-sm-block'],
    ['hidden-sm', 'd-sm-none d-md-block'],
    ['hidden-md', 'd-md-none d-lg-block'],
    ['hidden-lg', 'd-lg-none d-xl-block'],
    ['visible-xs-inline-block', 'd-inline-block d-sm-none'],
    ['visible-sm-inline-block', 'd-none d-sm-inline-block d-md-none'],
    ['visible-md-inline-block', 'd-none d-md-inline-block d-lg-none'],
    ['visible-lg-inline-block', 'd-none d-lg-inline-block d-xl-none'],
    ['visible-xs-inline', 'd-inline d-sm-none'],
    ['visible-sm-inline', 'd-none d-sm-inline d-md-none'],
    ['visible-md-inline', 'd-none d-md-inline d-lg-none'],
    ['visible-lg-inline', 'd-none d-lg-inline d-xl-none'],
    ['visible-xs', 'd-block d-sm-none'],
    ['visible-sm', 'd-none d-sm-block d-md-none'],
    ['visible-md', 'd-none d-md-block d-lg-none'],
    ['visible-lg', 'd-none d-lg-block d-xl-none'],
    ['navbar-default', 'navbar-light'],
    ['navbar-inverse', 'navbar-dark'],
    ['navbar-toggle', 'navbar-toggler'],
    ['navbar-fixed-top', 'fixed-top'],
    ['navbar-fixed-bottom', 'fixed-bottom'],
    ['navbar-static-top', 'sticky-top'],
    ['navbar-form', 'form-inline'],
    ['navbar-left', 'mr-auto'],
    ['navbar-right', 'ml-auto'],
    ['label-default', 'badge-secondary'],
    ['label-primary', 'badge-primary'],
    ['label-success', 'badge-success'],
    ['label-info', 'badge-info'],
    ['label-warning', 'badge-warning'],
    ['label-danger', 'badge-danger'],
    ['label', 'badge'],
    ['panel-heading', 'card-header'],
    ['panel-title', 'card-title'],
    ['panel-body', 'card-body'],
    ['panel-footer', 'card-footer'],
    ['panel-group', 'accordion'],
    ['panel', 'card'],
    ['divider', 'dropdown-divider'],
    ['table-condensed', 'table-sm'],
    ['control-label', 'col-form-label'],
    ['input-lg', 'form-control-lg'],
    ['input-sm', 'form-control-sm'],
    ['help-block', 'form-text'],
    ['form-control-static', 'form-control-plaintext'],
    ['has-error', 'is-invalid'],
    ['has-success', 'is-valid'],
    ['checkbox-inline', 'form-check-inline'],
    ['checkbox', 'form-check'],
    ['input-group-addon', 'input-group-text'],
    ['input-group-btn', 'input-group-append'],
    ['left carousel-control', 'carousel-control-prev'],
    ['right carousel-control', 'carousel-control-next'],
    ['icon-prev', 'carousel-control-prev-icon'],
    ['icon-next', 'carousel-control-next-icon'],
    ['item', 'carousel-item'],
    ['fade in', 'fade show'],
    ['in', 'show'],
    ['progress-bar-striped active', 'progress-bar-striped progress-bar-animated'],
  ];

  for (let i = 1; i <= 12; i++) {
    map.push([`col-xs-${i}`, `col-${i}`]);
    map.push([`col-xs-offset-${i}`, `offset-${i}`]);
    map.push([`col-sm-offset-${i}`, `offset-sm-${i}`]);
    map.push([`col-md-offset-${i}`, `offset-md-${i}`]);
    map.push([`col-lg-offset-${i}`, `offset-lg-${i}`]);
  }

  return map;
}

const BS3_TO_BS4_CLASS_MAP = buildBs3ToBs4ClassMap();

function tokenCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function sortedClassPairs(direction) {
  const pairs = BS3_TO_BS4_CLASS_MAP.map(([from, to]) => (direction === 'to4' ? [from, to] : [to, from]));
  return pairs.sort((a, b) => {
    const tokenDiff = tokenCount(b[0]) - tokenCount(a[0]);
    if (tokenDiff !== 0) {
      return tokenDiff;
    }
    return b[0].length - a[0].length;
  });
}

function findTokenGroup(tokens, parts) {
  const used = new Set();
  const indexes = [];
  for (const part of parts) {
    const idx = tokens.findIndex((token, i) => token === part && !used.has(i));
    if (idx === -1) {
      return null;
    }
    used.add(idx);
    indexes.push(idx);
  }
  return indexes;
}

function applyClassMap(classValue, pairs) {
  let tokens = classValue.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return { value: classValue, count: 0 };
  }

  let count = 0;
  for (const [from, to] of pairs) {
    const fromParts = from.trim().split(/\s+/).filter(Boolean);
    const toParts = to.trim().split(/\s+/).filter(Boolean);
    let found = findTokenGroup(tokens, fromParts);
    while (found) {
      const insertAt = Math.min(...found);
      const insertPos = tokens.filter((_, i) => i < insertAt && !found.includes(i)).length;
      tokens = tokens.filter((_, i) => !found.includes(i));
      tokens.splice(insertPos, 0, ...toParts);
      count++;
      found = findTokenGroup(tokens, fromParts);
    }
  }

  return { value: tokens.join(' '), count };
}

function replaceBootstrapCdn(content, fromMajor, cssUrl, jsUrl, bundleUrl, onCdnChange) {
  const major = String(fromMajor);
  const patterns = [
    [new RegExp(`https://cdn\\.jsdelivr\\.net/npm/bootstrap@${major}\\.\\d+\\.\\d+/dist/css/bootstrap(\\.min)?\\.css`, 'g'), cssUrl],
    [new RegExp(`https://cdn\\.jsdelivr\\.net/npm/bootstrap@${major}\\.\\d+\\.\\d+/dist/js/bootstrap\\.bundle(\\.min)?\\.js`, 'g'), bundleUrl],
    [new RegExp(`https://cdn\\.jsdelivr\\.net/npm/bootstrap@${major}\\.\\d+\\.\\d+/dist/js/bootstrap(\\.min)?\\.js`, 'g'), jsUrl],
    [new RegExp(`https://stackpath\\.bootstrapcdn\\.com/bootstrap/${major}\\.\\d+\\.\\d+/css/bootstrap(\\.min)?\\.css`, 'g'), cssUrl],
    [new RegExp(`https://stackpath\\.bootstrapcdn\\.com/bootstrap/${major}\\.\\d+\\.\\d+/js/bootstrap\\.bundle(\\.min)?\\.js`, 'g'), bundleUrl],
    [new RegExp(`https://stackpath\\.bootstrapcdn\\.com/bootstrap/${major}\\.\\d+\\.\\d+/js/bootstrap(\\.min)?\\.js`, 'g'), jsUrl],
    [new RegExp(`https://maxcdn\\.bootstrapcdn\\.com/bootstrap/${major}\\.\\d+\\.\\d+/css/bootstrap(\\.min)?\\.css`, 'g'), cssUrl],
    [new RegExp(`https://maxcdn\\.bootstrapcdn\\.com/bootstrap/${major}\\.\\d+\\.\\d+/js/bootstrap(\\.min)?\\.js`, 'g'), jsUrl],
    [new RegExp(`https://cdnjs\\.cloudflare\\.com/ajax/libs/(?:twitter-bootstrap|bootstrap)/${major}\\.\\d+\\.\\d+/(?:dist/)?css/bootstrap(\\.min)?\\.css`, 'g'), cssUrl],
    [new RegExp(`https://cdnjs\\.cloudflare\\.com/ajax/libs/(?:twitter-bootstrap|bootstrap)/${major}\\.\\d+\\.\\d+/(?:dist/)?js/bootstrap\\.bundle(\\.min)?\\.js`, 'g'), bundleUrl],
    [new RegExp(`https://cdnjs\\.cloudflare\\.com/ajax/libs/(?:twitter-bootstrap|bootstrap)/${major}\\.\\d+\\.\\d+/(?:dist/)?js/bootstrap(\\.min)?\\.js`, 'g'), jsUrl],
    [new RegExp(`https://unpkg\\.com/bootstrap[@/]${major}\\.\\d+\\.\\d+/(?:dist/)?css/bootstrap(\\.min)?\\.css`, 'g'), cssUrl],
    [new RegExp(`https://unpkg\\.com/bootstrap[@/]${major}\\.\\d+\\.\\d+/(?:dist/)?js/bootstrap\\.bundle(\\.min)?\\.js`, 'g'), bundleUrl],
    [new RegExp(`https://unpkg\\.com/bootstrap[@/]${major}\\.\\d+\\.\\d+/(?:dist/)?js/bootstrap(\\.min)?\\.js`, 'g'), jsUrl],
  ];

  let next = content;
  for (const [pattern, url] of patterns) {
    next = next.replace(pattern, function () {
      onCdnChange();
      return url;
    });
  }
  return next;
}

async function migrate(cb) {
  const options = parseArgs();

  console.log(options);
  // process.exit(0)

  let dataAttrChanged = 0;
  let CDNLinksChanged = 0;
  let cssClassChanged = 0;
  // const classPairs = sortedClassPairs('to5');

  return (
    /** when overwrite flag is true, set base option */
    src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
      .pipe(
        replace(/[\s\S]+/, function (content) {
          const withCdn = replaceBootstrapCdn(content, 4, BS5_CDN_CSS, BS5_CDN_JS, BS5_CDN_BUNDLE, function () {
            CDNLinksChanged++;
          });
          return withCdn;
        }),
      )
      .pipe(
        replace(
          /\sdata-(animation|autohide|backdrop|boundary|container|content|custom-class|delay|dismiss|display|html|interval|keyboard|method|offset|pause|placement|popper-config|reference|ride|selector|slide(-to)?|target|template|title|toggle|touch|trigger|wrap)=/g,
          function (match, p1) {
            if (p1 === 'toggle' && match.includes('data-bs-toggle="')) {
              return match;
            }
            dataAttrChanged++;
            return ' data-bs-' + p1 + '=';
          },
        ),
      )
      .pipe(
        replace(/\[data-toggle=/g, function () {
          dataAttrChanged++;
          return '[data-bs-toggle=';
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-danger\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-danger' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-dark\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-dark' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-info\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-info' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-light\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-light' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-pill\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded-pill' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-primary\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-primary' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-secondary\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-secondary' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-success\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-success' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-warning\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-bg-warning' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bborder-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'border-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bborder-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'border-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"])\s*\bclose\b\s*(['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'btn-close' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control-input\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-check-input' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control-label\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-check-label' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control custom-checkbox\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-check' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control custom-radio\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-check' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-file-input\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-control' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-file-label\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-label' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-range\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-range' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-select-sm\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-select-sm' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-select-lg\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-select-lg' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-select\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-select' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control custom-switch\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-check form-switch' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-sm-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-sm-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-md-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-md-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-lg-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-lg-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-xl-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-xl-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-sm-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-sm-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-md-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-md-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-lg-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-lg-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-xl-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-menu-xl-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropleft\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropstart' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropright\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropend' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-sm-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-sm-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-md-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-md-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-lg-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-lg-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-xl-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-xl-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-sm-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-sm-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-md-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-md-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-lg-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-lg-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-xl-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-xl-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-italic\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'fst-italic' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-bold\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'fw-bold' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-bolder\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'fw-bolder' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-light\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'fw-light' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-lighter\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'fw-lighter' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-normal\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'fw-normal' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-control-file\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-control' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-control-range\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-range' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-group\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'mb-3' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-inline\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-flex align-items-center' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-row\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'row' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bjumbotron-fluid\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded-0 px-0' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bjumbotron\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'bg-light mb-4 rounded-2 py-5 px-3' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmedia-body\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'flex-grow-1' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmedia\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-flex' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bml-\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ms-' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bml-n\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ms-n' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmr-\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'me-' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmr-n\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'me-n' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bno-gutters\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'g-0' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpl-\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ps-' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpr-\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'pe-' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpre-scrollable\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'overflow-y-scroll' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-item\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + '' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-16by9\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ratio-16x9' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-1by1\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ratio-1x1' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-21by9\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ratio-21x9' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-4by3\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ratio-4x3' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'ratio' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-lg\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded-3' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-sm\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded-1' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bsr-only sr-only-focusable\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'visually-hidden-focusable' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bsr-only-focusable\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'visually-hidden-focusable' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bsr-only\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'visually-hidden' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-hide\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-sm-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-sm-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-md-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-md-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-lg-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-lg-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-xl-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-xl-start' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-sm-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-sm-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-md-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-md-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-lg-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-lg-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-xl-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-xl-end' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-monospace\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'font-monospace' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bwidth\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'collapse-horizontal' + p2;
        }),
      )
      .pipe(replace(/<select([^>]*)\bclass=['"]([^'"]*)form-control(-lg|-sm)?([^'"]*)['"]([^>]*)>/g, '<select$1class="$2form-select$3$4"$5>'))
      .pipe(replace(/<select([^>]*)\bclass=['"]([^'"]*)form-control\b([^'"]*['"])/g, '<select$1class="$2form-select$3'))
      .pipe(replace('<span aria-hidden="true">&times;</span>', ''))
      .pipe(dest(options.dest))
      .on('data', (data) => {
        if (options.verbose) {
          console.log(`Wrote file: ${data.path}`);
        }
      })
      .on('end', function () {
        console.log(`Completed! Changed ${cssClassChanged} CSS class names, ${dataAttrChanged} data-attributes and ${CDNLinksChanged} CDN links.`);
        cb();
      })
  );
}

async function migrate5to4(cb) {
  const options = parseArgs();

  console.log(options);
  let dataAttrChanged = 0;
  let CDNLinksChanged = 0;
  let cssClassChanged = 0;
  // const classPairs = sortedClassPairs('to4');

  return src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
    .pipe(
      replace(/[\s\S]+/, function (content) {
        const withCdn = replaceBootstrapCdn(content, 5, BS4_CDN_CSS, BS4_CDN_JS, BS4_CDN_BUNDLE, function () {
          CDNLinksChanged++;
        });
        return withCdn
      }),
    )
    .pipe(
      replace(/\sdata-bs-([a-z0-9-]+)=/g, function (match, p1) {
        dataAttrChanged++;
        return ` data-${p1}=`;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?(?:badge\s+)?(?:rounded-pill\s+)?text-bg-primary\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-primary' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?text-bg-secondary\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-secondary' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?text-bg-success\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-success' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?text-bg-danger\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-danger' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?text-bg-warning\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-warning' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?text-bg-info\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-info' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?text-bg-light\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-light' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?(?:rounded-pill\s+)?text-bg-dark\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge badge-dark' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:badge\s+)?rounded-pill\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'badge-pill' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-check-input\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'custom-control-input' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-check-label\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'custom-control-label' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-check\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'custom-control custom-checkbox' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-select\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'custom-select' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-range\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'custom-range' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbtn-close\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'close' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-start\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-left' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-end\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-right' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bvisually-hidden\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'sr-only' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcarousel-control-pager-next\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'carousel-control-next' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcarousel-control-pager-prev\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'carousel-control-prev' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge\s+badge\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1.trimEnd() + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge\s+badge-pill\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1.trimEnd() + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:btn\s+)+btn-default\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'btn btn-default' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:custom-select\s+)+custom-select\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'custom-select' + p2;
      }),
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b(?:sr-only\s+)+sr-only\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'sr-only' + p2;
      }),
    )
    .pipe(
      replace(/data-bs-([a-z0-9-]+)/g, function (match, p1) {
        dataAttrChanged++;
        return `data-${p1}`;
      }),
    )
    .pipe(dest(options.dest))
    .on('data', (data) => {
      if (options.verbose) {
        console.log(`Wrote file: ${data.path}`);
      }
    })
    .on('end', function () {
      console.log(`Completed! Changed ${cssClassChanged} CSS class names, ${dataAttrChanged} data-attributes and ${CDNLinksChanged} CDN links.`);
      cb();
    });
}

async function migrate3to4(cb) {
  const options = parseArgs();

  console.log(options);
  let dataAttrChanged = 0;
  let CDNLinksChanged = 0;
  let cssClassChanged = 0;
  const classPairs = sortedClassPairs('to4');

  return (
    src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
      .pipe(
        replace(/[\s\S]+/, function (content) {
          const withCdn = replaceBootstrapCdn(content, 3, BS4_CDN_CSS, BS4_CDN_JS, BS4_CDN_BUNDLE, function () {
            CDNLinksChanged++;
          });
          return withCdn.replace(/(<[^>]*\bclass\s*=\s*['"])([^'"]*)(['"])/g, function (match, p1, classValue, p3) {
            const result = applyClassMap(classValue, classPairs);
            cssClassChanged += result.count;
            return p1 + result.value + p3;
          });
        }),
      )
      .pipe(dest(options.dest))
      .on('data', function (data) {
        if (options.verbose) {
          console.log(`Wrote file: ${data.path}`);
        }
      })
      .on('end', function () {
        console.log(`Completed! Changed ${cssClassChanged} CSS class names, ${dataAttrChanged} data-attributes and ${CDNLinksChanged} CDN links.`);
        cb();
      })
  );
}

async function migrate4to3(cb) {
  const options = parseArgs();

  console.log(options);
  let dataAttrChanged = 0;
  let CDNLinksChanged = 0;
  let cssClassChanged = 0;
  const classPairs = sortedClassPairs('to3');

  return (
    src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
      .pipe(
        replace(/[\s\S]+/, function (content) {
          const withCdn = replaceBootstrapCdn(content, 4, BS3_CDN_CSS, BS3_CDN_JS, BS3_CDN_JS, function () {
            CDNLinksChanged++;
          });
          return withCdn.replace(/(<[^>]*\bclass\s*=\s*['"])([^'"]*)(['"])/g, function (match, p1, classValue, p3) {
            const result = applyClassMap(classValue, classPairs);
            cssClassChanged += result.count;
            return p1 + result.value + p3;
          });
        }),
      )
      .pipe(dest(options.dest))
      .on('data', function (data) {
        if (options.verbose) {
          console.log(`Wrote file: ${data.path}`);
        }
      })
      .on('end', function () {
        console.log(`Completed! Changed ${cssClassChanged} CSS class names, ${dataAttrChanged} data-attributes and ${CDNLinksChanged} CDN links.`);
        cb();
      })
  );
}

/** parses cli args array and return an options object */
function parseArgs() {
  const options = Object.assign({}, DEFAULT_OPTIONS);

  const argv = process.argv;
  argv.forEach((flag, i) => {
    const value = argv[i + 1];
    switch (flag) {
      case '--src': {
        options.src = value;
        break;
      }
      case '--dest': {
        options.dest = value;
        break;
      }
      case '--glob': {
        options.defaultFileGlob = value;
        break;
      }
      case '--overwrite': {
        options.overwrite = true;
        options.dest = './';
        if (argv.includes('--dest')) {
          throw new Error('Cannot use --overwrite and --dest options together.');
        }
        break;
      }
      case '--verbose': {
        options.verbose = true;
        break;
      }

      default:
        break;
    }
  });
  return options;
}

exports.migrate = migrate;
exports.migrate3to4 = migrate3to4;
exports.migrate4to3 = migrate4to3;
exports.migrate5to4 = migrate5to4;
