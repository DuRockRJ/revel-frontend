#!/usr/bin/env node
/**
 * Translation Validation Script
 *
 * The app ships a single locale (pt), so there is nothing to compare across
 * languages anymore. This just sanity-checks messages/pt.json:
 * - Valid JSON
 * - No empty strings
 *
 * Usage: node scripts/validate-translations.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	blue: '\x1b[34m',
	bold: '\x1b[1m'
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadJSON(filename) {
	const filePath = join(__dirname, '..', 'messages', filename);
	const content = readFileSync(filePath, 'utf-8');
	return JSON.parse(content);
}

function getAllKeys(obj, prefix = '') {
	const keys = new Set();
	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			getAllKeys(value, fullKey).forEach((k) => keys.add(k));
		} else {
			keys.add(fullKey);
		}
	}
	return keys;
}

function findEmptyStrings(obj, prefix = '') {
	const empty = [];
	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			empty.push(...findEmptyStrings(value, fullKey));
		} else if (value === '' || (typeof value === 'string' && value.trim() === '')) {
			empty.push(fullKey);
		}
	}
	return empty;
}

function main() {
	log('\n=== Translation Validation (pt) ===\n', 'bold');

	let hasErrors = false;

	log('Loading messages/pt.json...', 'blue');
	const pt = loadJSON('pt.json');
	log('✓ Loaded\n', 'green');

	const ptKeys = getAllKeys(pt);
	log(`Total keys: ${ptKeys.size}\n`);

	const ptEmpty = findEmptyStrings(pt);
	if (ptEmpty.length > 0) {
		log(`✗ Portuguese has ${ptEmpty.length} empty strings!`, 'red');
		ptEmpty.slice(0, 5).forEach((k) => log(`  - ${k}`, 'red'));
		if (ptEmpty.length > 5) log(`  ... and ${ptEmpty.length - 5} more`, 'red');
		hasErrors = true;
	} else {
		log('✓ No empty strings', 'green');
	}

	log('');
	if (hasErrors) {
		log('✗ Validation failed with errors', 'red');
		process.exit(1);
	} else {
		log('✓ All validations passed!', 'green');
		process.exit(0);
	}
}

main();
