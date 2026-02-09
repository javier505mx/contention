'use client';

import { Stack, Title, Text, Button, Group, Card } from '@mantine/core';
import type { AdminGameState } from '@/types/game';

interface PlayOrPassPanelProps {
  gameState: AdminGameState;
  onAction: (event: any) => void;
}

export function PlayOrPassPanel({ gameState, onAction }: PlayOrPassPanelProps) {
  const winningTeamIndex = gameState.playOrPassTeamIndex;
  
  if (winningTeamIndex === null) return null;

  const winningTeam = gameState.teams[winningTeamIndex];

  return (
    <Stack gap="md">
      <Title order={2}>Play or Pass</Title>
      <Card shadow="sm" padding="lg" withBorder>
        <Text size="lg" mb="md">
          <strong>{winningTeam.name}</strong> won the face-off!
        </Text>
        <Text mb="md">
          Do they want to <strong>PLAY</strong> (control the board) or <strong>PASS</strong> (give control to the other team)?
        </Text>
        <Group>
          <Button 
            onClick={() => onAction({ type: 'PLAY' })} 
            size="xl"
            color="green"
          >
            PLAY
          </Button>
          <Button 
            onClick={() => onAction({ type: 'PASS' })} 
            size="xl"
            color="orange"
          >
            PASS
          </Button>
        </Group>
      </Card>
    </Stack>
  );
}
