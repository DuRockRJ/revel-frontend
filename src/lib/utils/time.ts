/**
 * Relative time formatting utilities
 */

import { formatDate } from './date';

/**
 * Format a timestamp as relative time (e.g., "2 horas atrás", "ontem", "3 dias atrás")
 * @param dateString ISO 8601 date-time string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	// Just now (less than 30 seconds)
	if (diffSeconds < 30) {
		return 'agora mesmo';
	}

	// Less than a minute
	if (diffMinutes < 1) {
		return `${diffSeconds} segundos atrás`;
	}

	// Less than an hour
	if (diffMinutes < 60) {
		const unit = diffMinutes === 1 ? 'minuto' : 'minutos';
		return `${diffMinutes} ${unit} atrás`;
	}

	// Less than a day
	if (diffHours < 24) {
		const unit = diffHours === 1 ? 'hora' : 'horas';
		return `${diffHours} ${unit} atrás`;
	}

	// Yesterday
	if (diffDays === 1) {
		return 'ontem';
	}

	// Less than a week
	if (diffDays < 7) {
		return `${diffDays} dias atrás`;
	}

	// Less than a month
	const diffWeeks = Math.floor(diffDays / 7);
	if (diffWeeks < 4) {
		const unit = diffWeeks === 1 ? 'semana' : 'semanas';
		return `${diffWeeks} ${unit} atrás`;
	}

	// More than a month: show absolute date
	return formatDate(dateString);
}
