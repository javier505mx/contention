'use client';

import { Stack, Title, Text, Button, Card, Group, Badge } from '@mantine/core';
import { FaceOffPanel } from './FaceOffPanel';
import { PlayOrPassPanel } from './PlayOrPassPanel';
import { ActiveRoundPanel } from './ActiveRoundPanel';
import { StealPanel } from './StealPanel';
import type { AdminGameState } from '@/types/game';

interface GameControlsProps {
  gameState: AdminGameState;
  onAction: (event: any) => void;
}

export function GameControls({ gameState, onAction }: GameControlsProps) {
  // Scoreboard always visible
  const ScoreBoard = () => (
    <Card shadow="sm" padding="lg" withBorder mb="xl">
      <Group justify="space-between">
        <div>
          <Text size="sm" c="dimmed">Team 1</Text>
          <Title order={2}>{gameState.teams[0].name}</Title>
          <Text size="xl" fw={700}>{gameState.teams[0].score} points</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text size="sm" c="dimmed">Round</Text>
          <Title order={2}>#{gameState.currentQuestionIndex + 1}</Title>
          <Text size="sm" c="dimmed">Max Score: {gameState.maxScore}</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text size="sm" c="dimmed">Team 2</Text>
          <Title order={2}>{gameState.teams[1].name}</Title>
          <Text size="xl" fw={700}>{gameState.teams[1].score} points</Text>
        </div>
      </Group>
    </Card>
  );

  // Game Start phase
  if (gameState.phase === 'gameStart') {
    return (
      <Stack gap="md">
        <ScoreBoard />
        <Card shadow="sm" padding="lg" withBorder>
          <Title order={2} mb="md">Game Ready!</Title>
          <Text mb="md">Click below to begin the first round.</Text>
          <Button 
            onClick={() => onAction({ type: 'BEGIN_ROUND' })} 
            size="xl"
            color="green"
            fullWidth
          >
            Begin Round
          </Button>
        </Card>
      </Stack>
    );
  }

  // Round Start phase
  if (gameState.phase === 'roundStart') {
    return (
      <Stack gap="md">
        <ScoreBoard />
        <Card shadow="sm" padding="lg" withBorder>
          <Title order={2} mb="md">Round {gameState.currentQuestionIndex + 1}</Title>
          {gameState.currentQuestionFull && (
            <Text size="lg" mb="md">
              <strong>Question:</strong> {gameState.currentQuestionFull.question}
            </Text>
          )}
          <Button 
            onClick={() => onAction({ type: 'NEXT' })} 
            size="xl"
            color="blue"
            fullWidth
          >
            Start Face-Off
          </Button>
        </Card>
      </Stack>
    );
  }

  // Face-Off phases
  if (gameState.phase.startsWith('faceOff')) {
    return (
      <Stack gap="md">
        <ScoreBoard />
        <FaceOffPanel gameState={gameState} onAction={onAction} />
      </Stack>
    );
  }

  // Play or Pass phase
  if (gameState.phase === 'playOrPass') {
    return (
      <Stack gap="md">
        <ScoreBoard />
        <PlayOrPassPanel gameState={gameState} onAction={onAction} />
      </Stack>
    );
  }

  // Active Round phases
  if (gameState.phase.startsWith('activeRound')) {
    return (
      <Stack gap="md">
        <ScoreBoard />
        <ActiveRoundPanel gameState={gameState} onAction={onAction} />
      </Stack>
    );
  }

  // Steal Phase
  if (gameState.phase.startsWith('stealPhase')) {
    return (
      <Stack gap="md">
        <ScoreBoard />
        <StealPanel gameState={gameState} onAction={onAction} />
      </Stack>
    );
  }

  // Award Points phase
  if (gameState.phase.startsWith('awardPoints')) {
    const isStealSuccess = gameState.phase === 'awardPoints.stealSuccess';
    const winningTeamIndex = isStealSuccess
      ? (gameState.controllingTeamIndex === 0 ? 1 : 0)
      : gameState.controllingTeamIndex;
    const winningTeam = winningTeamIndex !== null ? gameState.teams[winningTeamIndex] : null;

    return (
      <Stack gap="md">
        <ScoreBoard />
        <Card shadow="sm" padding="lg" withBorder>
          <Title order={2} mb="md">Round Complete!</Title>
          {winningTeam && (
            <Text size="lg" mb="md">
              <strong>{winningTeam.name}</strong> won {gameState.roundPot} points!
            </Text>
          )}
          <Button 
            onClick={() => onAction({ type: 'NEXT_ROUND' })} 
            size="xl"
            color="green"
            fullWidth
          >
            Continue
          </Button>
        </Card>
      </Stack>
    );
  }

  // Game Over phase
  if (gameState.phase === 'gameOver') {
    const winner = gameState.winner !== null ? gameState.teams[gameState.winner] : null;

    return (
      <Stack gap="md">
        <ScoreBoard />
        <Card shadow="sm" padding="lg" withBorder style={{ textAlign: 'center' }}>
          <Title order={1} mb="md" c="yellow">🎉 GAME OVER! 🎉</Title>
          {winner && (
            <>
              <Title order={2} mb="md">{winner.name} WINS!</Title>
              <Text size="xl" mb="xl">Final Score: {winner.score} points</Text>
            </>
          )}
          <Button 
            onClick={() => onAction({ type: 'NEW_GAME' })} 
            size="xl"
            color="blue"
            fullWidth
          >
            New Game
          </Button>
        </Card>
      </Stack>
    );
  }

  // Default fallback
  return (
    <Stack gap="md">
      <ScoreBoard />
      <Card shadow="sm" padding="lg" withBorder>
        <Text>Current Phase: {gameState.phase}</Text>
        <pre style={{ fontSize: '10px', overflow: 'auto' }}>
          {JSON.stringify(gameState, null, 2)}
        </pre>
      </Card>
    </Stack>
  );
}
