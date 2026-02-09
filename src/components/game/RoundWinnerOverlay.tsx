'use client';

import { Box, Title, Stack, Text } from '@mantine/core';

interface RoundWinnerOverlayProps {
  winningTeamName: string;
  points: number;
}

export function RoundWinnerOverlay({ winningTeamName, points }: RoundWinnerOverlayProps) {
  // Smaller confetti burst for round wins
  const emojis = ['🎉', '⭐', '✨', '💫', '🌟', '🔥'];

  const emojiElements = Array.from({ length: 30 }, (_, i) => ({
    emoji: emojis[i % emojis.length],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 1.5,
  }));

  return (
    <>
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.80)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'roundWinFadeIn 0.4s ease',
        }}
      >
        <Stack gap="lg" align="center">
          <Title
            order={1}
            style={{
              fontSize: '3.5rem',
              color: '#4fc3f7',
              textShadow:
                '0 0 30px rgba(79, 195, 247, 0.8), 0 0 60px rgba(79, 195, 247, 0.4)',
              textAlign: 'center',
              animation: 'roundWinPulse 2s ease-in-out infinite',
            }}
          >
            ROUND WON!
          </Title>
          <Title
            order={2}
            style={{
              fontSize: '3rem',
              color: '#fff',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
            }}
          >
            {winningTeamName}
          </Title>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              animation: 'roundWinScoreReveal 0.6s ease 0.3s both',
            }}
          >
            <Text
              style={{
                fontSize: '4rem',
                fontWeight: 900,
                color: '#ffd700',
                textShadow:
                  '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
                textAlign: 'center',
              }}
            >
              +{points}
            </Text>
            <Text
              style={{
                fontSize: '2rem',
                color: '#ffd700',
                textShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
              }}
            >
              points
            </Text>
          </Box>
        </Stack>

        {/* Animated emoji confetti */}
        {emojiElements.map((item, index) => (
          <Box
            key={index}
            style={{
              position: 'absolute',
              left: `${item.left}%`,
              top: '-10%',
              fontSize: '2.5rem',
              animation: `roundWinFall ${item.duration}s linear ${item.delay}s infinite, roundWinSpin ${item.duration * 0.5}s linear infinite`,
            }}
          >
            {item.emoji}
          </Box>
        ))}
      </Box>

      <style jsx>{`
        @keyframes roundWinFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes roundWinPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes roundWinScoreReveal {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes roundWinFall {
          0% {
            top: -10%;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }

        @keyframes roundWinSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
