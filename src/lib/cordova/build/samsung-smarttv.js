var shell 	= require('shelljs'),
    path 	= require('path'),
    fs 	= require('fs'),
    util 	= require('../../../utils.js');
var archiver = require('archiver');

function SamsungSmartTv(CliManager) {

    this.CliManager = CliManager;
    util.log("Building SamsungSmartTv");

    this.project_path = path.join( process.cwd() );
    this.platforms_path = path.join(this.project_path, "platforms", "samsung-smarttv");
    this.platforms_path_www = path.join(this.platforms_path, "www");
    this.platforms_path_build = path.join(this.platforms_path, "build");
    this.project_www = path.join(this.project_path, "www", "/");

    shell.cp('-Rf', this.project_www, this.platforms_path_www);

    this.build();
}

SamsungSmartTv.prototype.build = function(){
    util.log("Compressing project...");

    this.projectPath = process.cwd();
    var outputPath = this.platforms_path_build;
    var outputFile = "samsung-smarttv.zip";
    var srcPath = this.platforms_path_www;
    var zipArchive = archiver('zip');
    var me = this;

    if( !fs.existsSync(outputPath) ) {
        shell.mkdir("-p", outputPath);
    }

    var output = fs.createWriteStream( path.join( outputPath , outputFile) );

    output.on('close', function() {
        util.log("Build succeeded! " + path.join(me.platforms_path_build, outputFile) );
    });

    output.on('error', function() {
        console.error('error', arguments);
    });

    zipArchive.pipe(output);

    var bulkDirectories = [
        { src: [ '**/*' ], cwd: srcPath, dest: '/', expand: true }
    ];

    zipArchive.bulk(bulkDirectories);

    zipArchive.finalize();

}

module.exports = SamsungSmartTv;