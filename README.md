# CocoonJS Command Line tools #

The CocoonJS command line tools let you build Cordova-based applications that benefit of the performance [Webview+](http://support.ludei.com/hc/en-us/articles/201952993).The main goal of the CocoonJS CLI is to provide the Ludei services (like cloud project management) right in you terminal.


> The Webview+ provide you a consistent rendering engine independently of the Android 4.x version, so your app/game will run using the same rendering engine, with the fastest javascript engine in the world (V8).

## Requirements ##
Please refer to the [Cordova requirements](https://github.com/apache/cordova-cli#requirements) in order to set up the requirements.

After installing Cordova in your computer, execute the following command to install the CocoonJS CLI tools:

```
$ npm install -g cocoonjs
```

## How to use ##

Use any valid cordova command with the CocoonJS-CLI to manage your project, eg:

```
$ cocoonjs create /path/ com.ludei.test LudeiTest
$ cocoonjs platform add android
$ cocoonjs plugin add com.ludei.webview.plus
$ cocoonjs build
$ cocoonjs run
```

CocoonJS Cloud project managment
There is a command reserved to handle CocoonJS cloud based projects (http://cloud.ludei.com), the command is called "cloud" and can be used as follows:
```
$ cocoonjs cloud
```

This command *is still* in development and should be avoid its usage for now.

### FAQ ###

#### ¿Which version of cordova is required? ####
The CocoonJS command line tool automatically detects the Cordova version that you've installed in your computer, however, if you use a different cordova version that you've installed locally, you can use the --cordova-path argument to tell the CocoonJS-CLI where is the cordova binary that is need to be used for the cordova commands, eg:


```
$ cocoonjs platform add android --cordova-path=/Users/Cocoon/cordova/cordova-3.5.0-0.2.4/
```
When using the *--cordova-path* the CocoonJS-CLI will find the cordova binary inside *cordova-3.5.0-0.2.4/bin/cordova* and will use it to spawn all the cordova based commands, you can use any cordova 3.x version.


Documentation
----
http://support.ludei.com

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