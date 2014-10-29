/**
 * Created by karliky on 21/10/14.
 */
var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var util 	= require('../../utils.js');
var CocoonJSCloud  = require('cocoonjs-cloud-api');
var CliManager;

/**
 * Deletes a project in the cloud compiler
 * @param cmd
 * @param actions
 * @param Cloud
 * @constructor
 */
function Delete(Cloud, manager) {

    CliManager = manager;
    var me = this;
    var package = CliManager.getArgv( CliManager.ARGV.RAW )[2];

    if(!package){
        throw new Error("Missing argument 'package', see 'cocoonjs cloud'.");
    }

    this.credentials = Cloud.loadCredentials();

    if(!this.credentials){
        throw new Error("You have to log in first, see 'cocoonjs cloud'.");
    }

    this.api = new CocoonJSCloud.API(this.credentials);

    this.api.del('/project/' + package, function(err, data) {
        if(err){
            throw new Error(err.message);
        }
        util.log("Project deleted successfully from www.cocoonjs.com.");
    });
}

module.exports = Delete;