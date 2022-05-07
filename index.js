#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();

const inquirer = require('inquirer');

const pkg = require(__dirname + '/package.json');

const JSONdb = require('simple-json-db');
const db = new JSONdb(`./db/${pkg["name"]}.json`);

const shell = require('shelljs');

program
  .name('rpu')
  .description('CLI to upgrade NPM packages and NPM itself')
  .version('0.0.1');

program.command('list')
  .description('List all denied packages')
  .action(async (str, options) => {
    console.log(':: Getting denied packages');

    for (var key of Object.keys(pkg["dependencies"])) {
      const pak = key;
      const g = db.has(pak);

      ve = g;
      
      if (g === true) {
        console.log(pak);
      };
    };
  });

program.command('delete')
  .alias('del')
  .description('Delete a package from the deny list')
  .action(async (str, options) => {
    let arr = [];

    for (var key of Object.keys(pkg["dependencies"])) {
      const pak = key;
      const has = db.has(pak);

      if (has === true) {
        arr.push(pak);
      };

      if (arr.length === 0) {
        console.log(`:: There's no packages to delete from the deny list!`);
        return;
      };
    };
    
    let l = [
      {
        type: 'list',
        name: 'answer',
        message: 'Select a package',
        choices: arr
      }
    ];
    
    inquirer.prompt(l).then(answers => {
      const p = answers.answer;
      db.delete(p, "placeholder")
      console.info(`:: ${p} is now off the deny list`);
    });
  });


program.command('deny')
  .description('Add a package to the deny list')
  .action(async (str, options) => {
    let arr = [];

    for (var key of Object.keys(pkg["dependencies"])) {
      const pak = key;
      const has = db.has(pak);

      if (has === false) {
        arr.push(pak);
      };

      if (arr.length === 0) {
        console.log(`:: There's no packages to add to the deny list!`);
        return;
      };
    };
    
    let l = [
      {
        type: 'list',
        name: 'answer',
        message: 'Select a package',
        choices: arr
      }
    ];
    
    inquirer.prompt(l).then(answers => {
      const p = answers.answer;
      db.set(p, "placeholder")
      console.info(`:: ${p} is now on the deny list`);
    });
  });


program.command('upgrade')
  .alias('update')
  .description('Upgrade NPM & NPM packages')
  .argument('[latest]', 'Upgrades packages to latest')
  .action(async (str, options) => {
    console.log(':: Updating NPM');
    shell.exec('npm install -g npm@latest');
    console.log(':: Successfully updated');

    let pkgs = "npm install --silent ";
    
    for (var key of Object.keys(pkg["dependencies"])) {
      const pak = key;
      const has = db.has(pak);

      if (str && has === false) {
        pkgs = pkgs + ' ' + pak + '@latest' + ' ';
      } else if (!str && has === false) {
        pkgs = pkgs + ' ' + pak + ' ';
      };
    };

    console.log(':: Updating packages');
    shell.exec(pkgs);
    console.log(':: Successfully updated');
  });

program.parse();
