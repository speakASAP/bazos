import { appScript } from './ui.assets';

/**
 * `bindContactPhoneMirror` from the client script, executed rather than string-matched.
 *
 * `ui.assets.ts` ships client JS inside a TypeScript template literal, so nothing else in this
 * repository runs it. The mirror exists because Telefon and Kontaktní telefon are the same number
 * for almost every seller — but "almost" is the whole difficulty: it must fill the empty field
 * without ever overwriting a number the seller typed on purpose.
 */
describe('contact-phone mirroring in the client script', () => {
  const extract = (name: string): string => {
    const start = appScript.indexOf('function ' + name);
    expect(start).toBeGreaterThan(-1);
    return appScript.slice(start, appScript.indexOf('\n  }', start) + 4);
  };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const bindContactPhoneMirror = new Function(
    'return (' + extract('bindContactPhoneMirror') + ')',
  )() as (form: unknown) => void;

  interface StubField {
    value: string;
    dataset: Record<string, string>;
    listeners: Record<string, Array<() => void>>;
    addEventListener(type: string, fn: () => void): void;
    fire(type: string): void;
    closest(): { classList: { toggle(): void } };
  }

  const field = (value = ''): StubField => ({
    value,
    dataset: {},
    listeners: {},
    addEventListener(type, fn) {
      (this.listeners[type] = this.listeners[type] || []).push(fn);
    },
    fire(type) {
      (this.listeners[type] || []).forEach((fn) => fn());
    },
    closest: () => ({ classList: { toggle: () => undefined } }),
  });

  const boundForm = (phoneValue = '', contactValue = '') => {
    const phoneNumber = field(phoneValue);
    const contactPhone = field(contactValue);
    const form = { dataset: {} as Record<string, string>, elements: { phoneNumber, contactPhone } };
    bindContactPhoneMirror(form);
    return { form, phoneNumber, contactPhone };
  };

  const type = (target: StubField, value: string) => {
    target.value = value;
    target.fire('input');
  };

  it('fills an empty contact phone as the seller types the account phone', () => {
    const { phoneNumber, contactPhone } = boundForm();
    type(phoneNumber, '+420777000001');
    expect(contactPhone.value).toBe('+420777000001');
  });

  it('keeps following the account phone while it is still being corrected', () => {
    const { phoneNumber, contactPhone } = boundForm();
    type(phoneNumber, '+42077700000');
    type(phoneNumber, '+420777000012');
    expect(contactPhone.value).toBe('+420777000012');
  });

  it('never overwrites a contact phone the seller typed', () => {
    // A seller who advertises under a different number than the account phone must be able to say
    // so; silently rewriting it would put the wrong number into every published ad.
    const { phoneNumber, contactPhone } = boundForm();
    type(phoneNumber, '+420777000001');
    type(contactPhone, '+420601111111');
    type(phoneNumber, '+420777000002');
    expect(contactPhone.value).toBe('+420601111111');
  });

  it('resumes mirroring once the seller clears the contact phone again', () => {
    const { phoneNumber, contactPhone } = boundForm();
    type(contactPhone, '+420601111111');
    type(contactPhone, '');
    type(phoneNumber, '+420777000003');
    expect(contactPhone.value).toBe('+420777000003');
  });

  it('leaves a pre-filled contact phone alone', () => {
    const { phoneNumber, contactPhone } = boundForm('+420700000000', '+420602222222');
    type(phoneNumber, '+420700000001');
    expect(contactPhone.value).toBe('+420602222222');
  });

  it('mirrors on change too, so browser autofill is covered', () => {
    const { phoneNumber, contactPhone } = boundForm();
    phoneNumber.value = '+420777123456';
    phoneNumber.fire('change');
    expect(contactPhone.value).toBe('+420777123456');
  });

  it('binds once per form, so a re-render does not double-mirror', () => {
    const { form, phoneNumber } = boundForm();
    bindContactPhoneMirror(form);
    expect(phoneNumber.listeners.input).toHaveLength(1);
  });

  it('falls back to the account phone in the submitted payload', () => {
    // The mirror is a convenience; the payload must not depend on a listener having fired.
    expect(appScript).toContain(
      "contactPhone: String(data.contactPhone || '').trim() || phoneNumber || undefined,",
    );
  });

  it('is wired into both places the account phone is entered', () => {
    // The settings form and the connection wizard collect the same pair of fields.
    expect(appScript.match(/bindContactPhoneMirror\(/g) || []).toHaveLength(3);
  });

  it('carries no backtick inside the template literal it lives in', () => {
    expect(extract('bindContactPhoneMirror')).not.toContain('`');
  });
});
