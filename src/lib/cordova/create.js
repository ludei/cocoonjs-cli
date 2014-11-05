var shell = require('shelljs'),
    fs = require('fs'),
    path = require('path'),
    util = require('../../utils.js');

function Create(CliManager, callback) {

    var command_list = CliManager.getArgv(CliManager.ARGV.RAW);
    var cmd     = CliManager.getCMD();
    var command = CliManager.getArgv(CliManager.ARGV.AS_STRING);

    if(command_list.length === 1){
        throw new Error("At least the dir must be provided to create new project. See `cocoonjs --help`.");
    }else{
        util.log("Executing command '" + command + "'");
    }

    this.commands = command_list;

    this.stdout = "";
    this.stderr = "";
    var me = this;
    cmd.execAsync(command, {
    	events : {
            stdout : function(data){
                me.stdout += data;
            	if(!callback) util.log(data);
            },
            stderr : function(data){
                me.stderr += data;
                if(!callback) util.log(data);
            },
            exit : function(status){

                if(status === 0){
                    me.updateAssets();
                    me.terminateCommand(callback, status);
                }else{
                    me.terminateCommand(callback, status);
                }

            }
        }
    });
}

Create.prototype.terminateCommand  = function(callback, status){
    if(callback){
        callback(this.stdout, this.stderr, status);
    }else{
        process.exit(status);
    }
};

Create.prototype.updateAssets = function(){
    var project_path = path.join( this.commands[1] , "www");
    var brand = path.join(project_path, "img", "logo.png");
    var cli_brand = path.join(__dirname, "..", "..", "assets", "logo.png");
    var index_file = path.join(project_path, "index.html");

    if( fs.existsSync(brand) ){
        shell.cp("-f", cli_brand,brand);
    }

    if( fs.existsSync(index_file) ){
        var index_content = fs.readFileSync(index_file,'utf8');
        index_content = index_content.replace("<h1>Apache Cordova</h1>", "<h1>CocoonJS</h1>");
        fs.writeFileSync(index_file, index_content, 'utf8')
    }
};

module.exports = Create;