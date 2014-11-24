var shell 	= require('shelljs'),
    path 	= require('path'),
	util 	= require('../../utils.js');

function BuildCommand(CliManager) {

    this.CliManager = CliManager;
    this.argv = CliManager.getArgv(CliManager.ARGV.RAW);
    this.command = CliManager.getArgv(CliManager.ARGV.AS_STRING);
    this.cmd = CliManager.getCMD();

    util.log("Executing command '" + this.command + "'");

    var platform_name = this.argv[1];
    if( this.argv[1] && this.isLudeiPlatform(platform_name) ){
        this.buildCustomPlatform(platform_name);
        return;
    }

    this.executeGenericCommand();
}

BuildCommand.prototype.buildCustomPlatform = function(platform_name){
    var platform_path = path.join(__dirname, "build", platform_name);
    var PlatformLib = require(platform_path);
    new PlatformLib(this.CliManager);
};

BuildCommand.prototype.isLudeiPlatform = function(platform_name){
    var platforms = this.CliManager.getLudeiPlatforms();

    for(var x = 0; x < platforms.length; x++){
        if(platform_name === platforms[x].name){
            return true;
        }
    }

    return false;
};

BuildCommand.prototype.executeGenericCommand = function(){
    this.cmd.execAsync( this.command, {
        events : {
            stdout : function(data){
                util.log(data.toString());
            },
            stderr : function(data){
                console.error(data.toString());
            },
            exit : function(status){
                process.exit(status);
            }
        }
    });
};

module.exports = BuildCommand;