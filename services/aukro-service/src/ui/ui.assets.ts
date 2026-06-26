type AppMode = 'admin' | 'client';

const pageShell = (title: string, body: string) => `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="Služba AlfaRes Bazoš pomáhá prodejcům připravovat, sledovat a spravovat inzeráty na Bazoš.cz v souladu s pravidly.">
  <link rel="stylesheet" href="/ui/app.css?v=bazos-hero-typography-20260626">
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
      <a class="button button-primary" href="/client">${icon('login')}Přihlásit se / registrovat</a>
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

      <section class="portal-section">
        <a class="portal-card" href="/client">
          <span>${icon('client')}Klientský panel</span>
          <strong>Registrujte se nebo se přihlaste pro správu inzerátů, sledování stavu na Bazoši a žádosti o publikování přes hlídané postupy.</strong>
        </a>
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
  const navLabel = mode === 'admin' ? 'Administrátorský panel' : 'Klientský panel';
  const detailsLabel = mode === 'admin' ? 'Fronta ke kontrole' : 'Moje inzeráty';
  const authTitle = mode === 'admin' ? 'Přihlášení administrátora' : 'Přihlásit se nebo registrovat';
  const authCopy = mode === 'admin'
    ? 'Přihlášení administrátora probíhá přes jednotný Alfares Auth účet.'
    : 'Přihlášení i registrace probíhá přes jednotný Alfares Auth účet pro celou ekosystémovou službu.';
  const registerAuthAction = mode === 'client'
    ? `<button class="button button-secondary" data-auth-action="register" type="button">${icon('client')}Registrovat v Alfares Auth</button>`
    : '';
  return pageShell(
    title,
    `<div class="app-shell" data-mode="${mode}">
      <aside class="app-sidebar">
        <a class="brand" href="/">
          <span class="brand-mark">B</span>
          <span>Služba Bazoš</span>
        </a>
        <nav class="app-nav" aria-label="Navigace pracovního prostoru">
          <a class="active" href="/${mode}">${icon(mode === 'admin' ? 'admin' : 'client')}${navLabel}</a>
          <a href="/">${icon('layout')}Úvodní stránka</a>
          <a href="/#compliance">${icon('shield')}Soulad s pravidly</a>
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
            <a class="button button-secondary hidden" id="admin-link" href="/admin">${icon('admin')}Administrace</a>
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
          <div class="toolbar">
            <div class="tabs" role="tablist">
              <button class="tab active" data-view="overview" type="button">Přehled</button>
              <button class="tab" data-view="details" type="button">${detailsLabel}</button>
            </div>
            <button class="button button-secondary" id="refresh" type="button">${icon('refresh')}Obnovit</button>
          </div>
          <div id="workspace-content" class="workspace-content"></div>
        </section>
      </main>
    </div>
    <script src="/ui/app.js?v=hosted-auth-20260626"></script>`,
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  gap: 22px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 650;
}
.site-nav a:hover, .app-nav a:hover { color: var(--hover-red); }
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
.preview-panel, .benefit-grid article, .portal-card, .auth-panel {
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
.benefit-band, .workflow-section, .portal-section, .pricing-section {
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
.benefit-grid p, .portal-card strong, .auth-panel p {
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
.portal-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.portal-card {
  display: grid;
  gap: 12px;
  padding: 28px;
}
.portal-card span {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--red);
  font-weight: 800;
}
.portal-card strong {
  color: var(--ink);
  font-size: 24px;
  line-height: 1.25;
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
.workspace-content {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.stat-card, .data-panel {
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
@media (max-width: 960px) {
  .site-header { padding: 0 20px; }
  .site-nav { display: none; }
  .hero-section, .section-heading, .portal-section, .auth-panel, .pricing-section {
    grid-template-columns: 1fr;
  }
  .hero-section { padding: 44px 20px; }
  .product-frame { min-width: 0; }
  .preview-grid, .benefit-grid, .workflow, .summary-grid {
    grid-template-columns: 1fr;
  }
  .benefit-band, .workflow-section, .portal-section { padding: 52px 20px; }
  .site-footer { padding: 24px 20px; flex-direction: column; }
  .app-shell { grid-template-columns: 1fr; }
  .app-sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .app-nav { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .app-main { padding: 18px; }
  .app-topbar, .toolbar { align-items: flex-start; flex-direction: column; }
  .data-table { display: block; overflow-x: auto; }
}
@media (max-width: 560px) {
  .hero-copy h1 { font-size: 32px; }
  .hero-lede { font-size: 17px; }
  .button { width: 100%; }
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
  const content = document.getElementById('workspace-content');
  const message = document.getElementById('form-message');
  const sessionLabel = document.getElementById('session-label');
  const signOut = document.getElementById('sign-out');
  const adminLink = document.getElementById('admin-link');
  const refresh = document.getElementById('refresh');
  let activeView = 'overview';

  const token = () => localStorage.getItem(tokenKey);
  const setMessage = (text) => { if (message) message.textContent = text || ''; };

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
      showAuth();
      throw new Error('Relace vypršela. Přihlaste se prosím znovu.');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || body.error?.message || 'Požadavek selhal');
    }
    return response.json();
  }

  function showAuth() {
    authPanel.classList.remove('hidden');
    workspace.classList.add('hidden');
    signOut.classList.add('hidden');
    adminLink?.classList.add('hidden');
    sessionLabel.textContent = 'Nejste přihlášeni';
  }

  function showWorkspace(user, access) {
    authPanel.classList.add('hidden');
    workspace.classList.remove('hidden');
    signOut.classList.remove('hidden');
    if (mode === 'client' && access?.admin) adminLink?.classList.remove('hidden');
    else adminLink?.classList.add('hidden');
    sessionLabel.textContent = user?.email || 'Přihlášeno';
  }

  function statusClass(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('active') || text.includes('published') || text.includes('ok') || text.includes('ready')) return 'ok';
    if (text.includes('blocked') || text.includes('failed') || text.includes('review') || text.includes('challenge')) return 'risk';
    return 'wait';
  }

  function cell(value) {
    if (value === null || value === undefined || value === '') return 'Nenastaveno';
    if (typeof value === 'boolean') return value ? 'Ano' : 'Ne';
    if (typeof value === 'object') return Object.values(value).filter(Boolean).slice(0, 2).join(', ') || 'Zaznamenáno';
    return String(value);
  }

  function statusLabel(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('active')) return 'Aktivní';
    if (text.includes('published')) return 'Publikováno';
    if (text.includes('ready')) return 'Připraveno';
    if (text.includes('blocked')) return 'Blokováno';
    if (text.includes('failed')) return 'Selhalo';
    if (text.includes('review')) return 'Ke kontrole';
    if (text.includes('challenge')) return 'Vyžaduje zásah';
    if (text.includes('draft')) return 'Koncept';
    if (text.includes('queued')) return 'Ve frontě';
    if (text.includes('expired')) return 'Expirováno';
    return cell(value);
  }

  function stat(label, value) {
    return '<article class="stat-card"><span>' + label + '</span><strong>' + cell(value) + '</strong></article>';
  }

  function table(headers, rows, emptyText) {
    if (!rows || rows.length === 0) return '<div class="data-panel empty-state">' + emptyText + '</div>';
    return '<div class="data-panel"><table class="data-table"><thead><tr>' +
      headers.map((h) => '<th>' + h.label + '</th>').join('') +
      '</tr></thead><tbody>' +
      rows.map((row) => '<tr>' + headers.map((h) => '<td>' + h.render(row) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>';
  }

  async function renderAdmin() {
    content.innerHTML = '<div class="data-panel empty-state">Načítají se administrátorská data...</div>';
    const summary = await request('/api/bazos/monitoring/summary').catch((error) => ({ error: error.message }));
    const blocked = await request('/api/bazos/monitoring/blocked-attempts?limit=25').catch(() => []);
    if (summary.error) {
      content.innerHTML = '<div class="data-panel empty-state">' + summary.error + '</div>';
      return;
    }
    if (activeView === 'overview') {
      content.innerHTML =
        '<div class="summary-grid">' +
        stat('Pokusy o publikování', summary.publishAttempts || summary.totalPublishAttempts || 0) +
        stat('Blokované pokusy', summary.blockedAttempts || blocked.length || 0) +
        stat('Identity ke kontrole', summary.reviewIdentities || summary.identitiesNeedingReview || 0) +
        stat('Sledované aktivní inzeráty', summary.activeAds || summary.activeAdsTracked || 0) +
        '</div><div class="data-panel"><h2>Zaměření administrátora</h2><p class="card-note">Kontrolujte blokované pokusy a identity vyžadující ruční zásah. Kontroly publikování nadále vynucují backendová pravidla.</p></div>';
    } else {
      const rows = Array.isArray(blocked) ? blocked : (blocked.items || blocked.blockedAttempts || []);
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
      content.innerHTML = '<div class="data-panel"><h2>Výsledek kontroly pravidel</h2><pre>' + JSON.stringify(result, null, 2) + '</pre></div>';
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + error.message + '</div>';
    }
  }

  async function enqueuePublish(id) {
    content.innerHTML = '<div class="data-panel empty-state">Odesílá se žádost do hlídané publikační fronty...</div>';
    try {
      const result = await request('/api/bazos/ads/' + encodeURIComponent(id) + '/publish', { method: 'POST', body: '{}' });
      content.innerHTML = '<div class="data-panel"><h2>Výsledek fronty</h2><pre>' + JSON.stringify(result, null, 2) + '</pre></div>';
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + error.message + '</div>';
    }
  }

  async function renderClient() {
    content.innerHTML = '<div class="data-panel empty-state">Načítají se inzeráty...</div>';
    const result = await request('/api/bazos/ads').catch((error) => ({ error: error.message }));
    if (result.error) {
      content.innerHTML = '<div class="data-panel empty-state">' + result.error + '</div>';
      return;
    }
    const offers = Array.isArray(result) ? result : (result.items || result.offers || []);
    if (activeView === 'overview') {
      const active = offers.filter((offer) => String(offer.status || offer.bazosStatus || '').toLowerCase().includes('active')).length;
      content.innerHTML =
        '<div class="summary-grid">' +
        stat('Celkem inzerátů', offers.length) +
        stat('Aktivní na Bazoši', active) +
        stat('Vyžaduje kontrolu', offers.filter((offer) => statusClass(offer.status || offer.bazosStatus) === 'risk').length) +
        stat('Koncepty / ve frontě', Math.max(offers.length - active, 0)) +
        '</div><div class="data-panel"><h2>Zákaznický pracovní prostor</h2><p class="card-note">Pomocí akcí u inzerátu ověřte pravidla před žádostí o hlídané publikování. Backend stále vynucuje každou kontrolu.</p></div>';
    } else {
      content.innerHTML = table([
        { label: 'Inzerát', render: (r) => '<strong>' + cell(r.title || r.name || r.productName || r.id) + '</strong><small class="card-note">' + cell(r.productId || r.sku || '') + '</small>' },
        { label: 'Stav na Bazoši', render: (r) => '<span class="status ' + statusClass(r.status || r.bazosStatus || r.publishStatus) + '">' + statusLabel(r.status || r.bazosStatus || r.publishStatus || 'draft') + '</span>' },
        { label: 'Kategorie', render: (r) => cell(r.category || r.categoryName || r.bazosCategory) },
        { label: 'Aktualizováno', render: (r) => cell(r.updatedAt || r.createdAt) },
        { label: 'Akce', render: (r) => '<div class="row-actions"><button class="button button-secondary" data-policy="' + cell(r.id) + '" type="button">Pravidla</button><button class="button button-primary" data-publish="' + cell(r.id) + '" type="button">Publikovat</button></div>' },
      ], offers, 'Pro tento účet nebyly vráceny žádné inzeráty.');
      content.querySelectorAll('[data-policy]').forEach((button) => button.addEventListener('click', () => policyCheck(button.dataset.policy)));
      content.querySelectorAll('[data-publish]').forEach((button) => button.addEventListener('click', () => enqueuePublish(button.dataset.publish)));
    }
  }

  async function render() {
    if (!token()) return showAuth();
    try {
      const me = await request('/ui/auth/me?mode=' + encodeURIComponent(mode));
      showWorkspace(me.user, me.access);
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

  refresh.addEventListener('click', render);
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      activeView = tab.dataset.view;
      render();
    });
  });

  render();
})();
`;
