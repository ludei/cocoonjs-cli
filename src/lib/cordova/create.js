var shell = require('shelljs'),
    util = require('../../utils.js');

function CreateCommand(CliManager, callback) {

    var command_list = CliManager.getArgv(CliManager.ARGV.RAW);
    var cmd     = CliManager.getCMD();
    var command = CliManager.getArgv(CliManager.ARGV.AS_STRING);


    if(command_list.length === 1){
        throw new Error("At least the dir must be provided to create new project. See `cocoonjs --help`.");
    }else{
        util.log("Executing command '" + command + "'");
    }
    var stdout = "";
    var stderr = "";
    var result = cmd.execAsync(command, {
    	events : {
            stdout : function(data){
                stdout += data;
            	if(!callback) util.log(data);
            },
            stderr : function(data){
                stderr += data;
                if(!callback) util.log(data);
            },
            exit : function(status){
                if(callback){
                    callback(stdout, stderr, status);
                }else{
                    process.exit(status);
                }
            }
        }
    });
}

module.exports = CreateCommand;