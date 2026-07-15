import type { OrganizationTokenSchema, EventTokenSchema } from '$lib/api/generated/types.gen';
import { formatDateTime } from '$lib/utils/date';
import * as m from '$lib/paraglide/messages.js';

/**
 * Determine the status of an organization token
 */
export function getOrganizationTokenStatus(
	token: OrganizationTokenSchema
): 'active' | 'expired' | 'limit-reached' {
	// Check if expired
	if (token.expires_at && new Date(token.expires_at) < new Date()) {
		return 'expired';
	}

	// Check if limit reached
	if (
		token.max_uses !== undefined &&
		token.max_uses > 0 &&
		token.uses !== undefined &&
		token.uses >= token.max_uses
	) {
		return 'limit-reached';
	}

	return 'active';
}

/**
 * Determine the status of an event token
 */
export function getEventTokenStatus(
	token: EventTokenSchema
): 'active' | 'expired' | 'limit-reached' {
	// Check if expired
	if (token.expires_at && new Date(token.expires_at) < new Date()) {
		return 'expired';
	}

	// Check if limit reached
	if (
		token.max_uses !== undefined &&
		token.max_uses > 0 &&
		token.uses !== undefined &&
		token.uses >= token.max_uses
	) {
		return 'limit-reached';
	}

	return 'active';
}

/**
 * Check if a token is active (not expired and not at limit)
 */
export function isTokenActive(token: OrganizationTokenSchema | EventTokenSchema): boolean {
	const status =
		'grants_membership' in token
			? getOrganizationTokenStatus(token as OrganizationTokenSchema)
			: getEventTokenStatus(token as EventTokenSchema);

	return status === 'active';
}

/**
 * Format token usage display (e.g., "45/100" or "45/∞")
 */
export function formatTokenUsage(uses: number | undefined, maxUses: number | undefined): string {
	const usesValue = uses ?? 0;
	const maxUsesValue = maxUses ?? 0;

	if (maxUsesValue === 0) {
		return `${usesValue}/∞`;
	}
	return `${usesValue}/${maxUsesValue}`;
}

/**
 * Calculate time until expiration
 */
export function getExpirationDisplay(expiresAt: string | null | undefined): string {
	if (!expiresAt) {
		return m['tokenExpiration.never']();
	}

	const now = new Date();
	const expiry = new Date(expiresAt);
	const diff = expiry.getTime() - now.getTime();

	if (diff < 0) {
		return m['tokenExpiration.expired']();
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

	if (days > 0) {
		return days === 1
			? m['tokenExpiration.daySingular']({ count: days })
			: m['tokenExpiration.dayPlural']({ count: days });
	} else if (hours > 0) {
		return hours === 1
			? m['tokenExpiration.hourSingular']({ count: hours })
			: m['tokenExpiration.hourPlural']({ count: hours });
	} else {
		return m['tokenExpiration.lessThanHour']();
	}
}

/**
 * Format the absolute expiration date for display.
 * Returns 'Never' when there is no expiration.
 */
export function getExpirationDate(expiresAt: string | null | undefined): string {
	if (!expiresAt) {
		return m['tokenExpiration.never']();
	}
	return formatDateTime(expiresAt);
}

/**
 * Generate shareable organization token URL
 */
export function getOrganizationTokenUrl(tokenId: string, orgSlug?: string): string {
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

	if (orgSlug) {
		// Visibility URL with query param
		return `${baseUrl}/org/${orgSlug}?ot=${tokenId}`;
	}

	// Claiming URL
	return `${baseUrl}/participar/org/${tokenId}`;
}

/**
 * Generate shareable event token URL
 */
export function getEventTokenUrl(tokenId: string, orgSlug?: string, eventSlug?: string): string {
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

	if (orgSlug && eventSlug) {
		// Visibility URL with query param
		return `${baseUrl}/eventos/${orgSlug}/${eventSlug}?et=${tokenId}`;
	}

	// Claiming URL
	return `${baseUrl}/participar/evento/${tokenId}`;
}

/**
 * Get duration options for token creation
 */
export function getDurationOptions(): { label: string; value: number }[] {
	return [
		{ label: m['organizationTokenModal.durationHour1'](), value: 60 },
		{ label: m['organizationTokenModal.durationDay1'](), value: 1440 },
		{ label: m['organizationTokenModal.durationDay7'](), value: 10080 },
		{ label: m['organizationTokenModal.durationDay30'](), value: 43200 },
		{ label: m['organizationTokenModal.durationNever'](), value: 0 }
	];
}

/**
 * Get label for duration value
 */
export function getDurationLabel(minutes: number): string {
	const option = getDurationOptions().find((opt) => opt.value === minutes);
	return option?.label || `${minutes} minutes`;
}
