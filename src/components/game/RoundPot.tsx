'use client';

import { Stack, Title, Text, Card } from '@mantine/core';

interface RoundPotProps {
  points: number;
}

export function RoundPot({ points }: RoundPotProps) {
  return (
    <Card 
      shadow="xl" 
      padding="xl" 
      radius="md"
      style={{
        backgroundColor: 'rgba(34, 139, 230, 0.3)',
        border: '3px solid #228be6',
      }}
    >
      <Stack gap="xs" align="center">
        <Text 
          size="xl" 
          fw={700}
          style={{ 
            fontSize: '1.5rem',
            color: '#fff',
            letterSpacing: '2px',
          }}
        >
          ROUND POT
        </Text>
        <Title 
          order={1} 
          style={{ 
            fontSize: '5rem',
            color: '#ffd700',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
          }}
        >
          {points}
        </Title>
        <Text 
          size="lg" 
          c="dimmed"
          style={{ fontSize: '1.2rem' }}
        >
          POINTS
        </Text>
      </Stack>
    </Card>
  );
}
