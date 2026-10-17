import { readFileSync } from 'node:fs';

const html = readFileSync('public/index.html', 'utf8');
const appJs = readFileSync('public/js/app.js', 'utf8');

const regex = /onclick=["']([^"']+)["']/g;
const handlers = new Set();
let match;
while ((match = regex.exec(html)) !== null) {
  handlers.add(match[1]);
}

console.log('--- All onclick handlers found in public/index.html ---');
let missing = 0;
for (const h of handlers) {
  console.log('•', h);
  if (h.startsWith('window.HubAct.')) {
    const fnName = h.replace('window.HubAct.', '').split('(')[0];
    if (!appJs.includes(fnName)) {
      console.error(`❌ Function ${fnName} not found in app.js!`);
      missing++;
    }
  } else {
    // legacy or global
    const fnName = h.split('(')[0];
    if (!appJs.includes(fnName)) {
      console.warn(`⚠️ Warning: ${fnName} does not start with window.HubAct.`);
    }
  }
}

// Check forms
const formRegex = /<form[^>]+id=["']([^"']+)["']/g;
while ((match = formRegex.exec(html)) !== null) {
  const formId = match[1];
  if (!appJs.includes(formId)) {
    console.error(`❌ Form ID ${formId} has no listener in app.js!`);
    missing++;
  } else {
    console.log(`✓ Form listener verified for #${formId}`);
  }
}

if (missing === 0) {
  console.log('\n✅ All handlers and form IDs are 100% wired!');
} else {
  console.error(`\n❌ Found ${missing} missing handlers!`);
  process.exit(1);
}
