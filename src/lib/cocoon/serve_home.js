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
            description = description.replace(/(\r\n|\n|\r)/gm,"");
            description = description.replace(/^\s+|\s+$/g, '');
            project_info_template += "<p>Description: " + description + "</p>\n";
        }

        var author = this.getConfigParam("author");
        if(author){
            project_info_template += "<p>Author: " + author + "</p>\n";
        }

        /**
        * Canvas information
        */
       
        var project_canvas_info_template = "var mY = 160;";

        if(bundle_id){
            var template = [
            'layer.add(new Kinetic.Text({\n',
            'text: "Bundle id: ' + bundle_id + '",\n',
            'fontFamily: "Verdana",\n',
            'fontSize: 16,\n',
            'y: mY,\n',
            'fill: "black",\n',
            '}));\n',
            'mY = mY + 30;']
            project_canvas_info_template += template.join('');
        }

        if(version){
            var template = [
            'layer.add(new Kinetic.Text({\n',
            'text: "Version: ' + version + '",\n',
            'fontFamily: "Verdana",\n',
            'fontSize: 16,\n',
            'y: mY,\n',
            'fill: "black",\n',
            '}));\n',
            'mY = mY + 30;']
            project_canvas_info_template += template.join('');
        }

        if(name){
            var template = [
            'layer.add(new Kinetic.Text({\n',
            'text: "Name: ' + name + '",\n',
            'fontFamily: "Verdana",\n',
            'fontSize: 16,\n',
            'y: mY,\n',
            'fill: "black",\n',
            '}));\n',
            'mY = mY + 30;']
            project_canvas_info_template += template.join('');
        }

        if(author){
            var template = [
            'layer.add(new Kinetic.Text({\n',
            'text: "Author: ' + author + '",\n',
            'fontFamily: "Verdana",\n',
            'fontSize: 16,\n',
            'y: mY,\n',
            'fill: "black",\n',
            '}));\n',
            'mY = mY + 30;']
            project_canvas_info_template += template.join('');
        }

        var platforms_canvas_template = "";
        for (var i = 0; i < platforms.length; i++) {
            
            var circle = [
            'layer.add(new Kinetic.Circle({\n',
            'x: 10,\n',
            'y: mY + 10,\n',
            'radius: 2,\n',
            'fill: "black",\n',
            'stroke: "black",\n',
            'strokeWidth: 1,\n',
            '}));']

            var template = [
            'var pText = new Kinetic.Text({\n',
            'text: "' + platforms[i] + '",\n',
            'fontFamily: "Verdana",\n',
            'fontSize: 16,\n',
            'x: 20,\n',
            'y: mY,\n',
            'fill: "black",\n',
            '});\n',
            'pText.on("click", function () {\n',
            'Cocoon.App.load(window.location.href + "' + platforms[i] +'");\n',
            '});\n',   
            'layer.add(pText);\n',
            'mY = mY + 30;']

            platforms_canvas_template += circle.join('');
            platforms_canvas_template += template.join('');
        };

        home_template = home_template.replace("{{canvas_platforms}}", platforms_canvas_template);

        home_template = home_template.replace("{{project_info}}", project_info_template);

        home_template = home_template.replace("{{canvas_project_info}}", project_canvas_info_template);

        home_template = home_template.replace("{{title}}", this.getConfigParam("title"));
        home_template = home_template.replace("{{heading_title}}", this.getConfigParam("title").toUpperCase());

        home_template = home_template.replace("{{canvas_heading_title}}", this.getConfigParam("title").toUpperCase());

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