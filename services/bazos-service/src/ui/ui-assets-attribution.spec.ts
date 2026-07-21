import { appScript } from './ui.assets';

/**
 * The browser half of EP-005 W4, asserted against the emitted script.
 *
 * `ui.assets.ts` ships client JS inside a TypeScript template literal, so none of it is type
 * checked or executed by anything else in this repository — a mistake here compiles, deploys, and
 * shows up only as attribution that quietly never arrives.
 */
describe('auth-redirect emission in the client script', () => {
  const script = appScript;

  it('posts the click to the recording endpoint', () => {
    expect(script).toContain("fetch('/ui/auth-redirect'");
    expect(script).toContain('keepalive: true');
  });

  it('emits before navigating, not after', () => {
    // The whole point of W4: a visitor who registers and closes the tab has registered. Emitting
    // on the auth callback would miss exactly the conversions worth counting.
    const emit = script.indexOf("fetch('/ui/auth-redirect'");
    const navigate = script.indexOf('window.location.assign(url.toString())');
    expect(emit).toBeGreaterThan(-1);
    expect(navigate).toBeGreaterThan(-1);
    expect(emit).toBeLessThan(navigate);
  });

  it('sends the same state it hands to auth, so the two halves join', () => {
    expect(script).toContain('JSON.stringify({ state: state })');
    expect(script).toContain("url.searchParams.set('state', state)");
  });

  it('never puts gsid on the wire from the page', () => {
    // gsid is read server-side from the cookie. If the page sent it, it would sit in a request
    // the browser could also leak onward, and D-005 §3 keeps it off anything bound for auth.
    const fn = script.slice(
      script.indexOf('function startHostedAuth'),
      script.indexOf('function startHostedAuth') + 2000,
    );
    expect(fn).not.toContain('gsid:');
    expect(fn).not.toMatch(/searchParams\.set\('gsid'/);
  });

  it('does not fail the redirect when the call throws', () => {
    const fn = script.slice(
      script.indexOf('function startHostedAuth'),
      script.indexOf('function startHostedAuth') + 2000,
    );
    expect(fn).toContain('catch');
  });

  it('records register clicks only — a login is not a registration', () => {
    const fn = script.slice(
      script.indexOf('function startHostedAuth'),
      script.indexOf('function startHostedAuth') + 2000,
    );
    expect(fn).toContain("if (action === 'register')");
  });

  it('carries no backtick inside the template literal it lives in', () => {
    // A backtick in this script ends the TypeScript template literal that holds it and breaks the
    // build in a way that reads as a syntax error hundreds of lines away. This has happened.
    expect(script).not.toContain('`');
  });
});
