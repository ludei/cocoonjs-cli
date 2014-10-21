var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var prompt  = require('prompt');
var util 	= require('../../utils.js');
var async   = require('async');
var CocoonJSCloud  = require('cocoonjs-cloud-api');
var CliManager;
/**
 * Created a local project and a remote one.
 * @param cmd
 * @param actions
 * @param Cloud
 * @constructor
 */
function Create(Cloud, manager) {
    CliManager = manager;

    var me = this;

    this._cmd = CliManager.getCMD();
    this._command = CliManager.getArgv( CliManager.ARGV.RAW );
    this._project_path = this._command[1];
    this.credentials = Cloud.loadCredentials();

    if(!this.credentials){
        util.errorLog("You have to log in first, see 'cocoonjs cloud'. ");
        return;
    }

    this.api = new CocoonJSCloud.API(this.credentials);

    if(!this._command[1]){
        util.errorLog("At least the dir must be provided to create new project. See `cocoonjs help`.");
        process.exit(1);
    }

    util.log("creating a new project at", this._command[2]);

    var Lib = CliManager.getCordovaLib(this._command[1]);
    if(!Lib){
        util.errorLog("Cannot find 'cocoonjs create' library."); // This should never happen lol wut
    }

    /**
     * Arguments passed to "$ cocoonjs create ..."
     * @type {{path: *, package: *, name: *}}
     */
    var commandList = {
      path :   this._command[2],
      package : this._command[3],
      name : this._command[4]
    };

    async.waterfall([
        function(callback){
            if(!commandList.path){
                me.getPrompt(commandList, 'path', 'Path to your new CocoonJS project (absolute path)', callback);
            }else{
                callback(null);
            }
        },
        function(callback){
            if(!commandList.package){
                me.getPrompt(commandList, 'package', 'Package (reverse domain style, e.g. com.ludei.test)', callback);
            }else{
                callback(null);
            }
        },
        function(callback){
            if(!commandList.name){
                me.getPrompt(commandList, 'name', 'The name of your app', callback);
            }else{
                callback(null);
            }
        }
    ], function (err) {
        if(err){
            throw new Error(err);
        }

        var customArgv = ["create", commandList.path, commandList.package, commandList.name];
        CliManager.setCustomArgv(customArgv);
        CliManager.toogleCustomArgv(true);

        // Executes '$ cocoonjs create {/path/} {package} {name}'
        new Lib(CliManager, function(stdout, stderr, statusCode){
            if(statusCode !== 0){
                util.errorLog(stderr);
                return;
            }
            util.log(stdout);
            // Disable custom 'argv' so future operations
            // will use the original argv.
            CliManager.toogleCustomArgv(false);
            // Create the project in the cloud service
            me.createCloudProject(CliManager, customArgv);
        });
    });

}
/**
 *
 * @param CliManager
 * @param argv
 */
Create.prototype.createCloudProject = function(CliManager, argv){

    var options = {
        form: {
            "title": argv[3],
            "package": argv[2],
            "version": "0.0.1"
        }
    };

    this.api.post('/project', options, function(err, data) {
        if(err){
            throw new Error(err)
        }
        util.log("Your project has been created correctly in www.cocoonjs.com.");
    });

};
/**
 *
 * @param objReference
 * @param name
 * @param description
 * @param callback
 */
Create.prototype.getPrompt = function(objReference, name, description, callback){
    prompt.get([
        { name: name, description: description, required: true }
    ], function (err, result) {
        if (err) {
            callback(err);
            return;
        }

        if (result && result[name]) {
            objReference[name] = result[name];
            callback(null);
        }
    });
}

module.exports = Create;