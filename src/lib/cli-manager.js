var shell 	= require('shelljs'),
    fs 		= require('fs'),
    path 	= require('path'),
    util 	= require('../utils.js');
/**
 *
 * @constructor
 */
function CliManager(argv, options){

    this._argv = (function(argv){ // Optional arguments like --cordova-path or --plugins-path
        var arr = [];
        for(var prop in argv){
            var key = prop;
            var value = argv[key];
            if( isNaN( parseInt(key) ) ){
                arr[key] = value;
            }else{
                arr.push(value);
            }
        }
        return arr;
    })(argv);

    this._args 		= util.cleanUpArguments(options.command);	// Cordova command and flags
    this._argsStr 	= this._args.join(" ");						// Cordova command and flags as string
    this._customArgvEnabled = false;

    this._custom_argv = this._argv;
    this._custom_args = this._args;
    this._custom_argsStr = this._argsStr;

    this._cmdPath	= util.getCordovaCMD(this._argv); 			// Path to the Cordova CLI executable
    this._cmd 		= new (require('./cmd.js'))(this._cmdPath, options);

}
/**
 *
 * @type {{AS_STRING: number, RAW: number}}
 */
CliManager.prototype.ARGV = {
    AS_STRING : "AS_STRING",
    RAW : "RAW"
}
/**
 *
 * @param mode
 * @returns {*}
 */
CliManager.prototype.getArgv = function(mode){
    // If custom argv is enabled, return the custom one.
    if(this._customArgvEnabled){
        return this.getCustomArgv(mode);
    }
    mode = mode || this.ARGV.RAW;

    if( mode === this.ARGV.AS_STRING ){
        return this._argsStr;
    }else if( mode === this.ARGV.RAW ){
        return (this._argv) ? this._argv : [];
    }

    return (this._argv) ? this._argv : [];
}
/**
 *
 * @param argv
 */
CliManager.prototype.setCustomArgv = function(argv){
    this._custom_argv 	    = argv;
    this._custom_args 		= util.cleanUpArguments(argv);
    this._custom_argsStr 	= this._custom_args.join(" ");
}
/**
 *
 * @param bool
 */
CliManager.prototype.toogleCustomArgv = function(bool){
    this._customArgvEnabled = bool;
}
CliManager.prototype.isCustomArgvActive = function(){
    return this._customArgvEnabled;
}
/**
 *
 * @param argv
 */
CliManager.prototype.getCustomArgv = function(mode){
    mode = mode || this.ARGV.RAW;

    if( mode === this.ARGV.AS_STRING ){
        return this._custom_argsStr;
    }else if( mode === this.ARGV.RAW ){
        return (this._custom_argv) ? this._custom_argv : [];
    }

    return (this._custom_argv) ? this._custom_argv : [];
}
/**
 *
 * @returns {*}
 */
CliManager.prototype.getCMD = function(){
    return this._cmd;
}
/**
 *
 */
CliManager.prototype.getCocoonLib = function(command){
    var lib_path = path.join(__dirname , "cocoon" , command + ".js");

    if(fs.existsSync(lib_path)){
        return require(lib_path);
    }else{
        return false;
    }
}
/**
 *
 */
CliManager.prototype.getCordovaLib = function(command){
    var lib_path = path.join(__dirname , "cordova" , command + ".js");
    var generic_path = path.join(__dirname , "cordova" , "generic.js");

    if(fs.existsSync(lib_path)){
        return require(lib_path);
    }else{
        return require(generic_path);
    }
}
/**
 *
 */
CliManager.prototype.getCloudLib = function(command){
    var lib_path = path.join(__dirname , "cloud" , command + ".js");

    if(fs.existsSync(lib_path)){
        return require(lib_path);
    }else{
        return false;
    }
}

CliManager.prototype.getLudeiPlatforms = function(){
    var platforms_path = path.join( __dirname, "..", "..", "src", "ludei_platforms.json");
    return require(platforms_path);
};

CliManager.prototype.getLudeiPlugins = function(){
    var plugins = [{
        isView : true,
        name : "webview+",
        package : "com.ludei.webview.plus"
    },{
        isView : true,
        name : "webview+",
        package : "com.ludei.ios.webview.plus"
    },{
        isView : true,
        name : "canvas+",
        package : "com.ludei.canvas.plus"
    }];
    return plugins;
};
/**
 *
 */
CliManager.prototype.getAvailablePlatforms = function(){
    var platforms_path = path.join( process.cwd() , "platforms");
    var directories = [];
    var directory_content = fs.readdirSync(platforms_path);
    var length = directory_content.length;

    for(var x = 0; x < length; x++){
        var file = directory_content[x];
        if(file === "cocoonjs"){
            continue;
        }
        var stats = fs.statSync( path.join(platforms_path, file) );
        if(stats.isDirectory()){
            directories.push(file);
        }
    }

    return directories;
}

/**
 *
 */
CliManager.prototype.getAvailablePlugins = function(){
    var plugins_path = path.join( process.cwd() , "plugins");
    var directories = [];
    var directory_content = fs.readdirSync(plugins_path);
    var length = directory_content.length;

    for(var x = 0; x < length; x++){
        var file = directory_content[x];
        var stats = fs.statSync( path.join(plugins_path, file) );
        if(stats.isDirectory()){
            directories.push(file);
        }
    }

    return directories;
}
module.exports = CliManager;