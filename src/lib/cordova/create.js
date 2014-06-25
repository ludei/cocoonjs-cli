var shell = require('shelljs'),
    util = require('../../utils.js');

function CreateCommand(cmd, command) {
    
    var command_list = command.split(" ");
    if(command_list.length === 1){
        util.log("At least the dir must be provided to create new project. See `cocoonjs --help`.");
        return;
    }else{
        util.log("Executing command '" + command + "'");
    }

    var result = cmd.execAsync(command, {
    	events : {
            stdout : function(data){
            	util.log(data);
            },
            stderr : function(data){
            	util.log(data);
            },
            exit : function(status){
            	process.exit(status);
            }
        }
    });
}

module.exports = CreateCommand;