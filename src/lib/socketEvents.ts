// Socket event constants for consistent event naming
export const SOCKET_EVENTS = {
  // Admin events
  ADMIN_JOIN: 'admin:join',
  ADMIN_SETUP: 'admin:setup',
  ADMIN_ACTION: 'admin:action',
  ADMIN_RESET: 'admin:reset',
  ADMIN_STATE: 'admin:state',
  ADMIN_QUESTIONS: 'admin:questions',
  ADMIN_QUESTION_TYPES: 'admin:questionTypes',

  // Game events
  GAME_JOIN: 'game:join',
  GAME_STATE: 'game:state',
  GAME_REVEAL: 'game:reveal',
  GAME_STRIKE: 'game:strike',
} as const;
