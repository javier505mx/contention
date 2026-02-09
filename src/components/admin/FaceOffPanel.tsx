'use client';

import { Stack, Title, Text, Button, Group, Card, Badge } from '@mantine/core';
import type { AdminGameState } from '@/types/game';

interface FaceOffPanelProps {
  gameState: AdminGameState;
  onAction: (event: any) => void;
}

export function FaceOffPanel({ gameState, onAction }: FaceOffPanelProps) {
  const currentQuestion = gameState.currentQuestionFull;
  const isAwaitingBuzz = gameState.phase === 'faceOff.awaitingBuzz';
  const isEvaluating = gameState.phase === 'faceOff.evaluating';
  const isOpponentEvaluating = gameState.phase === 'faceOff.opponentEvaluating';

  if (!currentQuestion) return null;

  const handleBuzzIn = (teamIndex: number) => {
    onAction({ type: 'BUZZ_IN', teamIndex });
  };

  const handleEvaluate = (answerIndex: number | null) => {
    onAction({ type: 'EVALUATE', answerIndex });
  };

  return (
    <Stack gap="md">
      <Title order={2}>Face-Off</Title>
      <Card shadow="sm" padding="lg" withBorder>
        <Title order={3} mb="md">{currentQuestion.question}</Title>
        
        {isAwaitingBuzz && (
          <>
            <Text mb="md">Which team buzzed in first?</Text>
            <Group>
              <Button onClick={() => handleBuzzIn(0)} size="lg">
                {gameState.teams[0].name}
              </Button>
              <Button onClick={() => handleBuzzIn(1)} size="lg">
                {gameState.teams[1].name}
              </Button>
            </Group>
          </>
        )}

        {(isEvaluating || isOpponentEvaluating) && (
          <>
            <Text mb="md">
              {isEvaluating 
                ? `${gameState.teams[gameState.faceOffData?.firstBuzz?.teamIndex ?? 0].name} buzzed in. Select their answer:`
                : `${gameState.teams[gameState.faceOffData?.secondBuzz?.teamIndex ?? 1].name}'s turn. Select their answer:`
              }
            </Text>
            
            <Stack gap="xs">
              {currentQuestion.responses.map((response, index) => (
                <Button
                  key={index}
                  onClick={() => handleEvaluate(index)}
                  variant={gameState.revealedAnswers.some(r => r.index === index) ? 'filled' : 'default'}
                  disabled={gameState.revealedAnswers.some(r => r.index === index)}
                  size="lg"
                  fullWidth
                  justify="space-between"
                >
                  <span>{response.answer}</span>
                  <Badge>{response.value}</Badge>
                </Button>
              ))}
              <Button
                onClick={() => handleEvaluate(null)}
                color="red"
                size="lg"
                fullWidth
              >
                Wrong Answer
              </Button>
            </Stack>
          </>
        )}
      </Card>
    </Stack>
  );
}
