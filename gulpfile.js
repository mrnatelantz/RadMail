var gulp = require('gulp');
var inlineCss = require('gulp-inline-css');
var browserSync = require('browser-sync');
var zip = require('gulp-zip');
var argv = require('yargs').argv;
var litmus = require('gulp-litmus');
var fs = require('fs');
var replace = require('gulp-replace');
var prettify = require('gulp-html-prettify');
var csslint = require('gulp-csslint');
var gutil = require('gulp-util');
var rimraf = require('rimraf');
var git = require('gulp-git');



gulp.task('default', function() {
    gutil.log(
        gutil.colors.cyan('\nHey man, I think you forgot to tell me what to do?\n') +
        gutil.colors.green('1   gulp build\n') +
        gutil.colors.green('2   gulp package -n <radmail-V2.13>\n') +
        gutil.colors.green('3   gulp browser-sync\n') +
        gutil.colors.green('4   gulp stream\n') +
        gutil.colors.green('5   gulp litmus\n') +
        gutil.colors.green('6   gulp csslint\n') +
        gutil.colors.green('7   gulp load-template\n') +
        gutil.colors.green('8   gulp template\n') +
        gutil.colors.green('9   gulp update-template\n')
    );

});


/***************************
 **** File Manipulation ****/

gulp.task('build', ['styles', 'vendor', 'cleanUp']);

gulp.task('styles', function() {
    return gulp.src('./src/*.html')
        .pipe(inlineCss({
            applyStyleTags: true,
            applyLinkTags: true,
            removeStyleTags: true,
            removeLinkTags: true,
            preserveMediaQueries: true
        }))
        .pipe(gulp.dest('build/'));
});
// runs after styles
// adds email client vendor tags
gulp.task('vendor', ['styles'], function() {
    return gulp.src('build/index.html')
        .pipe(replace(/<!-- vendor.css --[^>]*>/g, function(s) {
            var style = fs.readFileSync('src/css/vendor.css', 'utf8');
            return '<style type="text/css">\n' + style + '\n</style>';
        }))
        .pipe(gulp.dest('build/'));
});


// Combines multiple style tags into one
// Prettify's the html after processed
gulp.task('cleanUp', ['vendor'], function() {
    return gulp.src('build/index.html')
        .pipe(replace(/<\/style[^>]*>[^<]*<style>/g, function(s) {
            return '/* Style tags removed */';
        }))
        .pipe(prettify({
            indent_char: '  ',
            indent_size: 2
        }))
        .pipe(gulp.dest('build/'));
});


/****************
 *** Packaging ***/

gulp.task('package', ['build'], function() {
    return gulp.src(['build/index.html', 'src/img/*', 'src/template/img/*'])
        .pipe(zip(argv.n != null ? argv.n + '.zip' : 'package.zip'))
        .pipe(gulp.dest('package/'));
});


/*****************************
 **** Everything Below here is
 **** is for testing       ****/


/***********************************
 **** Browser Sync / Live Reload ****/

gulp.task('browser-sync', function() {
    var files = [
        './src/*'
    ];

    browserSync({
        // replace with your localhost
        proxy: "<http://radmail.com.local>"
    });

});


gulp.task('watch', function() {
    gulp.watch('src/template/css/*.css', ['stream', 'browser-sync']);
});

gulp.task('stream', function() {
    return gulp.src('src/template/css/*.css')
        .pipe(reload({
            stream: true
        }));
});

/***********************
 **** Litmus Testing ****/

gulp.task('litmus', ['build', 'sendLitmusTest']);

gulp.task('sendLitmusTest', ['styles'], function() {
    // List of all email clients
    // https://skg.litmus.com/emails/clients.xml
    var config = {
        username: '<user.name@example.com>',
        password: '<secret>',
        url: '<https://your.litmus.com>',
        applications: [
            'ol2007',
            'chromegmailnew'
        ]
    }

    return gulp.src('build/index.html')
        .pipe(litmus(config));
});

/********************
 **** CSS Linting ****/

var customReporter = function(file) {
    gutil.log(gutil.colors.cyan(file.csslint.errorCount) + ' errors in ' + gutil.colors.magenta(file.path));

    file.csslint.results.forEach(function(result) {
        gutil.log(gutil.colors.cyan('Line ' + result.error.line + ' : ') + gutil.colors.red(result.error.message));
    });
};

gulp.task('csslint', function() {
    gulp.src(['src/css/*.css', 'src/template/css/*.css'])
        .pipe(csslint())
        .pipe(csslint.reporter(customReporter));
});




/*********************
 ** Template Parser ***/
//probably could be a node package

gulp.task('template', function() {

    fs.writeFileSync('src/template/tmp/index.html', fs.readFileSync('src/template/index.html', 'utf8'));


    var html = fs.readFileSync('src/template/tmp/index.html', 'utf8').replace(/(\r\n|\n|\r)/gm, "");
    var reg = new RegExp("<!-- -partial:(.*?[\\s*;\\S*;])*? --[^>]*>", "gm");

    var matches = html.match(reg);
    var partialCount = 1;
    var varCount = 1;
    matches.forEach(function(val) {

        /*** Find the partial stubs ***/

        var partialStr = val.replace(/<!--/g, '').replace(/--[^>]*>/g, '').replace(/(\r\n|\n|\r)/gm, "").trim();
        var vars = partialStr.split("-");
        vars = vars.filter(Boolean);
        var file = vars[0].split(":");

        /*** Find the partial html file ***/

        var pattern = new RegExp("<!-- -partial:" + file[1] + "(.*?) --[^>]*>", "gm");
        var partial = fs.readFileSync('src/template/partials/' + file[1].trim() + '.html', 'utf8');

        /**** Now load the vars into the partial ****/


        vars.splice(0, 1); // remove filename from var array
        vars.forEach(function(ele, ind) {
            var content = ele.split(":");
            var partialPattern = new RegExp("<!-- value:" + content[0] + "(.*?) --[^>]*>", "g");

            var safeContent = '';
            if (content[1] != void(0)) {
                safeContent = content[1].replace(/&#58;/g, ':'); // make sure there are no ":"s to mess our stuff up
            }

            partial = partial.replace(partialPattern, safeContent);
            varCount = varCount + 1;
        });


        html = html.replace(pattern, partial);
        partialCount = partialCount + 1;
    });

    fs.writeFileSync('src/index.html', html); // write a new html file with everything in it, same as a web page
    gulp.src('src/index.html')
        .pipe(prettify({
            indent_char: '  ',
            indent_size: 2
        }))
        .pipe(gulp.dest('src/'));

    /*** Show some stats ***/

    if (partialCount > 20) {
        gutil.colors.green('Whoa! You used a lot of partials');
    }
    gutil.log(
        gutil.colors.green('\nHere\'s some stats for what just happened with your rad template\n') +
        gutil.colors.cyan('HTML partials processed      : ') + gutil.colors.magenta(partialCount + '\n') +
        gutil.colors.cyan('Partial variables processed  : ') + gutil.colors.magenta(varCount + '\n')
    );
});


gulp.task('load-template', function() {
    // stuff
});


function getTemplateRepo(client, template) {
    // stuff
}


