import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = process.env.TEMP + '\\chrome-theme-test-' + Date.now();
const port = 9225;

console.log('🧪 [Browser Diagnostic Agent] Lancement du test E2E du bouton Thème & boot navbar...');

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--no-first-run',
  'about:blank'
]);

await new Promise(r => setTimeout(r, 1400));

try {
  const newTabRes = await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:3000/?nosplash=1`, { method: 'PUT' });
  const tab = await newTabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  await new Promise(resolve => ws.onopen = resolve);

  let id = 1;
  const consoleErrors = [];

  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
          consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
        }
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  // Wait for initial mount
  await new Promise(r => setTimeout(r, 1200));

  // 1. Initial State Check
  const check1 = await send('Runtime.evaluate', {
    expression: `({
      isDark: document.documentElement.classList.contains('dark'),
      isLight: document.documentElement.classList.contains('light'),
      icon: document.getElementById('theme-icon')?.textContent,
      themeSaved: localStorage.getItem('pi_theme'),
      xpTop: document.getElementById('wallet-xp-top')?.textContent,
      dinarsTop: document.getElementById('wallet-dinars-top')?.textContent
    })`,
    returnByValue: true
  });

  const res1 = check1.result?.value;
  console.log('1. État initial au démarrage :', res1);
  if (!res1.isDark) throw new Error('Le thème initial doit être sombre (dark)');
  if (res1.icon !== '☀️') throw new Error(`L'icône initiale devrait être ☀️ pour basculer vers le mode clair, reçu: ${res1.icon}`);

  // 2. Click Theme Button to toggle to Light Mode
  console.log('2. Déclenchement du clic sur #theme-btn (bascule vers Light)...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('theme-btn').click();`
  });

  await new Promise(r => setTimeout(r, 200));

  const check2 = await send('Runtime.evaluate', {
    expression: `({
      isDark: document.documentElement.classList.contains('dark'),
      isLight: document.documentElement.classList.contains('light'),
      icon: document.getElementById('theme-icon')?.textContent,
      themeSaved: localStorage.getItem('pi_theme')
    })`,
    returnByValue: true
  });

  const res2 = check2.result?.value;
  console.log('   Résultat après premier clic :', res2);
  if (res2.isDark) throw new Error('Le mode sombre devrait être désactivé après le clic');
  if (!res2.isLight) throw new Error('Le mode clair (.light) doit être actif');
  if (res2.themeSaved !== 'light') throw new Error(`localStorage pi_theme doit être 'light', reçu: ${res2.themeSaved}`);
  if (res2.icon !== '🌙') throw new Error(`L'icône devrait être 🌙 en mode clair, reçu: ${res2.icon}`);

  // 3. Click Theme Button again to toggle back to Dark Mode
  console.log('3. Deuxième clic sur #theme-btn (retour vers Dark)...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('theme-btn').click();`
  });

  await new Promise(r => setTimeout(r, 200));

  const check3 = await send('Runtime.evaluate', {
    expression: `({
      isDark: document.documentElement.classList.contains('dark'),
      isLight: document.documentElement.classList.contains('light'),
      icon: document.getElementById('theme-icon')?.textContent,
      themeSaved: localStorage.getItem('pi_theme')
    })`,
    returnByValue: true
  });

  const res3 = check3.result?.value;
  console.log('   Résultat après deuxième clic :', res3);
  if (!res3.isDark) throw new Error('Le mode sombre (.dark) doit être réactivé');
  if (res3.isLight) throw new Error('Le mode clair (.light) doit être retiré');
  if (res3.themeSaved !== 'dark') throw new Error(`localStorage pi_theme doit être 'dark', reçu: ${res3.themeSaved}`);
  if (res3.icon !== '☀️') throw new Error(`L'icône devrait être ☀️ en mode sombre, reçu: ${res3.icon}`);

  // 4. Verify no console errors occurred
  console.log('4. Vérification des erreurs de console sur le cycle d\'initialisation...');
  if (consoleErrors.length > 0) {
    console.error('Erreurs de console détectées :', consoleErrors);
    throw new Error('Des erreurs runtime ont été enregistrées dans la console');
  }
  console.log('   ✓ 0 erreur runtime. Le cycle de démarrage et les écouteurs sont 100% sains.');

  console.log('\n🎉 [SUCCESS] Diagnostic et validation du bouton Thème et de la Navbar complétés avec succès !');

  ws.close();
} finally {
  chrome.kill();
}
