var parse_arguments = null,
	fs              = require('fs'),
    path            = require('path'),
    util            = require('./utils.js'),
    q               = null;

module.exports = function CLI(args) {
	
    try{
        parse_arguments = require('minimist');
        q = require('q');
    }catch(e){
        console.error("Oooops, Did you forgot to run 'npm install'? Execute the following commands: \n",
            "$ cd " + path.dirname(__dirname) + "\n",
            "$ npm install -g \n");
        process.exit(1);
    }

	argv = parse_arguments(args);

    var options = {
        verboseEnabled : false,
        command : args
    };
    
    if(args.length === 0){
        return util.log('No valid command found. Try --help for a list of all the available commands.');
    }
	
    if (argv.help) {
		return util.printHelpInfo();
    }

	if (argv.v || argv.version) {
        return console.log(require('../package').version);
    }
    
    if (argv.d || argv.verbose) {
        options.verboseEnabled = true;
    }
    
    var CORDOVA_CMD = [ "create",
    					"platform", "platforms",
    					"plugin", "plugins",
    					"prepare",
    					"compile",
    					"build",
    					"emulate",
    					"run",
    					"serve" ];
    var COCOON_CMD 	= [ "cloud" ];
    
    if(options.command.length === 0) {
        return util.printHelpInfo();
    }

    if( (CORDOVA_CMD.indexOf(args[0]) !== -1)) {
        return new (require('./lib/cordova-lib'))(argv, options);
    }

    if( (COCOON_CMD.indexOf(args[0]) !== -1)){
        return new (require('./lib/cocoon-lib'))(argv, options);
    }

    return util.log('No valid command found. Try --help for a list of all the available commands.');

};