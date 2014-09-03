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
    utils.TAG_ERROR         = ("[" + ("CocoonJS") + "] ").cyan;

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

        return callback(false);
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

    utils.getPlatforms = function(){
        var platforms_path = path.join( process.cwd(), "platforms" );
        var platforms = [];

        if( fs.existsSync(platforms_path) ){
            var dir_content = fs.readdirSync(platforms_path);
            for (var i = 0; i < dir_content.length; i++) {
                var stat = fs.statSync( path.join( platforms_path, dir_content[i]) );
                if(stat.isDirectory()){
                    platforms.push(dir_content[i]);
                    platforms[dir_content[i]] = true;
                }
            };
        }

        return platforms;
    };

    utils.getCordovaCMD = function(argv){
        var path = (utils.inWindows) ? "cordova.cmd" : "cordova";
    
        if(!argv['cordova-path']) return path;

        var path_info   = fs.lstatSync(argv['cordova-path']);
        var bin_path    = argv['cordova-path'] + "/bin/cordova";
        if( path_info.isDirectory() && fs.existsSync(bin_path) ){
            path = "node " + bin_path;
        }else{
            path = "node " + argv['cordova-path'];
        }

        return path;
    }

    utils.errorLog = function(){
        var args = Array.prototype.slice.call(arguments).join(" ");
        if(args.length > 0 && new RegExp(/\\n/).test(JSON.stringify(args[args.length - 1]))){
            args = args.substring(0, args.length - 1);
        }
        console.error(utils.TAG_ERROR + (args.red));
    };

    utils.cleanUpArguments = function(CMD_ARGS){
        for (var i = 0; i < CMD_ARGS.length; i++){
        if(CMD_ARGS[i].indexOf("--cordova-path") !== -1) {
            CMD_ARGS.splice(i, 1);
            continue;
        }
        if(CMD_ARGS[i].indexOf("--plugins-path") !== -1) {
            CMD_ARGS.splice(i, 1);
            continue;
        }
    }
    return CMD_ARGS;
    }

    module.exports = utils;
})();