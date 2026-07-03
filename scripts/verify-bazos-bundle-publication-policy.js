#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checks = [
  {
    file: 'shared/bazos/catalog/bazos-catalog-sell-action.service.ts',
    needles: [
      'catalog.bundle.v1',
      'bazos.catalog_bundle_publication.v1',
      'bazos_catalog_bundle_external_listing_blocked',
      'catalogBundlePublicationIssue',
      'isCatalogBundleReadiness',
    ],
  },
  {
    file: 'shared/bazos/policy/publish-policy.service.ts',
    needles: [
      'catalog.bundle.v1',
      'CATALOG_BUNDLE_PUBLICATION_BLOCKED',
      'isCatalogBundleReadiness',
      'owner-approved Bazos bundle publication policy',
    ],
  },
  {
    file: 'shared/bazos/policy/publish-policy.types.ts',
    needles: ['catalog_bundle_publication_blocked'],
  },
  {
    file: 'implementation-goals/GOAL-24-bazos-bundle-publication-policy.md',
    needles: [
      'catalog.bundle.v1',
      'Bazos cannot publish',
      'bazos_catalog_bundle_external_listing_blocked',
      '[MISSING: owner-approved Bazos bundle publication contract]',
    ],
  },
  {
    file: 'docs/BAZOS_COMPLIANCE.md',
    needles: ['Catalog Bundle Publication Policy', 'catalog.bundle.v1', 'bazos_catalog_bundle_external_listing_blocked'],
  },
];

const failures = [];
for (const check of checks) {
  const filePath = path.join(root, check.file);
  if (!fs.existsSync(filePath)) {
    failures.push(`${check.file}: missing file`);
    continue;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  for (const needle of check.needles) {
    if (!text.includes(needle)) failures.push(`${check.file}: missing ${needle}`);
  }
}

if (failures.length) {
  console.error('Bazos bundle publication policy verifier failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Bazos bundle publication policy verifier passed');
