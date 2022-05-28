const uglify = require("gulp-uglify-es").default;
const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsConfig = require("./tsconfig");
const concat = require("gulp-concat");
const del = require("del");
const babel = require("gulp-babel");

function clean() {
  return del(["dist/", "build/"]);
}

function transpile() {
  return gulp
    .src("services/**/*.ts")
    .pipe(
      babel({
        plugins: [
          ["@babel/plugin-transform-typescript"],
          ["babel-plugin-remove-import-export"],
        ],
      })
    )
    .pipe(concat("standalone.js"))
    .pipe(gulp.dest("dist/"));
}
function compile() {
  return gulp
    .src(["app.ts", "services/**/*.ts"])
    .pipe(ts(tsConfig.compilerOptions))
    .pipe(gulp.dest("dist/"));
}

function types() {
  return gulp
    .src(["dist/**/*.d.ts"])
    .pipe(concat("index.d.ts"))
    .pipe(gulp.dest("dist/"));
}

function bundle() {
  return gulp
    .src(["dist/**/*.js"])
    .pipe(uglify())
    .pipe(concat("index.js"))
    .pipe(gulp.dest("dist/"));
}

exports.build = gulp.series(
  clean,
  gulp.parallel(transpile, compile),
  types,
  bundle
);
