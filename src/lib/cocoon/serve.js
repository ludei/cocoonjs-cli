var shell 	= require('shelljs'),
	util 	= require('../../utils.js'),
    path    = require('path'),
    fs      = require('fs'),
    gulp    = require('gulp'),
    gulp_connect = require(path.resolve(__dirname,"livereload","connect-index.js")),
    ip  = require('ip'),
    qrcode = require('qrcode-terminal'),
    me = this,
    root = path.join(process.cwd() , "www"),
    platformId = null,
    mime = require('mime'),
    config_xml;

var CliManager;
function LiveReload(manager) {
    CliManager = manager;

    var command = CliManager.getArgv( CliManager.ARGV.AS_STRING );

	util.log("Executing command '" + command + "'");

    this.cmd = CliManager.getCMD();

    util.log("A 'cordova prepare' is needed before executing 'cordova serve'.");
    // Prepare the project before serving it.
    var prepare = this.cmd.exec("prepare", { silent : false });
    if(prepare.code !== 0){
        util.errorLog("Error executing 'cordova prepare'. " + prepare.output);
        process.exit(0);
    }

    util.log("Command 'cordova prepare' executed correctly.");
    console.log(""); // Blank line for spacing unrelated logs of the livereload

    me = this;
    util.getConfigXML(function(err, xml){
        if(err){
            process.exit(0);
        }
        config_xml = xml;
        me.init();
    });
}

// Function helpers for serving specific files of cordova
LiveReload.prototype.serveCordovaLibrary = function(res, platform){
    var cordova_lib_path    = path.join(process.cwd() , "platforms", platform, "platform_www", "cordova.js");
    var cordova_lib_content = fs.readFileSync( cordova_lib_path , 'utf-8');
    res.end( cordova_lib_content );
};

LiveReload.prototype.serveCordovaPlugins = function(res, platform){
    var cordova_plugin_path    = path.join(process.cwd() , "platforms", platform, this.getCordovaPluginsPath(platform), "cordova_plugins.js");
    var cordova_plugin_content = fs.readFileSync( cordova_plugin_path , 'utf-8');
    res.end( cordova_plugin_content );
};

LiveReload.prototype.getCordovaPluginsPath = function(platform){
    var plugins_path;
    if(platform === "android"){
        plugins_path = "assets/www";
    }else if(platform === "ios" || platform === "browser"){
        plugins_path = "www";
    }
    return plugins_path;
};

// Middleware for gulp, serves static files and injects livereload snippet in case of inde.html file
LiveReload.prototype.middlewareCordovaLib = function(req, res, next){
    
    util.log("Serving file " + req.url);

    var queryString = req.url.split("/");
    var platforms   = util.getPlatforms();

    if(queryString.length >= 1 && queryString[0] === "" ) queryString.shift();

    if(platforms.length === 0){
        util.log("Platform add");
        process.exit(0);
    }

    if (queryString.length === 1 && queryString[0] === "") {
        res.end( me.getMainHTML(platforms) );
        return;
    }

    if( platforms[queryString[0]] ) {
        if( platformId != queryString[0]){
            platformId = queryString[0];
        }
    }

    //Special files, served from specific directories.
    if(queryString[0] && queryString[0] === "cordova.js"){ 
        me.serveCordovaLibrary(res, platformId);
        next();
    }

    if(queryString[0] && queryString[0] === "cordova_plugins.js"){
        me.serveCordovaPlugins(res, platformId);
        next();
    }
    
    if(platformId === queryString[0]) queryString.shift();

    var path_file = queryString.join("/");
    if( path_file === "" || path_file ){
        var file;
        
        if( path_file === "" || path_file === "/" + platformId){
            file = me.getStaticFile("index.html", res);
            // next middleware only loaded if we're using index.html
            // TODO: read from config file the main HTML file to inject there.
            next();
        }else{
            file = me.getStaticFile(path_file, res);
        }
        
        if(file){
            res.end( file );
        }
    }
};

LiveReload.prototype.getMainHTML = function (platforms){
    var ServeTemplateManager = require("./serve_home.js");
    return new ServeTemplateManager(platforms, config_xml).getTemplate();
};

LiveReload.prototype.getStaticFile = function(path_file, res){
    var static_file = path.join(process.cwd() , "www", path_file);
    
    var textExtensions = [".htm",".html",".js",".css"];
    var isPlainTextFile = this.isPlainTextFile(path_file,textExtensions);
    
    var mimeType = mime.lookup(static_file);

    
    // Detection of file type and return with proper myme type and encondig
    if(fs.existsSync(static_file)){
        res.writeHead(200, {'Content-Type': mimeType });
        return fs.readFileSync( static_file , (isPlainTextFile) ? 'utf-8' : undefined);
    }else{
        return false;
    }
};

LiveReload.prototype.isPlainTextFile = function (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (str.indexOf(strArray[j]) >= 0 ) return true;
    }
    return false;
}

LiveReload.prototype.init = function(){
    var port = 8070;
    var server_url = "http://" + ip.address() + ":" + port;

    if( !fs.existsSync(root) ){
        util.log("Current working directory is not a CocoonJS/Cordova-based project.");
        process.exit();
    }

    gulp.task('connect', function() {
      gulp_connect.server({
        root: root,
        silent : true,
        port : 8070,
        livereload: true,
        middleware: function() {
            return [me.middlewareCordovaLib]
        }
      });
    });

    gulp.task('reload_html', function () {
      gulp.src( path.join(root,'/**/*.html') ).pipe(gulp_connect.reload());
    });

    gulp.task('reload_styles', function () {
      gulp.src( path.join(root,'/**/*.css') ).pipe(gulp_connect.reload());
    });

    gulp.task('reload_code', function () {
      gulp.src( path.join(root,'/**/*.js') ).pipe(gulp_connect.reload());
    });

    gulp.task('watch', function () {
      gulp.watch([ path.join(root,'/**/*.html') ], ['reload_html']);
      gulp.watch([ path.join(root,'/**/*.css') ], ['reload_styles']);
      gulp.watch([ path.join(root,'/**/*.js') ], ['reload_code']);
    });

    gulp.task('default', ['connect', 'watch']);
    gulp.start('default');

    util.log("Static file server running on port " + port + " (i.e. " + server_url + ")");
    util.log("Path: " + root);
    util.log("CTRL + C to shut down");

    if( CliManager.getArgv( CliManager.ARGV.RAW )['qrcode'] ) qrcode.generate(server_url);
};

module.exports = LiveReload;
