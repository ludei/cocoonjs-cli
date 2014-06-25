var shell 	= require('shelljs'),
	util 	= require('../../utils.js');

function GenericCommand(cmd, command) {
	util.log("Executing command '" + command + "'");

	cmd.execAsync(command, {
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
}

module.exports = GenericCommand;