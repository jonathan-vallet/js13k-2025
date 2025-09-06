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

// Define replacements for shortening the code
const replacements = {
  // element ids
  gameBackgroundCanvas: 'gbc',
  gameCanvas: 'gc',

  // tile types
  grass: 'g',
  water: 'w',
  character: 'c',
  tree: 'tr',
  seeker: 'se',
  blade: 'bt',
  spikes: 's',
  stoneflower: 'sf',
  ground: 'dg',
  liana: 'l',
  mommy: 'm',
  skeleton: 'sk',
  heart: 'h',
  mushroom: 'msh',
  signpanel: 'sg',
  tree: 'tr',
  bush: 'b',
  crack: 'cr',
  rock: 'r',
  snow: 'sn',
  // // root: 'r',
  spring: 'sp',
  summer: 'su',
  fall: 'fa',
  winter: 'wi',

  // tile object properties
  collisionPadding: '_cp',
  isStatic: '_iS',
  colors: '_c',
  animationSpeed: '_aS',
  moveSpeed: '_mS',
  returningMoveSpeed: '_rS',
  moveDirection: '_mD',
  flipHorizontally: '_fH',
  animationFrame: '_aF',
  orientation: '_o',
  isCollected: '_iC',
};

// Chemins de fichiers
const paths = {
  html: './src/index.html',
  scripts: './src/js/**/*.js',
  dist: './dist',
  zipDest: './zip/game.zip',
};

const MAX_SIZE = 13312; // 13,312 bytes = 13 KB

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
    .pipe(
      terser({
        ecma: 2020,
        module: false,
        toplevel: true,
        compress: {
          passes: 3,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_methods: true,
          unsafe_math: true, // n’écrira pas >>4 tout seul, mais aide d’autres folds
          booleans_as_integers: true,
          pure_getters: true,
          hoist_vars: true,
          hoist_props: true,
          join_vars: true,
          switches: true,
          dead_code: true,
          drop_console: true, // si tu n’as pas de logs en prod
        },
        mangle: {
          toplevel: true,
          properties: {
            // utilise un préfixe _ sur tes props internes pour autoriser le mangle
            regex: /^_/,
          },
        },
      }),
    )
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
      .pipe(inlineSource({ compress: false, rootpath: paths.dist })) // Inline le fichier généré
      .on('error', reject) // Gestion des erreurs pour l'inlining
      .pipe(
        htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          minifyJS: true,
          minifyCSS: true,
        }),
      )
      .on('error', reject) // Gestion des erreurs pour la minification HTML
      .pipe(gulp.dest(paths.dist))
      .on('end', resolve) // Résoudre la Promise lorsque c'est terminé
      .on('error', reject); // Gestion des erreurs finales
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
  let stream = gulp.src(path.join(paths.dist, '**/*.{js,html}')); // Apply to all JS and HTML files in the dist folder
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

  // Archive uniquement le fichier index.html dans le dossier dist
  archive.file(path.join(paths.dist, 'index.html'), { name: 'index.html' });

  archive.finalize();
});

// Serveur de développement avec BrowserSync et LiveReload
gulp.task('serve', function () {
  // Initialiser BrowserSync et servir le dossier dist
  browserSync.init({
    server: {
      baseDir: paths.dist,
    },
  });

  // Regarder les changements et rafraîchir automatiquement
  gulp.watch(paths.scripts, gulp.series('scripts-dev', 'minify-html')).on('change', browserSync.reload);
  gulp.watch(paths.html, gulp.series('minify-html')).on('change', browserSync.reload);
});

// Tâche 'watch' : Surveille les fichiers et régénère à la volée (sans zip, sans minification JS)
gulp.task('watch', function () {
  gulp.watch(paths.scripts, gulp.series('scripts-dev', 'minify-html'));
  gulp.watch(paths.html, gulp.series('minify-html'));
});

// Tâche 'zip' : Exécuter tout (scripts, minify-html, zip)
gulp.task('zip', gulp.series('scripts-prod', 'minify-html', 'replace', 'make-zip'));

// Tâche 'zip' : Exécuter tout (scripts, minify-html, zip)
gulp.task('zip-only', gulp.series('zip-html'));

// Tâche par défaut : Utiliser la tâche 'serve' pour le développement avec live reload
gulp.task('default', gulp.series('scripts-dev', 'minify-html', 'serve'));
