import { describe, expect, it, vi } from 'vitest';

// Force a stable locale so date/month formatting is deterministic regardless
// of the machine running the tests. Times are always 24h (app is pt-BR only),
// independent of this mock.
vi.mock('$lib/paraglide/runtime.js', () => ({
	getLocale: () => 'en'
}));

import {
	formatEventDate,
	formatEventDateRange,
	formatEventDateForScreenReader,
	formatDateTime,
	formatDateTimeReadback,
	formatDate,
	formatDateLongMonth,
	formatDateTimeVerbose,
	formatMonthYearLabel
} from './date';

// A fixed winter instant (no DST ambiguity):
//   19:00 UTC  →  14:00 in New York (EST),  20:00 in Vienna (CET).
const WINTER_UTC = '2026-02-06T19:00:00Z';

describe('formatEventDate with an explicit timezone (#474)', () => {
	it('renders the instant in the given timezone, not the viewer’s', () => {
		const ny = formatEventDate(WINTER_UTC, 'America/New_York');
		const vienna = formatEventDate(WINTER_UTC, 'Europe/Vienna');

		expect(ny).toContain('14:00');
		expect(vienna).toContain('20:00');
		expect(ny).not.toBe(vienna);
	});

	it('omits the timezone abbreviation by default, even with a timezone supplied', () => {
		expect(formatEventDate(WINTER_UTC, 'America/New_York')).not.toContain('EST');
	});

	it('appends a timezone abbreviation when withAbbreviation is explicitly true', () => {
		// New York's short name is reliably "EST" in winter across ICU versions.
		const out = formatEventDate(WINTER_UTC, 'America/New_York', true);
		expect(out).toContain('14:00');
		expect(out).toContain('EST');
	});

	it('omits the timezone abbreviation when no timezone is supplied (backward compatible)', () => {
		expect(formatEventDate(WINTER_UTC)).not.toContain('EST');
	});
});

describe('formatEventDateRange same-day detection is timezone-aware', () => {
	// 22:00 UTC → 17:00 EST (Feb 6) and 23:00 CET (Feb 6)
	// 03:00 UTC next day → 22:00 EST (still Feb 6) and 04:00 CET (Feb 7)
	const start = '2026-02-06T22:00:00Z';
	const end = '2026-02-07T03:00:00Z';

	it('collapses to a single date when both ends fall on the same local day', () => {
		const ny = formatEventDateRange(start, end, 'America/New_York');
		expect(ny).toContain('17:00 - 22:00');
	});

	it('shows two dates when the local days differ', () => {
		const vienna = formatEventDateRange(start, end, 'Europe/Vienna');
		// A cross-day range repeats the bullet separator for the end date.
		expect(vienna.match(/•/g)?.length).toBe(2);
	});

	it('labels each end with its own offset across a DST transition', () => {
		// Europe/Vienna springs forward on 2026-03-29: 23:00 Mar 28 is GMT+1,
		// 13:00 Mar 29 is GMT+2. The end must not inherit the start's offset.
		const out = formatEventDateRange(
			'2026-03-28T22:00:00Z',
			'2026-03-29T11:00:00Z',
			'Europe/Vienna',
			true
		);
		expect(out).toContain('23:00 GMT+1');
		expect(out).toContain('13:00 GMT+2');
	});
});

describe('formatDate applies the timezone to the calendar day without an abbreviation', () => {
	// 23:00 UTC → 18:00 Feb 6 in New York, but 00:00 Feb 7 in Vienna.
	const iso = '2026-02-06T23:00:00Z';

	it('rolls the date forward/back according to the timezone', () => {
		expect(formatDate(iso, 'America/New_York')).toContain('Feb 6');
		expect(formatDate(iso, 'Europe/Vienna')).toContain('Feb 7');
	});

	it('does not append a timezone abbreviation to a date-only value', () => {
		expect(formatDate(iso, 'America/New_York')).not.toMatch(/EST|GMT/);
	});
});

describe('formatDateTime and screen-reader format', () => {
	it('formatDateTime renders a 24h time and never appends a timezone abbreviation', () => {
		const out = formatDateTime(WINTER_UTC, 'America/New_York');
		expect(out).toContain('14:00');
		expect(out).not.toContain('EST');
	});

	it('screen-reader format spells out the date in the event timezone, with abbreviation', () => {
		const out = formatEventDateForScreenReader(WINTER_UTC, 'America/New_York');
		expect(out).toContain('February');
		expect(out).toContain('14:00');
		expect(out).toContain('EST');
	});
});

describe('formatDateTimeReadback (#508 picker readback)', () => {
	it('returns "" for empty/nullish input', () => {
		expect(formatDateTimeReadback('')).toBe('');
		expect(formatDateTimeReadback(null)).toBe('');
		expect(formatDateTimeReadback(undefined)).toBe('');
	});

	it('returns "" for an invalid datetime string', () => {
		expect(formatDateTimeReadback('not-a-date')).toBe('');
	});

	it('renders a textual month and year for a datetime-local value', () => {
		const out = formatDateTimeReadback('2026-06-07T12:00');
		expect(out).toContain('2026');
		expect(out).toContain('Jun'); // en-US short month — textual, never "6"
		expect(out).not.toMatch(/\b0?6\/0?7\b/); // not numeric m/d
	});

	it('also accepts a full ISO 8601 string', () => {
		expect(formatDateTimeReadback('2026-06-07T12:00:00Z')).toContain('2026');
	});
});

describe('formatDateLongMonth (#510)', () => {
	it('contains the full month name and year, no time', () => {
		const out = formatDateLongMonth('2026-06-07T12:00:00Z');
		expect(out).toContain('June');
		expect(out).toContain('2026');
	});

	it('contains the day of month', () => {
		const out = formatDateLongMonth('2026-06-07T12:00:00Z');
		expect(out).toContain('7');
	});

	it('does not contain a time component (no colon)', () => {
		const out = formatDateLongMonth('2026-06-07T12:00:00Z');
		expect(out).not.toMatch(/\d+:\d+/);
	});

	it('respects timezone when supplied (date may shift a day)', () => {
		// 2026-02-06T23:00:00Z is Feb 6 in New York and Feb 7 in Vienna
		const ny = formatDateLongMonth('2026-02-06T23:00:00Z', 'America/New_York');
		const vienna = formatDateLongMonth('2026-02-06T23:00:00Z', 'Europe/Vienna');
		expect(ny).toContain('February');
		expect(ny).toContain('6');
		expect(vienna).toContain('February');
		expect(vienna).toContain('7');
	});
});

describe('formatDateTimeVerbose (#510)', () => {
	it('contains the full month name, year, and a time component', () => {
		const out = formatDateTimeVerbose('2026-06-07T12:00:00Z');
		expect(out).toContain('June');
		expect(out).toContain('2026');
		expect(out).toMatch(/\d+:\d+/);
	});

	it('never includes AM/PM — the app is 24h-only', () => {
		const out = formatDateTimeVerbose('2026-06-07T12:00:00Z');
		expect(out).not.toMatch(/AM|PM/);
	});

	it('respects a supplied timezone', () => {
		// 2026-02-06T19:00:00Z → 14:00 in New York (EST)
		const out = formatDateTimeVerbose('2026-02-06T19:00:00Z', 'America/New_York');
		expect(out).toContain('14:00');
		expect(out).toContain('February');
	});
});

describe('formatMonthYearLabel (#510)', () => {
	it('contains the full month name and year', () => {
		const out = formatMonthYearLabel('2026-06-07T12:00:00Z');
		expect(out).toContain('June');
		expect(out).toContain('2026');
	});

	it('does not contain a day number', () => {
		// The string should not contain " 7" or "7," etc. (isolated day digit)
		const out = formatMonthYearLabel('2026-06-07T12:00:00Z');
		expect(out).not.toMatch(/\b7\b/);
	});

	it('does not contain a time component', () => {
		const out = formatMonthYearLabel('2026-06-07T12:00:00Z');
		expect(out).not.toMatch(/\d+:\d+/);
	});
});
