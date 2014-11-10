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
    var zipArchive = archiver('zip');
    var me = this;

    if( !fs.existsSync(outputPath) ) {
        shell.mkdir("-p", outputPath);
    }

    var output = fs.createWriteStream(path.join( outputPath , outputFile));

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
    configManager.readConfigXML( process.cwd() , function(err) {

        if (err) {
            throw new Error(err);
        }

        var bundle = configManager.getValue("package");
        var platforms = me.CliManager.getAvailablePlatforms();
        var plugins = me.CliManager.getAvailablePlugins();

        util.log("Uploading project '" + bundle + "' to CocoonJS' Cloud Compiler.");
        var view = me.getView();
        var options = {
            form: {
                file: filePath,
                data: {
                    "view": view,
                    "version": "default",
                    "platforms" : platforms
                }
            }
        };

        var viewHelp = "The project '" + package + "' ";
            viewHelp += "will be compiled with the '" + view + "' execution environment,";
            viewHelp += "see 'cocoonjs environments' for more info.";

        var pluginHelp = "";
        if(plugins.length === 0){
            pluginHelp += "Your project does not have installed plugins.";
        }else{
            pluginHelp += "Plugins that will be compiled with your project:\n";
            for(var x = 0; x < plugins.length; x++){
                pluginHelp += plugins[x] + "\n";
            }
        }

        util.log(viewHelp);
        util.log(pluginHelp);

        me.api.post('/project/' + package + '/compile', options, function(err) {
            if(err){
                throw new Error(err);
            }

            util.log("Compilation started...");
            clearInterval(me.interval);
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

    var LudeiPlugins = this.CliManager.getLudeiPlugins();

    for(var i = 0; i < LudeiPlugins.length; i++){
        if(pluginsInstalled.indexOf(LudeiPlugins[i].package) !== -1){
            return LudeiPlugins[i].name;
        }
    }

    return defaultView;
}

module.exports = Build;