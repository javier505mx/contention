'use client';

import { Box, Title, Stack } from '@mantine/core';
import { useEffect } from 'react';

interface VictoryOverlayProps {
  winningTeamName: string;
  onPlayVictory: () => void;
}

export function VictoryOverlay({ winningTeamName, onPlayVictory }: VictoryOverlayProps) {
  useEffect(() => {
    // Play victory sound when component mounts
    onPlayVictory();
  }, [onPlayVictory]);

  // Array of party emojis for confetti effect
  const emojis = ['🎉', '🎊', '🏆', '⭐', '✨', '🎈', '🎆', '💫', '🌟', '🎁'];
  
  // Create multiple instances of emojis for the animation
  const emojiElements = Array.from({ length: 50 }, (_, i) => ({
    emoji: emojis[i % emojis.length],
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
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
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.5s ease',
        }}
      >
        <Stack gap="xl" align="center">
          <Title
            order={1}
            style={{
              fontSize: '4rem',
              color: '#ffd700',
              textShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.5)',
              textAlign: 'center',
              animation: 'victoryPulse 2s ease-in-out infinite',
            }}
          >
            VICTORY!
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
              fontSize: '5rem',
              animation: 'trophySpin 3s ease-in-out infinite',
            }}
          >
            🏆
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
              fontSize: '3rem',
              animation: `fall ${item.duration}s linear ${item.delay}s infinite, spin ${item.duration * 0.5}s linear infinite`,
            }}
          >
            {item.emoji}
          </Box>
        ))}
      </Box>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes victoryPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes trophySpin {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        @keyframes fall {
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

        @keyframes spin {
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
