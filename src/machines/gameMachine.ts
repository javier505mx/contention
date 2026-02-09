import { setup, assign } from 'xstate';
import type { GameContext, GameEvent, Question } from '@/types/game';

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  guards: {
    isTopAnswer: ({ context, event }) => {
      if (event.type !== 'EVALUATE' || event.answerIndex === null) return false;
      const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
      return event.answerIndex === 0; // Top answer is at index 0 (sorted by value)
    },
    
    firstBuzzHigherOrEqual: ({ context }) => {
      if (!context.faceOffData?.firstBuzz || !context.faceOffData?.secondBuzz) return false;
      return context.faceOffData.firstBuzz.value >= context.faceOffData.secondBuzz.value;
    },
    
    allAnswersRevealed: ({ context }) => {
      const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
      return context.revealedAnswers.length === currentQuestion.responses.length;
    },
    
    strikesLessThan3: ({ context }) => {
      return context.strikes < 3;
    },
    
    strikesEqual3: ({ context }) => {
      return context.strikes === 3;
    },
    
    scoreReachedMax: ({ context }) => {
      return context.teams.some(team => team.score >= context.maxScore);
    },
    
    scoreBelowMax: ({ context }) => {
      return context.teams.every(team => team.score < context.maxScore);
    },
    
    noMoreQuestions: ({ context }) => {
      return context.currentQuestionIndex + 1 >= context.selectedQuestions.length;
    },
  },
  actions: {
    setupGame: assign(({ event }) => {
      if (event.type !== 'SETUP') return {};
      
      return {
        availableQuestions: event.questions,
        selectedQuestions: event.questions,
        teams: [
          { name: event.teams[0], score: 0 },
          { name: event.teams[1], score: 0 },
        ],
        maxScore: event.maxScore,
        currentQuestionIndex: 0,
        controllingTeamIndex: null,
        roundPot: 0,
        revealedAnswers: [],
        strikes: 0,
        faceOffData: null,
        playOrPassTeamIndex: null,
        winner: null,
      };
    }),
    
    startRound: assign({
      roundPot: 0,
      revealedAnswers: [],
      strikes: 0,
      faceOffData: null,
      playOrPassTeamIndex: null,
      controllingTeamIndex: null,
    }),
    
    recordFirstBuzz: assign(({ context, event }) => {
      if (event.type !== 'BUZZ_IN') return {};
      
      return {
        faceOffData: {
          firstBuzz: {
            teamIndex: event.teamIndex,
            answerIndex: null,
            value: 0,
          },
          secondBuzz: null,
        },
      };
    }),
    
    evaluateFirstBuzz: assign(({ context, event }) => {
      if (event.type !== 'EVALUATE' || !context.faceOffData) return {};
      
      const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
      const value = event.answerIndex !== null ? currentQuestion.responses[event.answerIndex].value : 0;
      
      return {
        faceOffData: {
          ...context.faceOffData,
          firstBuzz: {
            ...context.faceOffData.firstBuzz!,
            answerIndex: event.answerIndex,
            value,
          },
        },
        revealedAnswers: event.answerIndex !== null ? [event.answerIndex] : [],
        roundPot: value,
      };
    }),
    
    autoRecordSecondBuzz: assign(({ context }) => {
      if (!context.faceOffData?.firstBuzz) return {};
      const opponentTeamIndex = context.faceOffData.firstBuzz.teamIndex === 0 ? 1 : 0;
      
      return {
        faceOffData: {
          ...context.faceOffData,
          secondBuzz: {
            teamIndex: opponentTeamIndex,
            answerIndex: null,
            value: 0,
          },
        },
      };
    }),
    
    evaluateSecondBuzz: assign(({ context, event }) => {
      if (event.type !== 'EVALUATE' || !context.faceOffData) return {};
      
      const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
      const value = event.answerIndex !== null ? currentQuestion.responses[event.answerIndex].value : 0;
      const isNewAnswer = event.answerIndex !== null && !context.revealedAnswers.includes(event.answerIndex);
      
      return {
        faceOffData: {
          ...context.faceOffData,
          secondBuzz: {
            ...context.faceOffData.secondBuzz!,
            answerIndex: event.answerIndex,
            value,
          },
        },
        revealedAnswers: isNewAnswer ? [...context.revealedAnswers, event.answerIndex] : context.revealedAnswers,
        roundPot: isNewAnswer ? context.roundPot + value : context.roundPot,
      };
    }),
    
    assignControlToFirst: assign(({ context }) => {
      if (!context.faceOffData?.firstBuzz) return {};
      
      return {
        controllingTeamIndex: context.faceOffData.firstBuzz.teamIndex,
        playOrPassTeamIndex: context.faceOffData.firstBuzz.teamIndex,
      };
    }),
    
    assignControlToSecond: assign(({ context }) => {
      if (!context.faceOffData?.secondBuzz) return {};
      
      return {
        controllingTeamIndex: context.faceOffData.secondBuzz.teamIndex,
        playOrPassTeamIndex: context.faceOffData.secondBuzz.teamIndex,
      };
    }),
    
    handlePlay: assign(({ context }) => ({
      // Control stays with playOrPassTeamIndex
      controllingTeamIndex: context.playOrPassTeamIndex,
    })),
    
    handlePass: assign(({ context }) => ({
      // Control goes to the other team
      controllingTeamIndex: context.playOrPassTeamIndex === 0 ? 1 : 0,
    })),
    
    revealCorrectAnswer: assign(({ context, event }) => {
      if (event.type !== 'SUBMIT_ANSWER' || event.answerIndex === null) return {};
      
      const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
      const value = currentQuestion.responses[event.answerIndex].value;
      
      return {
        revealedAnswers: [...context.revealedAnswers, event.answerIndex],
        roundPot: context.roundPot + value,
      };
    }),
    
    addStrike: assign(({ context }) => ({
      strikes: context.strikes + 1,
    })),
    
    revealStealAnswer: assign(({ context, event }) => {
      if (event.type !== 'STEAL_ANSWER' || event.answerIndex === null) return {};
      
      const currentQuestion = context.selectedQuestions[context.currentQuestionIndex];
      const value = currentQuestion.responses[event.answerIndex].value;
      
      return {
        revealedAnswers: [...context.revealedAnswers, event.answerIndex],
        roundPot: context.roundPot + value,
      };
    }),
    
    awardPointsToControlling: assign(({ context }) => {
      const teams = [...context.teams];
      if (context.controllingTeamIndex !== null) {
        teams[context.controllingTeamIndex] = {
          ...teams[context.controllingTeamIndex],
          score: teams[context.controllingTeamIndex].score + context.roundPot,
        };
      }
      
      return { teams };
    }),
    
    awardPointsToStealing: assign(({ context }) => {
      const teams = [...context.teams];
      const stealingTeamIndex = context.controllingTeamIndex === 0 ? 1 : 0;
      
      teams[stealingTeamIndex] = {
        ...teams[stealingTeamIndex],
        score: teams[stealingTeamIndex].score + context.roundPot,
      };
      
      return { teams };
    }),
    
    determineWinner: assign(({ context }) => {
      const winningTeamIndex = context.teams[0].score >= context.teams[1].score ? 0 : 1;
      
      return { winner: winningTeamIndex };
    }),
    
    nextQuestion: assign(({ context }) => ({
      currentQuestionIndex: context.currentQuestionIndex + 1,
    })),
    
    resetGame: assign({
      selectedQuestions: [],
      currentQuestionIndex: 0,
      teams: [
        { name: '', score: 0 },
        { name: '', score: 0 },
      ],
      controllingTeamIndex: null,
      roundPot: 0,
      revealedAnswers: [],
      strikes: 0,
      faceOffData: null,
      playOrPassTeamIndex: null,
      winner: null,
    }),
  },
}).createMachine({
  id: 'familyFeud',
  initial: 'idle',
  context: {
    availableQuestions: [],
    selectedQuestions: [],
    currentQuestionIndex: 0,
    teams: [
      { name: '', score: 0 },
      { name: '', score: 0 },
    ],
    controllingTeamIndex: null,
    roundPot: 0,
    revealedAnswers: [],
    strikes: 0,
    maxScore: 200,
    faceOffData: null,
    playOrPassTeamIndex: null,
    winner: null,
  },
  states: {
    idle: {
      on: {
        SETUP: {
          target: 'gameStart',
          actions: 'setupGame',
        },
      },
    },
    gameStart: {
      on: {
        BEGIN_ROUND: {
          target: 'roundStart',
          actions: 'startRound',
        },
      },
    },
    roundStart: {
      on: {
        NEXT: 'faceOff',
      },
    },
    faceOff: {
      initial: 'awaitingBuzz',
      states: {
        awaitingBuzz: {
          on: {
            BUZZ_IN: {
              target: 'evaluating',
              actions: 'recordFirstBuzz',
            },
          },
        },
        evaluating: {
          on: {
            EVALUATE: [
              {
                guard: 'isTopAnswer',
                target: 'resolved',
                actions: ['evaluateFirstBuzz', 'assignControlToFirst'],
              },
              {
                target: 'opponentEvaluating',
                actions: ['evaluateFirstBuzz', 'autoRecordSecondBuzz'],
              },
            ],
          },
        },
        opponentEvaluating: {
          on: {
            EVALUATE: {
              target: 'compareFaceOff',
              actions: 'evaluateSecondBuzz',
            },
          },
        },
        compareFaceOff: {
          always: [
            {
              guard: 'firstBuzzHigherOrEqual',
              target: 'resolved',
              actions: 'assignControlToFirst',
            },
            {
              target: 'resolved',
              actions: 'assignControlToSecond',
            },
          ],
        },
        resolved: {
          type: 'final',
        },
      },
      onDone: 'playOrPass',
    },
    playOrPass: {
      on: {
        PLAY: {
          target: 'activeRound',
          actions: 'handlePlay',
        },
        PASS: {
          target: 'activeRound',
          actions: 'handlePass',
        },
      },
    },
    activeRound: {
      initial: 'awaitingGuess',
      states: {
        awaitingGuess: {
          on: {
            SUBMIT_ANSWER: 'checkGuess',
          },
        },
        checkGuess: {
          always: [
            {
              guard: ({ event }) => event.type === 'SUBMIT_ANSWER' && event.answerIndex !== null,
              target: 'correct',
            },
            {
              target: 'incorrect',
            },
          ],
        },
        correct: {
          entry: 'revealCorrectAnswer',
          always: [
            {
              guard: 'allAnswersRevealed',
              target: '#familyFeud.awardPoints.controllingWins',
            },
            {
              target: 'awaitingGuess',
            },
          ],
        },
        incorrect: {
          entry: 'addStrike',
          always: [
            {
              guard: 'strikesEqual3',
              target: '#familyFeud.stealPhase',
            },
            {
              target: 'awaitingGuess',
            },
          ],
        },
      },
    },
    stealPhase: {
      initial: 'awaitingSteal',
      states: {
        awaitingSteal: {
          on: {
            STEAL_ANSWER: 'stealResolved',
          },
        },
        stealResolved: {
          always: [
            {
              guard: ({ event }) => event.type === 'STEAL_ANSWER' && event.answerIndex !== null,
              target: '#familyFeud.awardPoints.stealSuccess',
              actions: 'revealStealAnswer',
            },
            {
              target: '#familyFeud.awardPoints.stealFailed',
            },
          ],
        },
      },
    },
    awardPoints: {
      initial: 'controllingWins',
      states: {
        controllingWins: {
          entry: 'awardPointsToControlling',
        },
        stealSuccess: {
          entry: 'awardPointsToStealing',
        },
        stealFailed: {
          entry: 'awardPointsToControlling',
        },
      },
      on: {
        NEXT_ROUND: [
          {
            guard: 'scoreReachedMax',
            target: 'gameOver',
            actions: 'determineWinner',
          },
          {
            guard: 'noMoreQuestions',
            target: 'gameOver',
            actions: 'determineWinner',
          },
          {
            target: 'roundStart',
            actions: ['nextQuestion', 'startRound'],
          },
        ],
      },
    },
    gameOver: {
      on: {
        NEW_GAME: {
          target: 'idle',
          actions: 'resetGame',
        },
      },
    },
  },
});
