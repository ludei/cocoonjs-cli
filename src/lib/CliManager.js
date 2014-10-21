var shell 	= require('shelljs'),
    fs 		= require('fs'),
    path 	= require('path'),
    util 	= require('../utils.js');
/**
 *
 * @constructor
 */
function CliManager(argv, options){

    this._argv 		= argv;							            // Optional arguments like --cordova-path or --plugins-path
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

    if(fs.existsSync(lib_path)){
        return require(lib_path);
    }else{
        return require("./cordova/generic.js");
    }
}
/**
 *
 */
CliManager.prototype.getCloudLib = function(){

}
module.exports = CliManager;