type AppMode = 'admin' | 'client';

const pageShell = (title: string, body: string) => `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="Služba AlfaRes Bazoš pomáhá prodejcům připravovat, sledovat a spravovat inzeráty na Bazoš.cz v souladu s pravidly.">
  <link rel="stylesheet" href="/ui/app.css?v=czech-settings-20260627">
</head>
<body>
${body}
</body>
</html>`;

const icon = (name: string) => `<span class="icon icon-${name}" aria-hidden="true"></span>`;

export const renderLandingPage = () =>
  pageShell(
    'AlfaRes Bazoš',
    `<header class="site-header">
      <a class="brand" href="/" aria-label="AlfaRes Bazoš">
        <span class="brand-mark">B</span>
        <span>Služba Bazoš</span>
      </a>
      <nav class="site-nav" aria-label="Hlavní navigace">
        <a href="#benefits">Výhody</a>
        <a href="#service">Služba</a>
        <a href="#compliance">Soulad s pravidly</a>
      </nav>
      <div class="site-actions" aria-label="Klientský přístup">
        <a class="nav-client" href="/client">${icon('client')}Klientský panel</a>
        <a class="button button-primary" href="/client?auth=register">${icon('client')}Registrovat</a>
      </div>
    </header>

    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <h1>Spravujte inzeráty na Bazoši bezpečně a přehledně.</h1>
          <p class="hero-lede">Prodejci mohou připravovat inzeráty, sledovat stav na Bazoši a žádat o hlídané publikování přes AlfaRes, aniž by ztratili přehled o limitech Bazoš.cz.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="/client">${icon('layout')}Otevřít klientský prostor</a>
            <a class="button button-secondary" href="#service">${icon('catalog')}Zobrazit službu</a>
          </div>
        </div>
        <div class="product-frame" aria-label="Náhled ovládacího panelu služby Bazoš">
          <div class="browser-bar">
            <span></span><span></span><span></span>
            <strong>bazos.alfares.cz</strong>
          </div>
          <div class="preview-grid">
            <div class="preview-panel wide">
              <div class="panel-header">
                <strong>Centrum správy inzerátů</strong>
                <span class="status ok">Pravidla splněna</span>
              </div>
              <div class="offer-row">
                <span class="thumb"></span>
                <div><strong>iPhone 13 128GB</strong><small>Koncept z katalogu</small></div>
                <span>Elektro</span>
                <span class="status wait">Kontrola</span>
              </div>
              <div class="offer-row">
                <span class="thumb green"></span>
                <div><strong>Sada vrtaček Makita</strong><small>Publikováno na Bazoši</small></div>
                <span>Nářadí</span>
                <span class="status ok">Aktivní</span>
              </div>
              <div class="offer-row">
                <span class="thumb red"></span>
                <div><strong>Kancelářská židle</strong><small>Vyžadována kontrola duplicity</small></div>
                <span>Nábytek</span>
                <span class="status risk">Blokováno</span>
              </div>
            </div>
            <div class="preview-panel">
              <strong>Kontroly pravidel</strong>
              <ol class="gate-list">
                <li>${icon('check')}Ověřená identita</li>
                <li>${icon('check')}Limit aktivních inzerátů</li>
                <li>${icon('check')}Interval kategorie</li>
                <li>${icon('check')}Důkaz bez duplicity</li>
              </ol>
            </div>
            <div class="preview-panel">
              <strong>Administrátorská kontrola</strong>
              <p class="metric">7</p>
              <small>identit nebo pokusů vyžaduje ruční kontrolu</small>
            </div>
          </div>
        </div>
      </section>

      <section class="benefit-band" id="benefits">
        <div class="section-heading">
          <h2>Proč prodejci používají tuto službu místo samotného Bazoše</h2>
          <p>Samotný Bazoš je vhodný pro ruční vkládání. AlfaRes k němu přidává katalogový kontext, přehled o pravidlech, týmové postupy a sledování životního cyklu.</p>
        </div>
        <div class="benefit-grid">
          <article>
            ${icon('catalog')}
            <h3>Příprava inzerátu z katalogu</h3>
            <p>Vytvářejte lokální koncepty z produktových dat a mějte název, kategorii, obrázky, stav skladu i výchozí údaje prodejce na jednom místě.</p>
          </article>
          <article>
            ${icon('activity')}
            <h3>Stav uložený i po ukončení relace</h3>
            <p>Sledujte, které inzeráty jsou koncepty, ve frontě, publikované, blokované, expirované nebo čekají na ruční kontrolu, bez ručního procházení každého inzerátu.</p>
          </article>
          <article>
            ${icon('guard')}
            <h3>Vestavěné kontroly pravidel</h3>
            <p>Zobrazte limity aktivních inzerátů, kontrolu duplicit, intervaly kategorií a důkazy obsahu ještě před rizikovým publikováním.</p>
          </article>
          <article>
            ${icon('team')}
            <h3>Administrátorský dohled</h3>
            <p>Kontrolujte blokované pokusy, stavy identit a provozní stav z vyhrazené administrátorské konzole.</p>
          </article>
        </div>
      </section>

      <section class="pricing-section" id="service">
        <div class="pricing-copy">
          <h2>Přístup ke službě pro ověřené prodejce</h2>
          <p>Používejte klientský panel pro přípravu inzerátů, sledování stavu a hlídané žádosti o publikování pro ověřené identity na Bazoši.</p>
        </div>
        <div class="pricing-card">
          <span>Klientský prostor</span>
          <strong>Přístup</strong>
          <small>pro ověřené uživatele AlfaRes</small>
          <a class="button button-primary" href="/client">${icon('login')}Přihlásit se nebo registrovat</a>
        </div>
      </section>

      <section class="workflow-section" id="compliance">
        <div class="section-heading">
          <h2>Nejdříve bezpečný pracovní postup</h2>
          <p>Služba nenahrazuje ověření na Bazoši ani neobchází pravidla platformy. Zastaví se, když Bazoš vyžaduje zásah člověka.</p>
        </div>
        <div class="workflow">
          <div class="workflow-step"><strong>1</strong><span>Ruční ověření identity na Bazoši</span></div>
          <div class="workflow-step"><strong>2</strong><span>Lokální koncept a důkaz bez duplicity</span></div>
          <div class="workflow-step"><strong>3</strong><span>Kontroly frekvence, kategorie a aktivních inzerátů</span></div>
          <div class="workflow-step"><strong>4</strong><span>Přehled fronty a kontrola při výzvě k ručnímu zásahu</span></div>
        </div>
      </section>

    </main>

    <footer class="site-footer">
      <span>AlfaRes Bazoš</span>
      <span>Provoz na Bazoš.cz v souladu s pravidly pro ověřené prodejce.</span>
    </footer>`,
  );

export const renderAuthCallbackPage = () =>
  pageShell(
    'Dokončení přihlášení',
    `<main class="callback-page">
      <section class="auth-panel callback-panel">
        <div class="auth-copy">
          <h1>Dokončení přihlášení</h1>
          <p id="callback-message">Ověřuje se návrat z Alfares Auth.</p>
        </div>
      </section>
    </main>
    <script>${authCallbackScript}</script>`,
  );

export const renderAppPage = (mode: AppMode) => {
  const title = mode === 'admin' ? 'Administrace Bazoš' : 'Klientský panel Bazoš';
  const navLabel = mode === 'admin' ? 'Administrace' : 'Klientský panel';
  const detailsLabel = mode === 'admin' ? 'Fronta ke kontrole' : 'Moje inzeráty';
  const clientTabs = mode === 'client'
    ? `<button class="tab" data-view="publish" type="button">Publikovat</button>
              <button class="tab" data-view="account" type="button">Účet Bazos.cz</button>`
    : '';
  const sidebarNav = mode === 'admin'
    ? `<a class="active" href="/admin">${icon('admin')}Administrace</a>`
    : `<a class="active" href="/client" data-sidebar-view="overview">${icon('client')}${navLabel}</a>
          <a href="#details" data-sidebar-view="details">${icon('catalog')}Moje inzeráty</a>
          <a href="#publish" data-sidebar-view="publish">${icon('catalog')}Publikovat</a>
          <a href="#account" data-sidebar-view="account">${icon('client')}Účet Bazos.cz</a>
          <a href="#bazos-settings" data-sidebar-view="settings">${icon('settings')}Nastavení Bazos.cz</a>
          <a href="#catalog" data-sidebar-view="catalog">${icon('catalog')}Katalog</a>
          <a class="hidden" id="admin-link" href="/admin">${icon('admin')}Administrace</a>`;
  const authTitle = mode === 'admin' ? 'Přihlášení administrátora' : 'Přihlásit se nebo registrovat';
  const authCopy = mode === 'admin'
    ? 'Přihlášení administrátora probíhá přes jednotný Alfares Auth účet.'
    : 'Přihlášení i registrace probíhá přes jednotný Alfares Auth účet pro celou ekosystémovou službu.';
  const registerAuthAction = mode === 'client'
    ? `<button class="button button-secondary" data-auth-action="register" type="button">${icon('client')}Registrovat v Alfares Auth</button>`
    : '';
  return pageShell(
    title,
    `<div class="app-shell" data-mode="${mode}" data-auth-pending="${mode === 'client' ? 'true' : 'false'}">
      <aside class="app-sidebar">
        <a class="brand" href="/">
          <span class="brand-mark">B</span>
          <span>Služba Bazoš</span>
        </a>
        <nav class="app-nav" aria-label="Navigace pracovního prostoru">
          ${sidebarNav}
        </nav>
      </aside>
      <main class="app-main">
        <header class="app-topbar">
          <div>
            <h1>${title}</h1>
            <p>${mode === 'admin' ? 'Provozní přehled identit na Bazoši, blokovaných pokusů a stavu služby.' : 'Zákaznický pracovní prostor pro vaše inzeráty, předplatné, kontroly pravidel a hlídané publikování.'}</p>
          </div>
          <div class="session-actions">
            <span id="session-label">Nejste přihlášeni</span>
            <button class="button button-secondary hidden" id="sign-out" type="button">${icon('logout')}Odhlásit se</button>
          </div>
        </header>

        <section class="auth-panel" id="auth-panel" data-auth-mode="login">
          <div class="auth-copy">
            <h2>${authTitle}</h2>
            <p>${authCopy}</p>
          </div>
          <div id="hosted-auth-actions" class="auth-actions">
            <button class="button button-primary" data-auth-action="login" type="button">${icon('login')}Přihlásit se přes Alfares Auth</button>
            ${registerAuthAction}
            <p class="auth-note">Jednotný Alfares účet pro Bazoš i další služby.</p>
          </div>
          <p class="form-message" id="form-message" role="status"></p>
        </section>

        <section class="workspace hidden" id="workspace">
          <div class="identity-required-banner hidden" id="identity-required-banner" role="status"></div>
          <div class="toolbar">
            <div class="tabs" role="tablist">
              <button class="tab active" data-view="overview" type="button">Přehled</button>
              <button class="tab" data-view="details" type="button">${detailsLabel}</button>
              ${clientTabs}
              ${mode === 'client' ? '<button class="tab" data-view="catalog" type="button">Katalog</button>' : ''}
            </div>
            <button class="button button-secondary" id="refresh" type="button">${icon('refresh')}Obnovit</button>
          </div>
          <div id="workspace-content" class="workspace-content"></div>
        </section>
      </main>
    </div>
    <script src="/ui/app.js?v=czech-settings-20260627"></script>`,
  );
};

export const appStyles = `
:root {
  --bg: #ffffff;
  --bg-soft: #FBF3E1;
  --ink: #000000;
  --muted: #5D5D5D;
  --line: #dddddd;
  --panel: #FBF3E1;
  --panel-strong: #FFECBF;
  --red: #FF6600;
  --red-dark: #BF4C00;
  --teal: #FFD9BF;
  --green: #2f7d32;
  --amber: #705000;
  --highlight: #FFD9BF;
  --highlight-line: #E4C2AB;
  --hover-red: #CC3333;
  --danger-bg: #fff1f0;
  --danger-line: #d92d20;
  --danger-text: #9f1f17;
  --shadow: 0 18px 55px rgba(0, 0, 0, 0.10);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0;
}
a { color: inherit; text-decoration: none; }
button, input { font: inherit; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  min-height: 72px;
  padding: 0 44px;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(14px);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 750;
  font-size: 15px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--red);
  color: #fff;
  font-weight: 800;
}
.site-nav {
  display: flex;
  justify-content: center;
  gap: 22px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 650;
}
.site-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}
.nav-client {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  color: var(--ink);
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}
.site-nav a:hover, .nav-client:hover, .app-nav a:hover { color: var(--hover-red); }
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
}
.button-primary { background: var(--red); color: #fff; }
.button-primary:hover { background: var(--red-dark); }
.button-secondary { background: #fff; color: var(--ink); border-color: var(--line); }
.button-secondary:hover { border-color: #EBD9B0; background: var(--panel-strong); }
.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(460px, 1.05fr);
  gap: 54px;
  align-items: center;
  padding: 76px 44px 64px;
  max-width: 1320px;
  margin: 0 auto;
}
.hero-copy h1 {
  margin: 0;
  max-width: 680px;
  color: #171717;
  font-size: clamp(36px, 3.9vw, 56px);
  line-height: 1.08;
  font-weight: 780;
}
.hero-lede {
  max-width: 660px;
  margin: 24px 0 0;
  color: var(--muted);
  font-size: 19px;
  line-height: 1.58;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
.product-frame {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.browser-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--line);
  background: var(--panel);
}
.browser-bar span {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: #E4C2AB;
}
.browser-bar strong {
  margin-left: 8px;
  color: var(--muted);
  font-size: 12px;
}
.preview-grid {
  display: grid;
  grid-template-columns: 1fr 0.62fr;
  gap: 14px;
  padding: 16px;
}
.preview-panel, .benefit-grid article, .auth-panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.preview-panel {
  min-height: 132px;
  padding: 16px;
}
.preview-panel.wide {
  grid-row: span 2;
}
.panel-header, .offer-row, .toolbar, .app-topbar, .session-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.offer-row {
  margin-top: 14px;
  padding: 12px;
  border-radius: 8px;
  background: var(--panel);
  font-size: 13px;
}
.offer-row small, .preview-panel small, .card-note { color: var(--muted); display: block; }
.thumb {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #FF6600, #FFD9BF);
}
.thumb.green { background: linear-gradient(135deg, #FFECBF, #FFD9BF); }
.thumb.red { background: linear-gradient(135deg, #CC3333, #FFD9BF); }
.status {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}
.status.ok { color: #2f7d32; background: #FFECBF; }
.status.wait { color: #705000; background: #FFD9BF; }
.status.risk { color: #C00029; background: #FFD9BF; }
.gate-list {
  display: grid;
  gap: 9px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 13px;
}
.gate-list li { display: flex; align-items: center; gap: 8px; }
.metric {
  margin: 14px 0 4px;
  color: var(--red);
  font-size: 52px;
  font-weight: 820;
  line-height: 1;
}
.benefit-band, .workflow-section, .pricing-section {
  max-width: 1220px;
  margin: 0 auto;
  padding: 74px 44px;
}
.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(320px, 0.7fr);
  gap: 44px;
  align-items: end;
  margin-bottom: 30px;
}
.section-heading h2 {
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.05;
}
.section-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.6;
}
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.benefit-grid article {
  padding: 22px;
  min-height: 230px;
}
.benefit-grid h3 {
  margin: 18px 0 10px;
  font-size: 18px;
}
.benefit-grid p, .auth-panel p {
  color: var(--muted);
  line-height: 1.55;
}
.pricing-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 32px;
  align-items: center;
  border-top: 1px solid var(--line);
}
.pricing-copy h2 {
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.05;
}
.pricing-copy p {
  max-width: 720px;
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.6;
}
.pricing-card {
  display: grid;
  gap: 10px;
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  box-shadow: var(--shadow);
}
.pricing-card span, .pricing-card small { color: var(--muted); font-weight: 750; }
.pricing-card strong { font-size: 56px; line-height: 1; color: var(--red); }
.pricing-card .button { margin-top: 10px; }
.workflow-section {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--panel);
  max-width: none;
}
.workflow-section > * {
  max-width: 1220px;
  margin-left: auto;
  margin-right: auto;
}
.workflow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.workflow-step {
  display: grid;
  gap: 16px;
  padding: 22px;
  border-left: 3px solid var(--red-dark);
  background: #fff;
  border-radius: 8px;
}
.workflow-step strong {
  color: var(--red-dark);
  font-size: 28px;
}
.site-footer {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 28px 44px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 14px;
}
.icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  background: currentColor;
  mask-size: 18px 18px;
  mask-repeat: no-repeat;
  mask-position: center;
}
.icon-login { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 17l5-5-5-5v3H3v4h7v3zm2-15h7a2 2 0 012 2v16a2 2 0 01-2 2h-7v-2h7V4h-7V2z'/%3E%3C/svg%3E"); }
.icon-layout { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4h18v16H3V4zm2 2v4h14V6H5zm0 6v6h8v-6H5zm10 0v6h4v-6h-4z'/%3E%3C/svg%3E"); }
.icon-shield, .icon-guard { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2l8 3v6c0 5-3.4 9.7-8 11-4.6-1.3-8-6-8-11V5l8-3zm0 2.2L6 6.4V11c0 3.8 2.4 7.4 6 8.8 3.6-1.4 6-5 6-8.8V6.4l-6-2.2z'/%3E%3C/svg%3E"); }
.icon-check { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.3 16.2L4.8 11.7l-1.4 1.4 5.9 5.9L21 7.3l-1.4-1.4L9.3 16.2z'/%3E%3C/svg%3E"); }
.icon-catalog { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z'/%3E%3C/svg%3E"); }
.icon-activity { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 13h4l3-8 4 14 3-6h4v2h-2.8l-4.6 9.2L9.8 10.8 8.4 15H3v-2z'/%3E%3C/svg%3E"); }
.icon-team, .icon-admin, .icon-client { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z'/%3E%3C/svg%3E"); }
.icon-settings { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2.1-1.6-2-3.5-2.5 1a7 7 0 00-2.6-1.5L14 2h-4l-.4 2.9A7 7 0 007 6.4l-2.5-1-2 3.5 2.1 1.6c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2.1 1.6 2 3.5 2.5-1a7 7 0 002.6 1.5L10 22h4l.4-2.9a7 7 0 002.6-1.5l2.5 1 2-3.5-2.1-1.6zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z'/%3E%3C/svg%3E"); }
.icon-refresh { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17.7 6.3A8 8 0 104.1 12H2l3.5 3.5L9 12H6.1a6 6 0 111.8 4.2l-1.4 1.4A8 8 0 1019.1 5L21 3h-6v6l2.7-2.7z'/%3E%3C/svg%3E"); }
.icon-logout { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 7l-1.4 1.4 2.6 2.6H7v2h8.2l-2.6 2.6L14 17l5-5-5-5zM5 5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h7v-2H5V5z'/%3E%3C/svg%3E"); }
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  background: var(--panel);
}
.app-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 24px 18px;
  background: #fff;
  border-right: 1px solid var(--line);
}
.app-nav {
  display: grid;
  gap: 6px;
  margin-top: 30px;
}
.app-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 750;
}
.app-nav a.active {
  color: var(--red);
  background: #FFD9BF;
}
.app-main {
  padding: 28px;
}
.app-topbar {
  margin-bottom: 20px;
}
.app-topbar h1 {
  margin: 0 0 6px;
  font-size: 32px;
}
.app-topbar p {
  margin: 0;
  color: var(--muted);
}
.auth-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 420px);
  gap: 28px;
  align-items: start;
  padding: 28px;
}
.auth-panel h2 {
  margin: 0 0 10px;
  font-size: 24px;
}
.auth-copy { display: grid; gap: 12px; }
.auth-actions {
  display: grid;
  gap: 12px;
}
.auth-note {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}
.callback-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--bg-soft);
}
.callback-panel {
  width: min(720px, 100%);
  grid-template-columns: 1fr;
}
.login-form {
  display: grid;
  gap: 12px;
}
.auth-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}
.auth-switch:has(.auth-tab:only-child) { grid-template-columns: 1fr; }
.auth-tab {
  min-height: 40px;
  border: 0;
  background: #fff;
  color: var(--muted);
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
}
.auth-tab + .auth-tab { border-left: 1px solid var(--line); }
.auth-tab.active { background: var(--red); color: #fff; }
.login-form label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 750;
}
.login-form input {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: #fff;
}
.form-message {
  grid-column: 1 / -1;
  min-height: 20px;
  margin: 0;
  color: var(--red);
  font-weight: 700;
}
.hidden { display: none !important; }
.app-shell[data-auth-pending="true"] {
  min-height: 100vh;
  background: var(--bg-soft);
}
.app-shell[data-auth-pending="true"] .app-sidebar,
.app-shell[data-auth-pending="true"] .app-topbar,
.app-shell[data-auth-pending="true"] #auth-panel,
.app-shell[data-auth-pending="true"] #workspace {
  display: none !important;
}
.workspace-content {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}
.identity-required-banner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--danger-line);
  border-left-width: 5px;
  border-radius: 8px;
  background: var(--danger-bg);
  color: var(--danger-text);
}
.identity-required-banner strong {
  display: block;
  margin-bottom: 4px;
  color: var(--danger-text);
}
.identity-required-banner p {
  margin: 0;
  color: #5f241f;
  line-height: 1.45;
}
.identity-required-banner .button-primary { background: var(--danger-line); }
.identity-required-banner .button-primary:hover { background: #b42318; }
.connection-modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.42);
}
.connection-dialog {
  width: min(760px, 100%);
  max-height: min(92vh, 820px);
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  box-shadow: var(--shadow);
}
.connection-dialog-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  padding: 22px 22px 14px;
  border-bottom: 1px solid var(--line);
}
.connection-dialog-header h2 { margin: 0 0 8px; font-size: 24px; }
.connection-dialog-header p { margin: 0; color: var(--muted); line-height: 1.5; }
.icon-button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}
.connection-dialog .form-panel {
  border: 0;
  border-radius: 0;
}
.connection-requirement {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  color: var(--muted);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.45;
}
.connection-requirement strong { display: block; color: var(--ink); margin-bottom: 4px; }
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.overview-stats {
  grid-template-columns: repeat(4, minmax(180px, 1fr));
}
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 16px;
}
.overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.stat-card, .data-panel, .form-panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  padding: 18px;
}
.stat-card span {
  color: var(--muted);
  font-size: 13px;
  font-weight: 750;
}
.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
}
.stat-card small {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
}
.table-link, .link-button {
  color: var(--red-dark);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.link-button {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table th, .data-table td {
  padding: 12px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
.data-table th {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.form-grid label, .form-panel label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 750;
}
.form-grid input, .form-grid select, .form-grid textarea, .form-panel input, .form-panel select, .form-panel textarea {
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
}
.form-grid textarea { min-height: 120px; resize: vertical; }
.form-grid .wide { grid-column: 1 / -1; }
.check-row {
  display: flex !important;
  grid-column: 1 / -1;
  align-items: flex-start;
  gap: 10px !important;
  color: var(--ink) !important;
}
.check-row input { width: auto !important; min-height: auto !important; margin-top: 3px; }
.panel-stack { display: grid; gap: 16px; }
.account-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 0.75fr); gap: 16px; }
.gate-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.gate-item { padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
.gate-item strong { display: block; margin-bottom: 4px; }
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tab {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--muted);
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
}
.tab:first-child { border-radius: 8px 0 0 8px; }
.tab:last-child { border-radius: 0 8px 8px 0; }
.tab.active {
  color: #fff;
  border-color: var(--red);
  background: var(--red);
}
.empty-state {
  padding: 30px;
  color: var(--muted);
  text-align: center;
}

.catalog-flow {
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(360px, 1.15fr);
  gap: 16px;
  align-items: start;
}
.flow-column {
  display: grid;
  gap: 12px;
}
.search-row, .form-grid {
  display: grid;
  gap: 10px;
}
.search-row {
  grid-template-columns: minmax(0, 1fr) auto;
}
.input, .select, .textarea {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
}
.textarea {
  min-height: 112px;
  padding-top: 10px;
  resize: vertical;
}
.product-list {
  display: grid;
  gap: 8px;
  max-height: 520px;
  overflow: auto;
}
.product-option {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.product-option.active, .product-option:hover {
  border-color: var(--red);
  background: var(--panel-strong);
}
.product-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: linear-gradient(135deg, #FF6600, #FFD9BF);
  object-fit: cover;
}
.preview-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.preview-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}
.preview-price {
  color: var(--red-dark);
  font-size: 24px;
  font-weight: 820;
}
.preview-description {
  white-space: pre-wrap;
  color: var(--ink);
  line-height: 1.5;
}
.flow-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.flow-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.flow-meta span {
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  color: var(--muted);
  font-size: 12px;
  font-weight: 750;
}
.flow-meta strong {
  color: var(--ink);
  font-size: 14px;
}
@media (max-width: 960px) {
  .catalog-flow, .search-row, .flow-meta { grid-template-columns: 1fr; }
}

@media (max-width: 960px) {
  .site-header {
    grid-template-columns: 1fr;
    align-items: start;
    min-height: auto;
    padding: 14px 20px;
  }
  .site-nav { display: none; }
  .site-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .hero-section, .section-heading, .auth-panel, .pricing-section {
    grid-template-columns: 1fr;
  }
  .hero-section { padding: 44px 20px; }
  .product-frame { min-width: 0; }
  .preview-grid, .benefit-grid, .workflow, .summary-grid, .overview-grid, .form-grid, .account-grid, .gate-grid {
    grid-template-columns: 1fr;
  }
  .benefit-band, .workflow-section { padding: 52px 20px; }
  .site-footer { padding: 24px 20px; flex-direction: column; }
  .app-shell { grid-template-columns: 1fr; }
  .app-sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .app-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .app-main { padding: 18px; }
  .app-topbar, .toolbar { align-items: flex-start; flex-direction: column; }
  .identity-required-banner { grid-template-columns: 1fr; }
  .data-table { display: block; overflow-x: auto; }
}
@media (max-width: 560px) {
  .hero-copy h1 { font-size: 32px; }
  .hero-lede { font-size: 17px; }
  .button { width: 100%; }
  .site-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .site-actions .nav-client { grid-column: 1 / -1; }
  .site-actions .button { width: 100%; }
  .app-nav { grid-template-columns: 1fr; }
  .session-actions { width: 100%; align-items: stretch; flex-direction: column; }
}
`;

export const authCallbackScript = `
(function () {
  const tokenKey = 'bazosServiceToken';
  const refreshTokenKey = 'bazosServiceRefreshToken';
  const authStateKey = 'bazosAuthState';
  const authReturnKey = 'bazosAuthReturnPath';
  const message = document.getElementById('callback-message');
  const setMessage = (text) => { if (message) message.textContent = text; };

  function safeReturnPath(value) {
    return value === '/admin' || value === '/client' ? value : '/client';
  }

  function clearPendingAuth() {
    sessionStorage.removeItem(authStateKey);
    sessionStorage.removeItem(authReturnKey);
  }

  try {
    const hash = window.location.hash || '';
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const returnedState = params.get('state');
    const expectedState = sessionStorage.getItem(authStateKey);
    const returnPath = safeReturnPath(sessionStorage.getItem(authReturnKey));
    window.history.replaceState(null, document.title, '/auth/callback');

    if (!accessToken) {
      throw new Error('Auth nepředal přístupový token. Zkuste se přihlásit znovu.');
    }
    if (!expectedState || !returnedState || returnedState !== expectedState) {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshTokenKey);
      throw new Error('Návrat z Auth neodpovídá zahájené relaci. Zkuste se přihlásit znovu.');
    }

    localStorage.setItem(tokenKey, accessToken);
    if (refreshToken) localStorage.setItem(refreshTokenKey, refreshToken);
    clearPendingAuth();
    window.location.replace(returnPath);
  } catch (error) {
    clearPendingAuth();
    setMessage(error.message || 'Přihlášení se nepodařilo dokončit.');
  }
})();
`;

export const appScript = `
(function () {
  const root = document.querySelector('.app-shell');
  if (!root) return;
  const mode = root.dataset.mode;
  const tokenKey = 'bazosServiceToken';
  const refreshTokenKey = 'bazosServiceRefreshToken';
  const authStateKey = 'bazosAuthState';
  const authReturnKey = 'bazosAuthReturnPath';
  const authClientId = 'bazos-service';
  const authBaseUrl = 'https://auth.alfares.cz';
  const authCallbackUrl = 'https://bazos.alfares.cz/auth/callback';
  const authPanel = document.getElementById('auth-panel');
  const workspace = document.getElementById('workspace');
  const identityBanner = document.getElementById('identity-required-banner');
  const content = document.getElementById('workspace-content');
  const message = document.getElementById('form-message');
  const sessionLabel = document.getElementById('session-label');
  const signOut = document.getElementById('sign-out');
  const adminLink = document.getElementById('admin-link');
  const refresh = document.getElementById('refresh');
  let activeView = initialView();
  let currentUser = null;

  function initialView() {
    if (mode !== 'client') return 'overview';
    const view = String(window.location.hash || '').replace('#', '');
    if (view === 'bazos-settings') return 'settings';
    return ['overview', 'details', 'publish', 'account', 'settings', 'catalog'].includes(view) ? view : 'overview';
  }

  const token = () => localStorage.getItem(tokenKey);
  const setMessage = (value) => { if (message) message.textContent = value || ''; };

  function createState() {
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    return String(Date.now()) + '-' + Math.random().toString(16).slice(2);
  }

  function startHostedAuth(action) {
    const state = createState();
    const returnPath = mode === 'admin' ? '/admin' : '/client';
    sessionStorage.setItem(authStateKey, state);
    sessionStorage.setItem(authReturnKey, returnPath);
    const url = new URL(action === 'register' ? '/register' : '/login', authBaseUrl);
    url.searchParams.set('client_id', authClientId);
    url.searchParams.set('return_url', authCallbackUrl);
    url.searchParams.set('state', state);
    window.location.assign(url.toString());
  }

  const headers = () => ({ 'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json' });

  async function request(path, options) {
    const response = await fetch(path, Object.assign({ headers: headers() }, options || {}));
    if (response.status === 401) {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshTokenKey);
      if (mode === 'client') startHostedAuth('login');
      else showAuth();
      throw new Error('Relace vypršela. Přihlaste se prosím znovu.');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const raw = body.message || body.error?.message || 'Požadavek selhal';
      throw new Error(Array.isArray(raw) ? raw.join(', ') : raw);
    }
    return response.json();
  }

  function showAuth() {
    root.dataset.authPending = 'false';
    authPanel.classList.remove('hidden');
    workspace.classList.add('hidden');
    signOut.classList.add('hidden');
    adminLink?.classList.add('hidden');
    sessionLabel.textContent = 'Nejste přihlášeni';
  }

  function showWorkspace(user, access) {
    root.dataset.authPending = 'false';
    authPanel.classList.add('hidden');
    workspace.classList.remove('hidden');
    signOut.classList.remove('hidden');
    if (mode === 'client' && access?.admin) adminLink?.classList.remove('hidden');
    else adminLink?.classList.add('hidden');
    currentUser = user || null;
    sessionLabel.textContent = user?.email || 'Přihlášeno';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function statusClass(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('verified') || text.includes('active') || text.includes('published') || text.includes('ok') || text.includes('ready') || text.includes('clear') || text.includes('queued')) return 'ok';
    if (text.includes('blocked') || text.includes('banned') || text.includes('suspended') || text.includes('failed') || text.includes('review') || text.includes('challenge') || text.includes('missing') || text.includes('expired') || text.includes('required')) return 'risk';
    return 'wait';
  }

  function cell(value) {
    if (value === null || value === undefined || value === '') return 'Nenastaveno';
    if (typeof value === 'boolean') return value ? 'Ano' : 'Ne';
    if (typeof value === 'object') return Object.values(value).filter(Boolean).slice(0, 2).map(escapeHtml).join(', ') || 'Zaznamenáno';
    return escapeHtml(value);
  }

  function statusLabel(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('verified')) return 'Ověřeno';
    if (text.includes('active')) return 'Aktivní';
    if (text.includes('published')) return 'Publikováno';
    if (text.includes('ready')) return 'Připraveno';
    if (text.includes('clear')) return 'Bez blokace';
    if (text.includes('blocked')) return 'Blokováno';
    if (text.includes('banned')) return 'Zakázáno';
    if (text.includes('suspended')) return 'Pozastaveno';
    if (text.includes('failed')) return 'Selhalo';
    if (text.includes('review')) return 'Ke kontrole';
    if (text.includes('challenge')) return 'Vyžaduje zásah';
    if (text.includes('missing')) return 'Chybí';
    if (text.includes('draft')) return 'Koncept';
    if (text.includes('queued')) return 'Ve frontě';
    if (text.includes('expired')) return 'Expirováno';
    if (text.includes('required')) return 'Vyžadováno';
    return cell(value);
  }

  function stat(label, value, note) {
    return '<article class="stat-card"><span>' + escapeHtml(label) + '</span><strong>' + cell(value) + '</strong>' + (note ? '<small>' + cell(note) + '</small>' : '') + '</article>';
  }

  function table(headers, rows, emptyText) {
    if (!rows || rows.length === 0) return '<div class="data-panel empty-state">' + escapeHtml(emptyText) + '</div>';
    return '<div class="data-panel">' + tableOnly(headers, rows, emptyText) + '</div>';
  }

  function tableOnly(headers, rows, emptyText) {
    if (!rows || rows.length === 0) return '<p class="card-note">' + escapeHtml(emptyText) + '</p>';
    return '<table class="data-table"><thead><tr>' +
      headers.map((h) => '<th>' + escapeHtml(h.label) + '</th>').join('') +
      '</tr></thead><tbody>' +
      rows.map((row) => '<tr>' + headers.map((h) => '<td>' + h.render(row) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table>';
  }

  const asArray = (value, keys) => Array.isArray(value) ? value : keys.reduce((items, key) => items.length ? items : (Array.isArray(value?.[key]) ? value[key] : []), []);
  const isVerified = (identity) => String(identity?.status || '').toLowerCase() === 'verified';
  const hasActiveSession = (identity) => String(identity?.sessionState || '').toLowerCase() === 'active';
  const isReviewClear = (identity) => !identity?.reviewState || String(identity.reviewState).toLowerCase() === 'clear';
  const hasLinkedAccount = (identity) => Boolean(identity?.accountId);
  const hasLinkedBazosIdentity = (data) => Array.isArray(data?.identities) && data.identities.length > 0;
  const isPublishableIdentity = (identity) => hasLinkedAccount(identity) && isVerified(identity) && hasActiveSession(identity) && isReviewClear(identity) && Number(identity?.activeAdCount || 0) < 50;

  function connectionWizardKey() {
    const email = String(currentUser?.email || 'anonymous').trim().toLowerCase();
    return 'bazosIdentityWizardDismissed:' + email;
  }

  function toDate(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  }

  function isThisMonth(value) {
    const date = toDate(value);
    if (!date) return false;
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  function publishStatus(ad) {
    return String(ad.publishStatus || ad.bazosStatus || ad.status || 'draft').toLowerCase();
  }

  function isPublishedAd(ad) {
    const status = publishStatus(ad);
    return status === 'published' || status === 'active' || Boolean(ad.bazosAdId);
  }

  function isActiveAd(ad) {
    const status = publishStatus(ad);
    return ad.isActive !== false && (status === 'published' || status === 'active');
  }

  function identityActiveCount(identity, ads) {
    const tracked = Number(identity.activeAdCount || 0);
    const listed = ads.filter((ad) => ad.identityId === identity.id && isActiveAd(ad)).length;
    return Math.max(tracked, listed);
  }

  function bazosAdUrl(ad) {
    if (!ad.bazosAdId) return '';
    return 'https://www.bazos.cz/inzerat/' + encodeURIComponent(String(ad.bazosAdId)) + '/';
  }

  function manualEvidence() {
    const checkedAt = new Date().toISOString();
    return {
      publicDuplicateCheck: { checkedAt, source: 'manual_review', likelyDuplicate: false, reason: 'Potvrzeno v klientském panelu Basus před odesláním do fronty.' },
      contentPolicy: { checkedAt, source: 'manual_review', passed: true, reason: 'Potvrzeno v klientském panelu Basus před odesláním do fronty.' },
    };
  }

  async function loadClientData() {
    const [adsResult, identitiesResult, queueResult] = await Promise.all([
      request('/api/bazos/ads').catch((error) => ({ error: error.message })),
      request('/api/bazos/identities').catch((error) => ({ error: error.message })),
      request('/api/bazos/publish-queue?limit=50').catch(() => []),
    ]);
    return {
      ads: adsResult.error ? [] : asArray(adsResult, ['items', 'offers', 'ads']),
      adsError: adsResult.error,
      identities: identitiesResult.error ? [] : asArray(identitiesResult, ['items', 'identities']),
      identitiesError: identitiesResult.error,
      queue: asArray(queueResult, ['items', 'attempts', 'queue']),
    };
  }

  function accountSummary(identities, ads, queue) {
    const activeAds = ads.filter(isActiveAd).length;
    const publishedAds = ads.filter(isPublishedAd).length;
    const verified = identities.filter(isVerified);
    const publishable = identities.filter(isPublishableIdentity);
    const capacityTotal = verified.length * 50;
    const capacityUsed = verified.reduce((sum, identity) => sum + identityActiveCount(identity, ads), 0);
    const nextNotBefore = identities.map((identity) => identity.nextPublishNotBefore).filter(Boolean).sort()[0];
    return {
      activeAds,
      publishedAds,
      verified,
      publishable,
      capacityTotal,
      capacityUsed,
      capacityRemaining: Math.max(capacityTotal - capacityUsed, 0),
      monthCreated: ads.filter((ad) => isThisMonth(ad.createdAt)).length,
      monthPublished: ads.filter((ad) => isThisMonth(ad.lastPublishedAt)).length,
      nextNotBefore,
      queued: queue.filter((item) => String(item.status || '').toLowerCase().includes('queued')).length,
    };
  }

  function renderIdentityOptions(identities) {
    return identities.map((identity) => '<option value="' + cell(identity.id) + '">' + cell(identity.displayName || identity.contactName || identity.phoneNumber) + ' - ' + statusLabel(identity.status) + '</option>').join('');
  }


  function renderConnectionBanner(data) {
    if (mode !== 'client' || !identityBanner) return;
    if (hasLinkedBazosIdentity(data)) {
      identityBanner.classList.add('hidden');
      identityBanner.innerHTML = '';
      return;
    }
    identityBanner.classList.remove('hidden');
    identityBanner.innerHTML = '<div><strong>Účet zatím není připojen k Bazoši</strong><p>Po registraci je potřeba propojit Alfares účet s Bazoš účtem. E-mail na Bazoši musí být stejný jako v Alfares Auth: ' + cell(currentUser?.email || 'není k dispozici') + '.</p></div><button class="button button-primary" data-open-identity-wizard type="button">Připojit účet Bazoš</button>';
    bindIdentityWizardButtons();
  }

  function connectionWizardMarkup() {
    const email = currentUser?.email || '';
    return '<div class="connection-modal" id="connection-modal" role="dialog" aria-modal="true" aria-labelledby="connection-title">' +
      '<div class="connection-dialog"><div class="connection-dialog-header"><div><h2 id="connection-title">Připojit účet Bazoš</h2><p>Vyplňte údaje používané na Bazoši. Tím vznikne vazba mezi vaším Alfares účtem a Bazoš identitou; ověření telefonu a relace se dokončuje podle pravidel Bazoš.cz.</p></div><button class="icon-button" data-close-identity-wizard type="button" aria-label="Zavřít">×</button></div>' +
      '<form class="form-panel panel-stack" id="identity-wizard-form"><div class="connection-requirement"><strong>Požadavek na e-mail</strong>E-mail na Bazoši musí být stejný jako v Alfares Auth. Aktuální Alfares e-mail: ' + cell(email || 'není k dispozici') + '.</div><div class="form-grid">' +
      '<label class="wide">E-mail Alfares / Bazoš<input name="authEmail" value="' + cell(email) + '" readonly></label>' +
      '<label>Telefon Bazoš<input name="phoneNumber" minlength="9" maxlength="20" autocomplete="tel" required></label>' +
      '<label>Název účtu<input name="displayName" maxlength="200" required></label>' +
      '<label>Kontaktní jméno<input name="contactName" maxlength="200" autocomplete="name"></label>' +
      '<label>Kontaktní telefon<input name="contactPhone" maxlength="50" autocomplete="tel"></label>' +
      '<label>PSČ<input name="defaultZip" maxlength="20" autocomplete="postal-code"></label>' +
      '<label>Lokalita<input name="defaultLocation" maxlength="200" autocomplete="address-level2"></label>' +
      '<label class="wide">Poznámky<textarea name="notes" placeholder="Doplňující informace k ručnímu ověření nebo propojení účtu"></textarea></label>' +
      '</div><p class="form-message" data-form-message></p><div class="flow-actions"><button class="button button-primary" type="submit">Uložit a připojit</button><button class="button button-secondary" data-close-identity-wizard type="button">Dokončit později</button></div></form></div></div>';
  }

  function openConnectionWizard(auto) {
    if (mode !== 'client') return;
    if (document.getElementById('connection-modal')) return;
    document.body.insertAdjacentHTML('beforeend', connectionWizardMarkup());
    document.getElementById('identity-wizard-form')?.addEventListener('submit', createIdentity);
    document.querySelectorAll('[data-close-identity-wizard]').forEach((button) => button.addEventListener('click', () => {
      if (auto) sessionStorage.setItem(connectionWizardKey(), 'dismissed');
      closeConnectionWizard();
    }));
  }

  function closeConnectionWizard() {
    document.getElementById('connection-modal')?.remove();
  }

  function bindIdentityWizardButtons() {
    document.querySelectorAll('[data-open-identity-wizard]').forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => openConnectionWizard(false));
    });
  }

  function maybeAutoOpenConnectionWizard(data) {
    if (mode !== 'client' || hasLinkedBazosIdentity(data)) return;
    if (sessionStorage.getItem(connectionWizardKey())) return;
    openConnectionWizard(true);
  }

  async function renderAdmin() {
    content.innerHTML = '<div class="data-panel empty-state">Načítají se administrátorská data...</div>';
    const summary = await request('/api/bazos/monitoring/summary').catch((error) => ({ error: error.message }));
    const blocked = await request('/api/bazos/monitoring/blocked-attempts?limit=25').catch(() => []);
    if (summary.error) {
      content.innerHTML = '<div class="data-panel empty-state">' + escapeHtml(summary.error) + '</div>';
      return;
    }
    if (activeView === 'overview') {
      content.innerHTML =
        '<div class="summary-grid">' +
        stat('Pokusy o publikování', summary.publishAttempts || summary.totalPublishAttempts || 0) +
        stat('Blokované pokusy', summary.blockedAttempts || asArray(blocked, ['items', 'blockedAttempts']).length || 0) +
        stat('Identity ke kontrole', summary.reviewIdentities || summary.identitiesNeedingReview || 0) +
        stat('Sledované aktivní inzeráty', summary.activeAds || summary.activeAdsTracked || 0) +
        '</div><div class="data-panel"><h2>Zaměření administrátora</h2><p class="card-note">Kontrolujte blokované pokusy a identity vyžadující ruční zásah. Kontroly publikování nadále vynucují backendová pravidla.</p></div>';
    } else {
      const rows = asArray(blocked, ['items', 'blockedAttempts']);
      content.innerHTML = table([
        { label: 'Pokus', render: (r) => cell(r.id || r.attemptId) },
        { label: 'Inzerát', render: (r) => cell(r.offerId || r.adId || r.productId) },
        { label: 'Důvod', render: (r) => '<span class="status ' + statusClass(r.reason || r.status) + '">' + statusLabel(r.reason || r.status) + '</span>' },
        { label: 'Vytvořeno', render: (r) => cell(r.createdAt || r.updatedAt) },
      ], rows, 'Monitorovací endpoint nevrátil žádné blokované pokusy.');
    }
  }

  async function policyCheck(id) {
    content.innerHTML = '<div class="data-panel empty-state">Kontrolují se pravidla...</div>';
    try {
      const result = await request('/api/bazos/ads/' + encodeURIComponent(id) + '/evaluate-policy', { method: 'POST', body: '{}' });
      content.innerHTML = '<div class="data-panel"><h2>Výsledek kontroly pravidel</h2><pre>' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre></div>';
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + escapeHtml(error.message) + '</div>';
    }
  }

  async function enqueuePublish(id) {
    const confirmed = window.confirm('Potvrďte, že jste ručně zkontrolovali duplicitu a obsah inzerátu. Žádost se odešle pouze do hlídané fronty a backend znovu vyhodnotí pravidla.');
    if (!confirmed) return;
    content.innerHTML = '<div class="data-panel empty-state">Odesílá se žádost do hlídané publikační fronty...</div>';
    try {
      const result = await request('/api/bazos/ads/' + encodeURIComponent(id) + '/publish', { method: 'POST', body: JSON.stringify(manualEvidence()) });
      content.innerHTML = '<div class="data-panel"><h2>Výsledek fronty</h2><pre>' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre></div>';
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + escapeHtml(error.message) + '</div>';
    }
  }

  async function createDraft(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      identityId: data.identityId,
      productId: data.productId || undefined,
      title: data.title,
      description: data.description || undefined,
      price: Number(data.price || 0),
      category: data.category || undefined,
      location: data.location || undefined,
      stockQuantity: data.stockQuantity ? Number(data.stockQuantity) : 0,
    };
    try {
      const draft = await request('/api/bazos/ads', { method: 'POST', body: JSON.stringify(payload) });
      if (data.enqueue === 'on') {
        await request('/api/bazos/ads/' + encodeURIComponent(draft.id) + '/publish', { method: 'POST', body: JSON.stringify(manualEvidence()) });
      }
      activeView = 'details';
      syncActiveTabs();
      await renderClient();
    } catch (error) {
      content.querySelector('[data-form-message]').textContent = error.message;
    }
  }

  async function createIdentity(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const authEmail = String(currentUser?.email || data.authEmail || '').trim();
    const notes = [data.notes, authEmail ? 'E-mail v Alfares Auth se musí shodovat s e-mailem účtu na Bazoši: ' + authEmail : ''].filter(Boolean).join('\\n');
    const payload = {
      phoneNumber: data.phoneNumber,
      displayName: data.displayName,
      contactName: data.contactName || undefined,
      contactPhone: data.contactPhone || undefined,
      defaultZip: data.defaultZip || undefined,
      defaultLocation: data.defaultLocation || undefined,
      notes: notes || undefined,
    };
    const formMessage = form.querySelector('[data-form-message]') || content.querySelector('[data-form-message]');
    try {
      await request('/api/bazos/identities', { method: 'POST', body: JSON.stringify(payload) });
      sessionStorage.setItem(connectionWizardKey(), 'completed');
      closeConnectionWizard();
      activeView = 'account';
      syncActiveTabs();
      await renderClient();
    } catch (error) {
      if (formMessage) formMessage.textContent = error.message;
    }
  }

  function renderOverview(data) {
    if (data.adsError || data.identitiesError) {
      content.innerHTML = '<div class="data-panel empty-state">' + escapeHtml(data.adsError || data.identitiesError) + '</div>';
      return;
    }
    const summary = accountSummary(data.identities, data.ads, data.queue);
    const identitiesNeedingReview = data.identities.filter((identity) => !isVerified(identity) || !hasActiveSession(identity) || !isReviewClear(identity)).length;
    const identityRows = data.identities.map((identity) => ({
      ...identity,
      activeCount: identityActiveCount(identity, data.ads),
      remaining: isVerified(identity) ? Math.max(50 - identityActiveCount(identity, data.ads), 0) : 0,
    }));
    const recentAds = data.ads.slice(0, 8);
    content.innerHTML =
      '<div class="summary-grid overview-stats">' +
      stat('Stav přihlášení', 'Přihlášeno', 'Alfares Auth relace je aktivní') +
      stat('Ověřené identity', summary.publishable.length + ' / ' + data.identities.length, identitiesNeedingReview ? identitiesNeedingReview + ' vyžaduje kontrolu' : 'Telefon a relace připraveny') +
      stat('Zbývá vložit', summary.capacityRemaining, summary.capacityUsed + ' z ' + summary.capacityTotal + ' aktivních míst použito') +
      stat('Tento měsíc', summary.monthCreated, summary.monthPublished + ' publikováno') +
      stat('Celkem inzerátů', data.ads.length, summary.publishedAds + ' publikováno') +
      stat('Aktivní na Bazoši', summary.activeAds, 'Limit je 50 aktivních na ověřenou identitu') +
      stat('Vyžaduje kontrolu', data.ads.filter((ad) => statusClass(ad.publishStatus || ad.status || ad.bazosStatus) === 'risk').length, 'Blokované stavy nebo výzvy k ručnímu zásahu') +
      stat('Ve frontě', summary.queued, 'Hlídané publikování čeká na pravidla a cadence') +
      '</div><div class="overview-actions"><button class="button button-primary" data-nav-view="publish" type="button">Přidat inzerát</button><button class="button button-secondary" data-nav-view="details" type="button">Otevřít moje inzeráty</button>' + (!hasLinkedBazosIdentity(data) ? '<button class="button button-primary" data-open-identity-wizard type="button">Připojit účet Bazoš</button>' : '') + '</div>' +
      '<div class="overview-grid">' +
      '<div class="data-panel"><h2>Moje identity na Bazoši</h2>' +
      tableOnly([
        { label: 'Identita', render: (r) => '<strong>' + cell(r.displayName || r.contactName || r.id) + '</strong><small class="card-note">Telefon: ' + (isVerified(r) ? 'ověřen' : 'neověřen') + '</small>' },
        { label: 'Bazoš stav', render: (r) => '<span class="status ' + (isPublishableIdentity(r) ? 'ok' : 'risk') + '">' + (isPublishableIdentity(r) ? 'Připraveno' : 'Vyžaduje zásah') + '</span><small class="card-note">' + statusLabel(r.status) + ' / ' + statusLabel(r.sessionState) + ' / ' + statusLabel(r.reviewState || 'clear') + '</small>' },
        { label: 'Kapacita', render: (r) => '<strong>' + cell(r.remaining) + '</strong><small class="card-note">zbývá z 50, aktivní ' + cell(r.activeCount) + '</small>' },
      ], identityRows, 'Pro tento účet zatím není připojena žádná Bazoš identita.') +
      '</div><div class="data-panel"><h2>Moje inzeráty v přehledu</h2>' +
      tableOnly([
        { label: 'Inzerát', render: (r) => '<strong>' + cell(r.title || r.name || r.productName || r.id) + '</strong><small class="card-note">' + cell(r.category || r.categoryName || r.bazosCategory || r.productId || '') + '</small>' },
        { label: 'Stav', render: (r) => '<span class="status ' + statusClass(r.publishStatus || r.status || r.bazosStatus) + '">' + statusLabel(r.publishStatus || r.status || r.bazosStatus || 'draft') + '</span>' },
        { label: 'Odkaz', render: (r) => bazosAdUrl(r) ? '<a class="table-link" href="' + escapeHtml(bazosAdUrl(r)) + '" target="_blank" rel="noopener">Zobrazit na Bazoši</a>' : '<button class="link-button" data-nav-view="details" type="button">Otevřít v mých inzerátech</button>' },
      ], recentAds, 'Pro tento účet nebyly vráceny žádné inzeráty.') +
      '</div></div>';
    bindContentNavButtons();
    bindIdentityWizardButtons();
  }

  function renderDetails(data) {
    content.innerHTML = table([
      { label: 'Inzerát', render: (r) => '<strong>' + cell(r.title || r.name || r.productName || r.id) + '</strong><small class="card-note">' + cell(r.productId || r.sku || '') + '</small>' },
      { label: 'Stav na Bazoši', render: (r) => '<span class="status ' + statusClass(r.status || r.bazosStatus || r.publishStatus) + '">' + statusLabel(r.status || r.bazosStatus || r.publishStatus || 'draft') + '</span>' },
      { label: 'Kategorie', render: (r) => cell(r.category || r.categoryName || r.bazosCategory) },
      { label: 'Odkaz', render: (r) => bazosAdUrl(r) ? '<a class="table-link" href="' + escapeHtml(bazosAdUrl(r)) + '" target="_blank" rel="noopener">Zobrazit</a>' : cell('Zatím bez Bazoš ID') },
      { label: 'Aktualizováno', render: (r) => cell(r.updatedAt || r.createdAt) },
      { label: 'Akce', render: (r) => '<div class="row-actions"><button class="button button-secondary" data-policy="' + cell(r.id) + '" type="button">Pravidla</button><button class="button button-primary" data-publish="' + cell(r.id) + '" type="button">Publikovat</button></div>' },
    ], data.ads, 'Pro tento účet nebyly vráceny žádné inzeráty.');
    content.querySelectorAll('[data-policy]').forEach((button) => button.addEventListener('click', () => policyCheck(button.dataset.policy)));
    content.querySelectorAll('[data-publish]').forEach((button) => button.addEventListener('click', () => enqueuePublish(button.dataset.publish)));
  }

  function renderPublish(data) {
    if (!data.identities.length) {
      content.innerHTML = '<div class="data-panel empty-state">Nejdříve připojte účet Bazoš.<div class="flow-actions" style="justify-content:center;margin-top:14px"><button class="button button-primary" data-open-identity-wizard type="button">Připojit účet Bazoš</button></div></div>';
      bindIdentityWizardButtons();
      return;
    }
    content.innerHTML = '<form class="form-panel panel-stack" id="draft-form"><div><h2>Nový inzerát pro Bazos.cz</h2><p class="card-note">Vyberte ověřenou identitu, vyplňte inzerát a případně ho zařaďte do hlídané publikační fronty.</p></div><div class="form-grid">' +
      '<label>Účet / telefon<select name="identityId" required>' + renderIdentityOptions(data.identities) + '</select></label>' +
      '<label>Cena v Kč<input name="price" type="number" min="0" step="1" required></label>' +
      '<label class="wide">Název<input name="title" maxlength="500" required></label>' +
      '<label class="wide">Popis<textarea name="description"></textarea></label>' +
      '<label>Kategorie Bazos.cz<input name="category" maxlength="200"></label>' +
      '<label>Lokalita<input name="location" maxlength="200"></label>' +
      '<label>Produkt ID<input name="productId" placeholder="volitelné UUID"></label>' +
      '<label>Sklad<input name="stockQuantity" type="number" min="0" step="1" value="0"></label>' +
      '<label class="check-row"><input name="enqueue" type="checkbox"><span>Po vytvoření rovnou odeslat do fronty. Potvrzuji ruční kontrolu duplicity a obsahu.</span></label>' +
      '</div><p class="form-message" data-form-message></p><button class="button button-primary" type="submit">Vytvořit inzerát</button></form>';
    document.getElementById('draft-form').addEventListener('submit', createDraft);
  }

  function renderAccount(data) {
    const summary = accountSummary(data.identities, data.ads, data.queue);
    content.innerHTML = '<div class="summary-grid">' +
      stat('Bazoš identity', data.identities.length) +
      stat('Ověřené telefony', data.identities.filter(isVerified).length) +
      stat('Aktivní relace', data.identities.filter(hasActiveSession).length) +
      stat('Může publikovat', summary.publishable.length) +
      '</div>' + table([
        { label: 'Účet', render: (r) => '<strong>' + cell(r.displayName || r.phoneNumber) + '</strong><small class="card-note">Propojení účtu: ' + (hasLinkedAccount(r) ? 'propojeno' : 'čeká na dokončení') + '</small>' },
        { label: 'Telefon', render: (r) => '<span class="status ' + (isVerified(r) ? 'ok' : 'risk') + '">' + statusLabel(r.status) + '</span><small class="card-note">' + cell(r.phoneNumber) + '</small>' },
        { label: 'Relace', render: (r) => '<span class="status ' + statusClass(r.sessionState) + '">' + statusLabel(r.sessionState) + '</span>' },
        { label: 'Publikování', render: (r) => '<span class="status ' + (isPublishableIdentity(r) ? 'ok' : 'risk') + '">' + (isPublishableIdentity(r) ? 'Může publikovat' : 'Nelze publikovat') + '</span><small class="card-note">Aktivní: ' + cell(r.activeAdCount || 0) + ' / 50</small>' },
        { label: 'Kontrola', render: (r) => '<span class="status ' + statusClass(r.reviewState) + '">' + statusLabel(r.reviewState || 'clear') + '</span><small class="card-note">Platnost: ' + cell(r.verificationExpiresAt) + '</small>' },
      ], data.identities, 'Pro účet nejsou nastavené žádné Bazos identity.');
  }

  function renderSettings(data) {
    content.innerHTML = '<div class="account-grid"><form class="form-panel panel-stack" id="identity-form"><div><h2>Nastavení Bazos.cz</h2><p class="card-note">Přidejte telefon a údaje prodejce. Interní ID Bazoš účtu není potřeba hledat ani vyplňovat; systém ho doplní při propojení účtu. Ověření telefonu a relace se dokončuje ručně přes Bazos.cz.</p></div><div class="form-grid">' +
      '<label>Telefon<input name="phoneNumber" minlength="9" maxlength="20" required></label>' +
      '<label>Název účtu<input name="displayName" maxlength="200" required></label>' +
      '<label>Kontaktní jméno<input name="contactName" maxlength="200"></label>' +
      '<label>Kontaktní telefon<input name="contactPhone" maxlength="50"></label>' +
      '<label>PSČ<input name="defaultZip" maxlength="20"></label>' +
      '<label>Lokalita<input name="defaultLocation" maxlength="200"></label>' +
      '<label class="wide">Poznámky<textarea name="notes" placeholder="např. informace pro správce k propojení účtu"></textarea></label>' +
      '</div><p class="form-message" data-form-message></p><button class="button button-primary" type="submit">Uložit nastavení</button></form><div class="data-panel"><h2>Co musí být splněno</h2><div class="gate-grid"><div class="gate-item"><strong>Telefon</strong>ověřený</div><div class="gate-item"><strong>Relace</strong>aktivní</div><div class="gate-item"><strong>Kontrola</strong>bez blokace</div><div class="gate-item"><strong>Účet</strong>propojený systémem</div><div class="gate-item"><strong>Limit</strong>méně než 50 aktivních inzerátů</div></div></div></div>' +
      table([
        { label: 'Identita', render: (r) => cell(r.displayName || r.phoneNumber) },
        { label: 'Stav', render: (r) => '<span class="status ' + statusClass(r.status) + '">' + statusLabel(r.status) + '</span>' },
        { label: 'Relace', render: (r) => '<span class="status ' + statusClass(r.sessionState) + '">' + statusLabel(r.sessionState) + '</span>' },
        { label: 'Může publikovat', render: (r) => '<span class="status ' + (isPublishableIdentity(r) ? 'ok' : 'risk') + '">' + (isPublishableIdentity(r) ? 'Ano' : 'Ne') + '</span><small class="card-note">' + (hasLinkedAccount(r) ? 'Účet je propojený' : 'Čeká na propojení účtu') + '</small>' },
      ], data.identities, 'Zatím není uložené žádné nastavení Bazos.cz.');
    document.getElementById('identity-form').addEventListener('submit', createIdentity);
  }


  async function renderCatalog(data) {
    content.innerHTML = '<div class="data-panel empty-state">Načítá se katalog...</div>';
    let prepared = null;
    let products = [];
    let selected = null;

    const productPrice = (product) => {
      const pricing = Array.isArray(product?.pricing) ? product.pricing[0] : product?.pricing;
      return Number(pricing?.basePrice || pricing?.price || product?.price || product?.salePrice || 0);
    };
    const productCategory = (product) => {
      const category = Array.isArray(product?.categories) ? product.categories[0] : product?.category;
      return category?.bazosCategory || category?.name || category?.title || product?.categoryName || product?.category || '';
    };
    const productDescription = (product) => product?.description || product?.shortDescription || '';
    const productTitle = (product) => product?.name || product?.title || product?.sku || product?.id || '';
    const selectedIdentityId = () => document.getElementById('catalog-draft-form')?.elements.identityId?.value || data.identities[0]?.id || '';

    async function loadProducts(search) {
      const query = new URLSearchParams({ limit: '20', activeOnly: 'true' });
      if (search) query.set('search', search);
      const catalog = await request('/ui/catalog/products?' + query.toString()).catch((error) => ({ error: error.message }));
      if (catalog.error) throw new Error(catalog.error);
      products = asArray(catalog, ['items', 'products', 'data']);
      selected = products[0] || null;
    }

    function renderPreview() {
      if (!prepared?.draft) return '';
      const draft = prepared.draft;
      const allowed = Boolean(prepared.policyStatus?.allowed);
      return '<div class="preview-card">' +
        '<div class="panel-header"><h2>Náhled pro Bazoš</h2><span class="status ' + (allowed ? 'ok' : 'risk') + '">' + (allowed ? 'Pravidla splněna' : 'Vyžaduje kontrolu') + '</span></div>' +
        '<h3 class="preview-title">' + cell(draft.title) + '</h3>' +
        '<div class="preview-price">' + cell(draft.price) + ' Kč</div>' +
        '<div class="preview-description">' + cell(document.getElementById('catalog-draft-form')?.elements.description?.value || selected?.description || '') + '</div>' +
        '<div class="flow-meta">' +
          '<span>Kategorie<strong>' + cell(draft.category) + '</strong></span>' +
          '<span>Mapování<strong>' + (prepared.categoryMapping?.mapped ? 'Nalezeno' : 'Chybí / ke kontrole') + '</strong></span>' +
          '<span>Aktivní inzeráty identity<strong>' + cell(prepared.identity?.activeAdCount) + '</strong></span>' +
          '<span>Další krok<strong>' + cell(prepared.nextAction) + '</strong></span>' +
        '</div>' +
        (prepared.requiresHumanAction?.required ? '<p class="form-message">Vyžaduje zásah: ' + cell(prepared.requiresHumanAction.reason) + '</p>' : '') +
        '<div class="flow-actions"><button class="button button-primary" id="catalog-confirm" type="button"' + (allowed ? '' : ' disabled') + '>Schválit a odeslat na Bazoš</button><button class="button button-secondary" data-policy="' + cell(draft.id) + '" type="button">Ověřit pravidla</button></div>' +
      '</div>';
    }

    function fillForm(product) {
      const form = document.getElementById('catalog-draft-form');
      if (!form || !product) return;
      form.elements.title.value = productTitle(product);
      form.elements.description.value = productDescription(product);
      form.elements.price.value = productPrice(product);
      form.elements.category.value = productCategory(product);
      form.elements.location.value = '';
    }

    function draw(searchValue) {
      const options = data.identities.length ? renderIdentityOptions(data.identities) : '';
      content.innerHTML = '<div class="catalog-flow"><div class="data-panel flow-column"><h2>Katalog</h2><div class="search-row"><input class="input" id="catalog-search" value="' + cell(searchValue || '') + '" placeholder="Hledat produkt podle názvu, SKU nebo značky"><button class="button button-secondary" id="catalog-search-button" type="button">Hledat</button></div><div class="product-list">' +
        products.map((product, index) => '<button class="product-option' + (product === selected ? ' active' : '') + '" type="button" data-product-index="' + index + '"><span class="product-thumb"></span><span><strong>' + cell(productTitle(product)) + '</strong><small class="card-note">' + cell(product.sku || product.id) + '</small></span></button>').join('') +
        '</div></div><div class="flow-column"><form class="form-panel panel-stack" id="catalog-draft-form"><div><h2>Publikovat z katalogu</h2><p class="card-note">Produkt se nejdříve převede do Basus konceptu. Teprve po náhledu a schválení se odešle do hlídané publikační fronty.</p></div><div class="form-grid"><label>Účet / telefon<select name="identityId" required>' + options + '</select></label><label>Cena v Kč<input name="price" type="number" min="0" step="1" required></label><label class="wide">Název<input name="title" maxlength="500" required></label><label class="wide">Popis<textarea name="description"></textarea></label><label>Kategorie Bazos.cz<input name="category" maxlength="200" required></label><label>Lokalita<input name="location" maxlength="200"></label></div><p class="form-message" data-form-message></p><button class="button button-primary" type="submit">Sformovat inzerát</button></form>' + renderPreview() + '</div></div>';
      fillForm(selected);
      document.getElementById('catalog-search-button')?.addEventListener('click', async () => {
        prepared = null;
        await loadProducts(document.getElementById('catalog-search').value.trim());
        draw(document.getElementById('catalog-search').value.trim());
      });
      content.querySelectorAll('[data-product-index]').forEach((button) => button.addEventListener('click', () => {
        selected = products[Number(button.dataset.productIndex)];
        prepared = null;
        draw(document.getElementById('catalog-search')?.value || '');
      }));
      document.getElementById('catalog-draft-form')?.addEventListener('submit', prepare);
      document.getElementById('catalog-confirm')?.addEventListener('click', confirm);
      content.querySelector('[data-policy]')?.addEventListener('click', () => policyCheck(prepared?.draft?.id));
    }

    async function prepare(event) {
      event.preventDefault();
      if (!selected) return;
      const form = event.currentTarget;
      const values = Object.fromEntries(new FormData(form).entries());
      try {
        prepared = await request('/api/bazos/catalog/products/' + encodeURIComponent(selected.id) + '/sell-action', {
          method: 'POST',
          body: JSON.stringify({
            identityId: values.identityId,
            title: values.title,
            description: values.description || undefined,
            price: Number(values.price || 0),
            category: values.category,
            location: values.location || undefined,
            stockQuantity: Number(selected.stockQuantity || selected.stock || 0),
          }),
        });
        draw(document.getElementById('catalog-search')?.value || '');
      } catch (error) {
        content.querySelector('[data-form-message]').textContent = error.message;
      }
    }

    async function confirm() {
      if (!selected || !prepared?.draft?.id) return;
      try {
        prepared = await request('/api/bazos/catalog/products/' + encodeURIComponent(selected.id) + '/sell-action/confirm', {
          method: 'POST',
          body: JSON.stringify(Object.assign({ adId: prepared.draft.id, confirmed: true }, manualEvidence())),
        });
        draw(document.getElementById('catalog-search')?.value || '');
      } catch (error) {
        content.querySelector('[data-form-message]').textContent = error.message;
      }
    }

    try {
      await loadProducts('');
      if (!products.length) {
        content.innerHTML = '<div class="data-panel empty-state">Katalog nevrátil žádné aktivní produkty.</div>';
        return;
      }
      if (!data.identities.length) {
        content.innerHTML = '<div class="data-panel empty-state">Nejdříve připojte účet Bazoš.<div class="flow-actions" style="justify-content:center;margin-top:14px"><button class="button button-primary" data-open-identity-wizard type="button">Připojit účet Bazoš</button></div></div>';
        bindIdentityWizardButtons();
        return;
      }
      draw('');
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + escapeHtml(error.message) + '</div>';
    }
  }

  async function renderClient() {
    content.innerHTML = '<div class="data-panel empty-state">Načítají se data Bazos.cz...</div>';
    const data = await loadClientData();
    renderConnectionBanner(data);
    maybeAutoOpenConnectionWizard(data);
    if (activeView === 'overview') return renderOverview(data);
    if (activeView === 'details') return renderDetails(data);
    if (activeView === 'publish') return renderPublish(data);
    if (activeView === 'account') return renderAccount(data);
    if (activeView === 'settings') return renderSettings(data);
    if (activeView === 'catalog') return renderCatalog(data);
  }

  function bindContentNavButtons() {
    content.querySelectorAll('[data-nav-view], [data-sidebar-view]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        activeView = button.dataset.navView || button.dataset.sidebarView;
        syncActiveTabs();
        render();
      });
    });
  }

  function syncActiveTabs() {
    document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item.dataset.view === activeView));
    document.querySelectorAll('[data-nav-view]').forEach((item) => item.classList.toggle('active', item.dataset.navView === activeView));
    document.querySelectorAll('[data-sidebar-view]').forEach((item) => item.classList.toggle('active', item.dataset.sidebarView === activeView));
  }

  async function render() {
    if (!token()) return showAuth();
    try {
      const me = await request('/ui/auth/me?mode=' + encodeURIComponent(mode));
      showWorkspace(me.user, me.access);
      syncActiveTabs();
      if (mode === 'admin') await renderAdmin();
      else await renderClient();
    } catch (error) {
      setMessage(error.message);
    }
  }

  signOut.addEventListener('click', () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshTokenKey);
    sessionStorage.removeItem(authStateKey);
    sessionStorage.removeItem(authReturnKey);
    showAuth();
  });

  document.querySelectorAll('[data-auth-action]').forEach((button) => {
    button.addEventListener('click', () => startHostedAuth(button.dataset.authAction));
  });

  document.querySelectorAll('[data-nav-view], [data-sidebar-view]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      activeView = link.dataset.navView || link.dataset.sidebarView;
      const hash = activeView === 'settings' ? 'bazos-settings' : activeView;
      window.history.replaceState(null, document.title, '/client#' + hash);
      syncActiveTabs();
      render();
    });
  });

  const requestedAuthAction = new URLSearchParams(window.location.search).get('auth');
  if (mode === 'client' && !token()) {
    const action = requestedAuthAction === 'register' ? 'register' : 'login';
    window.history.replaceState(null, document.title, '/client');
    startHostedAuth(action);
    return;
  }

  refresh.addEventListener('click', render);
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeView = tab.dataset.view;
      if (window.location.hash) window.history.replaceState(null, document.title, mode === 'admin' ? '/admin' : '/client');
      syncActiveTabs();
      render();
    });
  });

  render();
})();
`;
