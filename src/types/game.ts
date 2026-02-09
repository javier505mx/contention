// Question structure from YAML
export interface QuestionResponse {
  answer: string;
  value: number;
}

export interface Question {
  id: string;
  question: string;
  types: string[];
  responses: QuestionResponse[];
}

// Team structure
export interface Team {
  name: string;
  score: number;
}

// Face-off data for tracking buzz-in answers
export interface FaceOffAnswer {
  teamIndex: number;
  answerIndex: number | null; // null if wrong answer
  value: number;
}

// Game state phases
export type GamePhase = 
  | 'idle'
  | 'gameStart'
  | 'roundStart'
  | 'faceOff.awaitingBuzz'
  | 'faceOff.evaluating'
  | 'faceOff.opponentEvaluating'
  | 'faceOff.compareFaceOff'
  | 'faceOff.resolved'
  | 'playOrPass'
  | 'activeRound.awaitingGuess'
  | 'activeRound.checkGuess'
  | 'stealPhase.awaitingSteal'
  | 'stealPhase.stealResolved'
  | 'awardPoints'
  | 'awardPoints.controllingWins'
  | 'awardPoints.stealSuccess'
  | 'awardPoints.stealFailed'
  | 'gameOver';

// Public game state (visible to /game page)
export interface PublicGameState {
  phase: GamePhase;
  teams: Team[];
  currentQuestion: {
    question: string;
    totalAnswers: number;
  } | null;
  revealedAnswers: Array<{
    index: number;
    answer: string;
    value: number;
  }>;
  roundPot: number;
  strikes: number;
  controllingTeamIndex: number | null;
  winner: number | null; // team index of winner
}

// Admin game state (includes everything public + private data)
export interface AdminGameState extends PublicGameState {
  availableQuestions: Question[];
  selectedQuestions: Question[];
  currentQuestionIndex: number;
  currentQuestionFull: Question | null;
  maxScore: number;
  faceOffData: {
    firstBuzz: FaceOffAnswer | null;
    secondBuzz: FaceOffAnswer | null;
  } | null;
  playOrPassTeamIndex: number | null; // team that won face-off and needs to decide
}

// Socket event types
export interface SocketEvents {
  // Admin to Server
  'admin:join': () => void;
  'admin:setup': (data: {
    selectedQuestionIds: string[];
    teamNames: [string, string];
    maxScore: number;
  }) => void;
  'admin:action': (event: GameEvent) => void;

  // Server to Admin
  'admin:state': (state: AdminGameState) => void;
  'admin:questions': (questions: Question[]) => void;

  // Game page to Server
  'game:join': () => void;

  // Server to Game page
  'game:state': (state: PublicGameState) => void;
  'game:reveal': (data: { index: number; answer: string; value: number }) => void;
  'game:strike': (strikeCount: number) => void;
}

// XState events
export type GameEvent =
  | { type: 'SETUP'; questions: Question[]; teams: [string, string]; maxScore: number }
  | { type: 'BEGIN_ROUND' }
  | { type: 'NEXT' }
  | { type: 'BUZZ_IN'; teamIndex: number }
  | { type: 'EVALUATE'; answerIndex: number | null } // null for wrong answer
  | { type: 'FACE_OFF_RESOLVED' }
  | { type: 'PLAY' }
  | { type: 'PASS' }
  | { type: 'SUBMIT_ANSWER'; answerIndex: number | null } // null for wrong answer/strike
  | { type: 'STEAL_ANSWER'; answerIndex: number | null }
  | { type: 'NEXT_ROUND' }
  | { type: 'NEW_GAME' };

// Machine context
export interface GameContext {
  availableQuestions: Question[];
  selectedQuestions: Question[];
  currentQuestionIndex: number;
  teams: Team[];
  controllingTeamIndex: number | null;
  roundPot: number;
  revealedAnswers: number[]; // indices of revealed answers
  strikes: number;
  maxScore: number;
  faceOffData: {
    firstBuzz: FaceOffAnswer | null;
    secondBuzz: FaceOffAnswer | null;
  } | null;
  playOrPassTeamIndex: number | null;
  winner: number | null;
}
