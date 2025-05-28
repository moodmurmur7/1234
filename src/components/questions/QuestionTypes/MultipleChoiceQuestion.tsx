import React from 'react';
import { Question } from '../../../types';
import { MathRenderer } from '../../MathRenderer';

interface MultipleChoiceQuestionProps {
  question: Question;
  onAnswer: (optionIndex: number) => void;
  selectedOption?: number;
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
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = selectedOption === index;
        const isCorrect = showCorrect && index === question.correctOptionIndex;
        const isIncorrect = showCorrect && isSelected && index !== question.correctOptionIndex;

        return (
          <button
            key={option.id}
            onClick={() => onAnswer(index)}
            disabled={showCorrect}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              isSelected
                ? 'border-indigo-500 bg-indigo-50'
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
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-gray-300'
              } ${
                isCorrect
                  ? 'border-green-500 bg-green-500'
                  : isIncorrect
                  ? 'border-red-500 bg-red-500'
                  : ''
              }`} />
              <div className="flex items-center">
                <span className={`${
                  isSelected ? 'text-indigo-700' : 'text-gray-700'
                } ${
                  isCorrect
                    ? 'text-green-700'
                    : isIncorrect
                    ? 'text-red-700'
                    : ''
                }`}>
                  {option.text}
                </span>
                {option.latex && (
                  <MathRenderer latex={option.latex} className="ml-2" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}