import * as PDFJS from 'pdfjs-dist';
import { Question, QuestionType, DifficultyLevel, QuestionOption, MatchingPair, FillInBlankAnswer } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Initialize PDF.js worker
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function parsePdf(file: File): Promise<Omit<Question, 'id'>[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    
    const questions: Omit<Question, 'id'>[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => 'str' in item ? item.str : '')
        .join('\n');
      
      const pageQuestions = parseQuestionsFromText(pageText);
      questions.push(...pageQuestions);
    }
    
    return questions;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF. Please make sure it follows the required format.');
  }
}

function parseQuestionsFromText(text: string): Omit<Question, 'id'>[] {
  const questions: Omit<Question, 'id'>[] = [];
  const questionBlocks = text.split(/(?=Q\d+\.)/);

  for (const block of questionBlocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n').map(line => line.trim());
    const questionMatch = lines[0].match(/Q\d+\.\s+(?:\[([A-Z_]+)\])?\s*(.*)/);
    
    if (!questionMatch) continue;

    const questionType = questionMatch[1] || 'MULTIPLE_CHOICE';
    const questionText = questionMatch[2];

    let question: Partial<Question> = {
      text: questionText,
      type: questionType as QuestionType,
      difficultyLevel: extractDifficultyLevel(block),
      tags: extractTags(block)
    };

    switch (questionType) {
      case 'MULTIPLE_CHOICE':
        const mcQuestion = parseMultipleChoice(block);
        if (mcQuestion) question = { ...question, ...mcQuestion };
        break;

      case 'TRUE_FALSE':
        const tfQuestion = parseTrueFalse(block);
        if (tfQuestion) question = { ...question, ...tfQuestion };
        break;

      case 'FILL_IN_BLANK':
        const fibQuestion = parseFillInBlank(block);
        if (fibQuestion) question = { ...question, ...fibQuestion };
        break;

      case 'MATCHING':
        const matchingQuestion = parseMatching(block);
        if (matchingQuestion) question = { ...question, ...matchingQuestion };
        break;

      case 'SHORT_ANSWER':
        const saQuestion = parseShortAnswer(block);
        if (saQuestion) question = { ...question, ...saQuestion };
        break;
    }

    if (isValidQuestion(question)) {
      questions.push(question as Omit<Question, 'id'>);
    }
  }

  return questions;
}

function parseMultipleChoice(block: string): Partial<Question> | null {
  const options: QuestionOption[] = [];
  const optionsRegex = /([A-D])\.\s+(.*?)(?=(?:[A-D]\.)|(?:Answer:)|$)/gs;
  
  let optionMatch;
  while ((optionMatch = optionsRegex.exec(block)) !== null) {
    options.push({
      id: uuidv4(),
      text: optionMatch[2].trim()
    });
  }

  const answerMatch = block.match(/Answer:\s+([A-D])/);
  if (!answerMatch || options.length !== 4) return null;

  return {
    type: QuestionType.MULTIPLE_CHOICE,
    options,
    correctOptionIndex: answerMatch[1].charCodeAt(0) - 'A'.charCodeAt(0)
  };
}

function parseTrueFalse(block: string): Partial<Question> | null {
  const answerMatch = block.match(/Answer:\s+(True|False)/i);
  if (!answerMatch) return null;

  return {
    type: QuestionType.TRUE_FALSE,
    correctAnswer: answerMatch[1].toLowerCase() === 'true'
  };
}

function parseFillInBlank(block: string): Partial<Question> | null {
  const blanks: FillInBlankAnswer[] = [];
  const blankRegex = /\[___\]/g;
  const answerRegex = /Answer:\s*([^|]+)(?:\|Alternatives:\s*([^|]+))?/g;

  let answerMatch;
  while ((answerMatch = answerRegex.exec(block)) !== null) {
    blanks.push({
      id: uuidv4(),
      answer: answerMatch[1].trim(),
      alternatives: answerMatch[2]?.split(',').map(alt => alt.trim())
    });
  }

  if (blanks.length === 0) return null;

  return {
    type: QuestionType.FILL_IN_BLANK,
    blanks
  };
}

function parseMatching(block: string): Partial<Question> | null {
  const pairs: MatchingPair[] = [];
  const pairRegex = /(\d+)\.\s+([^|]+)\|\s*([^|]+)/g;

  let pairMatch;
  while ((pairMatch = pairRegex.exec(block)) !== null) {
    pairs.push({
      id: uuidv4(),
      premise: pairMatch[2].trim(),
      response: pairMatch[3].trim()
    });
  }

  if (pairs.length === 0) return null;

  return {
    type: QuestionType.MATCHING,
    matchingPairs: pairs
  };
}

function parseShortAnswer(block: string): Partial<Question> | null {
  const modelAnswerMatch = block.match(/Model Answer:\s*(.*?)(?=Keywords:|$)/s);
  const keywordsMatch = block.match(/Keywords:\s*(.*?)(?=\n|$)/);

  if (!modelAnswerMatch) return null;

  return {
    type: QuestionType.SHORT_ANSWER,
    modelAnswer: modelAnswerMatch[1].trim(),
    keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : undefined
  };
}

function extractDifficultyLevel(block: string): DifficultyLevel {
  const difficultyMatch = block.match(/Difficulty:\s*(EASY|MEDIUM|HARD)/);
  return difficultyMatch ? difficultyMatch[1] as DifficultyLevel : DifficultyLevel.MEDIUM;
}

function extractTags(block: string): string[] {
  const tagsMatch = block.match(/Tags:\s*(.*?)(?=\n|$)/);
  return tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];
}

function isValidQuestion(question: Partial<Question>): boolean {
  if (!question.text || !question.type) return false;

  switch (question.type) {
    case QuestionType.MULTIPLE_CHOICE:
      return !!question.options && question.options.length === 4 && 
             typeof question.correctOptionIndex === 'number';

    case QuestionType.TRUE_FALSE:
      return typeof question.correctAnswer === 'boolean';

    case QuestionType.FILL_IN_BLANK:
      return !!question.blanks && question.blanks.length > 0;

    case QuestionType.MATCHING:
      return !!question.matchingPairs && question.matchingPairs.length > 0;

    case QuestionType.SHORT_ANSWER:
      return !!question.modelAnswer;

    default:
      return false;
  }
}