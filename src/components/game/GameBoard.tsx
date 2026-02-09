'use client';

import { Stack, Grid, Container, Title, Text, Box } from '@mantine/core';
import { TeamScore } from './TeamScore';
import { RoundPot } from './RoundPot';
import { AnswerPanel } from './AnswerPanel';
import { StrikeDisplay } from './StrikeDisplay';
import { VictoryOverlay } from './VictoryOverlay';
import { RoundWinnerOverlay } from './RoundWinnerOverlay';
import type { PublicGameState } from '@/types/game';

interface GameBoardProps {
  gameState: PublicGameState;
  onPlayVictory: () => void;
}

export function GameBoard({ gameState, onPlayVictory }: GameBoardProps) {
  // Show welcome screen if no game is active
  if (!gameState.currentQuestion) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="xl" align="center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
          <Title 
            order={1} 
            style={{ 
              fontSize: '5rem',
              color: '#ffd700',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
              textAlign: 'center',
            }}
          >
            CONTENTION
          </Title>
          <Text size="xl" c="dimmed" style={{ fontSize: '2rem', textAlign: 'center' }}>
            Waiting for game to start...
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="100%" fluid px="xl" py="md">
      <Stack gap="xl">
        {/* Top: Round Pot */}
        <Box style={{ display: 'flex', justifyContent: 'center' }}>
          <Box style={{ width: '100%', maxWidth: '600px' }}>
            <RoundPot points={gameState.roundPot} />
          </Box>
        </Box>

        {/* Middle: Main Game Area */}
        <Grid gutter="xl">
          {/* Left: Team 1 */}
          <Grid.Col span={3}>
            <TeamScore 
              team={gameState.teams[0]} 
              isActive={gameState.controllingTeamIndex === 0}
            />
          </Grid.Col>

          {/* Center: Answer Board */}
          <Grid.Col span={6}>
            <Stack gap="md">
              <Title 
                order={2} 
                style={{ 
                  textAlign: 'center',
                  fontSize: '2.5rem',
                  color: '#fff',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                }}
              >
                {gameState.currentQuestion.question}
              </Title>
              <AnswerPanel
                totalAnswers={gameState.currentQuestion.totalAnswers}
                revealedAnswers={gameState.revealedAnswers}
              />
            </Stack>
          </Grid.Col>

          {/* Right: Team 2 */}
          <Grid.Col span={3}>
            <TeamScore 
              team={gameState.teams[1]} 
              isActive={gameState.controllingTeamIndex === 1}
            />
          </Grid.Col>
        </Grid>

        {/* Bottom: Strikes */}
        <Box style={{ marginTop: '2rem' }}>
          <StrikeDisplay strikes={gameState.strikes} />
        </Box>
      </Stack>

      {/* Round Winner Overlay */}
      {gameState.phase.startsWith('awardPoints') && gameState.controllingTeamIndex !== null && (() => {
        const isStealSuccess = gameState.phase === 'awardPoints.stealSuccess';
        const roundWinnerIndex = isStealSuccess
          ? (gameState.controllingTeamIndex === 0 ? 1 : 0)
          : gameState.controllingTeamIndex;
        return (
          <RoundWinnerOverlay
            winningTeamName={gameState.teams[roundWinnerIndex].name}
            points={gameState.roundPot}
          />
        );
      })()}

      {/* Victory Overlay */}
      {gameState.phase === 'gameOver' && gameState.winner !== null && (
        <VictoryOverlay
          winningTeamName={gameState.teams[gameState.winner].name}
          onPlayVictory={onPlayVictory}
        />
      )}
    </Container>
  );
}
