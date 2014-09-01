var shell 	= require('shelljs'),
	fs 		= require('fs'),
	path 	= require('path'),
	util 	= require('../utils.js');

function CordovaLib(argv, options) {

	this._argv 		= argv;										// Optional arguments like --cordova-path or --plugins-path
	this._args 		= util.cleanUpArguments(options.command);	// Cordova command and flags
	this._argsStr 	= this._args.join(" ");						// Cordova command and flags as string
	this._cmdPath	= this.getCordovaCMD(); 					// Path to the Cordova CLI executable
	this._cmd 		= null;
	this._options 	= options;

	this.init();
};

CordovaLib.prototype.init = function(){
	
	shell.exec("cd " + process.cwd());
	
	var CommandLib = this.getCordovaLib(this._args[0]);
	this._cmd = new (require('./cmd.js'))(this._cmdPath, this._options);

	var req_results = this.checkRequirements();
	if(req_results.code !== 0){
		util.log("Could not find a valid Cordova version installed in your system.");
		util.log("Please install it with '$ npm install -g cordova'.");
		util.log("Or use --cordova-path to provide a local copy of the Cordova-CLI.");
		return;
	}

	new CommandLib(this._cmd, this._argsStr, this._argv);
};

CordovaLib.prototype.checkRequirements = function(){
	
	var options = {
		silent : true
	};

	return this._cmd.exec(" --version", options);
};

CordovaLib.prototype.getCordovaLib = function(command){
	var lib_path = path.join(__dirname , "cordova" , command + ".js");

	if(fs.existsSync(lib_path)){
		return require(lib_path);
	}else{
		return require("./cordova/generic.js");
	}
};

CordovaLib.prototype.getCordovaCMD = function(CMD_ARGS){
	var path = (util.inWindows) ? "cordova.cmd" : "cordova";
	
	if(!this._argv['cordova-path']) return path;

	var path_info = fs.lstatSync(this._argv['cordova-path']);
	var bin_path = this._argv['cordova-path'] + "/bin/cordova";
	if( path_info.isDirectory() && fs.existsSync(bin_path) ){
		path = "node " + bin_path;
	}else{
		path = "node " + this._argv['cordova-path'];
	}

	return path;
};

module.exports = CordovaLib;