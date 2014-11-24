var shell = require('shelljs'),
    util = require('../utils.js'),
    spawn = require('child_process').spawn;

function Cmd(cmd_path, options) {
    this.cmd = cmd_path;
    this.verboseEnabled = (options) ? !options.verboseEnabled : false;
}

Cmd.prototype.getCmdBinaryPath = function() {
    return this.cmd;
};

Cmd.prototype.exec = function(command, options) {

    var ops = {
        silent: this.verboseEnabled,
        callback: undefined,
        avoidCordovaCMD: false,
        env: ""
    };

    options = options || {};
    util.extend(ops, options);

    var complete_command;

    if (ops.avoidCordovaCMD) {
        complete_command = ops.env + command;
    } else {
        complete_command = ops.env + this.cmd + " " + command;
    }

    if (ops.callback) {
        shell.exec(complete_command, ops, ops.callback);
    } else {
        return shell.exec(complete_command, ops);
    }
};

Cmd.prototype.execAsync = function(command, options) {

    var ops = {
        silent: this.verboseEnabled,
        callback: undefined,
        avoidCordovaCMD: false,
        events : {
            stdout : function(data){},
            stderr : function(data){},
            exit : function(status){}
        },
        env: ""
    };

    options = options || {};
    util.extend(ops, options);

    var complete_command;

    if (ops.avoidCordovaCMD) {
        complete_command = ops.env + command;
    } else {
        complete_command = ops.env + this.cmd + " " + command;
    }

    //Spawn command needs command and args passed as array
    var tempArr = complete_command.match(/"[^"]*"|'[^']*'|\S+/g);
    var command = tempArr[0];
    tempArr.shift();

    // Create child process using spawn of node
    var child = spawn(command, tempArr, ops, ops.callback);

    // Callback registering
    child.stdout.on('data', ops.events.stdout);

    child.stderr.on('data', ops.events.stderr);

    child.on('exit', ops.events.exit);

}

Cmd.prototype.setVerboseMode = function(verbose_mode) {
    this.verboseEnabled = verbose_mode;
}

module.exports = Cmd;