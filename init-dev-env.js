#!/usr/bin/env node
/*jshint node:true*/

(function iniDevEnv() {
  "use strict";

  var fs = require('fs');
  var exec = require('child_process').exec;

  var isWin = !!process.platform.match(/^win/);

  var validateCommitPath = '../../tasks/lib/validate-commit-msg.js';
  var gitHookPath = '.git/hooks/commit-msg';

  var nodeModulesPath = 'node_modules';
  var karmaPath = '..';
  var nmKarmaPath = 'node_modules/karma';

//Add Hook "validate-commit-msg"
  function gitHookSetup(){
    if (fs.existsSync(gitHookPath)) {
      fs.unlinkSync(gitHookPath);
      console.log('Existing link removed:', gitHookPath);
    }

    console.log("Adding symbolic link: %s linked to %s", validateCommitPath, gitHookPath);
    fs.symlinkSync(validateCommitPath, gitHookPath, 'file');
  }

  function selfLinkSetup() {
    if (!fs.existsSync(nodeModulesPath)) {
      fs.mkdirSync(nodeModulesPath);
    }

    if (fs.existsSync(nmKarmaPath)) {
      fs.unlinkSync(nmKarmaPath);
      console.log('Existing link removed:', nmKarmaPath);
    }

    console.log('Adding symbolic link: %s linked to %s', karmaPath, nmKarmaPath);
    fs.symlinkSync(karmaPath, nmKarmaPath, 'dir');
  }

// Check for gurnt-cli
  function installGruntCli(callback) {

    console.log('Installing grunt-cli...');

    exec('npm install -g grunt-cli', function (error, stdout, stderr) {

      if (error !== null) {
        console.log(stdout);
        console.error(stderr);
        console.error('error installing grunt-cli: ' + error);
      } else {
        callback();
      }

    });
  }

  function checkForGruntCli(callback) {

    console.log('Checking for grunt-cli...');

    exec('npm list -global -json grunt-cli', function (error, stdout, stderr) {
      var gruntCli = JSON.parse(stdout);

      if (!gruntCli.dependencies) {
        installGruntCli(callback);
      } else {
        console.log('grunt-cli %s is already installed', gruntCli.dependencies['grunt-cli'].version);
        callback();
      }

    });
  }

  function installDependencies() {

    console.log("Installing dependencies...");

    exec('npm install', function (error, stdout, stderr) {

      if (error !== null) {
        console.log(stdout);
        console.error(stderr);
        console.error('Error installing karma dependencies: ' + error);
      }

    });

  }

  function runInit() {

    gitHookSetup();
    selfLinkSetup();
    checkForGruntCli(function cb() {
      installDependencies();
    });

  }

  if ( isWin ){

    exec('whoami /priv', function(err, o) {
      if (err || o.indexOf('SeCreateSymbolicLinkPrivilege') === -1) {
        console.log("You do not appear to have symlink privileges. Exiting init script.");
        console.log("Windows requires admin privileges to create symlinks.");
      } else {
        runInit();
      }
    });

  } else {
    runInit();
  }

})();






