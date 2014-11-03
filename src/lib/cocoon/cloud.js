var shell 	= require('shelljs'),
    path 	= require('path'),
    fs 		= require('fs'),
    util 	= require('../../utils.js');
var CliManager = null;

/**
 * This module manages all the requests made to the cloud compiler.
 * @constructor
 * @param CliManager
 */
function Cloud(manager) {
    CliManager = manager;
    var actions = CliManager.getArgv( CliManager.ARGV.RAW );
    var command = CliManager.getArgv( CliManager.ARGV.AS_STRING );

    if(actions[0] === "cloud" && actions.length <= 1 ){
        util.printHelpInfo("cloud.txt");
        return;
    }

    var lib = this.loadCommand(actions[1]);

    if(lib){
        new lib(this, CliManager);
    }else{
        util.errorLog("Unknown command " + actions[1]);
    }
};

/**
 *
 * @returns {*}
 */
Cloud.prototype.loadCredentials = function(){
    var home_path = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var config_file = "cocoonjs.json";
    var credentialsPath = path.join(home_path, '.cordova', config_file);
    if(!fs.existsSync(credentialsPath)){
        return false;
    }
    var content = fs.readFileSync(credentialsPath, "utf-8");
    return JSON.parse(content);
};
Cloud.prototype.getLudeiPlugins = function(){
    var plugins = [{
        isView : true,
        name : "webview+",
        package : "com.ludei.webview.plus"
    },{
        isView : true,
        name : "canvas+",
        package : "com.ludei.canvas.plus"
    }];
    return plugins;
}
/**
 *
 * @returns {*}
 */
Cloud.prototype.getCredentialsPath = function(){
    var home_path = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    return path.join(home_path, '.cordova');
};

/**
 * Loads the specified command library and executes it.
 */
Cloud.prototype.loadCommand = function(action){
    var lib_path = path.join(__dirname , "..", "cloud" , action + ".js");

    if(fs.existsSync(lib_path)){
        return require(lib_path);
    }else{
        return false;
    }
};

module.exports = Cloud;