import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = process.env.TEMP + '\\chrome-shots-' + Date.now();
const port = 9223;
const artifactDir = 'C:\\Users\\mayar\\.gemini\\antigravity-cli\\brain\\d9748107-0ff8-4406-b68d-073cea31ad80';

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--no-first-run',
  'about:blank'
]);

await new Promise(r => setTimeout(r, 1400));

async function capture(url, width, height, mobile, filename) {
  const newTabRes = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const tab = await newTabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  await new Promise(resolve => ws.onopen = resolve);

  let id = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
    screenOrientation: { angle: 0, type: 'portraitPrimary' }
  });

  // Allow layout and network calls to settle
  await new Promise(r => setTimeout(r, 1500));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = `public/screenshots/${filename}`;
  writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  
  // Copy to artifact directory for presentation
  try {
    copyFileSync(outPath, `${artifactDir}\\${filename}`);
  } catch (e) {
    // ignore if artifact dir not reachable
  }

  console.log(`✓ [${mobile ? 'MOBILE' : 'DESKTOP'}] Saved ${filename} (${width}x${height})`);

  ws.close();
  await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
}

try {
  mkdirSync('public/screenshots', { recursive: true });

  console.log('📸 Démarrage de la capture des captures d\'écran haute résolution...\n');

  // 1. Desktop captures (1280x850)
  await capture('http://localhost:3000/?nosplash=1&page=page-intro', 1280, 850, false, 'web-01-home.png');
  await capture('http://localhost:3000/?nosplash=1&page=page-profile-card', 1280, 850, false, 'web-02-carte-id.png');
  await capture('http://localhost:3000/?nosplash=1&page=page-events', 1280, 850, false, 'web-03-hackathons.png');
  await capture('http://localhost:3000/?nosplash=1&page=page-company', 1280, 850, false, 'web-04-recruteur.png');
  await capture('http://localhost:3000/verify/u-default', 1280, 850, false, 'web-05-verify.png');

  // 2. Mobile captures (390x844 - iPhone / modern viewport)
  await capture('http://localhost:3000/?nosplash=1&page=page-intro', 390, 844, true, 'mobile-01-home.png');
  await capture('http://localhost:3000/?nosplash=1&page=page-profile-card', 390, 844, true, 'mobile-02-carte-id.png');
  await capture('http://localhost:3000/?nosplash=1&page=page-events', 390, 844, true, 'mobile-03-hackathons.png');
  await capture('http://localhost:3000/?nosplash=1&page=page-company', 390, 844, true, 'mobile-04-recruteur.png');
  await capture('http://localhost:3000/verify/u-default', 390, 844, true, 'mobile-05-verify.png');

  console.log('\n🎉 Toutes les captures d\'écran Web et Mobile ont été générées avec succès !');
} catch (err) {
  console.error('Erreur lors de la capture:', err);
} finally {
  chrome.kill();
}
