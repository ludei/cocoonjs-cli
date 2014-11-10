var shell 	= require('shelljs'),
    util 	= require('../../utils.js');

function Platform(CliManager) {

    var Lib = CliManager.getCordovaLib("platform");
    new Lib(CliManager);

}

module.exports = Platform;