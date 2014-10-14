var util 	= require('../../utils.js'),
    path    = require('path'),
    fs      = require('fs');

(function(){
    function ServeHome(platforms, config_xml) {
        if(!config_xml) return;
        this.config_xml = config_xml;
        var home_template = fs.readFileSync( path.join(__dirname,"home.html") , "utf-8");

        var platforms_template = "";
        for (var i = 0; i < platforms.length; i++) {
            platforms_template += "<li><a href='/"+ platforms[i] +"'>"+ platforms[i] +"</a></li>\n";
        };

        home_template = home_template.replace("{{platforms}}", platforms_template);
        
        var project_info_template = "";
        
        var bundle_id = this.getConfigParam("bundle_id");
        if(bundle_id){
            project_info_template += "<p>Bundle id: " + bundle_id + "</p>\n";
        }
        
        var version = this.getConfigParam("version");
        if(version){
            project_info_template += "<p>Version: " + version + "</p>\n";
        }

        var name = this.getConfigParam("title");
        if(name){
            project_info_template += "<p>Name: " + name + "</p>\n";
        }

        var description = this.getConfigParam("description");
        if(description){
            project_info_template += "<p>Description: " + description + "</p>\n";
        }

        var author = this.getConfigParam("author");
        if(author){
            project_info_template += "<p>Author: " + author + "</p>\n";
        }

        home_template = home_template.replace("{{project_info}}", project_info_template);

        home_template = home_template.replace("{{title}}", this.getConfigParam("title"));
        home_template = home_template.replace("{{heading_title}}", this.getConfigParam("title").toUpperCase());

        this.home_template = home_template;
    };

    ServeHome.prototype.getConfigParam = function(param){
        switch (param) {
            case "title":
                var namespace = "config_xml.widget.name";
                var ret = this.getValueFromObj(this,namespace);
                return (ret[0]) ? ret[0] : "";
            break;
            case "bundle_id":
                var namespace = "config_xml.widget.$.id";
                var ret = this.getValueFromObj(this,namespace);
                return this.config_xml.widget.$.id;
            break;
            case "version":
                var namespace = "config_xml.widget.$.version";
                var ret = this.getValueFromObj(this,namespace);
                return ret;
            break;
            case "description":
                var namespace = "config_xml.widget.description";
                var ret = this.getValueFromObj(this,namespace);
                return (ret[0]) ? ret[0] : "";
            break;
            case "author":
                var namespace = "config_xml.widget.author";
                var ret = this.getValueFromObj(this,namespace);
                return (ret[0] && ret[0]["_"]) ? [0]["_"] : "";
            break;
            default:
                return "";
            break;
        }
    };

    ServeHome.prototype.getValueFromObj = function(objReference, namespace){
        var parts = namespace.split(".");
        var len = parts.length;
        for (var i = 0; i < len; ++i) {
            if(!objReference[parts[i]]) return "";
            objReference = objReference[parts[i]];
        }
        return objReference;
    };

    ServeHome.prototype.getTemplate = function(){
        return this.home_template;
    };

    module.exports = ServeHome;
})();