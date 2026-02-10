'use client';

import { Stack, Title, Text, Button, Group, Card, Badge, Progress } from '@mantine/core';
import type { AdminGameState } from '@/types/game';

interface ActiveRoundPanelProps {
  gameState: AdminGameState;
  onAction: (event: any) => void;
}

export function ActiveRoundPanel({ gameState, onAction }: ActiveRoundPanelProps) {
  const currentQuestion = gameState.currentQuestionFull;
  
  if (!currentQuestion) return null;

  const controllingTeam = gameState.controllingTeamIndex !== null 
    ? gameState.teams[gameState.controllingTeamIndex] 
    : null;

  const handleSubmitAnswer = (answerIndex: number | null) => {
    onAction({ type: 'SUBMIT_ANSWER', answerIndex });
  };

  const revealedCount = gameState.revealedAnswers.length;
  const totalCount = currentQuestion.responses.length;

  return (
    <Stack gap="md">
      <Title order={2}>Active Round</Title>
      <Card shadow="sm" padding="lg" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={1}>QUESTION: {currentQuestion.question.toUpperCase()}</Title>
            {controllingTeam && (
              <Text size="lg" c="blue" fw={500}>
                {controllingTeam.name} is playing
              </Text>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text size="xl" fw={700}>Pot: {gameState.roundPot}</Text>
            <Text size="sm" c="dimmed">
              {revealedCount} / {totalCount} answers revealed
            </Text>
          </div>
        </Group>

        <Progress 
          value={(revealedCount / totalCount) * 100} 
          size="xl" 
          mb="md"
          color="green"
        />

        <Group mb="md">
          <Text size="lg" fw={500}>Strikes:</Text>
          {[...Array(3)].map((_, i) => (
            <Badge 
              key={i} 
              size="lg" 
              color={i < gameState.strikes ? 'red' : 'gray'}
            >
              {i < gameState.strikes ? 'X' : '-'}
            </Badge>
          ))}
        </Group>
        
        <Text mb="md" size="lg" fw={500}>Select the contestant's answer:</Text>
        <Stack gap="xs">
          {currentQuestion.responses.map((response, index) => (
            <Button
              key={index}
              onClick={() => handleSubmitAnswer(index)}
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
            onClick={() => handleSubmitAnswer(null)}
            color="red"
            size="lg"
            fullWidth
          >
            Wrong Answer / Strike
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
