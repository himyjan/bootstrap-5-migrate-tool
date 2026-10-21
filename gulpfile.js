const replace = require('gulp-replace');
const { src, dest } = require('gulp');
const { getMigration, migrateContent } = require('./lib/bootstrap-migration');

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

/**
 * Migrates all files of the source folder from one Bootstrap major version to
 * another one. The reverse migrations (4 -> 3 and 5 -> 4) use the same
 * migration tables as their forward counterpart, so they are exact 1:1
 * mirrors of each other.
 */
async function migrateFiles(from, to, cb) {
  const options = parseArgs();
  const migration = getMigration(from, to);
  const counts = { classes: 0, dataAttributes: 0, cdnLinks: 0 };

  console.log(options);

  return (
    /** when overwrite flag is true, set base option */
    src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
      .pipe(
        replace(/[\s\S]+/, function (content) {
          const result = migrateContent(content, migration);
          counts.classes += result.counts.classes;
          counts.dataAttributes += result.counts.dataAttributes;
          counts.cdnLinks += result.counts.cdnLinks;
          return result.content;
        }),
      )
      .pipe(dest(options.dest))
      .on('data', (data) => {
        if (options.verbose) {
          console.log(`Wrote file: ${data.path}`);
        }
      })
      .on('end', function () {
        console.log(`Completed! Changed ${counts.classes} CSS class names, ${counts.dataAttributes} data-attributes and ${counts.cdnLinks} CDN links.`);
        cb();
      })
  );
}

/** Migrates Bootstrap 4 projects to Bootstrap 5. */
async function migrate(cb) {
  return migrateFiles(4, 5, cb);
}

/** Migrates Bootstrap 5 projects back to Bootstrap 4. */
async function migrate5to4(cb) {
  return migrateFiles(5, 4, cb);
}

/** Migrates Bootstrap 3 projects to Bootstrap 4. */
async function migrate3to4(cb) {
  return migrateFiles(3, 4, cb);
}

/** Migrates Bootstrap 4 projects back to Bootstrap 3. */
async function migrate4to3(cb) {
  return migrateFiles(4, 3, cb);
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
