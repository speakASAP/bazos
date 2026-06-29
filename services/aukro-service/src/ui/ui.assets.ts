type AppMode = 'admin' | 'client';

const pageShell = (title: string, body: string) => `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="Služba AlfaRes Bazoš pomáhá prodejcům připravovat, sledovat a spravovat inzeráty na Bazoš.cz v souladu s pravidly.">
  <link rel="stylesheet" href="/ui/app.css?v=settings-defaults-20260629">
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
    ? `<a class="active" href="/admin">${icon('admin')}Administrace</a>
          <a href="/client">${icon('client')}Klientský panel</a>`
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
    <script src="/ui/app.js?v=active-status-20260629"></script>`,
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
.identity-required-banner .setup-link { margin-top: 6px; }
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
.table-link, .link-button, .setup-link {
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
.setup-link { display: inline-block; margin-top: 10px; }
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
.settings-field-list {
  display: grid;
  gap: 6px;
  min-width: 220px;
}
.settings-field-list span {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 8px;
  color: var(--muted);
  line-height: 1.35;
}
.settings-field-list strong { color: var(--ink); }
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
.category-suggestions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff7ed;
}
.category-chip {
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}
.category-chip.active {
  border-color: var(--red);
  background: var(--red);
  color: #fff;
}
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
.account-tools {
  display: grid;
  gap: 12px;
  margin: 16px 0;
}
.bulk-account-help {
  display: grid;
  gap: 6px;
}
.bulk-account-help code {
  padding: 2px 5px;
  border-radius: 6px;
  background: var(--panel-strong);
  color: var(--ink);
}
.gate-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.gate-item { padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
.gate-item strong { display: block; margin-bottom: 4px; }
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.policy-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 420px;
}
.policy-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}
.policy-chip::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}
.policy-chip.ok {
  border-color: #b7dfb9;
  background: #effaf0;
  color: var(--green);
}
.policy-chip.wait {
  border-color: #ecd37f;
  background: #fff8dd;
  color: var(--amber);
}
.policy-chip.risk {
  border-color: #f3b7b0;
  background: var(--danger-bg);
  color: var(--danger-text);
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
.manual-media-panel {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.manual-media-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
.manual-media-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
}
.manual-media-preview img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
}
.media-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.media-choice {
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.media-choice label {
  display: grid;
  gap: 6px;
  padding: 8px;
  font-size: 13px;
}
.media-choice img,
.preview-media img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}
.preview-media {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
  margin-top: 14px;
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
  const catalogProductId = new URLSearchParams(window.location.search).get('productId')?.trim() || '';
  let activeView = initialView();
  let currentUser = null;
  let publishWorkerBusy = false;
  let publishWorkerTimer = null;
  let accountBulkOpen = false;
  let editingIdentityId = null;
  const BAZOS_TITLE_MAX_LENGTH = 500;
  const BAZOS_DESCRIPTION_MAX_LENGTH = 5000;
  const BAZOS_MEDIA_LIMIT = 20;
  const BAZOS_RUBRICS = [{"slug":"auto","label":"Auto","categories":[{"name":"Alfa Romeo"},{"name":"Audi"},{"name":"BMW"},{"name":"Citroën"},{"name":"Dacia"},{"name":"Fiat"},{"name":"Ford"},{"name":"Honda"},{"name":"Hyundai"},{"name":"Chevrolet"},{"name":"Kia"},{"name":"Mazda"},{"name":"Mercedes-Benz"},{"name":"Mitsubishi"},{"name":"Nissan"},{"name":"Opel"},{"name":"Peugeot"},{"name":"Renault"},{"name":"Seat"},{"name":"Suzuki"},{"name":"Škoda"},{"name":"Toyota"},{"name":"Volkswagen"},{"name":"Volvo"},{"name":"Ostatní značky"},{"name":"Autorádia"},{"name":"GPS navigace"},{"name":"Havarovaná auta"},{"name":"Náhradní díly"},{"name":"Pneumatiky, kola"},{"name":"Příslušenství"},{"name":"Tuning"},{"name":"Veteráni"},{"name":"Autobusy"},{"name":"Dodávky"},{"name":"Mikrobusy"},{"name":"Karavany, obytná auta"},{"name":"Nákladní auta"},{"name":"Pick-up"},{"name":"Vozíky, přívěsy"},{"name":"Stroje"},{"name":"Ostatní"},{"name":"Havarovaná"},{"name":"Náhradní díly"},{"name":"Motorky, Skútry"}]},{"slug":"deti","label":"Děti","categories":[{"name":"Autosedačky"},{"name":"Baby monitory, chůvičky"},{"name":"Dětská literatura"},{"name":"Hračky"},{"name":"Hlídání dětí"},{"name":"Chodítka a hopsadla"},{"name":"Kočárky"},{"name":"Kojenecké potřeby"},{"name":"Kola"},{"name":"Lego"},{"name":"Nábytek pro děti"},{"name":"Nosítka"},{"name":"Odrážedla"},{"name":"Sedačky na kolo"},{"name":"Sportovní potřeby"},{"name":"Školní potřeby"},{"name":"Ostatní"},{"name":"Body, dupačky a overaly"},{"name":"Bundy a kabátky"},{"name":"Čepice a kloboučky"},{"name":"Kalhoty, kraťasy a tepláky"},{"name":"Kombinézy"},{"name":"Komplety"},{"name":"Mikiny a svetry"},{"name":"Obuv"},{"name":"Plavky"},{"name":"Ponožky a punčocháče"},{"name":"Pyžámka a župánky"},{"name":"Rukavice a šály"},{"name":"Spodní prádlo"},{"name":"Sukýnky a šatičky"},{"name":"Těhotenské oblečení"},{"name":"Trička a košile"},{"name":"Ostatní oblečení"}]},{"slug":"dum","label":"Dům a zahrada","categories":[{"name":"Bazény"},{"name":"Čerpadla"},{"name":"Dveře, vrata"},{"name":"Klimatizace"},{"name":"Kotle, Kamna, Bojlery"},{"name":"Malotraktory, Kultivátory"},{"name":"Míchačky"},{"name":"Nářadí"},{"name":"Okna"},{"name":"Pily"},{"name":"Radiátory"},{"name":"Rostliny"},{"name":"Sekačky"},{"name":"Sněžná technika"},{"name":"Stavební materiál"},{"name":"Vybavení dílen"},{"name":"Vysavače/Foukače"},{"name":"Zahradní grily"},{"name":"Zahradní nábytek"},{"name":"Zahradní technika"},{"name":"Ostatní"}]},{"slug":"elektro","label":"Elektro","categories":[{"name":"Digestoře"},{"name":"Ledničky"},{"name":"Mikrovlnné trouby"},{"name":"Mrazáky"},{"name":"Myčky"},{"name":"Pračky"},{"name":"Sporáky"},{"name":"Sušičky"},{"name":"Ostatní - bílá"},{"name":"Autorádia"},{"name":"Domácí kina"},{"name":"Fotoaparáty"},{"name":"GPS navigace"},{"name":"Hifi systémy, Rádia"},{"name":"Hudební nástroje"},{"name":"Projektory"},{"name":"Repro soustavy"},{"name":"Sluchátka"},{"name":"Televizory"},{"name":"Video, DVD přehrávače"},{"name":"Videokamery"},{"name":"Zesilovače"},{"name":"Ostatní audio video"},{"name":"Epilátory, Depilátory"},{"name":"Fény, Kulmy"},{"name":"Holící strojky"},{"name":"Kávovary"},{"name":"Nabíječky baterií"},{"name":"Ruční šlehače, Mixéry"},{"name":"Svítidla, Lampy"},{"name":"Šicí stroje"},{"name":"Vysavače"},{"name":"Vysílačky"},{"name":"Zvlhčovače vzduchu"},{"name":"Žehličky"},{"name":"Ostatní drobné"}]},{"slug":"foto","label":"Foto","categories":[{"name":"Analogové fotoaparáty"},{"name":"Digitální fotoaparáty"},{"name":"Drony"},{"name":"Videokamery"},{"name":"Zrcadlovky"},{"name":"Baterie"},{"name":"Blesky a osvětlení"},{"name":"Brašny a pouzdra"},{"name":"Datové kabely"},{"name":"Filtry"},{"name":"Nabíječky baterií"},{"name":"Objektivy"},{"name":"Paměťové karty"},{"name":"Stativy"},{"name":"Ostatní"}]},{"slug":"hudba","label":"Hudba","categories":[{"name":"Bicí nástroje"},{"name":"Dechové nástroje"},{"name":"Klávesové nástroje"},{"name":"Smyčcové nástroje"},{"name":"Strunné nástroje"},{"name":"Ostatní nástroje"},{"name":"DVD, CD, MC, LP"},{"name":"Hudebníci a skupiny"},{"name":"Koncerty"},{"name":"Noty, texty"},{"name":"Světelná technika"},{"name":"Vstupenky"},{"name":"Výuka hudby"},{"name":"Zkušebny"},{"name":"Zvuková technika"},{"name":"Ostatní"}]},{"slug":"knihy","label":"Knihy","categories":[{"name":"Beletrie"},{"name":"Detektivky, thrillery"},{"name":"Historické romány"},{"name":"Humor"},{"name":"Knihy pro ženy"},{"name":"Komiksy"},{"name":"Poezie"},{"name":"Sci-fi, Fantasy"},{"name":"Životopisy"},{"name":"Pro nejmenší"},{"name":"Pro děti"},{"name":"Pro mládež"},{"name":"Cestování, mapy"},{"name":"Dítě, rodina a vztahy"},{"name":"Encyklopedie"},{"name":"Esoterika"},{"name":"Hobby, odborné knihy"},{"name":"Kuchařky"},{"name":"Počítačová literatura"},{"name":"Rozvoj osobnosti"},{"name":"Učebnice, skripta - ZŠ"},{"name":"Učebnice, skripta - SŠ"},{"name":"Učebnice, skripta - VŠ"},{"name":"Učebnice, skripta - Jazykové"},{"name":"Zdravý životní styl"},{"name":"Cizojazyčná literatura"},{"name":"Časopisy"},{"name":"Ostatní"}]},{"slug":"mobil","label":"Mobily","categories":[{"name":"Apple"},{"name":"Google"},{"name":"Huawei, Honor"},{"name":"Motorola, Lenovo"},{"name":"Nokia, Microsoft"},{"name":"Realme"},{"name":"Samsung"},{"name":"Sony"},{"name":"Xiaomi"},{"name":"Ostatní značky"},{"name":"Baterie"},{"name":"Bezdrátové telefony"},{"name":"Datové kabely"},{"name":"Faxy"},{"name":"GPS navigace"},{"name":"Headsety"},{"name":"HF Sady do auta"},{"name":"Chytré hodinky"},{"name":"Kryty"},{"name":"Nabíječky"},{"name":"Paměťové karty"},{"name":"Stolní telefony"},{"name":"Ostatní"}]},{"slug":"motorky","label":"Motorky","categories":[{"name":"Cestovní motocykly"},{"name":"Čtyřkolky"},{"name":"Chopper"},{"name":"Enduro"},{"name":"Minibike"},{"name":"Mopedy"},{"name":"Silniční motocykly"},{"name":"Skútry"},{"name":"Skútry vodní"},{"name":"Skútry sněžné"},{"name":"Tříkolky"},{"name":"Veteráni"},{"name":"Náhradní díly"},{"name":"Oblečení, obuv, helmy"},{"name":"Ostatní"}]},{"slug":"nabytek","label":"Nábytek","categories":[{"name":"Dětský nábytek"},{"name":"Dveře, vrata"},{"name":"Jídelní kouty"},{"name":"Knihovny"},{"name":"Koberce a podlah. krytina"},{"name":"Koupelny"},{"name":"Křesla a gauče"},{"name":"Kuchyně"},{"name":"Lampy, osvětlení"},{"name":"Ložnice"},{"name":"Matrace"},{"name":"Obývací stěny"},{"name":"Postele"},{"name":"Sedací soupravy"},{"name":"Skříně"},{"name":"Stoly"},{"name":"Zahradní nábytek"},{"name":"Židle"},{"name":"Doplňky"},{"name":"Ostatní nábytek"}]},{"slug":"obleceni","label":"Oblečení","categories":[{"name":"Bundy a Kabáty"},{"name":"Čepice a Šátky"},{"name":"Džíny"},{"name":"Halenky"},{"name":"Kalhoty"},{"name":"Košile"},{"name":"Kožené oděvy"},{"name":"Mikiny"},{"name":"Obleky a Saka"},{"name":"Plavky"},{"name":"Rukavice a Šály"},{"name":"Spodní prádlo"},{"name":"Sportovní oblečení"},{"name":"Sukně"},{"name":"Svatební šaty"},{"name":"Svetry"},{"name":"Šaty, Kostýmky"},{"name":"Šortky"},{"name":"Těhotenské oblečení"},{"name":"Termo prádlo"},{"name":"Trička, Tílka"},{"name":"Batohy, Kufry"},{"name":"Boty"},{"name":"Doplňky"},{"name":"Hodinky"},{"name":"Kabelky"},{"name":"Šperky"},{"name":"Ostatní"}]},{"slug":"pc","label":"PC","categories":[{"name":"DVD, Blu-ray mechaniky"},{"name":"Fotoaparáty"},{"name":"GPS navigace"},{"name":"Grafické karty"},{"name":"Hard disky, SSD"},{"name":"Herní konzole"},{"name":"Herní zařízení"},{"name":"Hry"},{"name":"Chladiče"},{"name":"Klávesnice"},{"name":"Kopírovací stroje"},{"name":"LCD monitory"},{"name":"Mobilní telefony"},{"name":"Modemy"},{"name":"Myši"},{"name":"Notebooky"},{"name":"Paměti"},{"name":"PC, Počítače"},{"name":"Procesory"},{"name":"Síťové prvky"},{"name":"Scanery"},{"name":"Skříně, zdroje"},{"name":"Software"},{"name":"Spotřební materiál"},{"name":"Tablety, E-čtečky"},{"name":"Tiskárny"},{"name":"Wireless, WiFi"},{"name":"Základní desky"},{"name":"Záložní zdroje"},{"name":"Zvukové karty"},{"name":"Ostatní"}]},{"slug":"prace","label":"Práce","categories":[{"name":"Administrativa"},{"name":"Chemie a potravinářství"},{"name":"Doprava a logistika"},{"name":"Finance a ekonomika"},{"name":"IT a telekomunikace"},{"name":"Marketing a reklama"},{"name":"Management"},{"name":"Obchod a prodej"},{"name":"Obrana a bezpečnost"},{"name":"Pohostinství a ubytování"},{"name":"Práce v domácnosti"},{"name":"Právo, legislativa"},{"name":"Průmysl a výroba"},{"name":"Řemeslné práce"},{"name":"Servis a služby"},{"name":"Stavebnictví"},{"name":"Technika a energetika"},{"name":"Tisk a polygrafie"},{"name":"Výzkum a vývoj"},{"name":"Vzdělávání a personalistika"},{"name":"Zdravotnictví"},{"name":"Zemědělství"},{"name":"Brigády"},{"name":"Ostatní"}]},{"slug":"reality","label":"Reality","categories":[{"name":"Prodej"},{"name":"Byty"},{"name":"Domy"},{"name":"Nové projekty"},{"name":"Garáže"},{"name":"Hotely, penziony, restaurace"},{"name":"Chalupy, Chaty"},{"name":"Kanceláře"},{"name":"Obchodní prostory"},{"name":"Pozemky"},{"name":"Sklady"},{"name":"Zahrady"},{"name":"Ostatní"},{"name":"Pronájem"},{"name":"Byty"},{"name":"Domy"},{"name":"Nové projekty"},{"name":"Podnájem, spolubydlící"},{"name":"Garáže"},{"name":"Hotely, penziony, restaurace"},{"name":"Ubytování"},{"name":"Kanceláře"},{"name":"Obchodní prostory"},{"name":"Pozemky"},{"name":"Sklady"},{"name":"Zahrady"},{"name":"Ostatní"}]},{"slug":"sluzby","label":"Služby","categories":[{"name":"Auto Moto"},{"name":"Cestování"},{"name":"Domácí práce"},{"name":"Esoterika"},{"name":"Hlídání dětí"},{"name":"IT, webdesign"},{"name":"Koně - služby"},{"name":"Kurzy a školení"},{"name":"Opravy, servis"},{"name":"Pořádání akcí"},{"name":"Právo a bezpečnost"},{"name":"Překladatelství"},{"name":"Přeprava a Stěhování"},{"name":"Půjčovny"},{"name":"Realitní služby"},{"name":"Reklama na auto"},{"name":"Reklamní plochy ostatní"},{"name":"Řemeslné a stavební práce"},{"name":"Služby pro zvířata"},{"name":"Tvůrčí služby"},{"name":"Ubytování"},{"name":"Účetnictví, poradenství"},{"name":"Úklid"},{"name":"Výroba"},{"name":"Výuka, doučování"},{"name":"Výuka hudby"},{"name":"Zdraví a krása"},{"name":"Zprostředkovatelské služby"},{"name":"Ostatní"}]},{"slug":"sport","label":"Sport","categories":[{"name":"Fitness, jogging"},{"name":"Golf"},{"name":"Fotbal"},{"name":"In-lines, Skateboarding"},{"name":"Kempink"},{"name":"Letectví"},{"name":"Míčové hry"},{"name":"Myslivost, lov"},{"name":"Paintball"},{"name":"Rybaření"},{"name":"Společenské hry"},{"name":"Tenis, squash, badminton"},{"name":"Turistika, horolezectví"},{"name":"Vodní sporty, potápění"},{"name":"Vše ostatní"},{"name":"Dětská kola"},{"name":"Koloběžky"},{"name":"Horská kola"},{"name":"Elektrokola"},{"name":"Silniční kola"},{"name":"Součástky a díly"},{"name":"Ostatní cyklistika"},{"name":"Běžkování"},{"name":"Lyžování"},{"name":"Skialpy"},{"name":"Snowboarding"},{"name":"Hokej, bruslení"},{"name":"Ostatní zimní"}]},{"slug":"stroje","label":"Stroje","categories":[{"name":"Čerpadla"},{"name":"Čistící stroje"},{"name":"Dřevoobráběcí stroje"},{"name":"Generátory"},{"name":"Historické stroje"},{"name":"Komunální technika"},{"name":"Kovoobráběcí stroje"},{"name":"Lesní technika"},{"name":"Motory"},{"name":"Potravinářské stroje"},{"name":"Skladová technika"},{"name":"Stavební stroje"},{"name":"Textilní stroje"},{"name":"Tiskařské stroje"},{"name":"Vybavení provozoven"},{"name":"Výrobní linky"},{"name":"Zemědělská technika"},{"name":"Náhradní díly"},{"name":"Ostatní"}]},{"slug":"vstupenky","label":"Vstupenky","categories":[{"name":"Dálniční známky"},{"name":"Dárkové poukazy"},{"name":"Jízdenky"},{"name":"Letenky"},{"name":"Permanentky"},{"name":"Divadlo"},{"name":"Festivaly"},{"name":"Hudba, Koncerty"},{"name":"Pro děti"},{"name":"Společenské akce"},{"name":"Sport"},{"name":"Výstavy"},{"name":"Ostatní"}]},{"slug":"zvirata","label":"Zvířata","categories":[{"name":"Akvarijní ryby"},{"name":"Drobní savci"},{"name":"Kočky"},{"name":"Koně"},{"name":"Koně - potřeby"},{"name":"Koně - služby"},{"name":"Psi"},{"name":"Ptactvo"},{"name":"Terarijní zvířata"},{"name":"Ostatní domácí"},{"name":"Krytí"},{"name":"Ztraceni a nalezeni"},{"name":"Chovatelské potřeby"},{"name":"Služby pro zvířata"},{"name":"Drůbež"},{"name":"Králíci"},{"name":"Ovce a kozy"},{"name":"Prasata"},{"name":"Skot"},{"name":"Ostatní hospodářská"}]},{"slug":"ostatni","label":"Ostatní","categories":[{"name":"Mince, bankovky"},{"name":"Modelářství"},{"name":"Potraviny"},{"name":"Sběratelství"},{"name":"Sklo, keramika"},{"name":"Starožitnosti"},{"name":"Šperky, hodinky"},{"name":"Umělecké předměty"},{"name":"Zdraví a krása"},{"name":"Známky, pohlednice"},{"name":"Ostatní"}]}];
  const BAZOS_PRICE_OPTIONS = [
    { value: 'fixed_price', label: 'Zadat cenu' },
    { value: 'dohodou', label: 'Dohodou' },
    { value: 'nabidnete', label: 'Nabídněte' },
    { value: 'nerozhoduje', label: 'Nerozhoduje' },
    { value: 'v_textu', label: 'V textu' },
    { value: 'zdarma', label: 'Zdarma' },
  ];

  function initialView() {
    if (mode !== 'client') return 'overview';
    const view = String(window.location.hash || '').replace('#', '');
    if (view === 'bazos-settings') return 'settings';
    if (catalogProductId) return 'catalog';
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

  async function requestForm(path, formData) {
    const response = await fetch(path, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token() }, body: formData });
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
    if (text.includes('deleted')) return 'risk';
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
    if (text.includes('deleted')) return 'Vymazáno';
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

  function table(headers, rows, emptyText, emptyAction) {
    if (!rows || rows.length === 0) return '<div class="data-panel empty-state">' + escapeHtml(emptyText) + (emptyAction || '') + '</div>';
    return '<div class="data-panel">' + tableOnly(headers, rows, emptyText, emptyAction) + '</div>';
  }

  function tableOnly(headers, rows, emptyText, emptyAction) {
    if (!rows || rows.length === 0) return '<p class="card-note">' + escapeHtml(emptyText) + '</p>' + (emptyAction || '');
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
  const isPublishableIdentity = (identity, ads) => hasLinkedAccount(identity) && isVerified(identity) && hasActiveSession(identity) && isReviewClear(identity) && (Array.isArray(ads) ? identityActiveCount(identity, ads) : Number(identity?.activeAdCount || 0)) < 50;

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
    if (status === 'deleted') return false;
    return status === 'published' || status === 'active' || Boolean(ad.bazosAdId);
  }

  function isActiveAd(ad) {
    const status = publishStatus(ad);
    return ad.isActive !== false && (status === 'published' || status === 'active');
  }

  function identityActiveCount(identity, ads) {
    const tracked = Number(identity.activeAdCount || 0);
    const identityAds = Array.isArray(ads) ? ads.filter((ad) => ad.identityId === identity.id) : [];
    const listed = identityAds.filter(isActiveAd).length;
    return identityAds.length ? listed : tracked;
  }

  function bazosAdUrl(ad) {
    if (publishStatus(ad) === 'deleted') return '';
    if (!ad.bazosAdId) return '';
    const value = String(ad.bazosAdId).trim();
    if (/^https?:\\/\\//i.test(value)) return value;
    return 'https://www.bazos.cz/inzerat/' + encodeURIComponent(value) + '/';
  }

  function bazosPlatformHost(hostname) {
    const host = String(hostname || '').toLowerCase();
    return host === 'bazos.cz' || host.endsWith('.bazos.cz');
  }

  function bazosNumericAdId(value) {
    const text = String(value || '').trim();
    const match = text.match(/[0-9]{5,}/);
    return match ? match[0] : '';
  }

  function bazosManageUrl(ad) {
    const fallback = 'https://www.bazos.cz/moje-inzeraty.php';
    const rawId = String(ad?.bazosAdId || '').trim();
    if (!rawId) return fallback;
    if (/^https?:\\/\\//i.test(rawId)) {
      try {
        const url = new URL(rawId);
        const id = bazosNumericAdId(url.pathname);
        if (id && bazosPlatformHost(url.hostname)) return url.protocol + '//' + url.hostname + '/smazat/' + encodeURIComponent(id) + '.php';
      } catch (error) {
        // Fall through to rubric-based URL construction.
      }
    }
    const id = bazosNumericAdId(rawId);
    if (!id) return fallback;
    const options = draftOptions(ad);
    const rubric = options.rubric || inferRubricForCategory(ad?.category);
    const knownRubric = BAZOS_RUBRICS.find((item) => item.slug === rubric);
    if (!knownRubric) return fallback;
    return 'https://' + knownRubric.slug + '.bazos.cz/smazat/' + encodeURIComponent(id) + '.php';
  }

  function draftOptions(ad) {
    const options = ad?.lastPolicyCheck?.draftOptions || ad?.lastPolicyCheck?.submissionOptions || {};
    return {
      rubric: options.rubric || inferRubricForCategory(ad?.category),
      priceOption: options.priceOption || 'fixed_price',
      media: Array.isArray(options.media) ? options.media : [],
    };
  }

  function canEditAd(ad) {
    const status = publishStatus(ad);
    return status === 'draft' || status === 'published' || status === 'active' || status === 'deleted' || Boolean(ad.bazosAdId);
  }

  function needsBazosUpdate(ad) {
    return Boolean(ad?.lastPolicyCheck?.pendingBazosUpdate?.required);
  }

  function manualEvidence() {
    const checkedAt = new Date().toISOString();
    return {
      publicDuplicateCheck: { checkedAt, source: 'manual_review', likelyDuplicate: false, reason: 'Potvrzeno v klientském panelu Bazoš před odesláním do fronty.' },
      contentPolicy: { checkedAt, source: 'manual_review', passed: true, reason: 'Potvrzeno v klientském panelu Bazoš před odesláním do fronty.' },
    };
  }

  function policyGateLabel(gate) {
    const labels = {
      identity_not_verified: 'Telefon neověřen',
      identity_review_blocked: 'Identita blokována',
      identity_verification_expired: 'Ověření expirovalo',
      identity_session_not_active: 'Relace není aktivní',
      active_ad_cap_reached: 'Limit 50 inzerátů',
      pacing_too_soon: 'Příliš brzy',
      category_cooldown: 'Pauza v kategorii',
      local_duplicate: 'Lokální duplicita',
      public_duplicate_check_missing: 'Duplicita neověřena',
      public_duplicate: 'Možná duplicita',
      category_missing_or_blocked: 'Kategorie chybí/blokována',
      content_policy_not_validated: 'Obsah neověřen',
      content_policy_fail: 'Obsah neprošel',
    };
    return labels[String(gate || '').toLowerCase()] || statusLabel(gate || 'Kontrola');
  }

  function policyFailureTone(failure) {
    const gate = String(failure?.gate || '').toLowerCase();
    if (gate.includes('missing') || gate.includes('not_validated') || gate.includes('cooldown') || gate.includes('pacing')) return 'wait';
    return 'risk';
  }

  function policyChip(label, tone, title) {
    return '<span class="policy-chip ' + escapeHtml(tone || 'wait') + '" title="' + cell(title || label) + '">' + escapeHtml(label) + '</span>';
  }

  function latestAttemptForAd(queue, ad) {
    const id = String(ad?.id || '');
    const attempts = [...asArray({ queue }, ['queue']), ...asArray(ad, ['publishAttempts'])];
    return attempts
      .filter((item) => String(item?.adId || item?.ad?.id || '') === id)
      .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))[0] || null;
  }

  function activeAttemptForAd(queue, ad) {
    const attempt = latestAttemptForAd(queue, ad);
    const status = String(attempt?.status || '').toLowerCase();
    return ['queued', 'submitting'].includes(status) ? attempt : null;
  }

  function isAttemptDue(attempt) {
    const notBefore = toDate(attempt?.notBefore);
    return !notBefore || notBefore.getTime() <= Date.now();
  }

  function queueAttemptNote(attempt) {
    if (!attempt) return '';
    const status = String(attempt.status || '').toLowerCase();
    if (status === 'queued') {
      if (isAttemptDue(attempt)) return 'Fronta je připravená. Worker může předat odeslání do ověřeného prohlížeče.';
      return attempt.notBefore
        ? 'Čeká ve frontě na worker po ' + cell(attempt.notBefore)
        : 'Čeká ve frontě na worker.';
    }
    if (status === 'submitting') return 'Worker připravil ruční odeslání. Dokončete ho v ověřeném prohlížeči a uložte Bazoš ID nebo odkaz.';
    return statusLabel(status);
  }

  function publishActionMarkup(ad, queue) {
    const activeAttempt = activeAttemptForAd(queue, ad);
    const detail = canEditAd(ad)
      ? '<button class="button button-secondary" data-edit-ad="' + cell(ad.id) + '" type="button">Upravit</button>'
      : '<button class="button button-secondary" data-open-ad="' + cell(ad.id) + '" type="button">Detail</button>';
    if (activeAttempt) {
      const status = String(activeAttempt.status || '').toLowerCase();
      const action = status === 'submitting'
        ? '<button class="button button-primary" data-open-submission="' + cell(activeAttempt.id) + '" type="button">Dokončit odeslání</button>'
        : (isAttemptDue(activeAttempt)
          ? '<button class="button button-primary" data-claim-attempt="' + cell(activeAttempt.id) + '" type="button">Odeslat přes worker</button>'
          : '<span class="status wait" title="' + cell(queueAttemptNote(activeAttempt)) + '">' + statusLabel(activeAttempt.status) + '</span>');
      return '<div class="row-actions">' + detail + action + '</div><small class="card-note">' + cell(queueAttemptNote(activeAttempt)) + '</small>';
    }
    if (isPublishedAd(ad)) {
      return '<div class="row-actions"><button class="button button-primary" data-open-bazos-manage="' + cell(ad.id) + '" type="button">Upravit/Vymazat</button></div>';
    }
    return '<div class="row-actions">' + detail + '<button class="button button-primary" data-publish="' + cell(ad.id) + '" type="button">Publikovat</button></div>';
  }

  function policySummaryChips(ad) {
    const check = ad?.lastPolicyCheck || {};
    const failures = Array.isArray(check.failures) ? check.failures : [];
    const chips = [];
    if (publishStatus(ad) === 'deleted') {
      chips.push(policyChip('Vymazáno na Bazoši', 'risk', 'Veřejná stránka inzerátu už není dostupná.'));
    }
    if (check.allowed === true) {
      chips.push(policyChip('Pravidla prošla', 'ok', 'Poslední uložená kontrola pravidel povolila publikování.'));
    } else if (failures.length) {
      failures.slice(0, 5).forEach((failure) => chips.push(policyChip(policyGateLabel(failure.gate), policyFailureTone(failure), failure.message || failure.gate)));
      if (failures.length > 5) chips.push(policyChip('+' + (failures.length - 5) + ' další', 'risk', failures.slice(5).map((failure) => failure.message || failure.gate).join('; ')));
    } else {
      chips.push(policyChip('Pravidla nevyhodnocena', 'wait', 'U tohoto inzerátu zatím není uložený výsledek kontroly pravidel.'));
    }
    if (!ad?.category && !ad?.categoryName && !ad?.bazosCategory) {
      chips.push(policyChip('Kategorie chybí', 'risk', 'Bez Bazoš kategorie nelze inzerát vyhodnotit ani publikovat.'));
    }
    if (needsBazosUpdate(ad)) {
      chips.push(policyChip('Bazoš čeká na aktualizaci', 'wait', 'Změny jsou uložené u nás, ale externí Bazoš.cz zatím nepotvrdil aktualizaci v ověřené relaci.'));
    }
    if (ad?.challengeState) {
      chips.push(policyChip(statusLabel(ad.challengeState), 'risk', 'Bazoš vyžaduje ruční zásah: ' + ad.challengeState));
    }
    return '<div class="policy-chip-list">' + chips.join('') + '</div>';
  }

  function refreshSummaryMarkup(summary) {
    if (!summary) return '';
    return '<div class="data-panel compact"><strong>Obnoveno z Bazoš.cz</strong><small class="card-note">Zkontrolováno: ' + cell(summary.checked || 0) + ', vymazáno: ' + cell(summary.deleted || 0) + ', neověřeno: ' + cell(summary.unknown || 0) + '</small></div>';
  }

  async function loadClientData(options) {
    const refreshExternal = Boolean(options?.refreshExternal);
    const queuePromise = request('/api/bazos/publish-queue?limit=50').catch(() => []);
    const adsResult = await request(refreshExternal ? '/api/bazos/ads/refresh' : '/api/bazos/ads', refreshExternal ? { method: 'POST', body: '{}' } : undefined).catch((error) => ({ error: error.message }));
    const identitiesResult = await request('/api/bazos/identities').catch((error) => ({ error: error.message }));
    const queueResult = await queuePromise;
    return {
      ads: adsResult.error ? [] : asArray(adsResult, ['items', 'offers', 'ads']),
      refreshSummary: adsResult.error ? null : (adsResult.checked !== undefined ? { checked: adsResult.checked, deleted: adsResult.deleted, unknown: adsResult.unknown } : null),
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
    const publishable = identities.filter((identity) => isPublishableIdentity(identity, ads));
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

  function findIdentity(identities, id) {
    return (identities || []).find((identity) => String(identity.id) === String(id)) || null;
  }

  function identityDefaultLocation(identity) {
    return String(identity?.defaultLocation || '').trim();
  }

  function applyIdentityDefaults(form, identities, force) {
    if (!form) return;
    const identity = findIdentity(identities, form.elements.identityId?.value);
    const location = identityDefaultLocation(identity);
    if (form.elements.location && location && (force || !String(form.elements.location.value || '').trim())) {
      form.elements.location.value = location;
    }
  }

  function bindIdentityDefaults(form, identities) {
    if (!form) return;
    applyIdentityDefaults(form, identities, false);
    form.elements.identityId?.addEventListener('change', () => applyIdentityDefaults(form, identities, true));
  }

  function identitySavedFields(identity) {
    const fields = [
      ['Telefon', identity.phoneNumber],
      ['Kontaktní jméno', identity.contactName],
      ['Kontaktní telefon', identity.contactPhone],
      ['PSČ', identity.defaultZip],
      ['Lokalita', identity.defaultLocation],
      ['Alfares účet', currentUser?.email],
      ['Poznámka', identity.notes],
    ];
    return '<div class="settings-field-list">' + fields.map(([label, value]) => '<span><strong>' + escapeHtml(label) + '</strong>' + cell(value || 'neuloženo') + '</span>').join('') + '</div>';
  }

  function externalBazosNotice() {
    return '<p class="form-message">Změny uložené tady jsou výchozí údaje pro nové koncepty v Alfares. Pokud jste stejný telefon, lokalitu nebo kontaktní údaje změnili na Bazoš.cz, aktualizujte je také přímo na Bazoš.cz.</p>';
  }

  function settingsLink(label, className) {
    return '<a class="' + (className || 'setup-link') + '" href="#bazos-settings" data-nav-view="settings">' + escapeHtml(label || 'Nastavit') + '</a>';
  }

  function missingSettingsMarkup(message, label) {
    return '<div class="data-panel empty-state">' + escapeHtml(message) + '<div class="flow-actions" style="justify-content:center;margin-top:14px">' + settingsLink(label || 'Nastavit v Nastavení Bazos.cz', 'button button-primary') + '</div></div>';
  }

  function settingsErrorMarkup(message) {
    return escapeHtml(message) + '<br>' + settingsLink('Otevřít Nastavení Bazos.cz');
  }
  function awaitingVerificationSession(identity) {
    return (identity?.verificationSessions || []).find((session) => String(session.state || '').toLowerCase() === 'awaiting_human') || null;
  }

  function identityGateSummary(identity) {
    const missing = [];
    if (!hasLinkedAccount(identity)) missing.push('propojení účtu');
    if (!isVerified(identity)) missing.push('ověřený telefon');
    if (!hasActiveSession(identity)) missing.push('aktivní relace');
    if (!isReviewClear(identity)) missing.push('kontrola bez blokace');
    if (Number(identity?.activeAdCount || 0) >= 50) missing.push('volná kapacita');
    return missing.length ? missing.join(', ') : 'připraveno';
  }

  function verificationActions(identity) {
    const session = awaitingVerificationSession(identity);
    if (isPublishableIdentity(identity)) {
      return '<span class="status ok">Připraveno</span>';
    }
    if (session) {
      return '<div class="row-actions"><button class="button button-primary" data-complete-verification="' + cell(identity.id) + '" data-session-id="' + cell(session.id) + '" type="button">Dokončit ruční ověření</button><button class="button button-secondary" data-open-bazos="' + cell(session.verificationUrl || 'https://www.bazos.cz/pridat-inzerat.php') + '" type="button">Otevřít Bazoš</button><button class="button button-secondary" data-challenge-verification="' + cell(identity.id) + '" data-session-id="' + cell(session.id) + '" type="button">Nahlásit výzvu</button></div><small class="card-note">SMS kód zadávejte pouze na Bazoš.cz, ne do Bazoš.</small>';
    }
    return '<div class="row-actions"><button class="button button-primary" data-start-verification="' + cell(identity.id) + '" type="button">Zahájit ověření</button></div><small class="card-note">Chybí: ' + cell(identityGateSummary(identity)) + '</small>';
  }

  async function startIdentityVerification(identityId) {
    try {
      const session = await request('/api/bazos/identities/' + encodeURIComponent(identityId) + '/verification-sessions', {
        method: 'POST',
        body: JSON.stringify({
          verificationUrl: 'https://www.bazos.cz/pridat-inzerat.php',
          notes: 'Manual seller verification started from Bazoš client UI. SMS and login stay on Bazos.cz.',
        }),
      });
      window.open(session.verificationUrl || 'https://www.bazos.cz/pridat-inzerat.php', '_blank', 'noopener');
      await renderClient();
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  async function completeManualVerification(identityId, sessionId) {
    const confirmed = window.confirm('Potvrďte pouze tehdy, když jste na Bazoš.cz ručně dokončili přihlášení, SMS ověření nebo požadovanou kontrolu. SMS kód se do Bazoš neukládá.');
    if (!confirmed) return;
    try {
      await request('/api/bazos/identities/' + encodeURIComponent(identityId) + '/verification-sessions/' + encodeURIComponent(sessionId) + '/complete-manual', {
        method: 'POST',
        body: JSON.stringify({
          humanConfirmed: true,
          notes: 'Seller confirmed manual Bazos browser verification. SMS/login was completed on Bazos.cz.',
        }),
      });
      await renderClient();
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  async function markVerificationChallenge(identityId, sessionId) {
    try {
      await request('/api/bazos/identities/' + encodeURIComponent(identityId) + '/verification-sessions/' + encodeURIComponent(sessionId) + '/challenge', {
        method: 'POST',
        body: JSON.stringify({
          challengeState: 'captcha_or_human_check_required',
          notes: 'Seller reported Bazos challenge during manual verification.',
        }),
      });
      await renderClient();
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  function bindVerificationButtons() {
    content.querySelectorAll('[data-start-verification]').forEach((button) => button.addEventListener('click', () => startIdentityVerification(button.dataset.startVerification)));
    content.querySelectorAll('[data-complete-verification]').forEach((button) => button.addEventListener('click', () => completeManualVerification(button.dataset.completeVerification, button.dataset.sessionId)));
    content.querySelectorAll('[data-challenge-verification]').forEach((button) => button.addEventListener('click', () => markVerificationChallenge(button.dataset.challengeVerification, button.dataset.sessionId)));
    content.querySelectorAll('[data-open-bazos]').forEach((button) => button.addEventListener('click', () => window.open(button.dataset.openBazos || 'https://www.bazos.cz/pridat-inzerat.php', '_blank', 'noopener')));
  }


  function renderConnectionBanner(data) {
    if (mode !== 'client' || !identityBanner) return;
    if (hasLinkedBazosIdentity(data)) {
      identityBanner.classList.add('hidden');
      identityBanner.innerHTML = '';
      return;
    }
    identityBanner.classList.remove('hidden');
    identityBanner.innerHTML = '<div><strong>Účet zatím není připojen k Bazoši</strong><p>Po registraci je potřeba propojit Alfares účet s Bazoš účtem. E-mail na Bazoši musí být stejný jako v Alfares Auth: ' + cell(currentUser?.email || 'není k dispozici') + '.</p>' + settingsLink('Připojit') + '</div>' + settingsLink('Připojit účet Bazoš', 'button button-primary');
    bindNavigationLinks(identityBanner);
  }

  function connectionWizardMarkup() {
    const email = currentUser?.email || '';
    return '<div class="connection-modal" id="connection-modal" role="dialog" aria-modal="true" aria-labelledby="connection-title">' +
      '<div class="connection-dialog"><div class="connection-dialog-header"><div><h2 id="connection-title">Připojit účet Bazoš</h2><p>Vyplňte údaje používané na Bazoši. Tím vznikne vazba mezi vaším Alfares účtem a Bazoš identitou; ověření telefonu a relace se dokončuje podle pravidel Bazoš.cz.</p></div><button class="icon-button" data-close-identity-wizard type="button" aria-label="Zavřít">×</button></div>' +
      '<form class="form-panel panel-stack" id="identity-wizard-form"><div class="connection-requirement"><strong>Požadavek na e-mail</strong>E-mail na Bazoši musí být stejný jako v Alfares Auth. Aktuální Alfares e-mail: ' + cell(email || 'není k dispozici') + '.</div><div class="form-grid">' +
      '<label class="wide">E-mail Alfares / Bazoš<input name="authEmail" value="' + cell(email) + '" readonly></label>' +
      '<label>Telefon Bazoš<input name="phoneNumber" minlength="9" maxlength="20" autocomplete="tel" required></label>' +
      '<input type="hidden" name="displayName" value="">' +
      '<label>Kontaktní jméno<input name="contactName" maxlength="200" autocomplete="name"></label>' +
      '<label>Kontaktní telefon<input name="contactPhone" maxlength="50" autocomplete="tel"></label>' +
      '<label>PSČ<input name="defaultZip" maxlength="20" autocomplete="postal-code"></label>' +
      '<label>Lokalita<input name="defaultLocation" maxlength="200" autocomplete="address-level2"></label>' +
      '<label class="wide">Popis účtu<textarea name="notes" placeholder="např. motodíly, knihy, sezónní zboží nebo hlavní prodejní účet"></textarea></label>' +
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
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  function renderQueueResult(result) {
    const attempt = result?.attempt || {};
    const queued = result?.queued === true;
    const heading = queued ? 'Inzerát je ve frontě' : 'Publikování nebylo zařazeno';
    const note = queued
      ? queueAttemptNote(attempt) + ' Skutečné Bazoš ID se doplní až po úspěšném odeslání přes worker nebo ruční handoff.'
      : (result?.decision?.failures || []).map((failure) => policyGateLabel(failure.gate)).join(', ') || 'Zkontrolujte pravidla před dalším pokusem.';
    content.innerHTML = '<div class="data-panel panel-stack"><div><h2>' + escapeHtml(heading) + '</h2><p class="card-note">' + cell(note) + '</p></div><div class="summary-grid">' +
      stat('Stav', statusLabel(attempt.status || (queued ? 'queued' : 'blocked')), attempt.id ? 'Pokus ' + attempt.id : '') +
      stat('Nejdříve po', attempt.notBefore || 'Ihned', 'Cadence ochrana proti příliš častému publikování') +
      stat('Kontrola pravidel', result?.decision?.allowed === true ? 'Splněna' : 'Vyžaduje kontrolu', result?.decision?.failures?.length ? result.decision.failures.length + ' blokací' : 'Bez blokací') +
      '</div><div class="flow-actions"><button class="button button-primary" data-nav-view="details" type="button">Zpět na moje inzeráty</button><button class="button button-secondary" data-refresh-client type="button">Obnovit stav</button></div></div>';
    bindContentNavButtons();
    content.querySelector('[data-refresh-client]')?.addEventListener('click', () => renderClient());
  }

  function bazosIdFromInput(value) {
    const text = String(value || '').trim();
    if (/^https?:\\/\\//i.test(text)) return text;
    const match = text.match(/(?:inzerat\\/)?([0-9]{5,})/);
    return match ? match[1] : text;
  }

  function submissionField(label, value) {
    return '<label>' + escapeHtml(label) + '<input readonly value="' + cell(value) + '"></label>';
  }

  function renderSubmissionHandoff(result) {
    const attempt = result?.attempt || {};
    const submission = result?.submission || {};
    const ad = submission.ad || attempt.ad || {};
    const identity = submission.identity || attempt.identity || {};
    const targetUrl = submission.targetUrl || 'https://www.bazos.cz/pridat-inzerat.php';
    content.innerHTML = '<div class="form-panel panel-stack"><div><h2>Worker připravil ruční odeslání</h2><p class="card-note">Otevřete Bazoš v ověřeném prohlížeči, odešlete inzerát a potom sem vložte reálné Bazoš ID nebo odkaz. Pokud Bazoš požádá o SMS, bankovní ověření, CAPTCHA nebo jinou kontrolu, nahlaste výzvu místo obcházení automatizací.</p></div>' +
      '<div class="flow-actions"><a class="button button-primary" href="' + escapeHtml(targetUrl) + '" target="_blank" rel="noopener">Otevřít Bazoš</a><button class="button button-secondary" data-refresh-client type="button">Obnovit stav</button></div>' +
      '<div class="form-grid">' +
        submissionField('Název', ad.title || '') +
        submissionField('Cena', ad.price ? String(ad.price) + ' Kč' : '') +
        submissionField('Volba ceny', submission.priceOption || ad.priceOption || '') +
        submissionField('Rubrika', submission.rubric || ad.rubric || '') +
        submissionField('Kategorie', ad.category || ad.categoryName || '') +
        submissionField('Lokalita', ad.location || identity.defaultLocation || '') +
        submissionField('Kontakt', identity.contactName || identity.displayName || '') +
        submissionField('Telefon', identity.contactPhone || identity.phoneNumber || '') +
        submissionField('Vaše heslo', ad.editPassword || '') +
        '<label class="wide">Popis<textarea readonly>' + escapeHtml(ad.description || '') + '</textarea></label>' +
      '</div>' +
      '<form class="form-grid" id="record-publish-result">' +
        '<label class="wide">Bazoš ID nebo odkaz<input name="bazosAdId" placeholder="např. https://www.bazos.cz/inzerat/123456789/... nebo 123456789"></label>' +
        '<label>Platnost do<input name="expiresAt" type="datetime-local"></label>' +
        '<label>Výzva Bazoš<select name="challengeState"><option value="">Bez výzvy, publikováno</option><option value="captcha_or_human_check_required">CAPTCHA / ruční kontrola</option><option value="sms_required">SMS ověření</option><option value="bank_verification_required">Bankovní ověření</option><option value="account_review_required">Kontrola účtu</option></select></label>' +
        '<label class="wide">Poznámka / chyba<textarea name="error" placeholder="Vyplňte při výzvě nebo neúspěchu"></textarea></label>' +
        '<div class="wide flow-actions"><button class="button button-primary" type="submit">Uložit výsledek</button><button class="button button-secondary" data-nav-view="details" type="button">Zpět</button></div>' +
      '</form></div>';
    bindContentNavButtons();
    content.querySelector('[data-refresh-client]')?.addEventListener('click', () => renderClient());
    document.getElementById('record-publish-result')?.addEventListener('submit', (event) => recordPublishResult(event, attempt.id));
  }

  async function claimDueAttempt(attemptId) {
    if (publishWorkerBusy) return;
    publishWorkerBusy = true;
    content.innerHTML = '<div class="data-panel empty-state">Worker přebírá připravený pokus...</div>';
    try {
      const result = await request('/api/bazos/publish-queue/claim-next', { method: 'POST', body: JSON.stringify(manualEvidence()) });
      if (result?.claimed) renderSubmissionHandoff(result);
      else content.innerHTML = '<div class="data-panel empty-state">Fronta zatím nemá připravený pokus: ' + cell(result?.reason || 'no_due_attempts') + '<div class="flow-actions" style="justify-content:center;margin-top:14px"><button class="button button-secondary" data-refresh-client type="button">Obnovit stav</button></div></div>';
      content.querySelector('[data-refresh-client]')?.addEventListener('click', () => renderClient());
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    } finally {
      publishWorkerBusy = false;
    }
  }

  async function openSubmission(attemptId) {
    content.innerHTML = '<div class="data-panel empty-state">Načítá se předání pro Bazoš...</div>';
    try {
      const result = await request('/api/bazos/publish-queue/attempts/' + encodeURIComponent(attemptId) + '/submission');
      renderSubmissionHandoff(result);
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  async function recordPublishResult(event, attemptId) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const challengeState = String(values.challengeState || '').trim();
    const body = challengeState
      ? { success: false, challengeState, error: values.error || 'Bazoš vyžaduje ruční zásah v prohlížeči.' }
      : { success: true, bazosAdId: bazosIdFromInput(values.bazosAdId), expiresAt: values.expiresAt || undefined };
    if (!challengeState && !body.bazosAdId) {
      event.currentTarget.querySelector('[name="bazosAdId"]')?.focus();
      return;
    }
    try {
      await request('/api/bazos/publish-queue/attempts/' + encodeURIComponent(attemptId) + '/result', { method: 'POST', body: JSON.stringify(body) });
      activeView = 'details';
      await renderClient();
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }


  function trimToLimit(value, limit) {
    return String(value || '').trim().slice(0, limit);
  }

  function manualMediaItems(form) {
    const seen = new Set();
    return Array.from(form.querySelectorAll('[data-manual-media-url]'))
      .map((input) => String(input.value || '').trim())
      .filter((url) => {
        if (!/^https?:\/\//i.test(url) || seen.has(url)) return false;
        seen.add(url);
        return true;
      })
      .slice(0, BAZOS_MEDIA_LIMIT)
      .map((url, index) => ({
        id: url,
        url,
        thumbnailUrl: url,
        altText: 'Bazoš foto ' + (index + 1),
        title: 'Bazoš foto ' + (index + 1),
        position: index,
      }));
  }

  function updateManualMediaPreview(form) {
    const media = manualMediaItems(form);
    const counter = form.querySelector('[data-manual-media-counter]');
    const preview = form.querySelector('[data-manual-media-preview]');
    const addButton = form.querySelector('[data-add-manual-media]');
    if (counter) counter.textContent = media.length + ' / ' + BAZOS_MEDIA_LIMIT;
    if (addButton) addButton.disabled = form.querySelectorAll('[data-manual-media-url]').length >= BAZOS_MEDIA_LIMIT;
    if (preview) {
      preview.innerHTML = media.map((item) => '<img src="' + escapeHtml(item.url) + '" alt="' + escapeHtml(item.altText) + '">').join('');
    }
  }

  function addManualMediaRow(form, value) {
    const list = form.querySelector('[data-manual-media-list]');
    if (!list || list.querySelectorAll('[data-manual-media-url]').length >= BAZOS_MEDIA_LIMIT) return;
    const row = document.createElement('div');
    row.className = 'manual-media-row';
    row.innerHTML = '<input data-manual-media-url type="url" inputmode="url" placeholder="https://..." value="' + escapeHtml(value || '') + '">' +
      '<button class="button button-secondary" data-remove-manual-media type="button">Odebrat</button>';
    list.appendChild(row);
    row.querySelector('[data-manual-media-url]')?.addEventListener('input', () => updateManualMediaPreview(form));
    row.querySelector('[data-remove-manual-media]')?.addEventListener('click', () => {
      row.remove();
      if (!list.querySelector('[data-manual-media-url]')) addManualMediaRow(form, '');
      updateManualMediaPreview(form);
    });
    updateManualMediaPreview(form);
  }

  function bindManualPublishControls(form) {
    if (!form) return;
    form.querySelector('[data-add-manual-media]')?.addEventListener('click', () => addManualMediaRow(form, ''));
    addManualMediaRow(form, '');
    updateManualMediaPreview(form);
  }

  async function enqueuePublish(id) {
    const confirmed = window.confirm('Potvrďte, že jste ručně zkontrolovali duplicitu a obsah inzerátu. Žádost se odešle pouze do hlídané fronty a backend znovu vyhodnotí pravidla.');
    if (!confirmed) return;
    content.innerHTML = '<div class="data-panel empty-state">Odesílá se žádost do hlídané publikační fronty...</div>';
    try {
      const result = await request('/api/bazos/ads/' + encodeURIComponent(id) + '/publish', { method: 'POST', body: JSON.stringify(manualEvidence()) });
      renderQueueResult(result);
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  async function createDraft(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      identityId: data.identityId,
      title: trimToLimit(data.title, BAZOS_TITLE_MAX_LENGTH),
      description: trimToLimit(data.description, BAZOS_DESCRIPTION_MAX_LENGTH) || undefined,
      brand: trimToLimit(data.brand, 200) || undefined,
      manufacturer: trimToLimit(data.manufacturer, 200) || undefined,
      ean: trimToLimit(data.ean, 64) || undefined,
      price: Number(data.price || 0),
      priceOption: data.priceOption || 'fixed_price',
      rubric: data.rubric || undefined,
      category: data.category || undefined,
      location: data.location || undefined,
      stockQuantity: 1,
      weightKg: data.weightKg ? Number(data.weightKg) : undefined,
      dimensionsCm: (data.lengthCm || data.widthCm || data.heightCm) ? {
        length: data.lengthCm ? Number(data.lengthCm) : undefined,
        width: data.widthCm ? Number(data.widthCm) : undefined,
        height: data.heightCm ? Number(data.heightCm) : undefined,
      } : undefined,
      saveToCatalog: true,
      media: manualMediaItems(form),
    };
    const photoFiles = Array.from(form.querySelector('[data-manual-photo-files]')?.files || []).slice(0, BAZOS_MEDIA_LIMIT - payload.media.length);
    if (!payload.media.length && !photoFiles.length) {
      const formMessage = content.querySelector('[data-form-message]');
      if (formMessage) formMessage.innerHTML = settingsErrorMarkup('Přidejte alespoň jednu fotku. Bazoš publikace a katalogový produkt vyžadují media.');
      return;
    }
    try {
      let draft;
      if (photoFiles.length) {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        photoFiles.forEach((file) => formData.append('photos', file));
        draft = await requestForm('/api/bazos/ads/with-photos', formData);
      } else {
        draft = await request('/api/bazos/ads', { method: 'POST', body: JSON.stringify(payload) });
      }
      await request('/api/bazos/ads/' + encodeURIComponent(draft.id) + '/publish', { method: 'POST', body: JSON.stringify(manualEvidence()) });
      activeView = 'details';
      syncActiveTabs();
      await renderClient();
    } catch (error) {
      const formMessage = content.querySelector('[data-form-message]');
      if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message);
    }
  }


  function selectedAttr(value, selected) {
    return String(value || '') === String(selected || '') ? ' selected' : '';
  }

  function rubricOptions(selected) {
    const value = selected || BAZOS_RUBRICS[0]?.slug || '';
    return BAZOS_RUBRICS.map((rubric) => '<option value="' + cell(rubric.slug) + '"' + selectedAttr(rubric.slug, value) + '>' + cell(rubric.label) + '</option>').join('');
  }

  function categoriesForRubric(slug) {
    return (BAZOS_RUBRICS.find((rubric) => rubric.slug === slug) || BAZOS_RUBRICS[0] || { categories: [] }).categories || [];
  }

  function categoryOptions(rubricSlug, selected) {
    const categories = categoriesForRubric(rubricSlug);
    return '<option value="">Vyberte kategorii</option>' + categories.map((category) => '<option value="' + cell(category.name) + '"' + selectedAttr(category.name, selected) + '>' + cell(category.name) + '</option>').join('');
  }

  function categorySuggestionButtons(rubricSlug, selected) {
    return categoriesForRubric(rubricSlug).map((category) => '<button class="category-chip' + (String(category.name) === String(selected || '') ? ' active' : '') + '" type="button" data-category-value="' + cell(category.name) + '">' + cell(category.name) + '</button>').join('');
  }

  function priceOptionOptions(selected) {
    const value = selected || 'fixed_price';
    return BAZOS_PRICE_OPTIONS.map((option) => '<option value="' + cell(option.value) + '"' + selectedAttr(option.value, value) + '>' + cell(option.label) + '</option>').join('');
  }

  function priceOptionLabel(value) {
    return (BAZOS_PRICE_OPTIONS.find((option) => option.value === value) || BAZOS_PRICE_OPTIONS[0]).label;
  }

  function inferRubricForCategory(categoryName) {
    const category = String(categoryName || '');
    const match = BAZOS_RUBRICS.find((rubric) => rubric.categories.some((item) => item.name === category));
    return match?.slug || BAZOS_RUBRICS[0]?.slug || 'auto';
  }

  function bindBazosCategoryControls(form) {
    if (!form) return;
    const rubricSelect = form.querySelector('[data-bazos-rubric]');
    const categorySelect = form.querySelector('[data-bazos-category]');
    const suggestions = form.querySelector('[data-category-suggestions]');
    if (!rubricSelect || !categorySelect || !suggestions) return;
    const draw = () => {
      const rubric = rubricSelect.value || BAZOS_RUBRICS[0]?.slug || '';
      const current = categorySelect.value;
      categorySelect.innerHTML = categoryOptions(rubric, current);
      if (current && !categoriesForRubric(rubric).some((category) => category.name === current)) categorySelect.value = '';
      suggestions.innerHTML = categorySuggestionButtons(rubric, categorySelect.value);
    };
    if (form.dataset.bazosCategoryBound === 'true') {
      draw();
      return;
    }
    form.dataset.bazosCategoryBound = 'true';
    rubricSelect.addEventListener('change', draw);
    categorySelect.addEventListener('change', draw);
    suggestions.addEventListener('click', (event) => {
      const button = event.target.closest('[data-category-value]');
      if (!button) return;
      categorySelect.value = button.dataset.categoryValue || '';
      draw();
    });
    draw();
  }

  function identityFormPayload(data) {
    const authEmail = String(currentUser?.email || data.authEmail || '').trim();
    const notes = [data.notes, authEmail ? 'E-mail v Alfares Auth se musí shodovat s e-mailem účtu na Bazoši: ' + authEmail : ''].filter(Boolean).join('\n');
    return {
      phoneNumber: String(data.phoneNumber || '').trim(),
      displayName: defaultIdentityDisplayName(data),
      contactName: String(data.contactName || '').trim() || undefined,
      contactPhone: String(data.contactPhone || '').trim() || undefined,
      defaultZip: String(data.defaultZip || '').trim() || undefined,
      defaultLocation: String(data.defaultLocation || '').trim() || undefined,
      notes: notes || undefined,
    };
  }

  function updateIdentityPayload(data) {
    return {
      displayName: String(data.displayName || '').trim() || undefined,
      contactName: String(data.contactName || '').trim() || undefined,
      contactPhone: String(data.contactPhone || '').trim() || undefined,
      defaultZip: String(data.defaultZip || '').trim() || undefined,
      defaultLocation: String(data.defaultLocation || '').trim() || undefined,
      notes: String(data.notes || '').trim() || undefined,
    };
  }

  function defaultIdentityDisplayName(data) {
    const explicitName = String(data.displayName || '').trim();
    if (explicitName) return explicitName;
    const description = String(data.notes || '').trim();
    const contactName = String(data.contactName || '').trim();
    const phoneNumber = String(data.phoneNumber || '').trim();
    const suffix = description || contactName || phoneNumber;
    return suffix ? 'Bazoš účet - ' + suffix : 'Bazoš účet';
  }

  async function createIdentity(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = identityFormPayload(data);
    const formMessage = form.querySelector('[data-form-message]') || content.querySelector('[data-form-message]');
    try {
      await request('/api/bazos/identities', { method: 'POST', body: JSON.stringify(payload) });
      sessionStorage.setItem(connectionWizardKey(), 'completed');
      closeConnectionWizard();
      accountBulkOpen = false;
      editingIdentityId = null;
      activeView = 'account';
      syncActiveTabs();
      await renderClient();
    } catch (error) {
      if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message);
    }
  }

  function parseBulkIdentityRows(value) {
    return String(value || '').split(/\n+/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const parts = line.split(/[;\t,]/).map((part) => part.trim());
      const phoneNumber = parts[0] || '';
      return identityFormPayload({
        phoneNumber,
        displayName: parts[1] || '',
        contactName: parts[2] || '',
        contactPhone: parts[3] || phoneNumber,
        defaultZip: parts[4] || '',
        defaultLocation: parts[5] || '',
        notes: parts.slice(6).join('; '),
      });
    }).filter((item) => item.phoneNumber);
  }

  async function createBulkIdentities(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formMessage = form.querySelector('[data-form-message]');
    const rows = parseBulkIdentityRows(form.elements.bulkIdentities?.value);
    if (!rows.length) {
      if (formMessage) formMessage.innerHTML = settingsErrorMarkup('Vložte alespoň jeden telefon.');
      return;
    }
    if (formMessage) formMessage.textContent = 'Ukládají se účty...';
    const created = [];
    const failed = [];
    for (const payload of rows) {
      try {
        await request('/api/bazos/identities', { method: 'POST', body: JSON.stringify(payload) });
        created.push(payload.phoneNumber);
      } catch (error) {
        failed.push(payload.phoneNumber + ': ' + error.message);
      }
    }
    if (failed.length) {
      if (formMessage) formMessage.innerHTML = settingsErrorMarkup('Uloženo ' + created.length + ', neuloženo ' + failed.length + ': ' + failed.join('; '));
      await renderClient();
      return;
    }
    accountBulkOpen = false;
    editingIdentityId = null;
    await renderClient();
  }

  async function saveIdentityEdit(event, identityId) {
    event.preventDefault();
    const form = event.currentTarget;
    const formMessage = form.querySelector('[data-form-message]');
    try {
      if (formMessage) formMessage.textContent = 'Ukládají se změny...';
      await request('/api/bazos/identities/' + encodeURIComponent(identityId), { method: 'PATCH', body: JSON.stringify(updateIdentityPayload(Object.fromEntries(new FormData(form).entries()))) });
      editingIdentityId = null;
      await renderClient();
    } catch (error) {
      if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message);
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
      '</div><div class="overview-actions"><button class="button button-primary" data-nav-view="publish" type="button">Přidat inzerát</button><button class="button button-secondary" data-nav-view="details" type="button">Otevřít moje inzeráty</button>' + (!hasLinkedBazosIdentity(data) ? settingsLink('Připojit účet Bazoš', 'button button-primary') : '') + '</div>' +
      '<div class="overview-grid">' +
      '<div class="data-panel"><h2>Moje identity na Bazoši</h2>' +
      tableOnly([
        { label: 'Identita', render: (r) => '<strong>' + cell(r.displayName || r.contactName || r.id) + '</strong><small class="card-note">Telefon: ' + (isVerified(r) ? 'ověřen' : 'neověřen') + '</small>' },
        { label: 'Bazoš stav', render: (r) => '<span class="status ' + (isPublishableIdentity(r, data.ads) ? 'ok' : 'risk') + '">' + (isPublishableIdentity(r, data.ads) ? 'Připraveno' : 'Vyžaduje zásah') + '</span><small class="card-note">' + statusLabel(r.status) + ' / ' + statusLabel(r.sessionState) + ' / ' + statusLabel(r.reviewState || 'clear') + '</small>' },
        { label: 'Kapacita', render: (r) => '<strong>' + cell(r.remaining) + '</strong><small class="card-note">zbývá z 50, aktivní ' + cell(r.activeCount) + '</small>' },
      ], identityRows, 'Pro tento účet zatím není připojena žádná Bazoš identita.', settingsLink('Připojit')) +
      '</div><div class="data-panel"><h2>Moje inzeráty v přehledu</h2>' +
      tableOnly([
        { label: 'Inzerát', render: (r) => '<button class="link-button" data-open-ad="' + cell(r.id) + '" type="button"><strong>' + cell(r.title || r.name || r.productName || r.id) + '</strong></button><small class="card-note">' + cell(r.category || r.categoryName || r.bazosCategory || '') + '</small>' },
        { label: 'Stav', render: (r) => '<span class="status ' + statusClass(r.publishStatus || r.status || r.bazosStatus) + '">' + statusLabel(r.publishStatus || r.status || r.bazosStatus || 'draft') + '</span>' },
        { label: 'Odkaz', render: (r) => bazosAdUrl(r) ? '<a class="table-link" href="' + escapeHtml(bazosAdUrl(r)) + '" target="_blank" rel="noopener">Zobrazit na Bazoši</a>' : '<button class="link-button" data-nav-view="details" type="button">Otevřít v mých inzerátech</button>' },
      ], recentAds, 'Pro tento účet nebyly vráceny žádné inzeráty.') +
      '</div></div>';
    bindContentNavButtons();
    content.querySelectorAll('[data-open-ad]').forEach((button) => button.addEventListener('click', () => openDraftDetails(button.dataset.openAd)));
    bindIdentityWizardButtons();
  }

  function renderDetails(data) {
    content.innerHTML = refreshSummaryMarkup(data.refreshSummary) + table([
      { label: 'Inzerát', render: (r) => '<button class="link-button" data-open-ad="' + cell(r.id) + '" type="button"><strong>' + cell(r.title || r.name || r.productName || r.id) + '</strong></button><small class="card-note">' + cell(r.category || r.categoryName || r.bazosCategory || '') + '</small>' },
      { label: 'Stav na Bazoši', render: (r) => '<span class="status ' + statusClass(r.status || r.bazosStatus || r.publishStatus) + '">' + statusLabel(r.status || r.bazosStatus || r.publishStatus || 'draft') + '</span>' },
      { label: 'Kategorie', render: (r) => cell(r.category || r.categoryName || r.bazosCategory) },
      { label: 'Odkaz', render: (r) => bazosAdUrl(r) ? '<a class="table-link" href="' + escapeHtml(bazosAdUrl(r)) + '" target="_blank" rel="noopener">Zobrazit</a>' : cell('Zatím bez Bazoš ID') },
      { label: 'Aktualizováno', render: (r) => cell(r.updatedAt || r.createdAt) },
      { label: 'Kontroly', render: (r) => policySummaryChips(r) },
      { label: 'Akce', render: (r) => publishActionMarkup(r, data.queue) },
    ], data.ads, 'Pro tento účet nebyly vráceny žádné inzeráty.');
    content.querySelectorAll('[data-open-ad], [data-edit-ad]').forEach((button) => button.addEventListener('click', () => openDraftDetails(button.dataset.openAd || button.dataset.editAd)));
    content.querySelectorAll('[data-publish]').forEach((button) => button.addEventListener('click', () => enqueuePublish(button.dataset.publish)));
    content.querySelectorAll('[data-open-bazos-manage]').forEach((button) => button.addEventListener('click', () => openBazosManageWithPreparedData(button.dataset.openBazosManage)));
    content.querySelectorAll('[data-claim-attempt]').forEach((button) => button.addEventListener('click', () => claimDueAttempt(button.dataset.claimAttempt)));
    content.querySelectorAll('[data-open-submission]').forEach((button) => button.addEventListener('click', () => openSubmission(button.dataset.openSubmission)));
  }

  function renderDraftEditor(ad) {
    const options = draftOptions(ad);
    const editable = canEditAd(ad);
    const published = isPublishedAd(ad);
    const publishButton = published ? '' : '<button class="button button-primary" data-publish-detail="' + cell(ad.id) + '" type="button">Publikovat</button>';
    const rubric = options.rubric || inferRubricForCategory(ad.category);
    const editorNote = published
      ? 'Po uložení se změny uloží u nás. Externí Bazoš.cz se nezmění, dokud aktualizace neproběhne v ověřené Bazoš relaci. Stejné změny je potřeba provést také přímo na Bazoš.cz.'
      : 'Změny se uloží do konceptu před publikováním.';
    content.innerHTML = '<form class="form-panel panel-stack" id="edit-draft-form"><div><h2>' + (editable ? 'Upravit inzerát' : 'Detail inzerátu') + '</h2><p class="card-note">Aktuální stav: <span class="status ' + statusClass(ad.publishStatus || ad.status || ad.bazosStatus) + '">' + statusLabel(ad.publishStatus || ad.status || ad.bazosStatus || 'draft') + '</span></p><p class="card-note">' + editorNote + '</p></div><div class="form-grid">' +
      '<label>Cena v Kč<input name="price" type="number" min="0" step="1" value="' + escapeHtml(ad.price ?? 0) + '"' + (editable ? '' : ' disabled') + '></label>' +
      '<label>Volba ceny<select name="priceOption"' + (editable ? '' : ' disabled') + '>' + priceOptionOptions(options.priceOption) + '</select></label>' +
      '<label>Rubrika<select name="rubric" data-bazos-rubric required' + (editable ? '' : ' disabled') + '>' + rubricOptions(rubric) + '</select></label>' +
      '<label>Kategorie Bazos.cz<select name="category" data-bazos-category required' + (editable ? '' : ' disabled') + '>' + categoryOptions(rubric, ad.category || '') + '</select></label>' +
      '<div class="category-suggestions wide" data-category-suggestions></div>' +
      '<label class="wide">Název<input name="title" maxlength="500" required value="' + escapeHtml(ad.title || '') + '"' + (editable ? '' : ' disabled') + '></label>' +
      '<label class="wide">Popis<textarea name="description"' + (editable ? '' : ' disabled') + '>' + escapeHtml(ad.description || '') + '</textarea></label>' +
      '<label>Lokalita<input name="location" maxlength="200" value="' + escapeHtml(ad.location || '') + '"' + (editable ? '' : ' disabled') + '></label>' +
      '</div><p class="form-message" data-form-message></p><div class="row-actions"><button class="button button-secondary" data-back-details type="button">Zpět na moje inzeráty</button>' + (editable ? '<button class="button button-primary" type="submit">' + (published ? 'Uložit a otevřít Upravit/Vymazat' : 'Uložit změny') + '</button>' : '') + publishButton + '</div></form>';
    const form = document.getElementById('edit-draft-form');
    bindBazosCategoryControls(form);
    content.querySelector('[data-back-details]')?.addEventListener('click', () => renderClient());
    content.querySelector('[data-publish-detail]')?.addEventListener('click', (event) => enqueuePublish(event.currentTarget.dataset.publishDetail));
    if (editable) form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (published) return saveAndOpenBazosManage(form, ad, options);
      return saveDraftEditsFromForm(form, ad, options);
    });
  }

  async function openDraftDetails(id) {
    content.innerHTML = '<div class="data-panel empty-state">Načítá se inzerát...</div>';
    try {
      const ad = await request('/api/bazos/ads/' + encodeURIComponent(id));
      renderDraftEditor(ad);
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  function adPayloadFromForm(form, originalOptions) {
    const values = Object.fromEntries(new FormData(form).entries());
    return {
      title: values.title,
      description: values.description || undefined,
      price: Number(values.price || 0),
      priceOption: values.priceOption || 'fixed_price',
      rubric: values.rubric || inferRubricForCategory(values.category),
      category: values.category || undefined,
      location: values.location || undefined,
      stockQuantity: values.stockQuantity ? Number(values.stockQuantity) : undefined,
      media: originalOptions.media || [],
    };
  }


  async function openBazosManageWithPreparedData(id) {
    try {
      await request('/api/bazos/ads/' + encodeURIComponent(id) + '/manage-opened', { method: 'POST', body: '{}' });
      const ad = await request('/api/bazos/ads/' + encodeURIComponent(id));
      window.open(bazosManageUrl(ad), '_blank', 'noopener');
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  async function saveAndOpenBazosManage(form, originalAd, originalOptions) {
    const formMessage = content.querySelector('[data-form-message]');
    if (formMessage) formMessage.textContent = 'Ukládá se a otevírá Bazoš.cz...';
    try {
      const updated = await saveDraftEditsFromForm(form, originalAd, originalOptions, false);
      await request('/api/bazos/ads/' + encodeURIComponent(updated.id) + '/manage-opened', { method: 'POST', body: '{}' });
      window.open(bazosManageUrl(updated), '_blank', 'noopener');
    } catch (error) {
      // saveDraftEditsFromForm already renders the form error.
    }
  }

  async function saveDraftEditsFromForm(form, originalAd, originalOptions, renderAfterSave = true) {
    const payload = adPayloadFromForm(form, originalOptions);
    const formMessage = content.querySelector('[data-form-message]');
    if (formMessage) formMessage.textContent = 'Ukládají se změny...';
    try {
      const updated = await request('/api/bazos/ads/' + encodeURIComponent(originalAd.id), { method: 'PATCH', body: JSON.stringify(payload) });
      if (renderAfterSave) {
        renderDraftEditor(updated);
        const savedMessage = content.querySelector('[data-form-message]');
        if (savedMessage) savedMessage.textContent = isPublishedAd(updated) ? 'Změny byly uloženy u nás. Externí Bazoš.cz zatím není potvrzeně aktualizovaný.' : 'Změny byly uloženy.';
      }
      return updated;
    } catch (error) {
      if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message);
      throw error;
    }
  }

  async function saveDraftEdits(event, originalAd, originalOptions) {
    event.preventDefault();
    return saveDraftEditsFromForm(event.currentTarget, originalAd, originalOptions);
  }

  function renderPublish(data) {
    if (!data.identities.length) {
      content.innerHTML = missingSettingsMarkup('Nejdříve připojte účet Bazoš v sekci Nastavení Bazos.cz.', 'Připojit účet Bazoš');
      bindContentNavButtons();
      return;
    }
    content.innerHTML = '<form class="form-panel panel-stack" id="draft-form"><div><h2>Nový inzerát pro Bazos.cz</h2><p class="card-note">Vyberte ověřenou identitu, vyplňte inzerát a zvolte, jestli se má uložit do katalogu nebo poslat do hlídané publikační fronty.</p></div><div class="form-grid">' +
      '<label>Účet / telefon<select name="identityId" required>' + renderIdentityOptions(data.identities) + '</select></label>' +
      '<label>Cena v Kč<input name="price" type="number" min="0" step="1" required></label>' +
      '<label>Volba ceny<select name="priceOption">' + priceOptionOptions('fixed_price') + '</select></label>' +
      '<label>Rubrika<select name="rubric" data-bazos-rubric required>' + rubricOptions('auto') + '</select></label>' +
      '<label>Kategorie Bazos.cz<select name="category" data-bazos-category required>' + categoryOptions('auto', '') + '</select></label>' +
      '<div class="category-suggestions wide" data-category-suggestions></div>' +
      '<label class="wide">Název<input name="title" minlength="5" maxlength="' + BAZOS_TITLE_MAX_LENGTH + '" required></label>' +
      '<label class="wide">Popis<textarea name="description" maxlength="' + BAZOS_DESCRIPTION_MAX_LENGTH + '" required></textarea><small class="card-note">Max ' + BAZOS_DESCRIPTION_MAX_LENGTH + ' znaků.</small></label>' +
      '<label>Lokalita<input name="location" maxlength="200"></label>' +
      '<label>Značka<input name="brand" maxlength="200"></label>' +
      '<label>Výrobce<input name="manufacturer" maxlength="200"></label>' +
      '<label>EAN<input name="ean" maxlength="64"></label>' +
      '<label>Hmotnost kg<input name="weightKg" type="number" min="0" step="0.01"></label>' +
      '<label>Délka cm<input name="lengthCm" type="number" min="0" step="0.1"></label>' +
      '<label>Šířka cm<input name="widthCm" type="number" min="0" step="0.1"></label>' +
      '<label>Výška cm<input name="heightCm" type="number" min="0" step="0.1"></label>' +
      '<div class="wide manual-media-panel"><div><strong>Fotky pro Bazoš</strong><small class="card-note">Alespoň 1, maximálně ' + BAZOS_MEDIA_LIMIT + '. Nahrajte soubory nebo vložte veřejné HTTPS/HTTP URL obrázků; stejné fotky se uloží i k produktu v katalogu.</small></div><label>Upload fotek<input data-manual-photo-files name="photos" type="file" accept="image/*" multiple></label><div data-manual-media-list></div><div class="row-actions"><button class="button button-secondary" data-add-manual-media type="button">Přidat URL fotku</button><span class="card-note" data-manual-media-counter>0 / ' + BAZOS_MEDIA_LIMIT + '</span></div><div class="manual-media-preview" data-manual-media-preview></div></div>' +
      '<label class="check-row"><input name="enqueue" type="checkbox" checked disabled><span>Publikovat inzerát na Bazoš přes hlídanou frontu. Potvrzuji ruční kontrolu duplicity a obsahu.</span></label>' +
      '<label class="check-row"><input name="saveToCatalog" type="checkbox" checked disabled><span>Přidat tento inzerát do katalogu produktů. Pokud podobný produkt existuje, použije se jako Bazoš verze.</span></label>' +
      '</div><p class="form-message" data-form-message></p><button class="button button-primary" type="submit">Vytvořit inzerát</button></form>';
    const form = document.getElementById('draft-form');
    bindBazosCategoryControls(form);
    bindIdentityDefaults(form, data.identities);
    bindManualPublishControls(form);
    form.addEventListener('submit', createDraft);
  }

  function accountBulkFormMarkup() {
    if (!accountBulkOpen) return '';
    return '<form class="form-panel panel-stack" id="bulk-identity-form"><div><h2>Přidat více Bazoš účtů</h2><div class="bulk-account-help card-note"><span>Každý řádek je jeden účet. Formát: <code>telefon; název; kontaktní jméno; kontaktní telefon; PSČ; lokalita; poznámka</code>.</span><span>Stačí vyplnit telefon; ostatní údaje můžete doplnit později přes Upravit.</span></div></div><label class="wide">Účty<textarea name="bulkIdentities" rows="6" placeholder="+420777000001; Bazoš účet - motodíly; Jan Novák; +420777000001; 11000; Praha; hlavní účet"></textarea></label><p class="form-message" data-form-message></p><div class="row-actions"><button class="button button-primary" type="submit">Uložit účty</button><button class="button button-secondary" data-close-bulk-identities type="button">Zavřít</button></div></form>';
  }

  function identityEditFormMarkup(identity) {
    if (!identity) return '';
    return '<form class="form-panel panel-stack" id="identity-edit-form"><div><h2>Upravit Bazoš účet</h2><p class="card-note">Telefon se nemění. Pro jiný telefon přidejte novou identitu a dokončete ověření.</p></div><div class="form-grid">' +
      '<label>Telefon<input value="' + cell(identity.phoneNumber) + '" readonly></label>' +
      '<label>Název pro přehled<input name="displayName" maxlength="200" value="' + cell(identity.displayName || '') + '" required></label>' +
      '<label>Kontaktní jméno<input name="contactName" maxlength="200" value="' + cell(identity.contactName || '') + '"></label>' +
      '<label>Kontaktní telefon<input name="contactPhone" maxlength="50" value="' + cell(identity.contactPhone || '') + '"></label>' +
      '<label>PSČ<input name="defaultZip" maxlength="20" value="' + cell(identity.defaultZip || '') + '"></label>' +
      '<label>Lokalita<input name="defaultLocation" maxlength="200" value="' + cell(identity.defaultLocation || '') + '"></label>' +
      '<label class="wide">Popis účtu<textarea name="notes">' + cell(identity.notes || '') + '</textarea></label>' +
      '</div><p class="form-message" data-form-message></p><div class="row-actions"><button class="button button-primary" type="submit">Uložit změny</button><button class="button button-secondary" data-cancel-identity-edit type="button">Zrušit</button></div></form>';
  }

  function bindAccountIdentityButtons(data) {
    content.querySelector('[data-open-bulk-identities]')?.addEventListener('click', () => { accountBulkOpen = true; editingIdentityId = null; renderAccount(data); });
    content.querySelector('[data-close-bulk-identities]')?.addEventListener('click', () => { accountBulkOpen = false; renderAccount(data); });
    content.querySelector('#bulk-identity-form')?.addEventListener('submit', createBulkIdentities);
    content.querySelectorAll('[data-edit-identity]').forEach((button) => button.addEventListener('click', () => { editingIdentityId = button.dataset.editIdentity; accountBulkOpen = false; renderAccount(data); }));
    content.querySelector('[data-cancel-identity-edit]')?.addEventListener('click', () => { editingIdentityId = null; renderAccount(data); });
    const editForm = content.querySelector('#identity-edit-form');
    if (editForm && editingIdentityId) editForm.addEventListener('submit', (event) => saveIdentityEdit(event, editingIdentityId));
  }

  function renderAccount(data) {
    const summary = accountSummary(data.identities, data.ads, data.queue);
    const identityRows = data.identities.map((identity) => ({
      ...identity,
      activeCount: identityActiveCount(identity, data.ads),
      remaining: isVerified(identity) ? Math.max(50 - identityActiveCount(identity, data.ads), 0) : 0,
      canPublish: isPublishableIdentity(identity, data.ads),
    }));
    const editingIdentity = data.identities.find((identity) => identity.id === editingIdentityId);
    content.innerHTML = '<div class="summary-grid">' +
      stat('Bazoš identity', data.identities.length) +
      stat('Ověřené telefony', data.identities.filter(isVerified).length) +
      stat('Aktivní relace', data.identities.filter(hasActiveSession).length) +
      stat('Může publikovat', summary.publishable.length) +
      '</div><div class="account-tools"><div class="row-actions"><button class="button button-primary" data-open-bulk-identities type="button">Přidat Bazoš účty</button><button class="button button-secondary" data-nav-view="publish" type="button">Publikovat přes účet</button><button class="button button-secondary" data-nav-view="settings" type="button">Jednotlivé nastavení</button></div>' +
      accountBulkFormMarkup() + identityEditFormMarkup(editingIdentity) + '</div>' + table([
        { label: 'Účet', render: (r) => '<strong>' + cell(r.displayName || r.phoneNumber) + '</strong><small class="card-note">Propojení účtu: ' + (hasLinkedAccount(r) ? 'propojeno' : 'čeká na dokončení') + '</small>' },
        { label: 'Telefon', render: (r) => '<span class="status ' + (isVerified(r) ? 'ok' : 'risk') + '">' + statusLabel(r.status) + '</span><small class="card-note">' + cell(r.phoneNumber) + '</small>' },
        { label: 'Relace', render: (r) => '<span class="status ' + statusClass(r.sessionState) + '">' + statusLabel(r.sessionState) + '</span>' },
        { label: 'Publikování', render: (r) => '<span class="status ' + (r.canPublish ? 'ok' : 'risk') + '">' + (r.canPublish ? 'Může publikovat' : 'Nelze publikovat') + '</span><small class="card-note">Aktivní: ' + cell(r.activeCount) + ' / 50, zbývá ' + cell(r.remaining) + '</small>' },
        { label: 'Kontrola', render: (r) => '<span class="status ' + statusClass(r.reviewState) + '">' + statusLabel(r.reviewState || 'clear') + '</span><small class="card-note">Platnost: ' + cell(r.verificationExpiresAt) + '</small>' },
        { label: 'Ověření', render: (r) => verificationActions(r) },
        { label: 'Akce', render: (r) => '<div class="row-actions"><button class="button button-secondary" data-edit-identity="' + cell(r.id) + '" type="button">Upravit</button><button class="button button-secondary" data-nav-view="publish" type="button">Publikovat</button></div>' },
      ], identityRows, 'Pro účet nejsou nastavené žádné Bazos identity.', '<div class="row-actions" style="justify-content:center;margin-top:14px"><button class="button button-primary" data-open-bulk-identities type="button">Přidat Bazoš účty</button></div>');
    bindVerificationButtons();
    bindAccountIdentityButtons(data);
    bindNavigationLinks(content);
  }

  function renderSettings(data) {
    content.innerHTML = '<div class="account-grid"><form class="form-panel panel-stack" id="identity-form"><div><h2>Nastavení Bazos.cz</h2><p class="card-note">Přidejte telefon a údaje prodejce. Interní ID Bazoš účtu není potřeba hledat ani vyplňovat; systém ho doplní při propojení účtu. Ověření telefonu a relace se dokončuje ručně přes Bazos.cz.</p>' + externalBazosNotice() + '</div><div class="form-grid">' +
      '<label>Telefon<input name="phoneNumber" minlength="9" maxlength="20" required></label>' +
      '<label>Název pro přehled<input name="displayName" maxlength="200" placeholder="např. Bazoš účet - motodíly" required></label>' +
      '<label>Kontaktní jméno<input name="contactName" maxlength="200"></label>' +
      '<label>Kontaktní telefon<input name="contactPhone" maxlength="50"></label>' +
      '<label>PSČ<input name="defaultZip" maxlength="20"></label>' +
      '<label>Lokalita<input name="defaultLocation" maxlength="200"></label>' +
      '<label class="wide">Popis účtu<textarea name="notes" placeholder="např. prodej motodílů, knih nebo sezónního zboží"></textarea></label>' +
      '</div><p class="form-message" data-form-message></p><button class="button button-primary" type="submit">Uložit nastavení</button></form><div class="data-panel"><h2>Co musí být splněno</h2><div class="gate-grid"><div class="gate-item"><strong>Telefon</strong>ověřený</div><div class="gate-item"><strong>Relace</strong>aktivní</div><div class="gate-item"><strong>Kontrola</strong>bez blokace</div><div class="gate-item"><strong>Účet</strong>propojený systémem</div><div class="gate-item"><strong>Limit</strong>méně než 50 aktivních inzerátů</div></div></div></div>' +
      table([
        { label: 'Identita', render: (r) => '<strong>' + cell(r.displayName || r.phoneNumber) + '</strong><small class="card-note">Účet Alfares: ' + cell(currentUser?.email || 'není k dispozici') + '</small>' },
        { label: 'Uložené údaje', render: (r) => identitySavedFields(r) },
        { label: 'Stav', render: (r) => '<span class="status ' + statusClass(r.status) + '">' + statusLabel(r.status) + '</span><small class="card-note">Telefon: ' + cell(r.phoneNumber) + '</small>' },
        { label: 'Relace', render: (r) => '<span class="status ' + statusClass(r.sessionState) + '">' + statusLabel(r.sessionState) + '</span>' },
        { label: 'Může publikovat', render: (r) => '<span class="status ' + (isPublishableIdentity(r) ? 'ok' : 'risk') + '">' + (isPublishableIdentity(r) ? 'Ano' : 'Ne') + '</span><small class="card-note">' + (hasLinkedAccount(r) ? 'Účet je propojený' : 'Čeká na propojení účtu') + '</small>' },
        { label: 'Ověření', render: (r) => verificationActions(r) },
      ], data.identities, 'Zatím není uložené žádné nastavení Bazos.cz.', settingsLink('Přidat nastavení'));
    document.getElementById('identity-form').addEventListener('submit', createIdentity);
    bindVerificationButtons();
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
    const productMedia = (product) => asArray(product, ['media']).filter((item) => String(item?.type || 'image').toLowerCase() === 'image' && item?.url).sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)) || Number(a.position || 0) - Number(b.position || 0));
    const normalizeMedia = (items) => asArray({ items }, ['items']).filter((item) => item?.url).slice(0, 20).map((item, index) => ({ id: item.id || item.url, url: item.url, thumbnailUrl: item.thumbnailUrl || item.url, altText: item.altText || item.title || '', title: item.title || item.altText || '', position: Number(item.position ?? index) }));
    const selectedMediaUrls = () => Array.from(document.querySelectorAll('[data-media-choice]:checked')).map((input) => String(input.value || '').trim()).filter(Boolean);
    const selectedIdentityId = () => document.getElementById('catalog-draft-form')?.elements.identityId?.value || data.identities[0]?.id || '';

    let catalogSearchTimer = null;
    let catalogSearchRequestId = 0;

    async function loadProducts(search) {
      const query = new URLSearchParams({ limit: '20', activeOnly: 'true' });
      if (catalogProductId && !search) query.set('productId', catalogProductId);
      else if (search) query.set('search', search);
      const catalog = await request('/ui/catalog/products?' + query.toString()).catch((error) => ({ error: error.message }));
      if (catalog.error) throw new Error(catalog.error);
      products = asArray(catalog, ['items', 'products', 'data']);
      selected = products[0] || null;
    }

    async function runCatalogSearch(search, focusSearch) {
      const requestId = ++catalogSearchRequestId;
      prepared = null;
      await loadProducts(search);
      if (requestId !== catalogSearchRequestId) return;
      draw(search, focusSearch);
    }

    function renderPreview() {
      if (!prepared?.draft) return '';
      const draft = prepared.draft;
      const allowed = Boolean(prepared.canQueueAfterConfirmation);
      return '<div class="preview-card">' +
        '<div class="panel-header"><h2>Náhled pro Bazoš</h2><span class="status ' + (allowed ? 'ok' : 'risk') + '">' + (allowed ? 'Připraveno ke schválení' : 'Vyžaduje kontrolu') + '</span></div>' +
        '<h3 class="preview-title">' + cell(draft.title) + '</h3>' +
        '<div class="preview-price">' + cell(draft.price) + ' Kč / ' + cell(priceOptionLabel(draft.priceOption || 'fixed_price')) + '</div>' +
        '<div class="preview-description">' + cell(draft.description || '') + '</div>' +
        (draft.media?.length ? '<div class="preview-media">' + draft.media.map((item) => '<img src="' + escapeHtml(item.thumbnailUrl || item.url) + '" alt="' + escapeHtml(item.altText || item.title || 'Foto') + '">').join('') + '</div>' : '') +
        '<div class="flow-meta">' +
          '<span>Rubrika<strong>' + cell(draft.rubric || '') + '</strong></span>' +
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
      const draft = prepared?.draft || {};
      form.elements.title.value = draft.title || productTitle(product);
      form.elements.description.value = draft.description || productDescription(product);
      const category = draft.category || productCategory(product);
      form.elements.price.value = draft.price ?? productPrice(product);
      form.elements.rubric.value = draft.rubric || inferRubricForCategory(category);
      bindBazosCategoryControls(form);
      form.elements.category.value = category;
      bindBazosCategoryControls(form);
      form.elements.location.value = draft.location || identityDefaultLocation(findIdentity(data.identities, form.elements.identityId?.value)) || '';
    }

    function draw(searchValue, focusSearch) {
      const options = data.identities.length ? renderIdentityOptions(data.identities) : '';
      const media = normalizeMedia(prepared?.draft?.media?.length ? prepared.draft.media : productMedia(selected));
      const mediaPicker = media.length ? '<div class="wide"><label>Fotky pro Bazoš</label><div class="media-picker">' + media.map((item, index) => '<div class="media-choice"><label><input data-media-choice type="checkbox" value="' + escapeHtml(item.url) + '"' + (prepared?.draft?.media?.length || index < 5 ? ' checked' : '') + '><img src="' + escapeHtml(item.thumbnailUrl || item.url) + '" alt="' + escapeHtml(item.altText || item.title || 'Foto') + '"><span>' + cell(item.title || item.altText || ('Foto ' + (index + 1))) + '</span></label></div>').join('') + '</div></div>' : '<p class="form-message wide">Katalog nevrátil žádné produktové fotky pro tento produkt.</p>';
      content.innerHTML = '<div class="catalog-flow"><div class="data-panel flow-column"><h2>Katalog</h2><div class="search-row"><input class="input" id="catalog-search" value="' + escapeHtml(searchValue || '') + '" placeholder="Hledat produkt podle názvu, SKU nebo značky"><button class="button button-secondary" id="catalog-search-button" type="button">Hledat</button></div><div class="product-list">' +
        products.map((product, index) => '<button class="product-option' + (product === selected ? ' active' : '') + '" type="button" data-product-index="' + index + '"><span class="product-thumb"></span><span><strong>' + cell(productTitle(product)) + '</strong><small class="card-note">' + cell(product.sku || product.id) + '</small></span></button>').join('') +
        '</div></div><div class="flow-column"><form class="form-panel panel-stack" id="catalog-draft-form"><div><h2>Publikovat z katalogu</h2><p class="card-note">Produkt se nejdříve převede do Bazoš konceptu. Teprve po náhledu a schválení se odešle do hlídané publikační fronty.</p></div><div class="form-grid"><label>Účet / telefon<select name="identityId" required>' + options + '</select></label><label>Cena v Kč<input name="price" type="number" min="0" step="1" required></label><label>Volba ceny<select name="priceOption">' + priceOptionOptions('fixed_price') + '</select></label><label>Rubrika<select name="rubric" data-bazos-rubric required>' + rubricOptions('auto') + '</select></label><label>Kategorie Bazos.cz<select name="category" data-bazos-category required>' + categoryOptions('auto', '') + '</select></label><div class="category-suggestions wide" data-category-suggestions></div><label class="wide">Název<input name="title" maxlength="500" required></label><label class="wide">Popis<textarea name="description"></textarea></label>' + mediaPicker + '<label>Lokalita<input name="location" maxlength="200"></label></div><p class="form-message" data-form-message></p><button class="button button-primary" type="submit">Sformovat inzerát</button></form>' + renderPreview() + '</div></div>';
      fillForm(selected);
      const searchInput = document.getElementById('catalog-search');
      if (focusSearch && searchInput) {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
      }
      searchInput?.addEventListener('input', () => {
        window.clearTimeout(catalogSearchTimer);
        const value = searchInput.value.trim();
        catalogSearchTimer = window.setTimeout(() => runCatalogSearch(value, true).catch((error) => {
          const formMessage = content.querySelector('[data-form-message]');
          if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message || 'Vyhledávání v katalogu selhalo.');
        }), 250);
      });
      document.getElementById('catalog-search-button')?.addEventListener('click', () => {
        window.clearTimeout(catalogSearchTimer);
        runCatalogSearch(document.getElementById('catalog-search').value.trim(), true).catch((error) => {
          const formMessage = content.querySelector('[data-form-message]');
          if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message || 'Vyhledávání v katalogu selhalo.');
        });
      });
      content.querySelectorAll('[data-product-index]').forEach((button) => button.addEventListener('click', () => {
        selected = products[Number(button.dataset.productIndex)];
        prepared = null;
        draw(document.getElementById('catalog-search')?.value || '');
      }));
      const form = document.getElementById('catalog-draft-form');
      bindBazosCategoryControls(form);
      bindIdentityDefaults(form, data.identities);
      form?.addEventListener('submit', prepare);
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
            priceOption: values.priceOption || 'fixed_price',
            rubric: values.rubric || inferRubricForCategory(values.category),
            category: values.category,
            location: values.location || undefined,
            stockQuantity: Number(selected.stockQuantity || selected.stock || 0),
            mediaUrls: selectedMediaUrls(),
          }),
        });
        draw(document.getElementById('catalog-search')?.value || '');
      } catch (error) {
        const formMessage = content.querySelector('[data-form-message]');
        if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message);
      }
    }

    async function confirm() {
      if (!selected || !prepared?.draft?.id) return;
      try {
        prepared = await request('/api/bazos/catalog/products/' + encodeURIComponent(selected.id) + '/sell-action/confirm', {
          method: 'POST',
          body: JSON.stringify(Object.assign({ adId: prepared.draft.id, confirmed: true, priceOption: prepared.draft.priceOption || 'fixed_price' }, manualEvidence())),
        });
        draw(document.getElementById('catalog-search')?.value || '');
      } catch (error) {
        const formMessage = content.querySelector('[data-form-message]');
        if (formMessage) formMessage.innerHTML = settingsErrorMarkup(error.message);
      }
    }

    try {
      await loadProducts('');
      if (!products.length) {
        content.innerHTML = missingSettingsMarkup('Katalog nevrátil žádné aktivní produkty. Pokud katalog není připojený, nastavte nejdříve Bazoš účet a návazné katalogové propojení.', 'Otevřít Nastavení Bazos.cz');
        return;
      }
      if (!data.identities.length) {
        content.innerHTML = missingSettingsMarkup('Nejdříve připojte účet Bazoš v sekci Nastavení Bazos.cz.', 'Připojit účet Bazoš');
        bindContentNavButtons();
        return;
      }
      draw('');
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + settingsErrorMarkup(error.message) + '</div>';
    }
  }

  function maybeStartPublishWorker(data) {
    if (mode !== 'client' || publishWorkerBusy || activeView === 'details') return;
    const due = asArray(data, ['queue']).find((attempt) => String(attempt?.status || '').toLowerCase() === 'queued' && isAttemptDue(attempt));
    if (!due) return;
    const key = 'bazosPublishWorkerPrompted:' + String(due.id || 'unknown');
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'true');
    content.insertAdjacentHTML('afterbegin', '<div class="data-panel panel-stack"><div><h2>Worker má připravený pokus ve frontě</h2><p class="card-note">Pokus je po plánovaném čase a čeká na předání do ověřeného Bazoš prohlížeče.</p></div><div class="flow-actions"><button class="button button-primary" data-claim-attempt="' + cell(due.id) + '" type="button">Odeslat přes worker</button><button class="button button-secondary" data-nav-view="details" type="button">Zobrazit frontu</button></div></div>');
    bindContentNavButtons();
    content.querySelector('[data-claim-attempt]')?.addEventListener('click', () => claimDueAttempt(due.id));
  }

  async function renderClient(options) {
    content.innerHTML = '<div class="data-panel empty-state">Načítají se data Bazos.cz...</div>';
    const data = await loadClientData(options);
    renderConnectionBanner(data);
    maybeAutoOpenConnectionWizard(data);
    if (activeView === 'overview') renderOverview(data);
    else if (activeView === 'details') renderDetails(data);
    else if (activeView === 'publish') renderPublish(data);
    else if (activeView === 'account') renderAccount(data);
    else if (activeView === 'settings') renderSettings(data);
    else if (activeView === 'catalog') await renderCatalog(data);
    maybeStartPublishWorker(data);
  }

  function navigateTo(view) {
    activeView = view;
    const hash = activeView === 'settings' ? 'bazos-settings' : activeView;
    if (mode === 'client') window.history.replaceState(null, document.title, '/client#' + hash);
    syncActiveTabs();
    render();
  }

  function bindNavigationLinks(container) {
    (container || document).querySelectorAll('[data-nav-view], [data-sidebar-view]').forEach((button) => {
      if (button.dataset.navBound === 'true') return;
      button.dataset.navBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        navigateTo(button.dataset.navView || button.dataset.sidebarView);
      });
    });
  }

  function bindContentNavButtons() {
    bindNavigationLinks(content);
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

  bindNavigationLinks(document);

  function startPublishWorkerTimer() {
    if (publishWorkerTimer || mode !== 'client') return;
    publishWorkerTimer = window.setInterval(() => {
      if (document.hidden || publishWorkerBusy || root.dataset.authPending !== 'false' || !token()) return;
      loadClientData().then(maybeStartPublishWorker).catch(() => undefined);
    }, 15000);
  }

  const requestedAuthAction = new URLSearchParams(window.location.search).get('auth');
  if (mode === 'client' && !token()) {
    const action = requestedAuthAction === 'register' ? 'register' : 'login';
    window.history.replaceState(null, document.title, '/client');
    startHostedAuth(action);
    return;
  }

  startPublishWorkerTimer();

  refresh.addEventListener('click', () => {
    if (mode === 'client') return renderClient({ refreshExternal: true });
    return render();
  });
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
