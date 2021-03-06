import * as fs from 'fs';
import * as path from 'path';

class Command {
  constructor(name, options) {
    this.name = name;
    this.description = (options === null || options === void 0 ? void 0 : options.description) || 'No description for this command';
    this.usage = (options === null || options === void 0 ? void 0 : options.usage) || 'No usage for this command';
    this.aliases = (options === null || options === void 0 ? void 0 : options.aliases) || [];
    this.func = undefined;
  }

  addAlias(alias) {
    if (alias instanceof Array) {
      this.aliases.push(...alias);
    } else {
      this.aliases.push(alias);
    }
  }

  run(client, Instance, message, args) {
    if (this.func) {
      this.func({
        message,
        args,
        client,
        instance: Instance
      });
    } else {
      throw new Error('No function set for this command');
    }
  }

  set Func(func) {
    this.func = func;
  }

  get Usage() {
    return this.usage;
  }

  set Usage(usage) {
    this.usage = usage;
  }

  get Description() {
    return this.description;
  }

  set Description(description) {
    this.description = description;
  }

  get Aliases() {
    return this.aliases;
  }

}

var command = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Command: Command
});

class Event {
  constructor(EventFunc) {
    this.EventFunc = EventFunc;
    this.EventRegister = EventFunc;
  }

  run(client, Instance) {
    if (this.EventRegister) {
      this.EventRegister(client, Instance);
    } else {
      throw new Error('No function set for this command');
    }
  }

}

var event = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Event: Event
});

function fetchJS(folder) {
  let folderContent = fs.readdirSync(folder);
  let files = [];

  for (let entry of folderContent) {
    let entrypath = path.join(folder, entry);
    let isDir = fs.statSync(entrypath).isDirectory();
    let isFile = fs.statSync(entrypath).isFile();
    let ext = path.extname(entrypath);

    if (isDir) {
      files = files.concat(fetchJS(entrypath));
    }

    if (isFile && ext == ".js") {
      files.push(entrypath);
    }
  }

  return files;
}

class CommandHandler {
  constructor(client, options) {
    this.commands = [];
    this.client = client;
    this.prefix = (options === null || options === void 0 ? void 0 : options.prefix) || '!';
    this.client.on((options === null || options === void 0 ? void 0 : options.messageEvent) || 'messageCreate', message => this.commandListener(message));
  }

  commandListener(message) {
    if (message.content.slice(0, this.prefix.length) == this.prefix) {
      let command = message.content.split(' ')[0].slice(this.prefix.length);
      let args = message.content.split(' ').slice(1);
      console.log(command, args);
      this.commands.forEach(cmd => {
        var _a;

        if (cmd.name === command || ((_a = cmd.Aliases) === null || _a === void 0 ? void 0 : _a.includes(command))) {
          cmd.run(this.client, this, message, args);
        }
      });
    }
  }

  loadCommands(target_path) {
    let exists = fs.existsSync(target_path);
    if (!exists) return false;

    if (target_path.match(/^\.\//)) {
      target_path = path.join(process.cwd(), target_path.replace(/^\.\//, ""));
    }

    let isDir = fs.statSync(target_path).isDirectory();

    if (isDir) {
      let allJS = fetchJS(target_path);

      for (let file of allJS) {
        let commands = require(file);

        this.addCommand(commands);
      }
    }
  }

  loadCommand(commandPath) {
    let command = require(commandPath);

    this.addCommand(command);
  }

  addCommand(command) {
    if (command instanceof Array) {
      this.commands.push(...command);
      command.forEach(cmd => {
        console.log(`Command ${cmd.name} loaded`);
      });
    } else {
      console.log(command);
      this.commands.push(command);
      console.log(`Command ${command.name} loaded`);
    }
  }

  loadEvents(target_path) {
    let exists = fs.existsSync(target_path);
    if (!exists) return false;

    if (target_path.match(/^\.\//)) {
      target_path = path.join(process.cwd(), target_path.replace(/^\.\//, ""));
    }

    let isDir = fs.statSync(target_path).isDirectory();

    if (isDir) {
      let allJS = fetchJS(target_path);

      for (let file of allJS) {
        let events = require(file);

        this.addEvent(events);
      }
    }
  }

  loadEvent(eventPath) {
    let command = require(eventPath);

    this.addCommand(command);
  }

  addEvent(event) {
    if (event instanceof Array) {
      event.forEach(event => {
        event.run(this.client, this);
      });
    } else {
      event.run(this.client, this);
    }
  }

}

export { command as Command, CommandHandler, event as Event, fetchJS };
