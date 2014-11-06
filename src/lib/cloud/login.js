var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var prompt  = require('prompt');
var util 	= require('../../utils.js');
var CocoonJSCloud  = require('cocoonjs-cloud-api');
var CliManager;
/**
 * Requests a valid token and saves it
 * in ~/.cordova/cocoon.js
 * @param cmd
 * @param actions
 * @param Cloud
 * @constructor
 */
function Login(Cloud, manager) {
    CliManager = manager;
    var me = this;
    this._cmd = CliManager.getCMD();
    this.Cloud = Cloud;
    this.credentials = Cloud.loadCredentials();

    if(this.credentials){
        process.exit(0); // already logged in
    }

    prompt.message = "";
    prompt.delimiter = "";
    prompt.start();

    util.log("CocoonJS Cloud Login");
    util.log("Sign up at www.cocoonjs.com/register");

    prompt.get([
        {
            name: 'username',
            description: 'Enter email:',
            required: true
        },
        {
            name: 'password',
            description: 'Enter password:',
            required: true,
            hidden: true
        }
    ], function (err, result) {
        if (err) {
            console.log("\n" + err);
            return;
        }

        if (result && result.username && result.password) {
            me.signIn(result.username, result.password);
        } else {
            console.log("Bad credentials?, Try again.");
        }
    });
}

/**
 * signIn in the CocoonJS' cloud
 * @param username
 * @param password
 */
Login.prototype.signIn = function(username, password){

    var me = this;

    CocoonJSCloud.auth({ username: username, password: password }, function(error, api) {
        if(error){
            if(error.description){
                util.errorLog(error.description);
            }else{
                util.errorLog(error);
            }
            return;
        }

        var cloud_credentials = {
            token : api.token,
            protocol : api.protocol,
            host : api.host,
            port : api.port,
            path : api.path
        };

        me.saveCredentials(cloud_credentials);
    });
};

Login.prototype.saveCredentials = function(credentials){

    var credentialsPath = this.Cloud.getCredentialsPath();
    var credentialsFile = "cocoonjs.json";

    if( !fs.existsSync(credentialsPath) ){
        shell.mkdir('-p', credentialsPath);
    }

    fs.writeFile( path.join(credentialsPath, credentialsFile) , JSON.stringify(credentials), function (err) {
        if (err){
            util.errorLog(err);
            return;
        }
        util.log("You are now logged in!");
        process.exit(0);
    });
};

module.exports = Login;