#!/usr/bin/env node

import meow from 'meow';
import Create from './create.js';

const cli = meow(
    `Create-Blast-App version 1.0.2

Usage : $ create-blast-app <project-name>`
    , {
        importMeta: import.meta,
        allowUnknownFlags: false,
        flags: { help: { alias: "h" } }
    });

if (!cli.input?.[0]) {
    console.log("Invalid parameter : You must set a project name.\n\nUsage : $ create-blast-app <project-name>")
    process.exit(1)
}

Create(cli.input[0], cli.flags);