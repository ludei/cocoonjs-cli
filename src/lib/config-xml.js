var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var xml2js  = require('xml2js');

function ConfigManager() {

}

ConfigManager.prototype.getConfigXMLPath = function(workingPath){
    var project_path    = workingPath;
    var config_path     = path.join(project_path, "config.xml");

    if( fileExists(config_path) ){
        return fs.readFileSync(config_path).toString('UTF-8');
    };

    config_path = path.join(project_path, "www","config.xml");
    if( fileExists(config_path) ){
        return fs.readFileSync(config_path).toString('UTF-8');
    }

    return false;
};

/**
 *
 * @param workingPath
 * @param callback
 * @returns {*}
 */
ConfigManager.prototype.readConfigXML = function(workingPath, callback){
    var parser = new xml2js.Parser();
    var config_xml_path = this.getConfigXMLPath(workingPath);

    if(!config_xml_path){
        callback("Can't find your config.xml at the given path " + workingPath, null);
    }

    var content = fs.readFileSync( config_xml_path ).toString('UTF-8');
    parser.parseString(content, function(data){
        callback(null, data);
    });
};

ConfigManager.prototype.setValue = function(section, value){

};

ConfigManager.prototype.getValue = function(section, value){

};

module.exports = ConfigManager;
