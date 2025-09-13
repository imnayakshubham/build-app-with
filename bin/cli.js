#!/usr/bin/env node

import { createApp } from '../src/create-app.js';
import { welcomeMessage } from '../src/utils/messages.js';

async function main() {
  welcomeMessage();
  await createApp();
}

main().catch(console.error);