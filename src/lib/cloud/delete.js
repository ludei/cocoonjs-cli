/**
 * Created by karliky on 21/10/14.
 */
var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var util 	= require('../../utils.js');
var prompt  = require('prompt');
var CocoonJSCloud  = require('cocoonjs-cloud-api');
var CliManager;

/**
 * Deletes a project in the cloud compiler
 * @param Cloud
 * @param CliManager
 */
function Delete(Cloud, CliManager) {

    var me = this;
    this.package = CliManager.getArgv( CliManager.ARGV.RAW )[2];

    if(!this.package){
        throw new Error("Missing argument 'package', see 'cocoonjs cloud'.");
    }

    this.credentials = Cloud.loadCredentials();

    if(!this.credentials){
        throw new Error("You have to log in first, see 'cocoonjs cloud'.");
    }

    if( !CliManager.getArgv(CliManager.ARGV.RAW)["force"] ){
        prompt.get([
            {
                name: 'confirm',
                description: 'Delete project?[y/n]',
                required: true
            }
        ], function (err, result) {
            if (err) {
                console.log("\n" + err);
                return;
            }
            if(result.confirm === "yes" || result.confirm === "y"){
                me.deleteProject();
            }else{
                util.log("User canceled the process.");
            }
        });
    }else{
        me.deleteProject();
    }

}

Delete.prototype.deleteProject = function(){
    this.api = new CocoonJSCloud.API(this.credentials);

    this.api.del('/project/' + this.package, function(err) {
        if(err){
            throw new Error(err.message);
        }
        util.log("Project deleted successfully from www.cocoonjs.com.");
    });
}

module.exports = Delete;