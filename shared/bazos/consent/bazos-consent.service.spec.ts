import { BazosConsentService } from './bazos-consent.service';
import { CONSENT_DOCUMENT_VERSION, CONSENT_SCOPE } from '../policy/publish-policy.types';

function makePrisma(existing: any = null) {
  return {
    bazosIdentityConsent: {
      findFirst: jest.fn().mockResolvedValue(existing),
      create: jest.fn().mockImplementation(async ({ data }: any) => ({ id: 'consent-new', ...data })),
      updateMany: jest.fn().mockResolvedValue({ count: existing ? 1 : 0 }),
      findMany: jest.fn().mockResolvedValue(existing ? [existing] : []),
    },
  } as any;
}

function makeLogger() {
  return { log: jest.fn(), warn: jest.fn(), error: jest.fn(), setContext: jest.fn() } as any;
}

const grantInput = {
  identityId: 'identity-1',
  userId: 'user-1',
  documentVersion: CONSENT_DOCUMENT_VERSION,
  ip: '203.0.113.10',
  userAgent: 'Mozilla/5.0',
};

describe('BazosConsentService', () => {
  describe('grant', () => {
    it('stores the consent with the evidence needed to prove it was given', async () => {
      const prisma = makePrisma();
      const svc = new BazosConsentService(prisma, makeLogger());

      await svc.grant(grantInput);

      expect(prisma.bazosIdentityConsent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identityId: 'identity-1',
          userId: 'user-1',
          scope: CONSENT_SCOPE.PUBLISH,
          documentVersion: CONSENT_DOCUMENT_VERSION,
          ip: '203.0.113.10',
          userAgent: 'Mozilla/5.0',
        }),
      });
    });

    it('refuses to record consent for a version other than the current text', async () => {
      const prisma = makePrisma();
      const svc = new BazosConsentService(prisma, makeLogger());

      await expect(svc.grant({ ...grantInput, documentVersion: 'bazos-publish-consent-v0' })).rejects.toThrow(
        /Refusing to record consent/,
      );
      expect(prisma.bazosIdentityConsent.create).not.toHaveBeenCalled();
    });

    it('supersedes an earlier live consent so only one stays active', async () => {
      const prisma = makePrisma();
      const svc = new BazosConsentService(prisma, makeLogger());

      await svc.grant(grantInput);

      expect(prisma.bazosIdentityConsent.updateMany).toHaveBeenCalledWith({
        where: { identityId: 'identity-1', scope: CONSENT_SCOPE.PUBLISH, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('revoke', () => {
    it('stamps the live consent instead of deleting it, keeping the audit trail', async () => {
      const prisma = makePrisma({ id: 'consent-1' });
      const svc = new BazosConsentService(prisma, makeLogger());

      const result = await svc.revoke('identity-1');

      expect(prisma.bazosIdentityConsent.updateMany).toHaveBeenCalledWith({
        where: { identityId: 'identity-1', scope: CONSENT_SCOPE.PUBLISH, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result).toEqual({ revoked: 1 });
    });
  });

  describe('status', () => {
    it('reports not granted when no consent exists', async () => {
      const svc = new BazosConsentService(makePrisma(null), makeLogger());
      await expect(svc.status('identity-1')).resolves.toEqual({
        granted: false,
        needsRenewal: false,
        currentVersion: CONSENT_DOCUMENT_VERSION,
      });
    });

    it('flags renewal when consent predates the current wording', async () => {
      const prisma = makePrisma({
        documentVersion: 'bazos-publish-consent-v0',
        grantedAt: new Date('2026-01-01T00:00:00Z'),
      });
      const svc = new BazosConsentService(prisma, makeLogger());

      const status = await svc.status('identity-1');

      expect(status.granted).toBe(false);
      expect(status.needsRenewal).toBe(true);
      expect(status.grantedVersion).toBe('bazos-publish-consent-v0');
    });

    it('reports granted for a live current-version consent', async () => {
      const prisma = makePrisma({
        documentVersion: CONSENT_DOCUMENT_VERSION,
        grantedAt: new Date('2026-01-01T00:00:00Z'),
      });
      const svc = new BazosConsentService(prisma, makeLogger());

      const status = await svc.status('identity-1');

      expect(status.granted).toBe(true);
      expect(status.needsRenewal).toBe(false);
    });
  });
});
