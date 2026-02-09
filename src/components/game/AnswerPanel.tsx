'use client';

import { Stack, Card, Group, Text, Box } from '@mantine/core';
import { useEffect, useState, useRef } from 'react';

interface Answer {
  index: number;
  answer: string;
  value: number;
}

interface AnswerPanelProps {
  totalAnswers: number;
  revealedAnswers: Answer[];
}

export function AnswerPanel({ totalAnswers, revealedAnswers }: AnswerPanelProps) {
  const [flippingIndex, setFlippingIndex] = useState<number | null>(null);
  const knownIndicesRef = useRef<Set<number>>(new Set(revealedAnswers.map(a => a.index)));

  useEffect(() => {
    // Find any answer index that we haven't seen before
    const currentIndices = new Set(revealedAnswers.map(a => a.index));
    let newIndex: number | null = null;

    for (const idx of currentIndices) {
      if (!knownIndicesRef.current.has(idx)) {
        newIndex = idx;
      }
    }

    // Update our known set to match current state (handles both additions and resets)
    knownIndicesRef.current = currentIndices;

    // Only animate if there's a genuinely new answer
    if (newIndex !== null) {
      setFlippingIndex(newIndex);

      const timer = setTimeout(() => {
        setFlippingIndex(null);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [revealedAnswers]);

  const isRevealed = (index: number) => {
    return revealedAnswers.some(a => a.index === index);
  };

  const getAnswer = (index: number) => {
    return revealedAnswers.find(a => a.index === index);
  };

  return (
    <Stack gap="sm">
      {Array.from({ length: totalAnswers }, (_, i) => {
        const revealed = isRevealed(i);
        const answer = getAnswer(i);
        const isFlipping = flippingIndex === i;

        return (
          <Card
            key={i}
            shadow="lg"
            padding="lg"
            radius="md"
            style={{
              minHeight: '80px',
              backgroundColor: revealed ? '#228be6' : 'rgba(0, 0, 0, 0.5)',
              border: revealed ? '3px solid #ffd700' : '3px solid #555',
              transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'all 0.6s ease',
              transformStyle: 'preserve-3d',
            }}
          >
            {revealed && answer ? (
              <Group justify="space-between" align="center">
                <Group gap="md">
                  <Box
                    style={{
                      backgroundColor: '#ffd700',
                      color: '#000',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 900,
                      fontSize: '1.5rem',
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Text
                    size="xl"
                    fw={700}
                    style={{
                      color: '#fff',
                      fontSize: '1.8rem',
                    }}
                  >
                    {answer.answer}
                  </Text>
                </Group>
                <Box
                  style={{
                    backgroundColor: '#ffd700',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '2rem',
                  }}
                >
                  {answer.value}
                </Box>
              </Group>
            ) : (
              <Group justify="center" align="center" style={{ minHeight: '52px' }}>
                <Text
                  size="xl"
                  fw={900}
                  style={{
                    color: '#666',
                    fontSize: '2rem',
                    letterSpacing: '8px',
                  }}
                >
                  {i + 1}
                </Text>
              </Group>
            )}
          </Card>
        );
      })}
    </Stack>
  );
}
