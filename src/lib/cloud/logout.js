var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var util 	= require('../../utils.js');
var CliManager;

function Logout(Cloud, manager) {

    CliManager = manager;
    var me = this;

    this.Cloud = Cloud;
    this.credentials = Cloud.loadCredentials();

    if(this.credentials){
        var credentialsPath = Cloud.getCredentialsPath();
        shell.rm("-rf", path.join(credentialsPath, "cocoonjs.json"));
        util.log("logged out of www.cocoonjs.com");
    }
}


module.exports = Logout;