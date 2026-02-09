'use client';

import { Stack, Title, Text, Card } from '@mantine/core';
import type { Team } from '@/types/game';

interface TeamScoreProps {
  team: Team;
  isActive?: boolean;
}

export function TeamScore({ team, isActive = false }: TeamScoreProps) {
  return (
    <Card 
      shadow="lg" 
      padding="xl" 
      radius="md"
      style={{
        backgroundColor: isActive ? 'rgba(34, 139, 230, 0.2)' : 'rgba(0, 0, 0, 0.3)',
        border: isActive ? '3px solid #228be6' : '3px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      <Stack gap="xs" align="center">
        <Title 
          order={2} 
          style={{ 
            fontSize: '2rem',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          {team.name}
        </Title>
        <Text 
          size="xl" 
          c="dimmed"
          style={{ fontSize: '1.2rem' }}
        >
          SCORE
        </Text>
        <Title 
          order={1} 
          style={{ 
            fontSize: '4rem',
            color: '#ffd700',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          }}
        >
          {team.score}
        </Title>
      </Stack>
    </Card>
  );
}
