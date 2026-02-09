'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Container, LoadingOverlay, Stack, Title, Text, Box } from '@mantine/core';
import { GameBoard } from '@/components/game/GameBoard';
import { SOCKET_EVENTS } from '@/lib/socketEvents';
import { useGameSounds } from '@/hooks/useGameSounds';
import type { PublicGameState } from '@/types/game';

export default function GamePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingState, setPendingState] = useState<PublicGameState | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { playError, playCorrect, playVictory, unlockAudio, audioUnlocked } = useGameSounds();

  const handleStartClick = useCallback(() => {
    unlockAudio();
  }, [unlockAudio]);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:3003');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Game page connected to server');
      socketInstance.emit(SOCKET_EVENTS.GAME_JOIN);
    });

    socketInstance.on(SOCKET_EVENTS.GAME_STATE, (state: PublicGameState) => {
      console.log('Received game state:', state);
      
      // If we're currently delaying for 3rd strike, buffer this state update
      if (delayTimeoutRef.current && state.phase.startsWith('stealPhase')) {
        setPendingState(state);
        return;
      }
      
      setGameState(state);
      setLoading(false);
    });

    socketInstance.on(SOCKET_EVENTS.GAME_REVEAL, (data: { index: number; answer: string; value: number }) => {
      console.log('Answer revealed:', data);
      // Play correct sound on answer reveal
      playCorrect();
    });

    socketInstance.on(SOCKET_EVENTS.GAME_STRIKE, (strikeCount: number) => {
      console.log('Strike!', strikeCount);
      // Play error sound on strike
      playError();
      
      // If this is the 3rd strike, add a 2.5 second delay before transitioning to steal phase
      if (strikeCount === 3) {
        delayTimeoutRef.current = setTimeout(() => {
          // Apply any pending state update after the delay
          if (pendingState) {
            setGameState(pendingState);
            setPendingState(null);
          }
          delayTimeoutRef.current = null;
        }, 2500);
      }
    });

    return () => {
      socketInstance.disconnect();
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [playError, playCorrect]);

  // Show "Click to Start" overlay to unlock audio before the game begins.
  // Browsers block programmatic audio playback until the user has interacted
  // with the page, so we need at least one click/tap to enable sound effects.
  if (!audioUnlocked) {
    return (
      <Box
        onClick={handleStartClick}
        style={{
          minHeight: '100vh',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a1a 100%)',
        }}
      >
        <Stack gap="xl" align="center">
          <Title
            order={1}
            style={{
              fontSize: '5rem',
              color: '#ffd700',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
              textAlign: 'center',
            }}
          >
            CONTENTION
          </Title>
          <Text
            size="xl"
            c="dimmed"
            style={{
              fontSize: '2rem',
              textAlign: 'center',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            Click anywhere to start
          </Text>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
          `}</style>
        </Stack>
      </Box>
    );
  }

  if (loading || !gameState) {
    return (
      <Container size="xl" py="xl" pos="relative" style={{ minHeight: '100vh' }}>
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  return <GameBoard gameState={gameState} onPlayVictory={playVictory} />;
}
