const uglify = require("gulp-uglify-es").default;
const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsConfig = require("./tsconfig");
const concat = require("gulp-concat");
const del = require("del");

function clean() {
  return del(["dist/", "build/"]);
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

exports.build = gulp.series(clean, compile, bundle, types);
