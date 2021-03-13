// Загружаем наши плагины
// const gulp = require('gulp');
const { task, src, dest, watch, series, parallel } = require('gulp'); // встроенные в gulp 
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const csscomb = require('gulp-csscomb');
const notify = require('gulp-notify');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const uglify = require('gulp-uglify')
const concat = require('gulp-concat');
const terser =require('gulp-terser');
const del = require('del');


// Выносим массив плагинов константу
const plugins = [
  autoprefixer({overrideBrowserslist: ['> 0.5%,  last 5 versions']}),
  mqpacker({sort:sortCSSmq})
];

// Пути в константах
const PATH = {
  scssFile: 'assets/scss/style.scss',
  cssFolder: 'assets/css',
  scssFiles: 'assets/scss/**/*.scss',
  scssFolder: 'assets/scss',
  htmlFiles: '*.html',
  jsFiles: [
    './assets/js/**/*.js',
    '!./assets/js/**/all.js',
    '!./assets/js/**/*.min.js',
  ],
  jsBundleName: 'all.js', // для concatJS делали
  jsFolder: 'assets/js',
  buildFolder: 'dest'
}
// Ф-ция для преобразования кода scss в css 
 function scss() {
   return src(PATH.scssFile)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss(plugins)) 
    .pipe(dest(PATH.cssFolder))
    .pipe(browserSync.stream())
}
 function scssMin() {
  const pluginsExtended = plugins.concat([cssnano({preset: 'default'})]) // С помощью concat добавляем в обьект plugins ssnamo (сжимает css)
  return src(PATH.scssFile)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss(pluginsExtended)) // postcss работает с плагинами
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(PATH.cssFolder))
    .pipe(browserSync.stream())
}

function scssDev() {
   return src(PATH.scssFile, {sourcemaps: true})
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(dest(PATH.cssFolder,{sourcemaps: true}))
    .pipe(browserSync.stream())
}

function comb () {
  return src(PATH.scssFiles)
  .pipe(csscomb().on('error', notify.onError(err => 'File ' + err.message)))
  .pipe(dest(PATH.scssFolder))
}
//Довляем все с js файлов в один all.js
function concatJS () {
  return src(PATH.jsFiles)
  .pipe(concat(PATH.jsBundleName))
  .pipe(dest(PATH.jsFolder))
}
//Сжимаем код
function uglifyJS () {
  return src(PATH.jsFiles)
  .pipe(uglify({
    toplevel: true,
    output: { quote_style: 3 }
  }))
  .pipe(rename({suffix: '.min'}))
  .pipe(dest(PATH.jsFolder))
}
//Сжимаем код для ES6 синтаксиса
function uglifyES6 () {
  return src(PATH.jsFiles)
  .pipe(terser({
    toplevel: true, // уровень сжатости кода
    output: { quote_style: 3 } // одинарные кавычки не работают
  }))
  .pipe(rename({suffix: '.min'}))
  .pipe(dest(PATH.jsFolder))
}
// Сборка на deployed min файлов, task запускаем parallel
function buildJS() {
  return src(PATH.jsFolder + '/**/*.min.js')
  .pipe(dest(PATH.buildFolder + '/js'))
}
function buildCSS() {
  return src(PATH.cssFolder + '/*.min.css')
  .pipe(dest(PATH.buildFolder + '/css'))
}
function buildHTML() {
  return src(PATH.htmlFiles)
  .pipe(dest(PATH.buildFolder + '/templates'))
}
//Делаем очистку при сборке,запускае task series
async function clearFolder () {
  await del(PATH.buildFolder, { force: true})
  return true;
}
//Coздаем сервер
function init() {
  //---копируем
  browserSync.init({
   server: {
     baseDir: './' 
   }
    });
}

async function sync () {
  browserSync.reload()
}
//-----------------------------
// Ф-ция для отслеживания файлов
function watchFiles() {
  init() // запускаем  сервер при запуске ф-ции watchFiles
  watch(PATH.scssFiles, scss)
  watch(PATH.htmlFiles, sync)
  watch(PATH.jsFiles, sync)
}
//Запускаем правила
task('scss', scss);
task('min', series(scss, scssMin));
task('dev', scssDev);
task('comb', comb);
task('watch', watchFiles);
task('concat', concatJS);
task('minjs', uglifyJS);
task('mines6', uglifyES6);
task('build', series(clearFolder, parallel(buildHTML, buildJS, buildCSS)));




