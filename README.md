# CocoonJS Command Line tools #

The CocoonJS command line tools let you build Cordova-based applications that benefit of Ludei's services (like cloud project management) right in you terminal.

The CocoonJS CLI also provide access to the Webview+ execution environment. The CocoonJS CLI handles the installation and usage of the webview+ plugin directly in your computer.

> Ludei's WebView+ is a Chromium based solution for Android 4.0+ and the WKWebView for iOS 8.0+.

- [Webview+ for iOs](https://github.com/ludei/webview-plus-ios)
- [Webview+ for Android](https://github.com/ludei/webview-plus)

## Requirements ##
Install cordova-cli 3.2 or higher (Cordova 3.5 is recommended). Please refer to [Cordova prerequisites](https://github.com/apache/cordova-cli#requirements) to set up your environment.

After installing Cordova in your computer, execute the following command to install the CocoonJS CLI tools:

```
$ npm install -g cocoonjs
```

## How to use ##

Use any valid cordova command with the CocoonJS-CLI to manage your project, eg:

```
$ cocoonjs create MyProject com.ludei.test LudeiTest
$ cd MyProject
$ cocoonjs platform add android
$ cocoonjs plugin add com.ludei.webview.plus
$ cocoonjs run
```

#### Regarding cordova versions ####

The CocoonJS command line tool automatically detects the Cordova version installed in your computer. However, if you have multiple versions installed locally, you can explicitly point to a specific path using the --cordova-path argument to force that cordova binary to execute, eg:


```
$ cocoonjs platform add android --cordova-path=/Users/Cocoon/cordova/cordova-3.5.0-0.2.4/
```
Using the *--cordova-path*, the CocoonJS-CLI will find the cordova binary inside *cordova-3.5.0-0.2.4/bin/cordova* and will use it to spawn all the cordova-based commands. You can use any cordova 3.x version.


#### Troubleshooting ####

CocoonJS command line has a verbose mode. If you get any error, launch the command  with -d flag. And you'll get more info. For instance:

```
cocoonjs plugin add com.ludei.webview.plus -d
```

And post the info in the console attached to your issue.

Documentation
----
http://support.ludei.com/hc/en-us/sections/200476168-CocoonJS-Command-Line-Interface

License
----
Copyright 2014 Ludei, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

### About the author ###

[Ludei](http://www.ludei.com) is a San Francisco based company, creators of [CocoonJS](https://www.ludei.com/cocoonjs/). Ludei aims to empower HTML5 industry with a set of tools that eases the adoption of HTML5 as the target platform for every mobile development.
