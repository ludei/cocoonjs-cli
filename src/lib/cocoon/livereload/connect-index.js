// Generated by CoffeeScript 1.7.1
var ConnectApp, connect, es, fs, http, https, liveReload, lr, opt, path, server, tiny_lr, util;

path = require("path");

es = require("./map-index.js");

http = require("http");

https = require("https");

fs = require("fs");

connect = require(path.resolve(__dirname,"../../../../","node_modules","gulp-connect","node_modules","connect","index.js"));

liveReload = require("./connect-livereload.js");

tiny_lr = require("tiny-lr");

opt = {};

server = void 0;

lr = void 0;

ConnectApp = (function() {
  function ConnectApp(options) {
    opt = options;
    opt.port = opt.port || "8080";
    opt.root = opt.root || path.dirname(module.parent.id);
    opt.host = opt.host || "localhost";
    if (opt.open) {
      this.oldMethod("open");
    }
    this.server();
  }

  ConnectApp.prototype.server = function() {
    var app;
    app = connect();
    this.middleware().forEach(function(middleware) {
      return app.use(middleware);
    });
    if (opt.https != null) {
      server = https.createServer({
        key: opt.https.key || fs.readFileSync(__dirname + '/certs/server.key'),
        cert: opt.https.cert || fs.readFileSync(__dirname + '/certs/server.crt'),
        ca: opt.https.ca || fs.readFileSync(__dirname + '/certs/ca.crt'),
        passphrase: opt.https.passphrase || 'gulp'
      }, app);
    } else {
      server = http.createServer(app);
    }
    app.use(connect.directory(typeof opt.root === "object" ? opt.root[0] : opt.root));
    server.listen(opt.port);
    this.log("Server started http://" + opt.host + ":" + opt.port);
    if (opt.livereload) {
      tiny_lr.Server.prototype.error = function() {};
      if (opt.https != null) {
        lr = tiny_lr({
          key: opt.https.key || fs.readFileSync(__dirname + '/certs/server.key'),
          cert: opt.https.cert || fs.readFileSync(__dirname + '/certs/server.crt')
        });
      } else {
        lr = tiny_lr();
      }
      lr.listen(opt.livereload.port);
      return this.log("LiveReload started on port " + opt.livereload.port);
    }
  };

  ConnectApp.prototype.middleware = function() {
    var middleware;
    middleware = opt.middleware ? opt.middleware.call(this, connect, opt) : [];
    if (opt.livereload) {
      if (typeof opt.livereload === "boolean") {
        opt.livereload = {};
      }
      if (!opt.livereload.port) {
        opt.livereload.port = 35729;
      }
      middleware.push(liveReload({
        port: opt.livereload.port
      }));
    }
    if (typeof opt.root === "object") {
      opt.root.forEach(function(path) {
        return middleware.push(connect["static"](path));
      });
    } else {
      middleware.push(connect["static"](opt.root));
    }
    if (opt.fallback) {
      middleware.push(function(req, res) {
        return require('fs').createReadStream(opt.fallback).pipe(res);
      });
    }
    return middleware;
  };

  ConnectApp.prototype.log = function(text) {
    this.text = text;
    if (!opt.silent) {
      return this.text;
    }
  };

  ConnectApp.prototype.logWarning = function(text) {
    this.text = text;
    if (!opt.silent) {
      return this.text;
    }
  };

  ConnectApp.prototype.oldMethod = function(type) {
    var text;
    text = 'does not work in gulp-connect v 2.*. Please read "readme" https://github.com/AveVlad/gulp-connect';
    switch (type) {
      case "open":
        return this.logWarning("Option open " + text);
    }
  };

  return ConnectApp;

})();

module.exports = {
  server: function(options) {
    if (options == null) {
      options = {};
    }
    return new ConnectApp(options);
  },
  reload: function() {
    return es(function(file, callback) {
      if (opt.livereload && typeof lr === "object") {
        lr.changed({
          body: {
            files: file.path
          }
        });
      }
      return callback(null, file);
    });
  },
  serverClose: function() {
    return server.close();
  }
};