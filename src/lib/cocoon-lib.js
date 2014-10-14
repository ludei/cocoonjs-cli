var shell 	= require('shelljs'),
	path 	= require('path'),
	fs 		= require('fs'),
	util 	= require('../utils.js');
	
 function CocoonLib(argv, options) {
	this._argv 		= argv;										// Full list of commands, constains optional arguments like --cordova-path
	this._args 		= util.cleanUpArguments(options.command);	// command and flags
	this._argsStr 	= this._args.join(" ");						// command and flags as string
	this._cmdPath 	= util.getCordovaCMD(argv);

	this.init();
};

CocoonLib.prototype.init = function(){
	
	shell.exec("cd " + process.cwd());
		
	var Lib = this.getCocoonLib(this._args[0]);

	if(!Lib){
		return util.printHelpInfo();
	}

	this._cmd = new (require('./cmd.js'))(this._cmdPath, this._options);

	new Lib(this._cmd, this._argsStr, this._argv);
};

CocoonLib.prototype.getCocoonLib = function(command){
	var lib_path = path.join(__dirname , "cocoon" , command + ".js");

	if(fs.existsSync(lib_path)){
		return require(lib_path);
	}else{
		return false;
	}
};

module.exports = CocoonLib;