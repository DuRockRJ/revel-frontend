/**
 * City display utilities
 */

/**
 * Format a city for human display as "Cidade, Região" (falls back to just
 * the city name when no region is set). The platform only serves Rio de
 * Janeiro state, so showing the country here would always read "Brasil" —
 * not useful information — while the region (bairro zone or região
 * fluminense) is what actually helps distinguish locations.
 */
export function formatCityRegion(city: { name: string; admin_name?: string | null }): string {
	return city.admin_name ? `${city.name}, ${city.admin_name}` : city.name;
}
