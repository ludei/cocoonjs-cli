var shell 	= require('shelljs');
var path 	= require('path');
var fs 		= require('fs');
var xml2js  = require('xml2js');

function ConfigManager() {

}

ConfigManager.prototype.getConfigXMLPath = function(project_path){
    var config_path = path.join(project_path, "config.xml");

    this.xml = "";
    this.config_xml_path = "";

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
    this.config_xml_path = this.getConfigXMLPath(workingPath);

    if(!this.config_xml_path){
        callback("Can't find your config.xml at the given path " + workingPath, null);
    }

    var configAsXml = fs.readFileSync( this.config_xml_path ).toString('UTF-8');
    this.xml = configAsXml;
    parser.parseString(configAsXml, function(err, configAsObj){
        callback(err, configAsObj, configAsXml);
    });
};

ConfigManager.prototype.setValue = function(section, value){

    if (!this.xml){
        throw new Error("You have to call .readConfigXML(); before setting a value.");
    }

    switch ( section ) {
        case "app_version":
            this.xml = this.xml.replace(/" version="([^"]*)"/, '" version=\"' + value + '\"');
        break;
    }

};

ConfigManager.prototype.getValue = function(section){
    if (!this.xml){
        throw new Error("You have to call .readConfigXML(); before getting a value.");
    }

    switch ( section ) {
        case "package":
            return this.xml.match(/id="([^"]*)"/)[1];
            break;
    }
};

ConfigManager.prototype.saveConfig = function(){
    fs.writeFileSync(this.config_xml_path, this.xml, { encoding : 'utf8' });
}

module.exports = ConfigManager;
