var shell = require('shelljs'),
    util = require('../../utils.js');

function ServeCommand(cmd, command) {
    util.log("Executing command '" + command + "'");
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

module.exports = ServeCommand;