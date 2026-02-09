import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { Question } from '@/types/game';

export async function loadQuestions(): Promise<Question[]> {
  const questionsDir = path.join(process.cwd(), 'questions');
  
  try {
    const files = await fs.readdir(questionsDir);
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    
    const questions: Question[] = [];
    
    for (const file of yamlFiles) {
      const filePath = path.join(questionsDir, file);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const data = yaml.load(fileContents) as any;
      
      // Create a unique ID from the filename
      const id = file.replace(/\.(yaml|yml)$/, '');
      
      // Validate the question structure
      if (!data.question || !Array.isArray(data.responses)) {
        console.warn(`Invalid question format in ${file}, skipping...`);
        continue;
      }
      
      const question: Question = {
        id,
        question: data.question,
        types: Array.isArray(data.types) ? data.types : [],
        responses: data.responses.map((r: any) => ({
          answer: r.answer,
          value: r.value,
        })),
      };
      
      questions.push(question);
    }
    
    console.log(`Loaded ${questions.length} questions from ${questionsDir}`);
    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}
