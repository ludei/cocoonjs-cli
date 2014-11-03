var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var util 	= require('../../utils.js');
var Table   = require('cli-table');
var ConfigManager  = require('../config-xml.js');
var CliManager;

function Clone(Cloud, manager) {

    CliManager = manager;

    this._cmd = CliManager.getCMD();
    this._CliManager = CliManager;
    var me = this;
    var credentials = Cloud.loadCredentials();

    if(!credentials){
        throw new Error("You have to log in first, see 'cocoonjs cloud login'.");
    }

    util.log("Cloning project");

    var AppLib = CliManager.getCloudLib("apps");
    if(!AppLib){
        throw new Error("Cannot find 'cocoonjs apps' library."); // This should never happen lol wut
    }

    var CreateLib = CliManager.getCordovaLib("create");
    if(!CreateLib){
        throw new Error("Cannot find 'cocoonjs create' library."); // This should never happen lol wut
    }

    // TODO configure ARGV
    var package = CliManager.getArgv( CliManager.ARGV.RAW )[2];
    if (!package){
        throw new Error("Missing argument package.");
    }

    var path = CliManager.getArgv( CliManager.ARGV.RAW )[3];
    if (!path){
        throw new Error("Missing argument path.");
    }

    /**
     * Activate the custom ARGV mode
     * so AppLib can use the correct project info.
     */
    CliManager.toogleCustomArgv(true);
    CliManager.setCustomArgv(["apps", package]);
    new AppLib(Cloud, CliManager, function(projectInfo){

        CliManager.toogleCustomArgv(false);

        me.setUpLocalProject(CreateLib, projectInfo, path);
    });
}

Clone.prototype.setUpLocalProject = function(CreateLib, projectInfo, path){

    if(!projectInfo){
        throw new Error(projectInfo);
    }

    this.createLocalProject(CreateLib, projectInfo, path);
}

Clone.prototype.createLocalProject = function(CreateLib, projectInfo, path){

    var customArgv = ["create", path, projectInfo.package, '"' + projectInfo.title + '"'];
    var me = this;
    var copyFrom = CliManager.getArgv()['copy-from'];
    if(copyFrom){
        customArgv.push("--copy-from=" + copyFrom);
    }

    CliManager.setCustomArgv(customArgv);
    CliManager.toogleCustomArgv(true);

    new CreateLib(CliManager, function(stdout, stderr, status){

        CliManager.toogleCustomArgv(false);

        if(stderr){
            throw new Error(stderr);
        }

        me.updateProjectSettings(projectInfo, path);
    });
}

Clone.prototype.updateProjectSettings = function (projectInfo, path) {

    var me  = this;
    var configManager = new ConfigManager();

    configManager.readConfigXML(path , function(err, configAsObj, configAsXML){
        if(err){
            throw new Error(err);
        }

        configManager.setValue("app_version", projectInfo.version);
        configManager.saveConfig();

        util.log("Your config.xml '" + configManager.config_xml_path + "' has been updated with its project information.");
        util.log("Project configuration '" + projectInfo.title + "' cloned correctly into " + path);

    });
}

module.exports = Clone;