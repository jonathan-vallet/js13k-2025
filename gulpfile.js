const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const inlineSource = require('gulp-inline-source');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const replace = require('gulp-replace');

// Parse --game=<name> from CLI args (default: witchcat)
const gameName = (process.argv.find((a) => a.startsWith('--game=')) || '--game=witchcat').split('=')[1];
const gameDir = `./games/${gameName}`;
const gameConfig = require(`${gameDir}/game.config.js`);
const replacements = gameConfig.replacements;
const terserOptions = gameConfig.terserOptions;

// Chemins de fichiers
const paths = {
  html: `${gameDir}/src/index.html`,
  scripts: `${gameDir}/src/js/**/*.js`,
  dist: `${gameDir}/dist`,
  zipDest: `${gameDir}/zip/game.zip`,
};

const MAX_SIZE = 13312; // 13,312 bytes = 13 KB

// Ensure dist and zip directories exist
if (!fs.existsSync(paths.dist)) fs.mkdirSync(paths.dist, { recursive: true });
if (!fs.existsSync(path.dirname(paths.zipDest))) fs.mkdirSync(path.dirname(paths.zipDest), { recursive: true });

// Concaténer les scripts JS sans minification (pour le développement)
gulp.task('scripts-dev', function () {
  return gulp
    .src(paths.scripts)
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(paths.dist))
    .on('error', function (err) {
      console.error('Error in scripts-dev task', err.toString());
    });
});

// Minifier et concaténer les scripts JS (pour la production)
gulp.task('scripts-prod', function () {
  return gulp
    .src(paths.scripts)
    .pipe(concat('bundle.js'))
    .pipe(terser(terserOptions))
    .pipe(gulp.dest(paths.dist))
    .on('error', function (err) {
      console.error('Error in scripts-prod task', err.toString());
    });
});

// Minifier et Inliner les scripts dans l'HTML
gulp.task('minify-html', function () {
  return new Promise((resolve, reject) => {
    gulp
      .src(paths.html)
      .pipe(inlineSource({ compress: false, rootpath: paths.dist }))
      .on('error', reject)
      .pipe(
        htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          minifyJS: true,
          minifyCSS: true,
        }),
      )
      .on('error', reject)
      .pipe(gulp.dest(paths.dist))
      .on('end', resolve)
      .on('error', reject);
  });
});

// Minify CSS files
gulp.task('minify-css', function () {
  return gulp.src(paths.html).pipe(cleanCSS()).pipe(gulp.dest(paths.dist));
});

// Tâche pour zipper uniquement 'index.html' avec archiver
gulp.task('make-zip', function (done) {
  const output = fs.createWriteStream(paths.zipDest);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const zipSize = archive.pointer();
    const percentageOfLimit = (zipSize / MAX_SIZE) * 100;
    console.log(`Zipped size: ${zipSize} bytes`);
    console.log(`You are using ${percentageOfLimit.toFixed(2)}% of the 13 KB limit (13,312 bytes).`);
    done();
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.file(path.join(paths.dist, 'index.html'), { name: 'index.html' });
  archive.finalize();
});

// Apply the replacements to the minified files
gulp.task('replace', function () {
  let stream = gulp.src(path.join(paths.dist, '**/*.{js,html}'));
  for (const [original, replacement] of Object.entries(replacements)) {
    stream = stream.pipe(replace(original, replacement));
  }
  return stream.pipe(gulp.dest(paths.dist));
});

gulp.task('zip-html', function (done) {
  const output = fs.createWriteStream(paths.zipDest);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const zipSize = archive.pointer();
    const percentageOfLimit = (zipSize / MAX_SIZE) * 100;
    console.log(`Zipped size: ${zipSize} bytes`);
    console.log(`You are using ${percentageOfLimit.toFixed(2)}% of the 13 KB limit (13,312 bytes).`);
    done();
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.file(path.join(paths.dist, 'index.html'), { name: 'index.html' });
  archive.finalize();
});

// Serveur de développement avec BrowserSync et LiveReload
gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: paths.dist,
    },
  });

  gulp.watch(paths.scripts, gulp.series('scripts-dev', 'minify-html')).on('change', browserSync.reload);
  gulp.watch(paths.html, gulp.series('minify-html')).on('change', browserSync.reload);
});

// Tâche 'watch' : Surveille les fichiers et régénère à la volée
gulp.task('watch', function () {
  gulp.watch(paths.scripts, gulp.series('scripts-dev', 'minify-html'));
  gulp.watch(paths.html, gulp.series('minify-html'));
});

// Tâche 'zip' : Exécuter tout (scripts, minify-html, zip)
gulp.task('zip', gulp.series('scripts-prod', 'minify-html', 'replace', 'make-zip'));

// Tâche 'zip-only' : Re-créer le ZIP depuis le dist existant
gulp.task('zip-only', gulp.series('zip-html'));

// Tâche par défaut : Utiliser la tâche 'serve' pour le développement avec live reload
gulp.task('default', gulp.series('scripts-dev', 'minify-html', 'serve'));
