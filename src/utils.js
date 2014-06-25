var colors  = require('colors'),
    path    = require('path'),
    fs      = require('fs'),
    os      = require('os'),
    xml2js  = require('xml2js');

var fileExists = fs.existsSync;

(function(){
    /**
     * The "exported" object, this object holds all the "utils" functionalities
     */
    var utils = {};

    /**
     * Property with the running operating system.
     */
    utils.OPERATING_SYSTEM  = os.type();
    utils.inWindows         = (os.platform() === 'win32');
    utils.TAG               = ("[" + ("CocoonJS") + "] ").cyan;

    /**
     * Creates a valid path depending on the platform
     */
    utils.getPath = function(filepath){
        if(utils.inWindows){
            return filepath.replaceAll('/', path.sep);
        }else{
            return filepath;
        }
    };

    /**
     * Check if this platform is ready to handle Cordova compilations
     */
    utils.isCordovaAvailable = function (cmd) {
        var exec = cmd.exec(" --version");
        if(exec.code === 0){
            return exec;
        }else{
            return false;
        }
    };

    utils.getConfigXML = function(callback){
        var project_path    = process.cwd();
        var config_path     = path.join(project_path, "config.xml");
        var parser          = new xml2js.Parser();

        if( fileExists(config_path) ){
            var data = fs.readFileSync(config_path).toString('UTF-8');
            parser.parseString(data, callback);
        };

        config_path = path.join(project_path, "www","config.xml");
        if( fileExists(config_path) ){
            var data = fs.readFileSync(config_path).toString('UTF-8');
            parser.parseString(data, callback);
        };

        return false;
    };
    
    /**
     * Checks if this platform ready to manage cordova compilations, also returns
     * the cordova version.
     */
    utils.getCordovaVersion = function(cmd, callback){
        var isAvailable = utils.isCordovaAvailable(cmd);
        if(isAvailable){
            return isAvailable.output.replace(/(\r\n|\n|\r)/gm,"");
        }else{
            return false;
        }
    };

    utils.printHelpInfo = function(){
        var help = path.join(__dirname, "../", "help.txt")
        return console.log( fs.readFileSync( help ).toString() );
    };

    utils.extend = function(){
        for(var i=1; i<arguments.length; i++)
                for(var key in arguments[i])
                    if(arguments[i].hasOwnProperty(key))
                        arguments[0][key] = arguments[i][key];
        return arguments[0];
    }

    /**
     * Utility log function, TODO: handle verbosity
     */
    utils.log = function(){
        var args = Array.prototype.slice.call(arguments).join(" ");
        if(args.length > 0 && new RegExp(/\\n/).test(JSON.stringify(args[args.length - 1]))){
            args = args.substring(0, args.length - 1);
        }
        console.log(utils.TAG + args);
    };

    module.exports = utils;
})();