import { AdviceQuestion, AdviceResponse } from '../types';

// Mock database for advice (would be replaced with actual API calls in production)
let mockQuestions: AdviceQuestion[] = [];
let mockResponses: AdviceResponse[] = [];

/**
 * Generate a unique ID
 */
function generateId(type: 'question' | 'response'): string {
  return `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Get recent questions (with optional filters)
 */
export async function getRecentQuestions(
  limit: number = 10, 
  category?: string, 
  onlyUnanswered: boolean = false
): Promise<AdviceQuestion[]> {
  let questions = [...mockQuestions];
  
  // Apply filters
  if (category) {
    questions = questions.filter(q => q.category === category);
  }
  
  if (onlyUnanswered) {
    const questionIds = new Set(mockResponses.map(r => r.questionId));
    questions = questions.filter(q => !questionIds.has(q.id));
  }
  
  // Sort by creation date (newest first)
  questions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Limit results
  return questions.slice(0, limit);
}

/**
 * Get questions asked by a specific user
 */
export async function getUserQuestions(userId: string): Promise<AdviceQuestion[]> {
  return mockQuestions
    .filter(q => q.userId === userId)
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Ask a new question
 */
export async function askQuestion(
  userId: string,
  question: string,
  context?: string,
  category: AdviceQuestion['category'] = 'other',
  options?: string[],
  isAnonymous: boolean = false
): Promise<AdviceQuestion> {
  const newQuestion: AdviceQuestion = {
    id: generateId('question'),
    userId,
    question,
    context,
    category,
    options,
    createdAt: new Date().toISOString(),
    isResolved: false,
    isAnonymous
  };
  
  mockQuestions.push(newQuestion);
  return newQuestion;
}

/**
 * Get a specific question by ID
 */
export async function getQuestionById(questionId: string): Promise<AdviceQuestion | null> {
  return mockQuestions.find(q => q.id === questionId) || null;
}

/**
 * Mark a question as resolved
 */
export async function resolveQuestion(questionId: string): Promise<boolean> {
  const question = mockQuestions.find(q => q.id === questionId);
  
  if (!question) {
    return false;
  }
  
  question.isResolved = true;
  return true;
}

/**
 * Delete a question (and all its responses)
 */
export async function deleteQuestion(questionId: string): Promise<boolean> {
  const index = mockQuestions.findIndex(q => q.id === questionId);
  
  if (index === -1) {
    return false;
  }
  
  // Remove the question
  mockQuestions.splice(index, 1);
  
  // Remove all responses to this question
  mockResponses = mockResponses.filter(r => r.questionId !== questionId);
  
  return true;
}

/**
 * Get responses for a question
 */
export async function getResponsesForQuestion(questionId: string): Promise<AdviceResponse[]> {
  return mockResponses
    .filter(r => r.questionId === questionId)
    .sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

/**
 * Add a response to a question
 */
export async function addResponse(
  questionId: string,
  userId: string,
  response: string,
  isAnonymous: boolean = false,
  optionSelected?: number
): Promise<AdviceResponse | null> {
  // Check if question exists
  const question = mockQuestions.find(q => q.id === questionId);
  
  if (!question) {
    return null;
  }
  
  // Create new response
  const newResponse: AdviceResponse = {
    id: generateId('response'),
    questionId,
    userId,
    response,
    isAnonymous,
    likes: 0,
    createdAt: new Date().toISOString(),
    optionSelected
  };
  
  mockResponses.push(newResponse);
  return newResponse;
}

/**
 * Like a response
 */
export async function likeResponse(responseId: string): Promise<AdviceResponse | null> {
  const response = mockResponses.find(r => r.id === responseId);
  
  if (!response) {
    return null;
  }
  
  response.likes++;
  return response;
}

/**
 * Get user's responses
 */
export async function getUserResponses(userId: string): Promise<AdviceResponse[]> {
  return mockResponses
    .filter(r => r.userId === userId)
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Check if a response is appropriate (no offensive language, etc.)
 * In a real app, this would use content moderation APIs
 */
export function isResponseAppropriate(text: string): boolean {
  // Simple check for offensive terms (would be much more sophisticated in a real app)
  const offensiveTerms = ['offensive', 'inappropriate', 'vulgar'];
  
  return !offensiveTerms.some(term => 
    text.toLowerCase().includes(term)
  );
}

// Initialize sample data for development
export function initializeDevAdviceData(userId: string): void {
  const now = new Date();
  
  mockQuestions = [
    {
      id: 'question-1',
      userId,
      question: 'Should I buy a bike or save money for an emergency fund?',
      context: 'I have ₹25,000 saved up. I need transportation but also want to be financially responsible.',
      category: 'planning',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isResolved: false,
      isAnonymous: false
    },
    {
      id: 'question-2',
      userId: 'other-user',
      question: 'Is it better to invest in stocks or mutual funds for a beginner?',
      category: 'investing',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isResolved: false,
      isAnonymous: true
    },
    {
      id: 'question-3',
      userId: 'other-user-2',
      question: 'Should I pay off my education loan first or start investing?',
      context: 'I have an education loan with 7% interest and can spare ₹15,000 per month.',
      category: 'debt',
      options: [
        'Pay off loan completely first', 
        'Invest all and pay minimum on loan', 
        'Split 50/50 between loan and investing'
      ],
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isResolved: false,
      isAnonymous: false
    }
  ];
  
  mockResponses = [
    {
      id: 'response-1',
      questionId: 'question-1',
      userId: 'other-user',
      response: 'Emergency fund should be your priority. Consider a used bike or public transport until you have 3 months of expenses saved.',
      isAnonymous: false,
      likes: 4,
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'response-2',
      questionId: 'question-1',
      userId: 'other-user-2',
      response: 'If the bike will help you earn more money (like getting to work), it might be worth the investment.',
      isAnonymous: true,
      likes: 2,
      createdAt: new Date(now.getTime() - 5.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'response-3',
      questionId: 'question-3',
      userId,
      response: 'Generally, if your loan interest rate is higher than what you could earn investing (after taxes), pay the loan first.',
      isAnonymous: false,
      likes: 7,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'response-4',
      questionId: 'question-3',
      userId: 'other-user',
      response: 'I prefer the balanced approach - put 70% toward the loan and 30% into index funds.',
      isAnonymous: true,
      likes: 3,
      createdAt: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
      optionSelected: 2
    }
  ];
}