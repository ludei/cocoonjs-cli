var shell 	= require('shelljs'),
	fs 		= require('fs'),
	path 	= require('path'),
	util 	= require('../utils.js');
var CliManager = null;

function CordovaLib(argv, options) {
    CliManager = new (require("./cli-manager.js"))(argv, options);
    this.init();
};

CordovaLib.prototype.init = function(){
	shell.exec("cd " + process.cwd());

    var CommandLib = CliManager.getCordovaLib(CliManager.getArgv()[0]);
	this._cmd = CliManager.getCMD();

	var req_results = this.checkRequirements();
	if(req_results.code !== 0){
		util.log("Could not find a valid Cordova version installed in your system.");
		util.log("Please install it with '$ npm install -g cordova'.");
		util.log("Or use --cordova-path to provide a local copy of the Cordova-CLI.");
		return;
	}

    if(!CommandLib){
        util.errorLog("Could not execute the command '" + CliManager.getArgv()[0] + "'.");
        util.errorLog("The command because it's not available as a cordova library.");
        return;
    }

	new CommandLib(CliManager);
};

CordovaLib.prototype.checkRequirements = function(){
	var options = {
		silent : true
	};

	return this._cmd.exec(" --version", options);
};

module.exports = CordovaLib;