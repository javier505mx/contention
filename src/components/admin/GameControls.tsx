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
            <Title order={1} mb="md">
              <strong>QUESTION:</strong> {gameState.currentQuestionFull.question.toUpperCase()}
            </Title>
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

  // Reveal Remaining phase
  if (gameState.phase === 'revealRemaining') {
    const totalAnswers = gameState.currentQuestionFull?.responses.length ?? 0;
    const revealedCount = gameState.revealedAnswers.length;
    const remainingCount = totalAnswers - revealedCount;
    const allRevealed = remainingCount === 0;

    const isStealSuccess = gameState.roundOutcome === 'stealSuccess';
    const stealingTeamIndex = gameState.controllingTeamIndex === 0 ? 1 : 0;
    const stealingTeamName = gameState.teams[stealingTeamIndex]?.name ?? 'Opponent';
    const controllingTeamName = gameState.controllingTeamIndex !== null
      ? gameState.teams[gameState.controllingTeamIndex].name
      : '';

    return (
      <Stack gap="md">
        <ScoreBoard />
        <Card shadow="sm" padding="lg" withBorder>
          <Title order={2} mb="md">Reveal Remaining Answers</Title>
          {isStealSuccess ? (
            <Text size="lg" mb="md" c="green">
              <strong>{stealingTeamName}</strong> stole successfully!
            </Text>
          ) : (
            <Text size="lg" mb="md" c="red">
              <strong>{stealingTeamName}</strong> failed to steal!{' '}
              <strong>{controllingTeamName}</strong> keeps the points.
            </Text>
          )}
          
          <Text size="md" mb="md" c="dimmed">
            {allRevealed 
              ? 'All answers revealed!' 
              : `${remainingCount} answer${remainingCount !== 1 ? 's' : ''} remaining`}
          </Text>

          <Group gap="md">
            <Button
              onClick={() => onAction({ type: 'REVEAL_NEXT_REMAINING' })}
              size="lg"
              color="blue"
              disabled={allRevealed}
              style={{ flex: 1 }}
            >
              Reveal Next Answer
            </Button>
            <Button
              onClick={() => onAction({ type: 'CONTINUE_AWARD' })}
              size="lg"
              color="green"
              style={{ flex: 1 }}
            >
              Continue
            </Button>
          </Group>

          {gameState.currentQuestionFull && (
            <Card shadow="xs" padding="sm" withBorder mt="md">
              <Text size="sm" c="dimmed" mb="xs">All answers:</Text>
              {gameState.currentQuestionFull.responses.map((response, idx) => {
                const isRevealed = gameState.revealedAnswers.some(a => a.index === idx);
                return (
                  <Group key={idx} gap="sm" mb={4}>
                    <Badge 
                      color={isRevealed ? 'green' : 'gray'} 
                      variant={isRevealed ? 'filled' : 'outline'}
                      size="sm"
                    >
                      {idx + 1}
                    </Badge>
                    <Text size="sm" fw={isRevealed ? 700 : 400}>
                      {response.answer} ({response.value})
                    </Text>
                    {isRevealed && <Text size="xs" c="green">✓</Text>}
                  </Group>
                );
              })}
            </Card>
          )}
        </Card>
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
