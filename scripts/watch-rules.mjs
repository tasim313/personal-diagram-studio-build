import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { resolve } from 'node:path';

const RULES_FILE = resolve(process.cwd(), 'firestore.rules');

console.log('👀 Watching firestore.rules for changes...');
console.log('⚡ Any modification will automatically deploy to Firebase!');

let deployProcess = null;
let debounceTimer = null;

function deployRules() {
  if (deployProcess) {
    console.log('⏳ A deployment is already in progress, waiting...');
    return;
  }

  console.log(`\n[${new Date().toLocaleTimeString()}] 🚀 Deploying updated Firestore rules to Firebase...`);

  deployProcess = spawn('npx', ['firebase', 'deploy', '--only', 'firestore:rules'], {
    stdio: 'inherit',
    shell: true,
  });

  deployProcess.on('close', (code) => {
    deployProcess = null;
    if (code === 0) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Firestore rules successfully updated and live!\n`);
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Failed to deploy Firestore rules (exit code: ${code}).`);
      console.log(`💡 Note: If you haven't authenticated yet, run: npx firebase login\n`);
    }
  });
}

// Initial deploy option or watch
watch(RULES_FILE, (eventType) => {
  if (eventType === 'change') {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      deployRules();
    }, 500); // 500ms debounce
  }
});
