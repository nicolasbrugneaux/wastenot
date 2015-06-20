var gulp           = require( 'gulp' );
var browserify     = require( 'browserify' );
var babelify       = require( 'babelify' );
var source         = require( 'vinyl-source-stream' );
var watch          = require( 'gulp-watch' );

function compile( src, standalone )
{
    var fileSplit = src.split( '/' );
    var file      = fileSplit[fileSplit.length-1];
    var options   =
    {
        debug: true
    };

    standalone && ( options.standalone = standalone );

    var b = browserify( options )
        .transform( babelify )
        .add( src );

    return b.bundle()
        .on( 'error', function( err )
        {
            console.log( err.toString() );
            this.emit( 'end' );
        } )
        .pipe( source( file ) )
        .pipe( gulp.dest( './public/js/' ) );
}


gulp.task( 'compile', function ()
{
    compile( './src_js/main.js' );
} );


gulp.task( 'watch', function ()
{
    gulp.start( 'compile' );

    watch( ['./src_js/**/*.js'], function()
    {
        gulp.start( 'compile' );
    } );
} );


// Default Task
gulp.task( 'default', ['compile'] );
