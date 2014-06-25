var shell 	= require('shelljs'),
	path 	= require('path'),
	fs 		= require('fs'),
	util 	= require('../../utils.js');
var fileExists = fs.existsSync;

function CordovaPlugin(cmd, command, argv) {
	util.log("Executing command '" + command + "'");

	var ctx = this;
	this._commands = command;
	this._commands_list = command.split(" ");
	this._cmd = cmd;
	this._argv = argv;
	this._config_xml = {};
	this.ludei_plugins = [];
	util.getConfigXML(function(err, data){
		if(err){
			util.log("Cannot locate your config.xml");
			ctx.init();
		}
		ctx._config_xml = data;
		ctx.init();
	});
};

CordovaPlugin.prototype.init = function(){

	if(this._commands_list.length < 2) { 
		this.executePluginCommand();
		return;
	}
	/**
	* TODO: The following code should be compatible with any Ludei plugin.
	*/
	var ludei_plugin = this.isLudeiPlugin();
	if(this._commands_list[1] === "add" && ludei_plugin){
		if( ludei_plugin.plugin_id === this._commands_list[2] ) this.installWebViewPlus(ludei_plugin);
	}else if(this._commands_list[1] === "rm" && ludei_plugin){
		if( ludei_plugin.plugin_id === this._commands_list[2] ) this.removeWebViewPlus(ludei_plugin);
	}else{
		this.executePluginCommand();
	}
};

CordovaPlugin.prototype.isLudeiPlugin = function(){
	var bundle_id = this._commands_list[2];
	var ludei_plugins = this.getLudeiPlugins();
	
	if(!ludei_plugins) return false;
	
	for (var i = 0; i < ludei_plugins.length; i++) {
		if(bundle_id === ludei_plugins[i].plugin_id) return ludei_plugins[i];
	};

	return false;
};

CordovaPlugin.prototype.getLudeiPlugins = function(){
	var plugins_info_path = path.join(__dirname, "../", "../", "ludei_plugins.json");
	if(fs.existsSync(plugins_info_path)) return require(plugins_info_path).plugins;

	return false;
};

CordovaPlugin.prototype.executePluginCommand = function(){
	var result = this._cmd.exec(this._commands);
	if(result.code !== 0){
		util.log("Something went wrong");
		util.log(result.output);
		process.exit(result.code);
	}else{
		util.log(result.output);
		process.exit(result.code);
	}
};

CordovaPlugin.prototype.WebViewPlusReq = function(webview_plus_path){
	var result = null;
	var options = { avoidCordovaCMD : true, silent : true };
	var command = null;

	command = (util.inWindows) ? "where android" : "which android";
	result 	= this._cmd.exec(command, options);
	if(result.code !== 0){
		util.log("The command `android` failed. Add the platform-tools/ as well as the tools/ directory to your PATH environment variable.");
		return false;
	}

	command = (util.inWindows) ? "echo %ANDROID_HOME%" : "echo $ANDROID_HOME";
	result 	= this._cmd.exec(command, options);
	if( (result.output.length < 2) ) {
		util.log("Missing environment variable ANDROID_HOME. The ANDROID_HOME variable must exist and should point to your android SDK directory.");
		return false;
	}

	command = (util.inWindows) ? "where javac" : "which javac";
	result 	= this._cmd.exec(command, options);
	if(result.code !== 0){
		util.log("The command `javac` failed. Download the latest JDK at http://www.oracle.com/technetwork/java/javase/downloads/index.html");
		return false;
	}

	return true;
};

CordovaPlugin.prototype.removeWebViewPlus = function(plugin){

	var plugin_id = plugin.plugin_id;
	var plugin_path = path.join(process.cwd(), "plugins", plugin_id, "android");
	var project_hooks_path = this.getHooksPath();
	var hook_path = path.join(project_hooks_path, "after_plugin_rm", plugin_id + ".js");
	var hook_installation_path = path.join(project_hooks_path, "after_plugin_add", plugin_id + ".js");
	var platforms = this.getPlatforms();
	var isAndroidAvailable = platforms.filter(function(obj){ return obj.name === "android" });

	if( (isAndroidAvailable.length > 0) || (!this.WebViewPlusReq(plugin_path)) ){
		util.log("The platform Android is not available in your project.");
		process.exit(1);
	}

	if(!fs.existsSync(hook_path)){
		util.log("Can't find uninstall hook.");
		process.exit(1);
	}

	var exec_result = this.executeHook(plugin_path, hook_path);
	if( exec_result.code !== 0){
		util.log("Error executing Webview+ hook", hook_path);
		util.log("Cannot uninstall manually the WebView+");
		console.log(exec_result.output);
		return false;
	};

	var plugin_result = this._cmd.exec("plugin rm " + plugin_id);
	if(plugin_result.code !== 0){
		util.log("Cannot uninstall the Webview+");
		util.log(plugin_result.output);
		process.exit(plugin_result.code);
	};

	try{
		fs.unlinkSync(hook_path);
		fs.unlinkSync(hook_installation_path);
	}catch(e){
		util.log("Cannot delete Webview+ hooks, please remove them manually:");
		util.log(hook_path, hook_installation_path);
		console.log(e);
	}

	util.log("Webview+ uninstalled correctly");
	process.exit(exec_result.code);
};

CordovaPlugin.prototype.installWebViewPlus = function(plugin){

	util.log("Installing Webview+ in your Cordova Project.");

	var plugin_id = plugin.plugin_id;
	var platforms = this.getPlatforms();
	var plugin_path = path.join(process.cwd(), "plugins", plugin_id, "android");
	var isAndroidAvailable = platforms.filter(function(obj){ return obj.name === "android" });

	if( (isAndroidAvailable.length > 0)){
		util.log("The platform Android is not available in your project. Please execute 'cocoonjs platform add android' before installing the Webview+");
		process.exit(1);
	}

	if( !this.WebViewPlusReq(plugin_path) ){
		util.log("Invalid configuration needed to install the Weview+");
		process.exit(1);
	}

	if(this._argv['plugins-path']){
		plugin.bundle_id = path.join(this._argv['plugins-path'] , plugin.plugin_id);
	}

	var plugin_result 	= this._cmd.exec("plugin add " + plugin.bundle_id);
	if(plugin_result.code !== 0) {
		util.log("Cannot install the WebView+ in your project");
		console.log(plugin_result.output);
		process.exit(plugin_result.code);
	}

	var hooks_path 		= path.join(plugin_path, 'hooks');
	var build_xml_path 	= path.join(plugin_path, "build.xml");
	
	if(!fileExists(build_xml_path)) {
		util.log("Can't find a build.xml needed to build the WebView+ project");
		process.exit(1);
	}

	var installed_hooks = this.installHooks(hooks_path);
	if( !installed_hooks ){
		util.log("Cannot install needed hook in your project");
		process.exit(1);
	}

	util.log("Executing 'ant release -buildfile " + build_xml_path + "'");
	var release_result 	= this._cmd.exec("ant release -buildfile " + build_xml_path, { avoidCordovaCMD : true });

	if(release_result.code !== 0) {
		util.log("Cannot build Webview+ project");
		this._cmd.exec("plugin rm " + plugin_id);
		process.exit(release_result.code);
	}

	var hook_path = "";
	for (var i = 0; i < installed_hooks.length; i++) {
		var hook_info = installed_hooks[i];
		if(hook_info.folder === "after_plugin_add"){
			hook_path = hook_info.full_path;
		}
	};

	if(!hook_path){
		util.log("Cannot find a valid Webview+ hook to be executed.");
		process.exit(1);
	}

	var installation_result = this.executeHook(plugin_path, hook_path);
	if( installation_result.code !== 0){
		util.log("Error executing Webview+ hook", hook_path);
		util.log("here's the error info we have");
		this._cmd.exec("plugin rm " + plugin_id);
		console.log(installation_result.output);
		return false;
	};

	util.log("The Webview+ has been installed correctly in your Cordova project :)");
	process.exit(0);
};

CordovaPlugin.prototype.installHooks = function(hooks_path){
	if(!fileExists(hooks_path)) return false;

	var files = fs.readdirSync(hooks_path);
	var project_hooks_path = this.getHooksPath();
	var installed_hooks = [];
	
	if(!project_hooks_path) return false;

	for (var i = 0; i < files.length; i++) {
		var file 		= files[i];
		var full_path 	= path.join(hooks_path , file);
		var stats 		= fs.statSync(full_path);
		if( stats.isDirectory() ){
			var hook_name = file;
			var hook_list = fs.readdirSync(full_path);
			for (var x = 0; x < hook_list.length; x++) {
				var js_file = hook_list[x];
				if(path.extname(js_file) === ".js"){
					var installation_path = path.join(project_hooks_path, hook_name);
					if( !fileExists(installation_path) ){
						shell.mkdir('-p', installation_path);
					}
					var hook_dest = path.join(installation_path, js_file);
					installed_hooks.push({ folder : hook_name, file_name : js_file, full_path : hook_dest });
					fs.renameSync( path.join(full_path, js_file) ,  hook_dest);
					shell.chmod("+x", hook_dest);
				}
			};
		}
	}

	return installed_hooks;
};

CordovaPlugin.prototype.getPlatforms = function(){
	var platforms_path = path.join(process.cwd(), "platforms");
	return fs.readdirSync(platforms_path);
};

CordovaPlugin.prototype.getHooksPath = function(){
	var project_path = process.cwd();

	var possible_path = path.join(project_path,".cordova");
	if( fileExists( possible_path ) ) return possible_path;

	possible_path = path.join(project_path,"hooks");
	if( fileExists( possible_path ) ) return possible_path;

	return;
};

CordovaPlugin.prototype.executeHook = function(plugin_path, hook_path){

	var CORDOVA_CMD_PATH  		= this._cmd.getCmdBinaryPath();
	var CORDOVA_VERSION 		= util.getCordovaVersion(this._cmd);
	var CORDOVA_PROJECT_NAME 	= this._config_xml.widget.name.toString();
	var CORDOVA_PLUGIN_PATH 	= plugin_path;

	var env_vars = "";
	if(util.inWindows){
		env_vars += ("set CORDOVA_PATH_BINARY='" + new Buffer(CORDOVA_CMD_PATH).toString('base64') +"' & ");
		env_vars += ("set CORDOVA_VERSION='" + new Buffer(CORDOVA_VERSION).toString('base64') +"' & ");
		env_vars += ("set CORDOVA_PROJECT_NAME='" + new Buffer(CORDOVA_PROJECT_NAME).toString('base64') +"' & ");
		env_vars += ("set CORDOVA_PLUGIN_PATH='" + new Buffer(CORDOVA_PLUGIN_PATH).toString('base64') +"' & ");
	}else{
		env_vars += ("export CORDOVA_PATH_BINARY='" + new Buffer(CORDOVA_CMD_PATH).toString('base64') +"' && ");
		env_vars += ("export CORDOVA_VERSION='" + new Buffer(CORDOVA_VERSION).toString('base64') +"' && ");
		env_vars += ("export CORDOVA_PROJECT_NAME='" + new Buffer(CORDOVA_PROJECT_NAME).toString('base64') +"' && ");
		env_vars += ("export CORDOVA_PLUGIN_PATH='" + new Buffer(CORDOVA_PLUGIN_PATH).toString('base64') +"' && ");
	}

	var results = this._cmd.exec("node " + hook_path, { env: env_vars, avoidCordovaCMD : true });
	if(results.code !== 0){
		return results;
	}

	return results;
};

module.exports = CordovaPlugin;