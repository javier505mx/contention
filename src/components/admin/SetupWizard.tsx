'use client';

import { useState, useMemo } from 'react';
import { 
  Container, 
  Title, 
  Stepper, 
  Button, 
  Group, 
  Checkbox, 
  TextInput, 
  NumberInput,
  Stack,
  Card,
  Text,
  Badge,
  Grid,
  MultiSelect,
} from '@mantine/core';
import type { Question } from '@/types/game';

interface SetupWizardProps {
  questions: Question[];
  questionTypes: string[];
  onComplete: (data: {
    selectedQuestionIds: string[];
    teamNames: [string, string];
    maxScore: number;
  }) => void;
}

export function SetupWizard({ questions, questionTypes, onComplete }: SetupWizardProps) {
  const [active, setActive] = useState(0);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>([]);

  const typeFilterOptions = useMemo(
    () => questionTypes.map((type) => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) })),
    [questionTypes]
  );

  const filteredQuestions = useMemo(
    () =>
      selectedTypeFilters.length === 0
        ? questions
        : questions.filter((q) => selectedTypeFilters.some((t) => q.types.includes(t))),
    [questions, selectedTypeFilters]
  );
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [maxScore, setMaxScore] = useState(200);

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleComplete = () => {
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least one question');
      return;
    }
    if (!team1Name || !team2Name) {
      alert('Please enter both team names');
      return;
    }
    
    onComplete({
      selectedQuestionIds,
      teamNames: [team1Name, team2Name],
      maxScore,
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Contention - Game Setup</Title>

      <Stepper active={active} onStepClick={setActive} mb="xl">
        <Stepper.Step label="Select Questions" description="Choose questions for the game">
          <Stack gap="md" mt="xl">
            <Title order={3}>Select Questions</Title>
            <Text c="dimmed">Choose the questions you want to use in this game</Text>

            <MultiSelect
              label="Filter by type"
              placeholder="All types"
              data={typeFilterOptions}
              value={selectedTypeFilters}
              onChange={setSelectedTypeFilters}
              clearable
              searchable
            />
            
            <Grid>
              {filteredQuestions.map((question) => (
                <Grid.Col key={question.id} span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Checkbox
                        checked={selectedQuestionIds.includes(question.id)}
                        onChange={() => handleQuestionToggle(question.id)}
                        label={<Text fw={500}>{question.question}</Text>}
                      />
                    </Group>
                    <Group gap="xs">
                      {question.types.map((type) => (
                        <Badge key={type} size="sm" variant="light">
                          {type}
                        </Badge>
                      ))}
                    </Group>
                    <Text size="sm" c="dimmed" mt="xs">
                      {question.responses.length} answers · {question.responses.reduce((sum, r) => sum + r.value, 0)} pts
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Team Names" description="Enter team names">
          <Stack gap="md" mt="xl">
            <Title order={3}>Enter Team Names</Title>
            <TextInput
              label="Team 1 Name"
              placeholder="Enter team 1 name"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.currentTarget.value)}
              size="lg"
            />
            <TextInput
              label="Team 2 Name"
              placeholder="Enter team 2 name"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.currentTarget.value)}
              size="lg"
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Max Score" description="Set winning score">
          <Stack gap="md" mt="xl">
            <Title order={3}>Set Maximum Score</Title>
            <Text c="dimmed">The first team to reach or exceed this score wins</Text>
            <NumberInput
              label="Maximum Score"
              value={maxScore}
              onChange={(value) => setMaxScore(Number(value) || 200)}
              min={100}
              max={500}
              step={50}
              size="lg"
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack gap="md" mt="xl">
            <Title order={3}>Ready to Start!</Title>
            <Text>
              <strong>Selected Questions:</strong> {selectedQuestionIds.length}
            </Text>
            <Text>
              <strong>Team 1:</strong> {team1Name}
            </Text>
            <Text>
              <strong>Team 2:</strong> {team2Name}
            </Text>
            <Text>
              <strong>Max Score:</strong> {maxScore}
            </Text>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={prevStep} disabled={active === 0}>
          Back
        </Button>
        {active < 3 ? (
          <Button 
            onClick={nextStep}
            disabled={
              (active === 0 && selectedQuestionIds.length === 0) ||
              (active === 1 && (!team1Name || !team2Name))
            }
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleComplete} size="lg" color="green">
            Start Game
          </Button>
        )}
      </Group>
    </Container>
  );
}
