var shell 	= require('shelljs'),
    path 	= require('path'),
    fs 	= require('fs'),
    util 	= require('../../../utils.js');

function SamsungSmartTv(CliManager) {

    this.CliManager = CliManager;
    util.log("Installing SamsungSmartTv");

    var project_path = path.join( process.cwd() );
    var platforms_path = path.join(project_path, "platforms", "samsung-smarttv");
    var platforms_path_www = path.join(platforms_path, "www");
    var platforms_path_build = path.join(platforms_path, "build");
    var assets_path = path.join(__dirname, "samsung-smarttv", "/");

    if( !fs.existsSync(platforms_path_www) ){
        shell.mkdir('-p', platforms_path_www);
    }

    if( !fs.existsSync(platforms_path_build) ){
        shell.mkdir('-p', platforms_path_build);
    }

    shell.cp('-Rf', assets_path, platforms_path_www);
    util.log("Platform 'samsung-smarttv' added correctly.")
}

module.exports = SamsungSmartTv;