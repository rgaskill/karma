#!/usr/bin/env node
'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var isWin = !!process.platform.match(/^win/);

var spawnGcliCmd;
var spawnInstallCmd;

if ( isWin ){
  spawnGcliCmd = ['cmd', ['/C','npm install -g grunt-cli']];
  spawnInstallCmd = ['cmd', ['/C', 'npm install']];
} else {
  spawnGcliCmd = ['npm', ['install', '-g', 'grunt-cli']];
  spawnInstallCmd = ['npm', ['install']];
}


var validateCommitPath = '../../tasks/lib/validate-commit-msg.js';
var gitHookPath = '.git/hooks/commit-msg';

var nodeModulesPath = 'node_modules';
var karmaPath = '..';
var nmKarmaPath = 'node_modules/karma';

//Add Hook "validate-commit-msg"
var gitHookSetup = function(){
  if (fs.existsSync(gitHookPath)) {
    fs.unlinkSync(gitHookPath);
    console.log('Existing link removed:', gitHookPath);
  }

  console.log('Adding symbolic link: %s linked to %s', validateCommitPath, gitHookPath);
  fs.symlinkSync(validateCommitPath, gitHookPath, 'file');
};

var selfLinkSetup = function() {
  if (!fs.existsSync(nodeModulesPath)) {
    fs.mkdirSync(nodeModulesPath);
  }

  if (fs.existsSync(nmKarmaPath)) {
    fs.unlinkSync(nmKarmaPath);
    console.log('Existing link removed:', nmKarmaPath);
  }

  console.log('Adding symbolic link: %s linked to %s', karmaPath, nmKarmaPath);
  fs.symlinkSync(karmaPath, nmKarmaPath, 'dir');
};

// Check for gurnt-cli
var installGruntCli = function(callback) {

  console.log('Installing grunt-cli...');

  var gcli = spawn.apply(spawn, spawnGcliCmd);

  gcli.stdout.on('data', function(data) {
    process.stdout.write(data);
  });

  gcli.stderr.on('data', function(data) {
    process.stderr.write(data);
  });

  gcli.on('close', function(code) {
    if ( code === 0 ){
      callback();
    }
  });

};

var checkForGruntCli = function(callback) {

  console.log('Checking for grunt-cli...');

  exec('npm list -global -json grunt-cli', function (error, stdout) {
    var gruntCli = JSON.parse(stdout);

    if (!gruntCli.dependencies) {
      installGruntCli(callback);
    } else {
      console.log('grunt-cli %s is already installed', gruntCli.dependencies['grunt-cli'].version);
      callback();
    }

  });
};

var installDependencies = function() {

  console.log('Installing dependencies...');

  var install = spawn.apply(spawn, spawnInstallCmd);

  install.stdout.on('data', function(data) {
    process.stdout.write(data);
  });

  install.stderr.on('data', function(data) {
    process.stderr.write(data);
  });

};

var runInit = function() {

  gitHookSetup();
  selfLinkSetup();
  checkForGruntCli(function cb() {
    installDependencies();
  });

};

if ( isWin ){

  exec('whoami /priv', function(err, o) {
    if (err || o.indexOf('SeCreateSymbolicLinkPrivilege') === -1) {
      console.log('You do not appear to have symlink privileges. Exiting init script.');
      console.log('Windows requires admin privileges to create symlinks.');
    } else {
      runInit();
    }
  });

} else {
  runInit();
}