import React from 'react';
import { Question } from '../../../types';

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
  selectedOption?: string;
  showCorrect?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  onAnswer,
  selectedOption,
  showCorrect
}: MultipleChoiceQuestionProps) {
  if (!question.options) {
    return <div className="text-red-500">Error: No options provided for multiple choice question</div>;
  }

  return (
    <div className="space-y-4">
      <div className="font-medium text-gray-900">{question.text}</div>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = showCorrect && option === question.correctAnswer;
          const isIncorrect = showCorrect && isSelected && option !== question.correctAnswer;

          return (
            <button
              key={index}
              onClick={() => onAnswer(option)}
              disabled={showCorrect}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                isCorrect
                  ? 'bg-green-50 border-green-500'
                  : isIncorrect
                  ? 'bg-red-50 border-red-500'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                } ${
                  isCorrect
                    ? 'border-green-500 bg-green-500'
                    : isIncorrect
                    ? 'border-red-500 bg-red-500'
                    : ''
                }`} />
                <span className={`${isSelected ? 'text-blue-700' : 'text-gray-700'} ${
                  isCorrect
                    ? 'text-green-700'
                    : isIncorrect
                    ? 'text-red-700'
                    : ''
                }`}>
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}