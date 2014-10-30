var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var xml2js  = require('xml2js');

function ConfigManager() {

}

ConfigManager.prototype.getConfigXMLPath = function(workingPath){
    var project_path    = workingPath;
    var config_path     = path.join(project_path, "config.xml");

    if( fs.existsSync(config_path) ){
        return config_path;
    }

    config_path = path.join(project_path, "www","config.xml");
    if( fs.existsSync(config_path) ){
        return config_path;
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

    var configAsXml = fs.readFileSync( config_xml_path ).toString('UTF-8');
    parser.parseString(configAsXml, function(err, configAsObj){
        callback(err, configAsObj, configAsXml);
    });
};

ConfigManager.prototype.setValue = function(xml, section, value){

    if (!xml){
        throw new Error("No XML Provided.");
    }

    switch ( section ) {
        case "app_version":

        break;
    }

};

ConfigManager.prototype.getValue = function(xml, section, value){

};

module.exports = ConfigManager;
