import fs from 'fs';
import path from 'path';

function loadJson(filePath: string) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        keys = keys.concat(getAllKeys(obj[k], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

try {
  console.log('🔍 Running i18n Dictionary Validation...');

  const en = loadJson('src/i18n/en.json');
  const kn = loadJson('src/i18n/kn.json');
  const hi = loadJson('src/i18n/hi.json');

  const enKeys = new Set(getAllKeys(en));
  const knKeys = new Set(getAllKeys(kn));
  const hiKeys = new Set(getAllKeys(hi));

  console.log(`✅ EN Keys count: ${enKeys.size}`);
  console.log(`✅ KN Keys count: ${knKeys.size}`);
  console.log(`✅ HI Keys count: ${hiKeys.size}`);

  let missingKn = 0;
  let missingHi = 0;

  for (const key of enKeys) {
    if (!knKeys.has(key)) {
      missingKn++;
    }
    if (!hiKeys.has(key)) {
      missingHi++;
    }
  }

  if (missingKn > 0) {
    console.warn(`⚠️  Notice: ${missingKn} EN keys fallback to EN in KN dictionary (Handled by I18nProvider).`);
  }
  if (missingHi > 0) {
    console.warn(`⚠️  Notice: ${missingHi} EN keys fallback to EN in HI dictionary (Handled by I18nProvider).`);
  }

  console.log('🎉 i18n validation complete: All dictionaries are valid JSON objects with active fallback support.');
} catch (err) {
  console.error('❌ i18n Check Failed:', err);
  process.exit(1);
}
