/**
 * @fileOverview
 * Ludei's plugins are multiplatform Javascript APIs, that work in any of the three environments 
 * of CocoonJS: accelerated Canvas+, webview+ and system webview.
 * - Select the specific plugin below to open the relevant documentation section.
 <ul>
    <li><a href="Cocoon.html">Cocoon</a></li>
    <li><a href="Cocoon.Ad.html">Ad</a></li>
    <li><a href="Cocoon.App.html">App</a></li>
    <li><a href="Cocoon.Camera.html">Camera</a></li>
    <li><a href="Cocoon.Device.html">Device</a></li>
    <li><a href="Cocoon.Dialog.html">Dialog</a></li>
    <li><a href="Cocoon.Motion.html">Motion</a></li>
    <li><a href="Cocoon.Multiplayer.html">Multiplayer</a></li>
    <li><a href="Cocoon.Notification.html">Notification</a></li>
    <li><a href="Cocoon.Proxify.html">Proxify</a></li>
    <li><a href="Cocoon.Social.html">Social</a></li>
    <li><a href="Cocoon.Store.html">Store</a></li>
    <li><a href="Cocoon.Touch.html">Touch</a></li>
    <li><a href="Cocoon.Utils.html">Utils</a></li>
    <li><a href="Cocoon.WebView.html">WebView</a></li>
    <li><a href="Cocoon.Widget.html">Widget</a></li>
</ul>
 <br/>The CocoonJS Plugin's library (cocoon.js and cocoon.min.js) can be found at Github. <br/>
 <a href="https://github.com/ludei/CocoonJS-Plugins"><img src="img/download.png" style="width:230px;height:51px;" /></a>
 <br/><br/>In addition to all the previously mentioned, in the following link you'll find an <a href="http://support.ludei.com/hc/en-us/articles/201821276-Extensions-overview">overview of all the avaliable features</a> in which each plugin support and availability are detailed.
 <br/><br/>
 * We hope you find everything you need to get going here, but if you stumble on any problems with the docs or the plugins, 
 * just drop us a line at our forum (support.ludei.com) and we'll do our best to help you out.
 * <h3>Tools</h3>
 <a href="http://support.ludei.com/hc/communities/public/topics"><img src="img/cocoon-tools-1.png" /></a>
 <a href="http://support.ludei.com/hc"><img src="img/cocoon-tools-2.png" /></a>
 <a href="https://cloud.ludei.com/"><img src="img/cocoon-tools-3.png" /></a>
 <a href="https://www.ludei.com/cocoonjs/how-to-use/"><img src="img/cocoon-tools-4.png" /></a>
 * @version 3.0.4
 */
(function () {
    
    /**
    * The "Cocoon" object holds all the CocoonJS Extensions and other stuff needed for the CocoonJS environment.
    * @namespace Cocoon
    */
    Cocoon = window.Cocoon ? window.Cocoon : {};
    
    /**
     * @property {string} version Current version of the CocoonJS Extensions.
     * @memberOf Cocoon
     * @example
     * console.log(Cocoon.version);
     */
    Cocoon.version = "3.0.4";
    
    /**
     * Is the native environment available? true if so.
     * @property {bool} version
     * @memberof Cocoon
     * @private
     * @example
     * if(Cocoon.nativeAvailable) { ... do native stuff here ... }
     */

    Cocoon.nativeAvailable = (!!window.ext);

    /**
    * This utility function allows to create an object oriented like hierarchy between two functions using their prototypes.
    * This function adds a "superclass" and a "__super" attributes to the subclass and it's functions to reference the super class.
    * @memberof Cocoon
    * @private
    * @static
    * @param {function} subc The subclass function.
    * @param {function} superc The superclass function.
    */
    Cocoon.extend = function(subc, superc) {
        var subcp = subc.prototype;

        var CocoonJSExtendHierarchyChainClass = function() {};
        CocoonJSExtendHierarchyChainClass.prototype = superc.prototype;

        subc.prototype = new CocoonJSExtendHierarchyChainClass();
        subc.superclass = superc.prototype;
        subc.prototype.constructor = subc;

        if (superc.prototype.constructor === Object.prototype.constructor) {
            superc.prototype.constructor = superc;
        }

        for (var method in subcp) {
            if (subcp.hasOwnProperty(method)) {
                subc.prototype[method] = subcp[method];
            }
        }
    }

    /**
    * This utility function copies the properties from one object to a new object array, the result object array can be used as arguments when calling Cocoon.callNative()
    * @memberof Cocoon
    * @static
    * @private
    * @param {function} obj The base object that contains all properties defined.
    * @param {function} copy The object that user has defined.
    */
    Cocoon.clone = function(obj,copy){
        if (null == obj || "object" != typeof obj) return obj;
        var arr = [];
        for (var attr in obj) {
            if ( copy.hasOwnProperty(attr) ) { 
                arr.push(copy[attr]);
            }else{
                arr.push(obj[attr]);
            }
        }
        return arr;
    }

    /**
    * IMPORTANT: This function should only be used by Ludei.
    * This function allows a call to the native extension object function reusing the same arguments object.
    * Why is interesting to use this function instead of calling the native object's function directly?
    * As the Cocoon object functions expicitly receive parameters, if they are not present and the native call is direcly mapped,
    * undefined arguments are passed to the native side. Some native functions do not check the parameters validation
    * correctly (just check the number of parameters passed).
    * Another solution instead of using this function call is to correctly check if the parameters are valid (not undefined) to make the
    * call, but it takes more work than using this approach.
    * @static
    * @private
    * @param {string} nativeExtensionObjectName The name of the native extension object name. The object that is a member of the 'ext' object.
    * @param {string} nativeFunctionName The name of the function to be called inside the native extension object.
    * @param {object} arguments The arguments object of the Cocoon extension object function. It contains all the arguments passed to the Cocoon extension object function and these are the ones that will be passed to the native call too.
    * @param {boolean} [async] A flag to indicate if the makeCall (false or undefined) or the makeCallAsync function should be used to perform the native call.
    * @returns Whatever the native function call returns.
    */
    Cocoon.callNative = function(nativeExtensionObjectName, nativeFunctionName, args, async) {
        if (Cocoon.nativeAvailable) {
            var argumentsArray = Array.prototype.slice.call(args);
            argumentsArray.unshift(nativeFunctionName);
            var nativeExtensionObject = ext[nativeExtensionObjectName];
            var makeCallFunction = async ? nativeExtensionObject.makeCallAsync : nativeExtensionObject.makeCall;
            var ret = makeCallFunction.apply(nativeExtensionObject, argumentsArray);
            var finalRet = ret;
            if (typeof ret === "string") {
                try {
                    finalRet = JSON.parse(ret);
                }
                catch(error) {
                    console.log(error);
                }
            }
            return finalRet;
        }
    };

    /**
    * Returns an object retrieved from a path specified by a dot specified text path starting from a given base object.
    * It could be useful to find the reference of an object from a defined base object. For example the base object could be window and the
    * path could be "Cocoon.App" or "document.body".
    * @static
    * @param {Object} baseObject The object to start from to find the object using the given text path.
    * @param {string} objectPath The path in the form of a text using the dot notation. i.e. "document.body"
    * @private
    * @memberof Cocoon
    * For example:
    * var body = Cocoon.getObjectFromPath(window, "document.body");
    */
    Cocoon.getObjectFromPath = function(baseObject, objectPath) {
        var parts = objectPath.split('.');
        var obj = baseObject;
        for (var i = 0, len = parts.length; i < len; ++i) 
        {
            obj[parts[i]] = obj[parts[i]] || undefined;
            obj = obj[parts[i]];
        }
        return obj;
    };

    /**
    * A class that represents objects to handle events. Event handlers have always the same structure:
    * Mainly they provide the addEventListener and removeEventListener functions.
    * Both functions receive a callback function that will be added or removed. All the added callback
    * functions will be called when the event takes place.
    * Additionally they also allow the addEventListenerOnce and notifyEventListeners functions.
    * @constructor
    * @param {string} nativeExtensionObjectName The name of the native extension object (inside the ext object) to be used.
    * @param {string} CocoonExtensionObjectName The name of the sugarized extension object.
    * @param {string} nativeEventName The name of the native event inside the ext object.
    * @param {number} [chainFunction] An optional function used to preprocess the listener callbacks. This function, if provided,
    * will be called before any of the other listeners.
    * @memberof Cocoon
    * @private
    * @static
    */
    Cocoon.EventHandler = function(nativeExtensionObjectName, CocoonExtensionObjectName, nativeEventName, chainFunction) {
        this.listeners = [];
        this.listenersOnce = [];
        this.chainFunction = chainFunction;

        /**
        * Adds a callback function so it can be called when the event takes place.
        * @param {function} listener The callback function to be added to the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */
        this.addEventListener = function(listener) {
            if (chainFunction) {
                var f = function() {
                    chainFunction.call(this, arguments.callee.sourceListener, Array.prototype.slice.call(arguments)); 
                };
                listener.CocoonEventHandlerChainFunction = f;
                f.sourceListener = listener;
                listener = f;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject && CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].addEventListener(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0) {
                    this.listeners.push(listener);
                }
            }
        };
        /**
        * Adds a callback function that will be called only one time.
        * @param {function} listener The callback function to be added to the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */

        this.addEventListenerOnce = function(listener)
        {
            if (chainFunction) {
                var f = function() { chainFunction(arguments.callee.sourceListener,Array.prototype.slice.call(arguments)); };
                f.sourceListener = listener;
                listener = f;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].addEventListenerOnce(nativeEventName, listener);
            }
            else
            {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0)
                {
                    this.listenersOnce.push(listener);
                }
            }
        };

        /**
        * Removes a callback function that was added to the event handler so it won't be called when the event takes place.
        * @param {function} listener The callback function to be removed from the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */
        this.removeEventListener = function (listener) {

            if (chainFunction) {
                listener = listener.CocoonEventHandlerChainFunction;
                delete listener.CocoonEventHandlerChainFunction;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].removeEventListener(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listeners.splice(indexOfListener, 1);
                }
            }
        };

        this.removeEventListenerOnce = function (listener) {

            if (chainFunction) {
                listener = listener.CocoonEventHandlerChainFunction;
                delete listener.CocoonEventHandlerChainFunction;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].removeEventListenerOnce(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listenersOnce.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listenersOnce.splice(indexOfListener, 1);
                }
            }
        };

        /**
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */

        this.notifyEventListeners = function() {
            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject && CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].notifyEventListeners(nativeEventName);
            } else {

                var argumentsArray= Array.prototype.slice.call(arguments);
                var listeners =     Array.prototype.slice.call(this.listeners);
                var listenersOnce = Array.prototype.slice.call(this.listenersOnce);
                var _this = this;
                // Notify listeners after a while ;) === do not block this thread.
                setTimeout(function() {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(_this, argumentsArray);
                    }
                    for (var i = 0; i < listenersOnce.length; i++) {
                        listenersOnce[i].apply(_this, argumentsArray);
                    }
                }, 0);

                _this.listenersOnce= [];
            }
        };
        return this;
    };
    
    /**
    * This function is used to create extensions in the global namespace of the "Cocoon" object.
    * @memberof Cocoon
    * @private
    * @static
    * @param {string} namespace The extensions namespace, ex: Cocoon.App.Settings.
    * @param {object} callback The callback which holds the declaration of the new extension.
    * @example
    * Cocoon.define("Cocoon.namespace" , function(extension){
    * "use strict";
    *
    * return extension;
    * });
    */
    Cocoon.define = function(extName, ext){
        
        var namespace = (extName.substring(0,7) == "Cocoon.") ? extName.substr(7) : extName;

        var base    = window.Cocoon;
        var parts  = namespace.split(".");
        var object = base;
    
        for(var i = 0; i < parts.length; i++) {
            var part = parts[i];
            (!object[part]) ? console.log("Created namespace: " + extName) : console.log("Updated namespace: - " + extName);
            object = object[part] = (i == (parts.length - 1)) ? ext( (object[part] || {}) ) : {};
            if(!object) {
                throw "Unable to create class " + extName;
            }
        }
                
        return true;
    }

    console.log("Created namespace: Cocoon");

})();

Cocoon.define("Cocoon.Signal" , function(extension){
    "use strict";

    /**
    * This namespace is used to create an Event Emitter/Dispatcher that works together.
    * with the Cocoon.EventHandler.
    * @namespace Cocoon.Signal
    * @private
    */

    /**
    * This constructor creates a new Signal that holds and emits different events that are specified inside each extension.
    * @memberof Cocoon.Signal
    * @private
    * @constructs createSignal
    */
    extension.createSignal = function(){
        /** @lends Cocoon.Signal.prototype */
        this.handle = null;
        this.signals = {};
        
        /**
        * Registers a new Signal.
        * @param {string} namespace The name of the signal which will be emitted.
        * @param {object} handle The Cocoon.EventHandler that will handle the signals.
        * @function register
        * @private
        * @example
        * signal.register("banner.ready", new Cocoon.EventHandler);
        */
        this.register = function(namespace, handle){

            if( (!namespace) && (!handle)) throw new Error("Can't create signal " + (namespace || ""));

            if(handle.addEventListener){
                this.signals[namespace] = handle;
                return true;
            }

            if(!handle.addEventListener){
                this.signals[namespace] = {};
                for (var prop in handle) {
                    if(handle.hasOwnProperty(prop)){
                        this.signals[namespace][prop] = handle[prop];
                    }
                };
                return true;
            }
            
            throw new Error("Can't create handler for " + namespace + " signal.");
            return false;
        },

        /**
        * Exposes the already defined signals, and can be use to atach a callback to a Cocoon.EventHandler event.
        * @param {string} signal The name of the signal which will be emitted.
        * @param {object} callback The Cocoon.EventHandler that will handle the signals.
        * @param {object} params Optional parameters, example { once : true }
        * @function expose
        * @private
        * @example
        * Cocoon.namespace.on("event",function(){});
        */
        this.expose = function(){
            return function(signal, callback, params){
                var once = false;

                if(arguments.length === 1){
                    var that = this;
                    var fnc = function(signal){
                        this.signal = signal;
                    }
                    
                    fnc.prototype.remove = function(functionListener){
                        var handle = that.signals[this.signal];
                        if(handle && handle.removeEventListener) {
                            handle.removeEventListener.apply(that,[functionListener]);
                            that.signals[this.signal] = undefined;
                        }
                    }
                    return new fnc(signal);
                }

                if((params) && (params.once)){
                    once = true;
                }

                if(!this.signals[signal]) throw new Error("The signal " + signal + " does not exists.");
                var handle = this.signals[signal];
                if(handle.addEventListener){
                    if(once){
                        handle.addEventListenerOnce(function(){
                            callback.apply( this || window , arguments);
                        });
                    }else{
                        handle.addEventListener(function(){
                            callback.apply( this || window , arguments);
                        });
                    }
                }

                if(!this.signals[signal].addEventListener){
                    for (var prop in this.signals[signal]) {
                        
                        if(!this.signals[signal].hasOwnProperty(prop)) continue;
                        
                        var handle = this.signals[signal][prop];

                        if(once){
                            handle.addEventListenerOnce(function(){
                                this.clbk[this.name].apply( this || window , arguments);
                            }.bind({ name : prop , clbk : callback }));
                        }else{
                            handle.addEventListener(function(){
                                this.clbk[this.name].apply( this || window , arguments);
                            }.bind({ name : prop , clbk : callback }));
                        }
                        
                    }
                }

            }.bind(this);
        }
    }

    return extension;

});

/**
 * This namespace represents different methods to control your application.
 *
 * <div class="alert alert-success">
 * <p>Here you will find demos about this namespace: </p> 
 * <ul> <li> <a href="https://github.com/ludei/cocoonjs-demos/tree/master/Rate">Rate demo</a>.</li>
 * <li> <a href="https://github.com/ludei/cocoonjs-demos/tree/Sound">Sound demo</a>.</li>
 * <li> <a href="https://github.com/ludei/cocoonjs-demos/tree/Vibration">Vibration demo</a>.</li>
 * <li> <a href="https://github.com/ludei/cocoonjs-demos/tree/master/Basic%20examples">Basic examples demo</a>.</li></ul>
 * </div>
 *
 * @namespace Cocoon.App
 * @example
 * // Example 1: Closes the application
 * Cocoon.App.exit();
 * // Example 2: Opens a given URL
 * Cocoon.App.openURL("http://www.ludei.com");
 * // Example 3: Fired when the application is suspended
 * Cocoon.App.on("suspended", function(){
 *  ...
 * });
 */
Cocoon.define("Cocoon.App" , function(extension){
    
    extension.nativeAvailable = (!!window.ext) && (!!window.ext.IDTK_APP);

    extension.isBridgeAvailable = function(){
        if (Cocoon.App.forward.nativeAvailable === 'boolean') {
            return Cocoon.App.forward.nativeAvailable;
        }
        else {
            var available = Cocoon.callNative("IDTK_APP", "forwardAvailable", arguments);
            available = !!available;
            Cocoon.App.forward.nativeAvailable = available;
            return available;
        }
    };

    /**
     * Makes a forward call of some javascript code to be executed in a different environment (i.e. from CocoonJS to the WebView and viceversa).
     * It waits until the code is executed and the result of it is returned === synchronous.
     * @function forward
     * @memberof Cocoon.App
     * @param {string} code Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from CocoonJS to the WebView and viceversa).
     * @return {string} The result of the execution of the passed JavaScript code in the different JavaScript environment.
     * @example
     * Cocoon.App.forward("alert('Ludei!');");
     */
    extension.forward = function (javaScriptCode) {
        if (Cocoon.App.nativeAvailable && Cocoon.App.isBridgeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "forward", arguments);
        }
        else if (!navigator.isCocoonJS) {
            if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
                return window.parent.eval(javaScriptCode);
            }
            else {
                return window.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode);
            }
        }
    };

    /**
     * Makes a forward call of some javascript code to be executed in a different environment (i.e. from CocoonJS to the WebView and viceversa).
     * It is asyncrhonous so it does not wait until the code is executed and the result of it is returned. Instead, it calls a callback function when the execution has finished to pass the result.
     * @function forwardAsync
     * @memberof Cocoon.App
     * @param {string} javaScriptCode Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from CocoonJS to the WebView and viceversa).
     * @param {function} [callback] A function callback (optional) that will be called when the passed JavaScript code is executed in a different thread to pass the result of the execution in the different JavaScript environment.
     * @example
     * Cocoon.App.forwardAsync("alert('Ludei!');", function(){
     * ...
     * });
     */
    extension.forwardAsync = function (javaScriptCode, returnCallback) {
        if (Cocoon.App.nativeAvailable && Cocoon.App.isBridgeAvailable()) {
            if (typeof returnCallback !== 'undefined') {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode, returnCallback);
            }
            else {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode);
            }
        }
        else {
            setTimeout(function() {
                var res;
                window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame' ? 
                    (res = window.parent.eval(javaScriptCode), (typeof returnCallback === 'function') && returnCallback(res) ) :
                    (
                        res = window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.eval(javaScriptCode), 
                        (typeof returnCallback === 'function') && returnCallback(res)
                    );
            }, 1);
        }
    };

    /**
     * Allows to load a new JavaScript/HTML5 resource that can be loaded either locally (inside the platform/device storage) or using a remote URL.
     * @function load
     * @memberof Cocoon.App
     * @param {string} path A path to a resource stored in the platform or in a URL to a remote resource.
     * @param {Cocoon.App.StorageType} [storageType] If the path argument represents a locally stored resource, the developer can specify the storage where it is stored. If no value is passes, the {@link Cocoon.App.StorageType.APP_STORAGE} value is used by default.
     * @example
     * Cocoon.App.load("index.html");
     */
    extension.load = function (path, storageType) {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "loadPath", arguments);
        }
        else if (!navigator.isCocoonJS) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var jsCode;
                        // If there is no webview, it means we are in the webview, so notify the CocoonJS environment
                        if (!Cocoon.App.EmulatedWebViewIFrame) {
                            jsCode = "window.Cocoon && window.Cocoon.App.onLoadInTheWebViewSucceed.notifyEventListeners('" + path + "');";
                        }
                        // If there is a webview, it means we are in CocoonJS, so notify the webview environment
                        else {
                            jsCode = "window.Cocoon && window.Cocoon.App.onLoadInCocoonJSSucceed.notifyEventListeners('" + path + "');";
                        }
                        Cocoon.App.forwardAsync(jsCode);
                        window.location.href = path;
                    }
                    else if (xhr.status === 404) {
                        this.onreadystatechange = null;
                        var jsCode;
                        // If there is no webview, it means we are in the webview, so notify the CocoonJS environment
                        if (!Cocoon.App.EmulatedWebViewIFrame) {
                            jsCode = "Cocoon && Cocoon.App.onLoadInTheWebViewFailed.notifyEventListeners('" + path + "');";
                        }
                        // If there is a webview, it means we are in CocoonJS, so notify the webview environment
                        else {
                            jsCode = "Cocoon && Cocoon.App.onLoadInCocoonJSFailed.notifyEventListeners('" + path + "');";
                        }
                        Cocoon.App.forwardAsync(jsCode);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };

    /**
     * Reloads the last loaded path in the current context.
     * @function reload
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.reload();
     */
    extension.reload = function () {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "reload", arguments);
        }
        else if (!navigator.isCocoonJS) {
            if (window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
                return window.parent.location.reload();
            }
            else {
                return window.parent.frames['CocoonJS_App_ForCocoonJS_WebViewIFrame'].window.location.reload();
            }
        }
    };

    /**
     * Opens a given URL using a system service that is able to open it. For example, open a HTTP URL using the system WebBrowser.
     * @function openURL
     * @memberof Cocoon.App
     * @param {string} url The URL to be opened by a system service.
     * @example
     * Cocoon.App.openURL("http://www.ludei.com");
     */
    extension.openURL = function (url) {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "openURL", arguments, true);
        }
        else if (!navigator.isCocoonJS) {
            window.open(url, '_blank');
        }
    }

    /**
     * Forces the app to finish.
     * @function exit
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.exit();
     */
    extension.exit = function () {
        if (Cocoon.App.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "forceToFinish", arguments);
        }
        else if (!navigator.isCocoonJS) {
            window.close();
        }
    }

    /**
     * 
     * @memberof Cocoon.App
     * @name Cocoon.App.StorageType
     * @property {string} Cocoon.App.StorageType - The base object
     * @property {string} Cocoon.App.StorageType.APP_STORAGE The application storage.
     * @property {string} Cocoon.App.StorageType.INTERNAL_STORAGE Internal Storage
     * @property {string} Cocoon.App.StorageType.EXTERNAL_STORAGE External Storage
     * @property {string} Cocoon.App.StorageType.TEMPORARY_STORAGE Temporary Storage
     */
    extension.StorageType = {
        APP_STORAGE:        "APP_STORAGE",
        INTERNAL_STORAGE:   "INTERNAL_STORAGE",
        EXTERNAL_STORAGE:   "EXTERNAL_STORAGE",
        TEMPORARY_STORAGE:  "TEMPORARY_STORAGE"
    };

    extension.onSuspended = new Cocoon.EventHandler("IDTK_APP", "App", "onsuspended");

    extension.onActivated = new Cocoon.EventHandler("IDTK_APP", "App", "onactivated");

    extension.onSuspending = new Cocoon.EventHandler("IDTK_APP", "App", "onsuspending");

    extension.onMemoryWarning = new Cocoon.EventHandler("IDTK_APP", "App", "onmemorywarning");

    var signal = new Cocoon.Signal.createSignal();

    /**
     * Allows to listen to events called when the application is suspended.
     * The callback function does not receive any parameter.
     * @event On application suspended
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("suspended", function(){
     *  ...
     * });
     */
    signal.register("suspended", extension.onSuspended);
    /**
     * Allows to listen to events called when the application is activated.
     * The callback function does not receive any parameter.
     * @event On application activated
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("activated", function(){
     *  ...
     * });
     */
    signal.register("activated", extension.onActivated);

    /**
     * Allows to listen to events called when the application is suspending.
     * The callback function does not receive any parameter.
     * @event On application suspending
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("suspending", function(){
     *  ...
     * });
     */
    signal.register("suspending", extension.onSuspending);

    /**
     * Allows to listen to memory warning notifications from the system
     * It is strongly recommended that you implement this method and free up as much memory as possible by disposing of cached data objects, images on canvases that can be recreated.
     * @event On memory warning
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("memorywarning", function(){
     *  ...
     * });
     */
     signal.register("memorywarning", extension.onMemoryWarning);


    extension.on = signal.expose();
    
    return extension;
});