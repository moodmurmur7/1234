import { QuestionRenderer } from '../components/questions/QuestionRenderer';

export default function TestPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Question {currentQuestionIndex + 1} of {questions.current.length}
        </h2>
        
        {activeTest.settings.freeNavigation && questions.current.length > 1 && (
          <div className="flex space-x-1">
            {questions.current.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentQuestionIndex === index
                    ? 'bg-indigo-600 text-white'
                    : selectedAnswers[questions.current[index]?.id] !== undefined
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <p className="text-gray-800 text-lg">{currentQuestion.text}</p>
      </div>

      <QuestionRenderer
        question={currentQuestion}
        onAnswer={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
        selectedAnswer={selectedAnswers[currentQuestion.id]}
      />
    </div>
  );
}

export { TestPage }