var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var util 	= require('../../utils.js');
var archiver = require('archiver');
var ConfigManager  = require('../config-xml.js');
var CocoonJSCloud  = require('cocoonjs-cloud-api');
var spinner = require("char-spinner");
var CliManager;

function Build(Cloud, manager) {

    this.CliManager = manager;

    this.Cloud = Cloud;
    this.interval = spinner();

    this.credentials = Cloud.loadCredentials();

    if(!this.credentials){
        util.errorLog("You have to log in first, see 'cocoonjs cloud'. ");
        return;
    }

    this.api = new CocoonJSCloud.API(this.credentials);

    this.compressProject();
}

Build.prototype.compressProject = function(){

    this.projectPath = process.cwd();
    var outputPath = path.join(process.cwd(), "platforms", "cocoonjs");
    var outputFile = "cloud.zip";
    var pluginsPath = path.join(process.cwd(), "plugins");
    var srcPath = path.join(process.cwd(), "www");
    var output = fs.createWriteStream(path.join( outputPath , outputFile));
    var zipArchive = archiver('zip');
    var me = this;

    if( !fs.existsSync(outputPath) ) {
        shell.mkdir("-p", outputPath);
    }

    output.on('close', function() {
        me.build( path.join(outputPath, outputFile) );
    });

    output.on('error', function() {
        console.log('error', arguments);
    });

    zipArchive.pipe(output);

    var bulkDirectories = [
        { src: [ '**/*' ], cwd: srcPath, dest: 'www', expand: true },
        { src: [ '**/*' ], cwd: pluginsPath, dest: 'plugins', expand: true }
    ];

    if( !fs.existsSync( path.join(srcPath, "config.xml") ) ){
        bulkDirectories.push({ src: [ '**/config.xml' ], cwd: this.projectPath, expand: true });
    }

    zipArchive.bulk(bulkDirectories);

    zipArchive.finalize();

}

Build.prototype.build = function(filePath){
    var configManager = new ConfigManager();
    var me = this;
    configManager.readConfigXML( process.cwd() , function(err, configAsObj, configAsXML) {

        if (err) {
            throw new Error(err);
        }

        util.log("Uploading project '" + package + "' to www.cocoonjs.com");

        var package = configManager.getValue("package");
        var platforms = me.CliManager.getAvailablePlatforms();

        var options = {
            form: {
                file: filePath,
                data: {
                    "view": view,
                    "version": "default", // TODO change this value to 'latest' when possible
                    "platforms" : platforms
                }
            }
        };

        var view = me.getView();
        var viewHelp = "The project '" + package + "' ";
            viewHelp += "will be compiled with the '" + view + "' execution environment,";
            viewHelp += "see 'cocoonjs environments' for more info.";

        util.log(viewHelp);

        me.api.post('/project/' + package + '/compile', options, function(err, data) {
            if(err){
                throw new Error(err);
            }

            util.log("Compilation started...");
            clearInterval(this.interval);
        });
    });
}

Build.prototype.getView = function(){
    var pluginsPath = path.join(this.projectPath, "plugins");
    var pluginsInstalled = fs.readdirSync(pluginsPath);
    var defaultView = "webview";

    if(pluginsInstalled.length === 0){
        return defaultView;
    }

    var LudeiPlugins = this.Cloud.getLudeiPlugins();

    for(var i = 0; i < LudeiPlugins.length; i++){
        if(pluginsInstalled.indexOf(LudeiPlugins[i].name) > -1){
            return LudeiPlugins[i].name;
        }
    }

    return defaultView;
}

module.exports = Build;