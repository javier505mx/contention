'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Container, LoadingOverlay, Button, Divider } from '@mantine/core';
import { SetupWizard } from '@/components/admin/SetupWizard';
import { GameControls } from '@/components/admin/GameControls';
import { SOCKET_EVENTS } from '@/lib/socketEvents';
import type { Question, AdminGameState } from '@/types/game';

export default function AdminPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [gameState, setGameState] = useState<AdminGameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:3003');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Admin connected to server');
      socketInstance.emit(SOCKET_EVENTS.ADMIN_JOIN);
    });

    socketInstance.on(SOCKET_EVENTS.ADMIN_QUESTIONS, (loadedQuestions: Question[]) => {
      console.log('Received questions:', loadedQuestions);
      setQuestions(loadedQuestions);
      setLoading(false);
    });

    socketInstance.on(SOCKET_EVENTS.ADMIN_QUESTION_TYPES, (types: string[]) => {
      console.log('Received question types:', types);
      setQuestionTypes(types);
    });

    socketInstance.on(SOCKET_EVENTS.ADMIN_STATE, (state: AdminGameState) => {
      console.log('Received admin state:', state);
      setGameState(state);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSetupComplete = (data: {
    selectedQuestionIds: string[];
    teamNames: [string, string];
    maxScore: number;
  }) => {
    console.log('Setup complete:', data);
    if (socket) {
      socket.emit(SOCKET_EVENTS.ADMIN_SETUP, data);
    }
  };

  const handleAction = (event: any) => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.ADMIN_ACTION, event);
    }
  };

  const handleResetGame = () => {
    if (socket && confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      socket.emit(SOCKET_EVENTS.ADMIN_RESET);
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl" pos="relative" style={{ minHeight: '100vh' }}>
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  // Show setup wizard if game hasn't been set up
  if (!gameState || gameState.phase === 'idle') {
    return <SetupWizard questions={questions} questionTypes={questionTypes} onComplete={handleSetupComplete} />;
  }

  // Show game controls
  return (
    <Container size="xl" py="xl">
      <GameControls gameState={gameState} onAction={handleAction} />
      <Divider my="xl" />
      <Button
        color="red"
        variant="filled"
        fullWidth
        size="lg"
        onClick={handleResetGame}
      >
        Reset Game
      </Button>
    </Container>
  );
}
