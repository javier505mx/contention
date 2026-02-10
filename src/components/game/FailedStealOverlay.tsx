'use client';

import { Box, Title } from '@mantine/core';

export function FailedStealOverlay() {
  return (
    <>
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.90)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'stealFailFadeIn 0.2s ease',
        }}
      >
        <Title
          order={1}
          style={{
            fontSize: '25rem',
            fontWeight: 900,
            color: '#ff0000',
            textShadow:
              '0 0 60px rgba(255, 0, 0, 0.9), 0 0 120px rgba(255, 0, 0, 0.6), 0 0 200px rgba(255, 0, 0, 0.3)',
            animation: 'stealFailSlam 0.4s ease-out',
            lineHeight: 1,
          }}
        >
          X
        </Title>
      </Box>

      <style>{`
        @keyframes stealFailFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes stealFailSlam {
          0% {
            transform: scale(3);
            opacity: 0;
          }
          50% {
            transform: scale(0.9);
            opacity: 1;
          }
          75% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
