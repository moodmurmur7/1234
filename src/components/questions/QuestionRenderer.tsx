import React from 'react';
import { Question } from '../../types';
import { MultipleChoiceQuestion } from './QuestionTypes/MultipleChoiceQuestion';
import { TrueFalseQuestion } from './QuestionTypes/TrueFalseQuestion';
import { FillInBlankQuestion } from './QuestionTypes/FillInBlankQuestion';
import { MatchingQuestion } from './QuestionTypes/MatchingQuestion';
import { ShortAnswerQuestion } from './QuestionTypes/ShortAnswerQuestion';
import { MathRenderer } from '../MathRenderer';

interface QuestionRendererProps {
  question: Question;
  onAnswer: (answer: any) => void;
  selectedAnswer?: any;
  showCorrect?: boolean;
}

export function QuestionRenderer({ 
  question, 
  onAnswer, 
  selectedAnswer, 
  showCorrect 
}: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      {question.latex && (
        <MathRenderer latex={question.latex} block />
      )}
      
      {question.imagePath && (
        <img 
          src={question.imagePath} 
          alt="Question illustration" 
          className="max-w-full rounded-lg border border-gray-200"
        />
      )}

      {question.type === 'MULTIPLE_CHOICE' && (
        <MultipleChoiceQuestion
          question={question}
          onAnswer={onAnswer}
          selectedOption={selectedAnswer}
          showCorrect={showCorrect}
        />
      )}

      {question.type === 'TRUE_FALSE' && (
        <TrueFalseQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          showCorrect={showCorrect}
        />
      )}

      {question.type === 'FILL_IN_BLANK' && (
        <FillInBlankQuestion
          question={question}
          onAnswer={onAnswer}
          answers={selectedAnswer}
          showCorrect={showCorrect}
        />
      )}

      {question.type === 'MATCHING' && (
        <MatchingQuestion
          question={question}
          onAnswer={onAnswer}
          selectedMatches={selectedAnswer}
          showCorrect={showCorrect}
        />
      )}

      {question.type === 'SHORT_ANSWER' && (
        <ShortAnswerQuestion
          question={question}
          onAnswer={onAnswer}
          answer={selectedAnswer}
          showCorrect={showCorrect}
        />
      )}

      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {question.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}