var shell 	= require('shelljs'),
	util 	= require('../../utils.js'),
    path    = require('path'),
    fs      = require('fs'),
    gulp    = require('gulp'),
    gulp_connect = require(path.resolve(__dirname,"livereload","connect-index.js")),
    ip  = require('ip'),
    url = require('url'),
    qrcode = require('qrcode-terminal'),
    me = this,
    root = path.join(process.cwd() , "www"),
    platformId = null,
    mime = require('mime');

function LiveReload(cmd, command, argv) {
	util.log("Executing command '" + command + "'");
    this.init();
}

LiveReload.prototype.serveCordovaLibrary = function(res, platform){
    var cordova_lib_path    = path.join(process.cwd() , "platforms", platform, "platform_www", "cordova.js");
    var cordova_lib_content = fs.readFileSync( cordova_lib_path , 'utf-8');
    res.end( cordova_lib_content );
}

LiveReload.prototype.middlewareCordovaLib = function(req, res, next){
    
    util.log("Serving file " + req.url);

    var queryString = req.url.split("/");
    var platforms   = util.getPlatforms();

    if(queryString.length >= 1 && queryString[0] === "" ) queryString.shift();

    if(platforms.length === 0){
        util.log("Platform add");
        process.exit(0);
    }

    if (!queryString) {
        res.end( "Main page" );
        return;
    }

    if(!platformId){
        platformId = queryString[0];
        if (!platforms[platformId]) {
        res.end( "Platform not found" );
        return;
        }
    }

    if(queryString[0] && queryString[0] === "cordova.js"){
        me.serveCordovaLibrary(res, platformId);
        return;
    }
    
    if(platformId === queryString[0]) queryString.shift();

    var path_file = queryString.join("/");
    if( path_file === "" || path_file ){
        var file;
        
        if( path_file === "" || path_file === "/" + platformId){
            file = me.getStaticFile("index.html", res);
        }else{
            file = me.getStaticFile(path_file, res);
        }
        
        if(file){
            res.end( file );
            return;
        }
    }

    next();
};

LiveReload.prototype.getStaticFile = function(path_file, res){
    var static_file = path.join(process.cwd() , "www", path_file);
    
    var textExtensions = [".htm",".html",".js",".css"];
    var isPlainTextFile = this.isPlainTextFile(path_file,textExtensions);
    
    var mimeType = mime.lookup(static_file);

    

    if(fs.existsSync(static_file)){
        res.writeHead(200, {'Content-Type': mimeType });
        return fs.readFileSync( static_file , (isPlainTextFile) ? 'utf-8' : 'binary');
    }else{
        return false;
    }
};

LiveReload.prototype.isPlainTextFile = function (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return false;
}

LiveReload.prototype.init = function(){
    var port = 8070;
    var server_url = "http://" + ip.address() + ":" + port;
    me = this;

    if( !fs.existsSync(root) ){
        util.log("Current working directory is not a CocoonJS-based project.");
        process.exit();
    }

    gulp.task('connect', function() {
      gulp_connect.server({
        root: root,
        silent : true,
        port : 8070,
        livereload: true,
        middleware: function(connect, opt) {
            return [me.middlewareCordovaLib]
        }
      });
    });

    gulp.task('html', function () {
      gulp.src( path.join(root,'/*.html') ).pipe(gulp_connect.reload());
    });

    gulp.task('watch', function () {
      gulp.watch([ path.join(root,'/*.html') ], ['html']);
    });

    gulp.task('default', ['connect', 'watch']);
    gulp.start('default');

    util.log("Static file server running on port " + port + " (i.e. " + server_url + ")");
    util.log("Path: " + root);
    util.log("CTRL + C to shut down");

    if(argv.qrcode) qrcode.generate(server_url);
};

module.exports = LiveReload;