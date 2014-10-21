var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var util 	= require('../../utils.js');
var Table   = require('cli-table');
var CocoonJSCloud  = require('cocoonjs-cloud-api');
var CliManager;

function Apps(Cloud, manager) {

    CliManager = manager;

    this._cmd = CliManager.getCMD();
    this._rawMode = CliManager.getArgv( CliManager.ARGV.RAW )['raw-mode'] ? true : false;

    var me = this;
    var credentials = Cloud.loadCredentials();

    if(!credentials){
        util.errorLog("You have to log in first, see 'cocoonjs cloud login'. ");
        process.exit(1);
    }

    this.api = new CocoonJSCloud.API(credentials);

    this.api.get('/project', function (err, data) {
        if(err){
            util.errorLog(err.message);
            return;
        }

        if(data.length === 0){
            util.log("No projects found, you will need to create one, see 'cocoonjs cloud create'.");
        }

        /**
         * Print the object in raw
         */
        if(me._rawMode){
            console.log(data);
            return;
        }

        /**
         * Pretty prints a table :)
         * @type {Table}
         */
        var table = new Table({
            head: ['Title', 'Package' ,'Build count'],
            colWidths: [20, 30, 15]
        });

        data.forEach(function(project){
            table.push(
                [project.title, project.package, project.build_count]
            );
        });

        console.log(table.toString());
    });
}

module.exports = Apps;