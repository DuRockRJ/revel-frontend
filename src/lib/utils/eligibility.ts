import type {
	EventUserEligibility,
	EventUserStatusResponse,
	NextStep,
	EventRsvpSchema,
	UserTicketSchema,
	RsvpStatus as ApiRsvpStatus,
	TicketStatus as ApiTicketStatus
} from '$lib/api/generated/types.gen';
import { formatDateTime } from './date';

/**
 * RSVP Status - Correctly typed from backend
 */
export type RsvpStatus = ApiRsvpStatus; // 'yes' | 'no' | 'maybe'

/**
 * Ticket Status - Correctly typed from backend
 */
export type TicketStatus = ApiTicketStatus; // 'pending' | 'active' | 'checked_in' | 'cancelled'

/**
 * Invitation Request Status - From EventInvitationRequest.Status backend enum
 * The generated types show this as just 'string', but backend actually uses a TextChoices enum
 */
export type InvitationRequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * Membership Request Status - From OrganizationMembershipRequest.Status backend enum
 * The generated types show this as just 'string', but backend actually uses a TextChoices enum
 */
export type MembershipRequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * Legacy alias for backward compatibility
 * @deprecated Use RsvpStatus instead
 */
export type RsvpAnswer = RsvpStatus;

/**
 * EventRsvpSchema with corrected status type
 */
export type EventRsvpSchemaActual = Omit<EventRsvpSchema, 'status'> & {
	status: RsvpStatus;
};

/**
 * UserTicketSchema with corrected status type
 * (Previously EventTicketSchema, now unified as UserTicketSchema)
 */
export type EventTicketSchemaActual = Omit<UserTicketSchema, 'status'> & {
	status: TicketStatus;
};

/**
 * User status returned from /my-status endpoint (new unified response)
 * This is the new format that includes multiple tickets and purchase limits
 */
export type UserEventStatusResponse = EventUserStatusResponse;

/**
 * Legacy user status type for backward compatibility
 * @deprecated The /my-status endpoint now returns EventUserStatusResponse or EventUserEligibility
 */
export type UserEventStatus =
	| EventRsvpSchemaActual
	| EventTicketSchemaActual
	| EventUserEligibility
	| UserEventStatusResponse;

/**
 * Type guard to check if status is the new unified response format
 */
export function isUserStatusResponse(
	status: UserEventStatus | EventUserEligibility
): status is UserEventStatusResponse {
	return 'tickets' in status || 'can_purchase_more' in status;
}

/**
 * Type guard to check if status is an RSVP (legacy format)
 * @deprecated Use isUserStatusResponse and check rsvp field instead
 */
export function isRSVP(status: UserEventStatus): status is EventRsvpSchemaActual {
	if (isUserStatusResponse(status)) return false;
	return 'status' in status && !('tier' in status) && !('allowed' in status);
}

/**
 * Type guard to check if status is a Ticket (legacy format)
 * @deprecated Use isUserStatusResponse and check tickets array instead
 */
export function isTicket(status: UserEventStatus): status is EventTicketSchemaActual {
	if (isUserStatusResponse(status)) return false;
	return 'tier' in status && !('tickets' in status);
}

/**
 * Type guard to check if status is eligibility check result
 */
export function isEligibility(status: UserEventStatus): status is EventUserEligibility {
	return 'allowed' in status && !('tickets' in status);
}

/**
 * Check if user has any active tickets (non-cancelled)
 */
export function hasActiveTickets(status: UserEventStatusResponse): boolean {
	const tickets = status.tickets || [];
	return tickets.some((t) => t.status !== 'cancelled');
}

/**
 * Get the user's active tickets (non-cancelled)
 */
export function getActiveTickets(status: UserEventStatusResponse): EventTicketSchemaActual[] {
	const tickets = status.tickets || [];
	return tickets.filter((t) => t.status !== 'cancelled') as EventTicketSchemaActual[];
}

/**
 * Check if user has a positive RSVP
 */
export function hasPositiveRsvp(status: UserEventStatusResponse): boolean {
	return status.rsvp?.status === 'yes' || status.rsvp?.status === 'maybe';
}

/**
 * Check if user is attending (has active ticket or positive RSVP)
 */
export function isAttending(status: UserEventStatusResponse): boolean {
	return hasActiveTickets(status) || hasPositiveRsvp(status);
}

/**
 * Get user-friendly message for next step
 */
export function getNextStepMessage(nextStep: NextStep): string {
	const messages: Record<NextStep, string> = {
		rsvp: 'Você está apto a confirmar presença neste evento',
		purchase_ticket: 'Adquira seu ingresso para participar deste evento',
		complete_questionnaire: 'Preencha o questionário obrigatório para participar',
		wait_for_questionnaire_evaluation: 'Sua resposta ao questionário está em análise',
		wait_to_retake_questionnaire: 'Você poderá refazer o questionário em breve',
		request_invitation: 'Solicite um convite para participar deste evento privado',
		wait_for_invitation_approval: 'Sua solicitação de convite está pendente de aprovação',
		become_member:
			'Torne-se membro da organização para participar deste evento exclusivo para membros',
		join_waitlist: 'Este evento está lotado, mas você pode entrar na lista de espera',
		wait_for_open_spot: 'Você está na lista de espera deste evento',
		wait_for_event_to_open: 'Volte quando as inscrições abrirem',
		upgrade_membership: 'Faça upgrade do seu nível de associação para participar deste evento',
		request_whitelist: 'Verificação adicional é necessária para acessar esta organização',
		wait_for_whitelist_approval: 'Sua solicitação de verificação está pendente de aprovação',
		complete_profile: 'Complete seu perfil para participar deste evento'
	};

	return messages[nextStep] || 'Verifique sua elegibilidade';
}

/**
 * Get action button text for next step
 */
export function getActionButtonText(nextStep: NextStep): string {
	const buttonTexts: Record<NextStep, string> = {
		rsvp: 'Confirmar presença',
		purchase_ticket: 'Comprar ingressos',
		complete_questionnaire: 'Preencher questionário',
		wait_for_questionnaire_evaluation: 'Em análise',
		wait_to_retake_questionnaire: 'Tentar novamente em breve',
		request_invitation: 'Solicitar convite',
		wait_for_invitation_approval: 'Pendente de aprovação',
		become_member: 'Entrar na organização',
		join_waitlist: 'Entrar na lista de espera',
		wait_for_open_spot: 'Você está na lista de espera',
		wait_for_event_to_open: 'Avise-me',
		upgrade_membership: 'Fazer upgrade da associação',
		request_whitelist: 'Solicitar verificação',
		wait_for_whitelist_approval: 'Verificação pendente',
		complete_profile: 'Completar perfil'
	};

	return buttonTexts[nextStep] || 'Ver detalhes';
}

/**
 * Check if action button should be disabled
 */
export function isActionDisabled(nextStep: NextStep): boolean {
	const disabledStates: NextStep[] = [
		'wait_for_questionnaire_evaluation',
		'wait_to_retake_questionnaire',
		'wait_for_invitation_approval',
		'wait_for_event_to_open',
		'wait_for_open_spot',
		'wait_for_whitelist_approval'
	];

	return disabledStates.includes(nextStep);
}

/**
 * Get icon name for next step (using lucide-svelte icon names)
 */
export function getNextStepIcon(nextStep: NextStep): string {
	const icons: Record<NextStep, string> = {
		rsvp: 'Check',
		purchase_ticket: 'Ticket',
		complete_questionnaire: 'ClipboardList',
		wait_for_questionnaire_evaluation: 'Clock',
		wait_to_retake_questionnaire: 'Clock',
		request_invitation: 'Mail',
		wait_for_invitation_approval: 'Clock',
		become_member: 'UserPlus',
		join_waitlist: 'ListPlus',
		wait_for_open_spot: 'Clock',
		wait_for_event_to_open: 'Bell',
		upgrade_membership: 'ArrowUpCircle',
		request_whitelist: 'ShieldCheck',
		wait_for_whitelist_approval: 'Clock',
		complete_profile: 'UserCircle'
	};

	return icons[nextStep] || 'Info';
}

/**
 * Format retry date for display
 */
export function formatRetryDate(retryOn: string | null | undefined): string | null {
	if (!retryOn) return null;
	const date = new Date(retryOn);
	if (isNaN(date.getTime())) return null;
	return formatDateTime(retryOn);
}

/**
 * Get detailed eligibility explanation
 */
export function getEligibilityExplanation(eligibility: EventUserEligibility): string {
	if (eligibility.allowed) {
		return eligibility.next_step
			? getNextStepMessage(eligibility.next_step)
			: 'Você está apto a participar deste evento';
	}

	// For complete_profile, always show our message since the backend reason
	// may be misleading (e.g., "Event is full" when the real issue is profile)
	if (eligibility.next_step === 'complete_profile') {
		return getNextStepMessage(eligibility.next_step);
	}

	// Not allowed - show reason
	if (eligibility.reason) {
		return eligibility.reason;
	}

	// Fallback based on next_step
	if (eligibility.next_step) {
		return getNextStepMessage(eligibility.next_step);
	}

	return 'Você não está apto a participar deste evento no momento';
}

/**
 * Get RSVP status display text
 */
export function getRSVPStatusText(status: RsvpStatus): string {
	// Backend returns the user's actual answer: 'yes' | 'no' | 'maybe'
	if (status === 'yes') return 'Você vai participar';
	if (status === 'maybe') return 'Você talvez participe';
	if (status === 'no') return 'Você não vai participar';
	return 'Status do RSVP desconhecido';
}

/**
 * Get ticket status display text
 */
export function getTicketStatusText(status?: TicketStatus): string {
	if (!status) return 'Você tem um ingresso';

	if (status === 'active') return 'Você tem um ingresso';
	if (status === 'cancelled') return 'Ingresso cancelado';
	if (status === 'checked_in') return 'Check-in feito';
	if (status === 'pending') return 'Ingresso pendente';

	return 'Você tem um ingresso';
}

/**
 * Get display text for multiple tickets
 */
export function getMultipleTicketsStatusText(tickets: EventTicketSchemaActual[]): string {
	const activeTickets = tickets.filter((t) => t.status !== 'cancelled');
	const count = activeTickets.length;

	if (count === 0) return 'Sem ingressos';
	if (count === 1) return getTicketStatusText(activeTickets[0].status);

	const checkedIn = activeTickets.filter((t) => t.status === 'checked_in').length;
	const pending = activeTickets.filter((t) => t.status === 'pending').length;

	if (checkedIn === count) return `${count} ingressos com check-in feito`;
	if (pending === count) return `${count} ingressos pendentes`;
	if (pending > 0) return `${count} ingressos (${pending} pendente(s))`;

	return `${count} ingressos`;
}

/**
 * Check if any tickets have pending online payment
 */
export function hasPendingOnlinePayment(tickets: EventTicketSchemaActual[]): boolean {
	return tickets.some((t) => t.status === 'pending' && t.tier?.payment_method === 'online');
}

/**
 * Returns true when the user is allowed AND holds an active (pending) waitlist
 * offer. The backend signals this purely via `active_offer_expires_at`; there is
 * no dedicated next_step.
 */
export function hasActiveWaitlistOffer(eligibility: EventUserEligibility): boolean {
	return eligibility.allowed === true && !!eligibility.active_offer_expires_at;
}

/**
 * Get user-friendly label for a missing profile field
 */
export function getMissingProfileFieldLabel(field: string): string {
	const labels: Record<string, string> = {
		profile_picture: 'Foto de perfil',
		name: 'Nome de exibição'
	};

	return labels[field] || field;
}

/**
 * Get all missing profile field labels
 */
export function getMissingProfileFieldLabels(fields: string[]): string[] {
	return fields.map(getMissingProfileFieldLabel);
}
