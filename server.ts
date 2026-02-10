import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { createActor } from 'xstate';
import { gameMachine } from './src/machines/gameMachine';
import { loadQuestions } from './src/lib/questionsLoader';
import { SOCKET_EVENTS } from './src/lib/socketEvents';
import type { 
  Question, 
  GameEvent, 
  PublicGameState, 
  AdminGameState,
  GameContext 
} from './src/types/game';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3003;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let availableQuestions: Question[] = [];
let availableQuestionTypes: string[] = [];
let gameActor: ReturnType<typeof createActor<typeof gameMachine>> | null = null;

// Convert XState compound state value to dot-notation string
// e.g. { faceOff: 'awaitingBuzz' } → 'faceOff.awaitingBuzz'
function stateValueToString(value: string | Record<string, any>): string {
  if (typeof value === 'string') return value;
  const key = Object.keys(value)[0];
  const child = value[key];
  if (typeof child === 'string') return `${key}.${child}`;
  return `${key}.${stateValueToString(child)}`;
}

// Convert context to public state
function getPublicState(context: GameContext): PublicGameState {
  const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
  const rawValue = gameActor?.getSnapshot().value;
  const phase = rawValue ? stateValueToString(rawValue) : 'idle';
  
  return {
    phase: phase as any,
    teams: context.teams,
    currentQuestion: currentQuestion ? {
      question: currentQuestion.question,
      totalAnswers: currentQuestion.responses.length,
    } : null,
    revealedAnswers: currentQuestion ? context.revealedAnswers.map(index => ({
      index,
      answer: currentQuestion.responses[index].answer,
      value: currentQuestion.responses[index].value,
    })) : [],
    roundPot: context.roundPot,
    strikes: context.strikes,
    controllingTeamIndex: context.controllingTeamIndex,
    winner: context.winner,
    roundOutcome: context.roundOutcome,
  };
}

// Convert context to admin state
function getAdminState(context: GameContext): AdminGameState {
  const publicState = getPublicState(context);
  const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
  
  return {
    ...publicState,
    availableQuestions: context.availableQuestions,
    selectedQuestions: context.selectedQuestions,
    currentQuestionIndex: context.currentQuestionIndex,
    currentQuestionFull: currentQuestion || null,
    maxScore: context.maxScore,
    faceOffData: context.faceOffData,
    playOrPassTeamIndex: context.playOrPassTeamIndex,
  };
}

app.prepare().then(async () => {
  // Load questions on startup
  console.log('Loading questions...');
  availableQuestions = await loadQuestions();
  // Compute unique question types from all loaded questions
  availableQuestionTypes = [...new Set(availableQuestions.flatMap(q => q.types))].sort();
  console.log(`Loaded ${availableQuestions.length} questions with ${availableQuestionTypes.length} unique types`);

  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.IO server
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Initialize game actor
  function initializeGameActor() {
    if (gameActor) {
      gameActor.stop();
    }

    gameActor = createActor(gameMachine);
    
    // Subscribe to state changes
    gameActor.subscribe((snapshot) => {
      const context = snapshot.context;
      
      // Emit public state to game clients
      io.emit(SOCKET_EVENTS.GAME_STATE, getPublicState(context));
      
      // Emit admin state to admin clients
      io.emit(SOCKET_EVENTS.ADMIN_STATE, getAdminState(context));
    });

    gameActor.start();
  }

  initializeGameActor();

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Admin joins
    socket.on(SOCKET_EVENTS.ADMIN_JOIN, () => {
      console.log('Admin joined:', socket.id);
      
      // Send available questions and unique types to admin
      socket.emit(SOCKET_EVENTS.ADMIN_QUESTIONS, availableQuestions);
      socket.emit(SOCKET_EVENTS.ADMIN_QUESTION_TYPES, availableQuestionTypes);
      
      // Send current state
      if (gameActor) {
        const context = gameActor.getSnapshot().context;
        socket.emit(SOCKET_EVENTS.ADMIN_STATE, getAdminState(context));
      }
    });

    // Admin setup
    socket.on(SOCKET_EVENTS.ADMIN_SETUP, (data: {
      selectedQuestionIds: string[];
      teamNames: [string, string];
      maxScore: number;
    }) => {
      console.log('Admin setup:', data);
      
      // Filter selected questions
      const selectedQuestions = availableQuestions.filter(q => 
        data.selectedQuestionIds.includes(q.id)
      );
      
      if (gameActor) {
        gameActor.send({
          type: 'SETUP',
          questions: selectedQuestions,
          teams: data.teamNames,
          maxScore: data.maxScore,
        });
      }
    });

    // Admin action
    socket.on(SOCKET_EVENTS.ADMIN_ACTION, (event: GameEvent) => {
      console.log('Admin action:', event);
      
      if (gameActor) {
        // Capture state before sending event (needed for REVEAL_NEXT_REMAINING diff)
        const prevRevealedAnswers = new Set(gameActor.getSnapshot().context.revealedAnswers);
        const prevState = stateValueToString(gameActor.getSnapshot().value);
        
        // Face-off steal failed: opponent gave a wrong answer during face-off
        // Emit BEFORE state machine transitions so the overlay appears on the
        // game page before the board updates to playOrPass.
        if (
          prevState === 'faceOff.opponentEvaluating' &&
          event.type === 'EVALUATE' &&
          event.answerIndex === null
        ) {
          io.emit(SOCKET_EVENTS.GAME_STEAL_FAILED);
        }
        
        gameActor.send(event);
        
        // Check for special events that trigger animations
        const context = gameActor.getSnapshot().context;
        
        // Emit reveal event for animations
        if (event.type === 'EVALUATE' || event.type === 'SUBMIT_ANSWER' || event.type === 'STEAL_ANSWER') {
          if (event.answerIndex !== null) {
            const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
            const answer = currentQuestion.responses[event.answerIndex];
            
            io.emit(SOCKET_EVENTS.GAME_REVEAL, {
              index: event.answerIndex,
              answer: answer.answer,
              value: answer.value,
            });
          }
        }
        
        // Emit reveal event for remaining answer reveals
        if (event.type === 'REVEAL_NEXT_REMAINING') {
          const newlyRevealed = context.revealedAnswers.find(idx => !prevRevealedAnswers.has(idx));
          if (newlyRevealed !== undefined) {
            const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
            const answer = currentQuestion.responses[newlyRevealed];
            io.emit(SOCKET_EVENTS.GAME_REVEAL, {
              index: newlyRevealed,
              answer: answer.answer,
              value: answer.value,
            });
          }
        }
        
        // Emit steal failed event for X overlay
        if (event.type === 'STEAL_ANSWER' && event.answerIndex === null) {
          io.emit(SOCKET_EVENTS.GAME_STEAL_FAILED);
        }
        
        // Emit strike event for animations
        if (event.type === 'SUBMIT_ANSWER' && event.answerIndex === null) {
          io.emit(SOCKET_EVENTS.GAME_STRIKE, context.strikes);
        }
      }
    });

    // Admin reset game
    socket.on(SOCKET_EVENTS.ADMIN_RESET, () => {
      console.log('Admin reset game:', socket.id);
      initializeGameActor();
    });

    // Game page joins
    socket.on(SOCKET_EVENTS.GAME_JOIN, () => {
      console.log('Game page joined:', socket.id);
      
      // Send current state
      if (gameActor) {
        const context = gameActor.getSnapshot().context;
        socket.emit(SOCKET_EVENTS.GAME_STATE, getPublicState(context));
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
