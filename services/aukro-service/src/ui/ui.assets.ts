type AppMode = 'admin' | 'client';

const pageShell = (title: string, body: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="AlfaRes Bazos Service helps sellers prepare, monitor, and manage compliant Bazos.cz listings.">
  <link rel="stylesheet" href="/ui/app.css">
</head>
<body>
${body}
</body>
</html>`;

const icon = (name: string) => `<span class="icon icon-${name}" aria-hidden="true"></span>`;

export const renderLandingPage = () =>
  pageShell(
    'AlfaRes Bazos Service',
    `<header class="site-header">
      <a class="brand" href="/" aria-label="AlfaRes Bazos Service">
        <span class="brand-mark">B</span>
        <span>Bazos Service</span>
      </a>
      <nav class="site-nav" aria-label="Main navigation">
        <a href="#benefits">Benefits</a>
        <a href="#pricing">Pricing</a>
        <a href="#compliance">Compliance</a>
        <a href="/client">Client login</a>
      </nav>
      <a class="button button-primary" href="/client">${icon('login')}Sign in</a>
    </header>

    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <h1>Publish your Bazos offers from one compliant workspace.</h1>
          <p class="hero-lede">For 49 Kc per month, sellers can prepare offers, monitor Bazos status, and request guarded publishing through AlfaRes without losing visibility into Bazos.cz limits.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="/client">${icon('layout')}Start for 49 Kc/month</a>
            <a class="button button-secondary" href="#pricing">${icon('catalog')}See pricing</a>
          </div>
        </div>
        <div class="product-frame" aria-label="Bazos service dashboard preview">
          <div class="browser-bar">
            <span></span><span></span><span></span>
            <strong>bazos.alfares.cz</strong>
          </div>
          <div class="preview-grid">
            <div class="preview-panel wide">
              <div class="panel-header">
                <strong>Offer command center</strong>
                <span class="status ok">Policy ready</span>
              </div>
              <div class="offer-row">
                <span class="thumb"></span>
                <div><strong>iPhone 13 128GB</strong><small>Draft from catalog</small></div>
                <span>Elektro</span>
                <span class="status wait">Review</span>
              </div>
              <div class="offer-row">
                <span class="thumb green"></span>
                <div><strong>Makita drill set</strong><small>Published on Bazos</small></div>
                <span>Naradi</span>
                <span class="status ok">Active</span>
              </div>
              <div class="offer-row">
                <span class="thumb red"></span>
                <div><strong>Office chair</strong><small>Duplicate check required</small></div>
                <span>Nabytek</span>
                <span class="status risk">Blocked</span>
              </div>
            </div>
            <div class="preview-panel">
              <strong>Compliance gates</strong>
              <ol class="gate-list">
                <li>${icon('check')}Verified identity</li>
                <li>${icon('check')}Active ad cap</li>
                <li>${icon('check')}Category cadence</li>
                <li>${icon('check')}Duplicate evidence</li>
              </ol>
            </div>
            <div class="preview-panel">
              <strong>Admin review</strong>
              <p class="metric">7</p>
              <small>identities or attempts need human attention</small>
            </div>
          </div>
        </div>
      </section>

      <section class="benefit-band" id="benefits">
        <div class="section-heading">
          <h2>Why sellers use this instead of native Bazos alone</h2>
          <p>Native Bazos is good for manual posting. AlfaRes adds catalog context, compliance visibility, team workflows, and lifecycle tracking around it.</p>
        </div>
        <div class="benefit-grid">
          <article>
            ${icon('catalog')}
            <h3>Catalog-to-offer preparation</h3>
            <p>Create local drafts from product data and keep title, category, images, stock state, and seller defaults in one place.</p>
          </article>
          <article>
            ${icon('activity')}
            <h3>Status that survives the session</h3>
            <p>See which offers are drafts, queued, published, blocked, expired, or waiting for manual review without checking each listing manually.</p>
          </article>
          <article>
            ${icon('guard')}
            <h3>Built-in policy checks</h3>
            <p>Surface active-ad caps, duplicate checks, category pacing, and content evidence before a risky publish action happens.</p>
          </article>
          <article>
            ${icon('team')}
            <h3>Admin oversight</h3>
            <p>Review blocked attempts, identity states, and operational health from a dedicated administrator console.</p>
          </article>
        </div>
      </section>

      <section class="pricing-section" id="pricing">
        <div class="pricing-copy">
          <h2>Simple customer pricing</h2>
          <p>Pay 49 Kc per month for access to the client dashboard, offer preparation, status tracking, and guarded publish requests for verified Bazos identities.</p>
        </div>
        <div class="pricing-card">
          <span>Monthly service</span>
          <strong>49 Kc</strong>
          <small>per month</small>
          <a class="button button-primary" href="/client">${icon('login')}Sign in or register</a>
        </div>
      </section>

      <section class="workflow-section" id="compliance">
        <div class="section-heading">
          <h2>Compliant workflow first</h2>
          <p>The service does not replace Bazos verification or bypass platform controls. It stops when Bazos requires human action.</p>
        </div>
        <div class="workflow">
          <div class="workflow-step"><strong>1</strong><span>Manual Bazos identity verification</span></div>
          <div class="workflow-step"><strong>2</strong><span>Local draft and duplicate evidence</span></div>
          <div class="workflow-step"><strong>3</strong><span>Rate, category, and active-ad gates</span></div>
          <div class="workflow-step"><strong>4</strong><span>Queue visibility and stop-on-challenge review</span></div>
        </div>
      </section>

      <section class="portal-section">
        <a class="portal-card" href="/client">
          <span>${icon('client')}Client dashboard</span>
          <strong>Register or sign in to manage offers, see Bazos status, and request publishing through guarded flows.</strong>
        </a>
        <a class="portal-card" href="/admin">
          <span>${icon('admin')}Admin dashboard</span>
          <strong>Separate administrator page for blocked attempts, identity review, and service health.</strong>
        </a>
      </section>
    </main>

    <footer class="site-footer">
      <span>AlfaRes Bazos Service</span>
      <span>Compliant Bazos.cz operations for verified sellers.</span>
    </footer>`,
  );

export const renderAppPage = (mode: AppMode) => {
  const title = mode === 'admin' ? 'Bazos Admin Console' : 'Bazos Client Dashboard';
  const navLabel = mode === 'admin' ? 'Admin dashboard' : 'Client dashboard';
  const detailsLabel = mode === 'admin' ? 'Review queue' : 'My offers';
  const authTitle = mode === 'admin' ? 'Admin sign in' : 'Sign in or register';
  const authCopy = mode === 'admin'
    ? 'Use your AlfaRes administrator account to access operational review tools.'
    : 'Use your AlfaRes account, or create one with email and password to start the 49 Kc/month service.';
  return pageShell(
    title,
    `<div class="app-shell" data-mode="${mode}">
      <aside class="app-sidebar">
        <a class="brand" href="/">
          <span class="brand-mark">B</span>
          <span>Bazos Service</span>
        </a>
        <nav class="app-nav" aria-label="Workspace navigation">
          <a class="active" href="/${mode}">${icon(mode === 'admin' ? 'admin' : 'client')}${navLabel}</a>
          <a href="/">${icon('layout')}Landing page</a>
          <a href="/#compliance">${icon('shield')}Compliance</a>
        </nav>
      </aside>
      <main class="app-main">
        <header class="app-topbar">
          <div>
            <h1>${title}</h1>
            <p>${mode === 'admin' ? 'Operational visibility for Bazos identities, blocked attempts, and service health.' : 'Customer workspace for your offers, subscription access, policy checks, and guarded publish actions.'}</p>
          </div>
          <div class="session-actions">
            <span id="session-label">Not signed in</span>
            <button class="button button-secondary hidden" id="sign-out" type="button">${icon('logout')}Sign out</button>
          </div>
        </header>

        <section class="auth-panel" id="auth-panel" data-auth-mode="login">
          <div class="auth-copy">
            <h2>${authTitle}</h2>
            <p>${authCopy}</p>
            ${mode === 'client' ? '<div class="price-note"><strong>49 Kc/month</strong><span>Client service subscription</span></div>' : ''}
          </div>
          <form id="login-form" class="login-form">
            <div class="auth-switch" role="tablist" aria-label="Authentication mode">
              <button class="auth-tab active" data-auth-tab="login" type="button">Sign in</button>
              ${mode === 'client' ? '<button class="auth-tab" data-auth-tab="register" type="button">Register</button>' : ''}
            </div>
            <label class="register-only hidden">First name<input name="firstName" type="text" autocomplete="given-name"></label>
            <label class="register-only hidden">Last name<input name="lastName" type="text" autocomplete="family-name"></label>
            <label>Email<input name="email" type="email" autocomplete="email" required></label>
            <label>Password<input name="password" type="password" autocomplete="current-password" required minlength="8"></label>
            <button class="button button-primary" id="auth-submit" type="submit">${icon('login')}Sign in</button>
          </form>
          <p class="form-message" id="form-message" role="status"></p>
        </section>

        <section class="workspace hidden" id="workspace">
          <div class="toolbar">
            <div class="tabs" role="tablist">
              <button class="tab active" data-view="overview" type="button">Overview</button>
              <button class="tab" data-view="details" type="button">${detailsLabel}</button>
            </div>
            <button class="button button-secondary" id="refresh" type="button">${icon('refresh')}Refresh</button>
          </div>
          <div id="workspace-content" class="workspace-content"></div>
        </section>
      </main>
    </div>
    <script src="/ui/app.js"></script>`,
  );
};

export const appStyles = `
:root {
  --bg: #ffffff;
  --ink: #172026;
  --muted: #5d6873;
  --line: #d9e1e7;
  --panel: #f7fafc;
  --panel-strong: #eef4f7;
  --red: #c9272d;
  --red-dark: #9e1e24;
  --teal: #0c7c75;
  --green: #1b8a4b;
  --amber: #9d6a00;
  --shadow: 0 18px 55px rgba(23, 32, 38, 0.12);
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
.site-nav a:hover, .app-nav a:hover { color: var(--red); }
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
.button-secondary:hover { border-color: #b7c3cb; background: var(--panel); }
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
  max-width: 760px;
  font-size: clamp(44px, 5.1vw, 76px);
  line-height: 0.98;
  font-weight: 820;
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
  background: #c8d2d9;
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
  background: linear-gradient(135deg, #c9272d, #f0a4a7);
}
.thumb.green { background: linear-gradient(135deg, #0c7c75, #8bd6c8); }
.thumb.red { background: linear-gradient(135deg, #6b1d22, #e0676d); }
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
.status.ok { color: #0c5f36; background: #dcf4e7; }
.status.wait { color: #705000; background: #fff2c9; }
.status.risk { color: #8f1f25; background: #fde2e4; }
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
  border-left: 3px solid var(--red);
  background: #fff;
  border-radius: 8px;
}
.workflow-step strong {
  color: var(--red);
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
  background: #fdebed;
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
.price-note {
  display: inline-grid;
  gap: 3px;
  width: fit-content;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
}
.price-note strong { color: var(--red); font-size: 24px; }
.price-note span { color: var(--muted); font-size: 13px; font-weight: 750; }
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
  .hero-copy h1 { font-size: 38px; }
  .hero-lede { font-size: 17px; }
  .button { width: 100%; }
  .app-nav { grid-template-columns: 1fr; }
  .session-actions { width: 100%; align-items: stretch; flex-direction: column; }
}
`;

export const appScript = `
(function () {
  const root = document.querySelector('.app-shell');
  if (!root) return;
  const mode = root.dataset.mode;
  const tokenKey = 'bazosServiceToken';
  const authPanel = document.getElementById('auth-panel');
  const workspace = document.getElementById('workspace');
  const content = document.getElementById('workspace-content');
  const form = document.getElementById('login-form');
  const message = document.getElementById('form-message');
  const sessionLabel = document.getElementById('session-label');
  const signOut = document.getElementById('sign-out');
  const refresh = document.getElementById('refresh');
  const authSubmit = document.getElementById('auth-submit');
  let activeView = 'overview';
  let authMode = 'login';

  const token = () => localStorage.getItem(tokenKey);
  const setMessage = (text) => { if (message) message.textContent = text || ''; };

  function setAuthMode(nextMode) {
    authMode = nextMode;
    document.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.classList.toggle('active', tab.dataset.authTab === authMode));
    document.querySelectorAll('.register-only').forEach((field) => field.classList.toggle('hidden', authMode !== 'register'));
    if (authSubmit) authSubmit.innerHTML = authMode === 'register' ? '${icon('login')}Register' : '${icon('login')}Sign in';
    const password = form.querySelector('input[name="password"]');
    if (password) password.autocomplete = authMode === 'register' ? 'new-password' : 'current-password';
  }
  const headers = () => ({ 'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json' });

  async function request(path, options) {
    const response = await fetch(path, Object.assign({ headers: headers() }, options || {}));
    if (response.status === 401) {
      localStorage.removeItem(tokenKey);
      showAuth();
      throw new Error('Session expired. Please sign in again.');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || body.error?.message || 'Request failed');
    }
    return response.json();
  }

  function showAuth() {
    authPanel.classList.remove('hidden');
    workspace.classList.add('hidden');
    signOut.classList.add('hidden');
    sessionLabel.textContent = 'Not signed in';
  }

  function showWorkspace(user) {
    authPanel.classList.add('hidden');
    workspace.classList.remove('hidden');
    signOut.classList.remove('hidden');
    sessionLabel.textContent = user?.email || 'Signed in';
  }

  function statusClass(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('active') || text.includes('published') || text.includes('ok') || text.includes('ready')) return 'ok';
    if (text.includes('blocked') || text.includes('failed') || text.includes('review') || text.includes('challenge')) return 'risk';
    return 'wait';
  }

  function cell(value) {
    if (value === null || value === undefined || value === '') return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return Object.values(value).filter(Boolean).slice(0, 2).join(', ') || 'Recorded';
    return String(value);
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
    content.innerHTML = '<div class="data-panel empty-state">Loading admin data...</div>';
    const summary = await request('/publishing-monitoring/summary').catch((error) => ({ error: error.message }));
    const blocked = await request('/publishing-monitoring/blocked?limit=25').catch(() => []);
    if (summary.error) {
      content.innerHTML = '<div class="data-panel empty-state">' + summary.error + '</div>';
      return;
    }
    if (activeView === 'overview') {
      content.innerHTML =
        '<div class="summary-grid">' +
        stat('Publish attempts', summary.publishAttempts || summary.totalPublishAttempts || 0) +
        stat('Blocked attempts', summary.blockedAttempts || blocked.length || 0) +
        stat('Review identities', summary.reviewIdentities || summary.identitiesNeedingReview || 0) +
        stat('Tracked active ads', summary.activeAds || summary.activeAdsTracked || 0) +
        '</div><div class="data-panel"><h2>Administrator focus</h2><p class="card-note">Review blocked attempts and identities needing manual action. Publishing controls remain enforced by the backend policy gates.</p></div>';
    } else {
      const rows = Array.isArray(blocked) ? blocked : (blocked.items || blocked.blockedAttempts || []);
      content.innerHTML = table([
        { label: 'Attempt', render: (r) => cell(r.id || r.attemptId) },
        { label: 'Offer', render: (r) => cell(r.offerId || r.adId || r.productId) },
        { label: 'Reason', render: (r) => '<span class="status ' + statusClass(r.reason || r.status) + '">' + cell(r.reason || r.status) + '</span>' },
        { label: 'Created', render: (r) => cell(r.createdAt || r.updatedAt) },
      ], rows, 'No blocked attempts returned by the monitoring endpoint.');
    }
  }

  async function policyCheck(id) {
    content.innerHTML = '<div class="data-panel empty-state">Checking policy...</div>';
    try {
      const result = await request('/offers/' + encodeURIComponent(id) + '/policy-check', { method: 'POST', body: '{}' });
      content.innerHTML = '<div class="data-panel"><h2>Policy result</h2><pre>' + JSON.stringify(result, null, 2) + '</pre></div>';
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + error.message + '</div>';
    }
  }

  async function enqueuePublish(id) {
    content.innerHTML = '<div class="data-panel empty-state">Requesting guarded publish queue...</div>';
    try {
      const result = await request('/offers/' + encodeURIComponent(id) + '/enqueue-publish', { method: 'POST', body: '{}' });
      content.innerHTML = '<div class="data-panel"><h2>Queue result</h2><pre>' + JSON.stringify(result, null, 2) + '</pre></div>';
    } catch (error) {
      content.innerHTML = '<div class="data-panel empty-state">' + error.message + '</div>';
    }
  }

  async function renderClient() {
    content.innerHTML = '<div class="data-panel empty-state">Loading offers...</div>';
    const result = await request('/offers').catch((error) => ({ error: error.message }));
    if (result.error) {
      content.innerHTML = '<div class="data-panel empty-state">' + result.error + '</div>';
      return;
    }
    const offers = Array.isArray(result) ? result : (result.items || result.offers || []);
    if (activeView === 'overview') {
      const active = offers.filter((offer) => String(offer.status || offer.bazosStatus || '').toLowerCase().includes('active')).length;
      content.innerHTML =
        '<div class="summary-grid">' +
        stat('Total offers', offers.length) +
        stat('Active on Bazos', active) +
        stat('Need review', offers.filter((offer) => statusClass(offer.status || offer.bazosStatus) === 'risk').length) +
        stat('Drafts / queued', Math.max(offers.length - active, 0)) +
        '</div><div class="data-panel"><h2>Customer workspace</h2><p class="card-note">Use offer actions to evaluate policy before requesting guarded publishing. The backend still enforces every compliance gate.</p></div>';
    } else {
      content.innerHTML = table([
        { label: 'Offer', render: (r) => '<strong>' + cell(r.title || r.name || r.productName || r.id) + '</strong><small class="card-note">' + cell(r.productId || r.sku || '') + '</small>' },
        { label: 'Bazos status', render: (r) => '<span class="status ' + statusClass(r.status || r.bazosStatus || r.publishStatus) + '">' + cell(r.status || r.bazosStatus || r.publishStatus || 'Draft') + '</span>' },
        { label: 'Category', render: (r) => cell(r.category || r.categoryName || r.bazosCategory) },
        { label: 'Updated', render: (r) => cell(r.updatedAt || r.createdAt) },
        { label: 'Actions', render: (r) => '<div class="row-actions"><button class="button button-secondary" data-policy="' + cell(r.id) + '" type="button">Policy</button><button class="button button-primary" data-publish="' + cell(r.id) + '" type="button">Publish</button></div>' },
      ], offers, 'No offers returned for this account.');
      content.querySelectorAll('[data-policy]').forEach((button) => button.addEventListener('click', () => policyCheck(button.dataset.policy)));
      content.querySelectorAll('[data-publish]').forEach((button) => button.addEventListener('click', () => enqueuePublish(button.dataset.publish)));
    }
  }

  async function render() {
    if (!token()) return showAuth();
    try {
      const me = await request('/ui/auth/me');
      showWorkspace(me.user);
      if (mode === 'admin') await renderAdmin();
      else await renderClient();
    } catch (error) {
      setMessage(error.message);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (authMode !== 'register') {
        delete data.firstName;
        delete data.lastName;
      }
      const response = await fetch(authMode === 'register' ? '/ui/auth/register' : '/ui/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || (authMode === 'register' ? 'Registration failed' : 'Sign in failed'));
      }
      const body = await response.json();
      localStorage.setItem(tokenKey, body.accessToken);
      await render();
    } catch (error) {
      setMessage(error.message);
    }
  });

  signOut.addEventListener('click', () => {
    localStorage.removeItem(tokenKey);
    showAuth();
  });

  document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
    tab.addEventListener('click', () => setAuthMode(tab.dataset.authTab));
  });
  setAuthMode('login');

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
