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
  defaultFileGlob: '**/*.{asp,aspx,cshtml,ejs,erb,hbs,html,htm,jsp,php,twig,vue}'
};

async function migrate3to4(cb) {
  const options = parseArgs();

  console.log(options);
  // process.exit(0)

  let dataAttrChanged = 0;
  let CDNLinksChanged = 0;
  let cssClassChanged = 0;

  return (
    /** when overwrite flag is true, set base option */
    src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
      // MaxCDN CSS
      .pipe(
        replace(
          /<link href=["']https:\/\/maxcdn\.bootstrapcdn\.com\/bootstrap\/3\.\d+\.\d+\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g,
          function () {
            CDNLinksChanged++;
            return '<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">';
          },
        ),
      )
      // CDNJS CSS
      .pipe(
        replace(
          /<link href=["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/bootstrap\/3\.\d+\.\d+\/dist\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g,
          function () {
            CDNLinksChanged++;
            return '<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/css/bootstrap.min.css" rel="stylesheet">';
          },
        ),
      )
      // JSDelivr CSS
      .pipe(
        replace(/<link href=["']https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@3\.\d+\.\d+\/dist\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g, function () {
          CDNLinksChanged++;
          return '<link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet">';
        }),
      )
      // Stackpath CSS
      .pipe(
        replace(/<link href=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/3\.\d+\.\d+\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g, function () {
          CDNLinksChanged++;
          return '<link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">';
        }),
      )
      // UNPKG CSS
      .pipe(
        replace(/<link href=["']https:\/\/unpkg\.com\/bootstrap\/3\.\d+\.\d+\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g, function () {
          CDNLinksChanged++;
          return '<link href="https://unpkg.com/bootstrap@4.6.2/dist/css/bootstrap.min.css">';
        }),
      )
      // MaxCDN JS
      .pipe(
        replace(/<link href=["']https:\/\/maxcdn\.bootstrapcdn\.com\/bootstrap\/3\.\d+\.\d+\/js\/bootstrap(\.min)?\.js["']*>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js">';
        }),
      )
      // CDNJS JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.cloudflare\.com\/ajax\/libs\/bootstrap\/3\.\d+\.\d+\/dist\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/js/bootstrap.min.js">';
        }),
      )
      // JSDelivr JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@3\.\d+\.\d+\/dist\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js">';
        }),
      )
      // Stackpath JS
      .pipe(
        replace(/<script src=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/3\.\d+\.\d+\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js">';
        }),
      )
      // UNPKG JS
      .pipe(
        replace(/<script src=["']https:\/\/unpkg\.com\/bootstrap\/3\.\d+\.\d+\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://unpkg.com/bootstrap@4.6.2/dist/js/bootstrap.min.js">';
        }),
      )
      // CDNJS Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.cloudflare\.com\/ajax\/libs\/bootstrap\/3\.\d+\.\d+\/dist\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/js/bootstrap.bundle.min.js">';
        }),
      )
      // JSDelivr Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@3\.\d+\.\d+\/dist\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js">';
        }),
      )
      // Stackpath Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/3\.\d+\.\d+\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js">';
        }),
      )
      // UNPKG Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/unpkg\.com\/bootstrap\/3\.\d+\.\d+\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://unpkg.com/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js">';
        }),
      )
      // inputConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcontrol-label\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-control-label' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-help\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-control-feedback' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bhelp-block\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-text' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-group-sm\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-control-sm' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-group-lg\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'form-control-lg' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-control\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          if (match.includes('.hasClass(\'input-lg\')')) {
            return match.replace(/form-control/g, 'form-control-lg');
          } else if (match.includes('.hasClass(\'input-sm\')')) {
            return match.replace(/form-control/g, 'form-control-sm');
          } else {
            return match;
          }
        }),
      )
      // hideConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bhidden-xs\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bhidden-sm\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-sm-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bhidden-md\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-md-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bhidden-lg\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-lg-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bvisible-xs\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-block d-sm-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bvisible-sm\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-block d-md-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bvisible-md\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-block d-lg-none' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bvisible-lg\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'd-block d-xl-none' + p2;
        }),
      )
      // imageConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bimg-responsive\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'img-fluid' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bimg-rounded\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bimg-circle\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'rounded-circle' + p2;
        }),
      )
      // buttonsConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbtn-default\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'btn-secondary' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbtn-xs\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'btn-sm' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbtn-group-xs\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'btn-group-sm' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdivider\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'dropdown-divider' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-pill\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blabel\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blabel-default\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge-secondary' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blabel-primary\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge-primary' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blabel-success\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge-success' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blabel-info\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge-info' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blabel-warning\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge-warning' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blabel-danger\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'badge-danger' + p2;
        }),
      )
      .pipe(
        replace(/(<li[^>]*class\s*=\s*['"][^'"]*)\bbreadcrumb\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'breadcrumb-item' + p2;
        }),
      )
      // listLiConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\blist-inline\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch, p1, p2) {
            return subMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
              return p1 + 'list-inline-item' + p2;
            });
          });
        }),
      )
      // paginationConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpagination\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch, p1, p2) {
            return subMatch.replace(/<a[^>]*>/g, function (innerMatch, p1, p2) {
              return innerMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
                return p1 + 'page-link' + p2;
              });
            });
          });
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpagination\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch) {
            return subMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
              return p1 + 'page-item' + p2;
            });
          });
        }),
      )
      // carouselConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcarousel-inner\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bitem\b([^'"]*['"])/g, function (subMatch, p1, p2) {
            return p1 + 'carousel-item' + p2;
          });
        }),
      )
      // pullConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpull-right\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-right' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpull-left\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'float-left' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcenter-block\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'mx-auto' + p2;
        }),
      )
      // wellConverter
      // $('.well').each(function () {
      //   var card = $("<div class='card'></div>");
      //   card.append("<div class='card-body'></div>");
      //   card.children('.card-body').append($(this).html());
      //   $(this).after(card);
      //   $(this).remove();
      // });
      // $('.thumbnail').each(function () {
      //   var card = $("<div class='card'></div>");
      //   card.append("<div class='card-body'></div>");
      //   card.children('.card-body').append($(this).html());
      //   $(this).after(card);
      //   $(this).remove();
      // });
      // blockquoteConverter
      // $('blockquote').each(function () {
      //   var classes = $(this).attr("class");
      //   var div = $("<div class='blockquote " + classes + "'></div>");
      //   div.append($(this).html());
      //   $(this).after(div);
      //   $(this).remove();
      // });

      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bblockquote-reverse\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'text-right' + p2;
        }),
      )
      // dropdownConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch, p1, p2) {
            return subMatch.replace(/<a[^>]*>/g, function (innerMatch, p1, p2) {
              return innerMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
                return p1 + 'dropdown-item' + p2;
              });
            });
          });
        }),
      )
      //  $('.dropdown-menu > li').each(function () {
      //    var aContent = $(this).html();
      //    $(this).after(aContent);
      //    $(this).remove();
      //  });
      // inConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bin\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'show' + p2;
        }),
      )
      // tableConverter
      .pipe(
        replace(/(<(td|tr)[^>]*class\s*=\s*['"][^'"]*)\bactive\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'table-active' + p2;
        }),
      )
      .pipe(
        replace(/(<(td|tr)[^>]*class\s*=\s*['"][^'"]*)\bsuccess\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'table-success' + p2;
        }),
      )
      .pipe(
        replace(/(<(td|tr)[^>]*class\s*=\s*['"][^'"]*)\binfo\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'table-info' + p2;
        }),
      )
      .pipe(
        replace(/(<(td|tr)[^>]*class\s*=\s*['"][^'"]*)\bwarning\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'table-warning' + p2;
        }),
      )
      .pipe(
        replace(/(<(td|tr)[^>]*class\s*=\s*['"][^'"]*)\bdanger\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'table-danger' + p2;
        }),
      )
      .pipe(
        replace(/(<table[^>]*class\s*=\s*['"][^'"]*)\btable-condesed\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'table-sm' + p2;
        }),
      )
      // navbarConverter
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch, p1, p2) {
            return subMatch.replace(/<a[^>]*>/g, function (innerMatch, p1, p2) {
              return innerMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
                return p1 + 'nav-link' + p2;
              });
            });
          });
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch) {
            return subMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
              return p1 + 'nav-intem' + p2;
            });
          });
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-btn\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'nav-item' + p2;
        }),
      )
      // .pipe(
      //   replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-nav\b([^'"]*['"])/g, function (match, p1, p2) {
      //     cssClassChanged++;
      //     return match.replace(/navbar-right/g, '').replace(/nav/g, '').replace(/navbar-nav/g, function (subMatch, p1, p2) {
      //       return p1 + 'ml-auto' + p2;
      //     });
      //   }),
      // )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-toggle\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/navbar-toggler-right/g, function (subMatch, p1, p2) {
            return p1 + 'ml-auto' + p2;
          });
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-nav\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch, p1, p2) {
            return subMatch.replace(/<a[^>]*>/g, function (innerMatch, p1, p2) {
              return innerMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
                return p1 + 'nav-link' + p2;
              });
            });
          });
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-nav\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<li[^>]*>/g, function (subMatch) {
            return subMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
              return p1 + 'nav-item' + p2;
            });
          });
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-nav\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return match.replace(/<a[^>]*>/g, function (subMatch) {
            return subMatch.replace(/(<[^>]*class\s*=\s*['"][^'"]*)\b\b([^'"]*['"])/g, function (innerMatch, p1, p2) {
              return p1 + 'navbar-brand' + p2;
            });
          });
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-fixed-top\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'fixed-top' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-toggle\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'navbar-toggler' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnav-stacked\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'flex-column' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'navbar-expand-lg' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bnavbar-toggle\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'navbar-expand-md' + p2;
        }),
      )
      // applyFilterBS4
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btitle\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card-title' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdescription\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card-description' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcategory\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card-category' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-danger\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card bg-danger text-white' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-warning\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card bg-warning' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-info\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card bg-info text-white' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-success\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card bg-success text-white' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-primary\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card bg-primary text-white' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-footer\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card-footer' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-body\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card-body' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-title\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card-title' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel-heading\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card-header' + p2;
        }),
      )
      .pipe(
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpanel\b([^'"]*['"])/g, function (match, p1, p2) {
          cssClassChanged++;
          return p1 + 'card' + p2;
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
      })
  );
}

async function migrate(cb) {
  const options = parseArgs();

  console.log(options);
  // process.exit(0)

  let dataAttrChanged = 0;
  let CDNLinksChanged = 0;
  let cssClassChanged = 0;

  return (
    /** when overwrite flag is true, set base option */
    src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
      // MaxCDN CSS
      .pipe(
        replace(
          /<link href=["']https:\/\/maxcdn\.bootstrapcdn\.com\/bootstrap\/4\.\d+\.\d+\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g,
          function () {
            CDNLinksChanged++;
            return '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">';
          },
        ),
      )
      // CDNJS CSS
      .pipe(
        replace(
          /<link href=["']https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/bootstrap\/4\.\d+\.\d+\/dist\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g,
          function () {
            CDNLinksChanged++;
            return '<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css" rel="stylesheet">';
          },
        ),
      )
      // JSDelivr CSS
      .pipe(
        replace(/<link href=["']https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@4\.\d+\.\d+\/dist\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g, function () {
          CDNLinksChanged++;
          return '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">';
        }),
      )
      // Stackpath CSS
      .pipe(
        replace(/<link href=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/4\.\d+\.\d+\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g, function () {
          CDNLinksChanged++;
          return '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">';
        }),
      )
      // UNPKG CSS
      .pipe(
        replace(/<link href=["']https:\/\/unpkg\.com\/bootstrap\/4\.\d+\.\d+\/css\/bootstrap(\.min)?\.css["'] rel=["']stylesheet["'] ?\/?>/g, function () {
          CDNLinksChanged++;
          return '<link href="https://unpkg.com/bootstrap@5.3.3/dist/css/bootstrap.min.css">';
        }),
      )
      // MaxCDN JS
      .pipe(
        replace(/<link href=["']https:\/\/maxcdn\.bootstrapcdn\.com\/bootstrap\/4\.\d+\.\d+\/js\/bootstrap(\.min)?\.js["']*>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js">';
        }),
      )
      // CDNJS JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.cloudflare\.com\/ajax\/libs\/bootstrap\/4\.\d+\.\d+\/dist\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.min.js">';
        }),
      )
      // JSDelivr JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@4\.\d+\.\d+\/dist\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js">';
        }),
      )
      // Stackpath JS
      .pipe(
        replace(/<script src=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/4\.\d+\.\d+\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js">';
        }),
      )
      // UNPKG JS
      .pipe(
        replace(/<script src=["']https:\/\/unpkg\.com\/bootstrap\/4\.\d+\.\d+\/js\/bootstrap(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://unpkg.com/bootstrap@5.3.3/dist/js/bootstrap.min.js">';
        }),
      )
      // CDNJS Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.cloudflare\.com\/ajax\/libs\/bootstrap\/4\.\d+\.\d+\/dist\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js">';
        }),
      )
      // JSDelivr Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@4\.\d+\.\d+\/dist\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js">';
        }),
      )
      // Stackpath Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/stackpath\.bootstrapcdn\.com\/bootstrap\/4\.\d+\.\d+\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js">';
        }),
      )
      // UNPKG Bundle JS
      .pipe(
        replace(/<script src=["']https:\/\/unpkg\.com\/bootstrap\/4\.\d+\.\d+\/js\/bootstrap\.bundle(\.min)?\.js["']>/g, function () {
          CDNLinksChanged++;
          return '<script src="https://unpkg.com/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js">';
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
        replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bclose\b([^'"]*['"])/g, function (match, p1, p2) {
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