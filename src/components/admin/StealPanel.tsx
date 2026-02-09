'use client';

import { Stack, Title, Text, Button, Card, Badge } from '@mantine/core';
import type { AdminGameState } from '@/types/game';

interface StealPanelProps {
  gameState: AdminGameState;
  onAction: (event: any) => void;
}

export function StealPanel({ gameState, onAction }: StealPanelProps) {
  const currentQuestion = gameState.currentQuestionFull;
  
  if (!currentQuestion) return null;

  const stealingTeamIndex = gameState.controllingTeamIndex === 0 ? 1 : 0;
  const stealingTeam = gameState.teams[stealingTeamIndex];

  const handleStealAnswer = (answerIndex: number | null) => {
    onAction({ type: 'STEAL_ANSWER', answerIndex });
  };

  return (
    <Stack gap="md">
      <Title order={2}>Steal Opportunity!</Title>
      <Card shadow="sm" padding="lg" withBorder>
        <Text size="xl" mb="md" fw={700} c="orange">
          {stealingTeam.name} has a chance to STEAL!
        </Text>
        
        <Text mb="md">
          The team got 3 strikes. If <strong>{stealingTeam.name}</strong> gives a correct answer,
          they steal all {gameState.roundPot} points!
        </Text>

        <Title order={4} mb="md">{currentQuestion.question}</Title>
        
        <Text mb="md" size="lg" fw={500}>Select their answer:</Text>
        <Stack gap="xs">
          {currentQuestion.responses.map((response, index) => (
            <Button
              key={index}
              onClick={() => handleStealAnswer(index)}
              variant={gameState.revealedAnswers.some(r => r.index === index) ? 'filled' : 'default'}
              disabled={gameState.revealedAnswers.some(r => r.index === index)}
              size="lg"
              fullWidth
              justify="space-between"
            >
              <span>#{index + 1}: {response.answer}</span>
              <Badge size="lg">{response.value}</Badge>
            </Button>
          ))}
          <Button
            onClick={() => handleStealAnswer(null)}
            color="red"
            size="lg"
            fullWidth
          >
            Wrong Answer (Steal Failed)
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
