'use client';

import { Group, Box } from '@mantine/core';
import { useEffect, useState } from 'react';

interface StrikeDisplayProps {
  strikes: number;
}

export function StrikeDisplay({ strikes }: StrikeDisplayProps) {
  const [animatedStrikes, setAnimatedStrikes] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    const newAnimated = [false, false, false];
    for (let i = 0; i < strikes; i++) {
      newAnimated[i] = true;
    }
    setAnimatedStrikes(newAnimated);
  }, [strikes]);

  return (
    <Group gap="xl" justify="center">
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          style={{
            fontSize: '6rem',
            fontWeight: 900,
            color: animatedStrikes[index] ? '#ff0000' : '#444',
            textShadow: animatedStrikes[index] 
              ? '0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.5)' 
              : 'none',
            transition: 'all 0.3s ease',
            animation: animatedStrikes[index] ? 'strikeFlash 0.5s ease' : 'none',
          }}
        >
          X
        </Box>
      ))}
      <style jsx>{`
        @keyframes strikeFlash {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>
    </Group>
  );
}
