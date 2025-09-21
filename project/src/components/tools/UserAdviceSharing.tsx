import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ThumbsUp, Clock, User, MessageCircle, HelpCircle,
  Shield, Users, ChevronDown, ChevronUp, Send, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getRecentQuestions, getUserQuestions, askQuestion, resolveQuestion,
  getResponsesForQuestion, addResponse, likeResponse, isResponseAppropriate,
  initializeDevAdviceData
} from '../../services/adviceService';
import { AdviceQuestion, AdviceResponse } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';

// Category colors and icons for questions
const categoryConfig = {
  saving: { 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <Shield className="h-4 w-4" />
  },
  spending: { 
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: <Clock className="h-4 w-4" />
  },
  investing: { 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: <ThumbsUp className="h-4 w-4" />
  },
  budgeting: { 
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: <User className="h-4 w-4" />
  },
  debt: { 
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: <Shield className="h-4 w-4" />
  },
  planning: { 
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    icon: <Clock className="h-4 w-4" />
  },
  other: { 
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: <HelpCircle className="h-4 w-4" />
  },
};

const UserAdviceSharing: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AdviceQuestion[]>([]);
  const [userQuestions, setUserQuestions] = useState<AdviceQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<AdviceQuestion | null>(null);
  const [responses, setResponses] = useState<AdviceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'community' | 'myQuestions'>('community');
  const [filter, setFilter] = useState<string>('');
  
  // State for new question form
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    context: '',
    category: 'other',
    isAnonymous: false,
    isPoll: false,
    options: ['', '']
  });
  
  // State for new response
  const [newResponse, setNewResponse] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnonymousResponse, setIsAnonymousResponse] = useState(false);
  
  // Initialize and load data
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Initialize dev data for demo purposes
          initializeDevAdviceData(user.id || 'user123');
          
          const recentQuestions = await getRecentQuestions(15);
          setQuestions(recentQuestions);
          
          const myQuestions = await getUserQuestions(user.id || 'user123');
          setUserQuestions(myQuestions);
        } catch (error) {
          console.error('Error loading questions:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user]);
  
  // Load responses when a question is selected
  useEffect(() => {
    const loadResponses = async () => {
      if (selectedQuestion) {
        try {
          const questionResponses = await getResponsesForQuestion(selectedQuestion.id);
          setResponses(questionResponses);
        } catch (error) {
          console.error('Error loading responses:', error);
        }
      } else {
        setResponses([]);
      }
    };
    
    loadResponses();
  }, [selectedQuestion]);
  
  // Handle question selection
  const handleSelectQuestion = async (question: AdviceQuestion) => {
    setSelectedQuestion(question);
  };
  
  // Filter questions by category
  const handleFilterChange = (category: string) => {
    setFilter(category === filter ? '' : category);
  };
  
  // Handle input change for new question form
  const handleQuestionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value
    });
  };
  
  // Handle checkbox change for poll options
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: checked
    });
  };
  
  // Handle changes to poll options
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };
  
  // Add new poll option
  const addOption = () => {
    if (newQuestion.options.length < 5) {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, '']
      });
    }
  };
  
  // Remove poll option
  const removeOption = (index: number) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = [...newQuestion.options];
      updatedOptions.splice(index, 1);
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions
      });
    }
  };
  
  // Submit new question
  const handleSubmitQuestion = async () => {
    if (!newQuestion.question.trim()) {
      alert('Please enter a question.');
      return;
    }
    
    if (newQuestion.isPoll && newQuestion.options.some(option => !option.trim())) {
      alert('All poll options must have a value.');
      return;
    }
    
    try {
      const options = newQuestion.isPoll ? newQuestion.options : undefined;
      
      const createdQuestion = await askQuestion(
        user?.id || 'user123',
        newQuestion.question,
        newQuestion.context || undefined,
        newQuestion.category as any,
        options,
        newQuestion.isAnonymous
      );
      
      // Add to both question lists
      setQuestions([createdQuestion, ...questions]);
      setUserQuestions([createdQuestion, ...userQuestions]);
      
      // Reset form and close it
      setNewQuestion({
        question: '',
        context: '',
        category: 'other',
        isAnonymous: false,
        isPoll: false,
        options: ['', '']
      });
      setIsAskingQuestion(false);
      
      // Select the new question
      setSelectedQuestion(createdQuestion);
      setCurrentTab('myQuestions');
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };
  
  // Submit response to question
  const handleSubmitResponse = async () => {
    if (!selectedQuestion) return;
    
    if (!newResponse.trim()) {
      alert('Please enter a response.');
      return;
    }
    
    if (!isResponseAppropriate(newResponse)) {
      alert('Your response contains inappropriate language. Please revise it.');
      return;
    }
    
    try {
      const response = await addResponse(
        selectedQuestion.id,
        user?.id || 'user123',
        newResponse,
        isAnonymousResponse,
        selectedOption
      );
      
      if (response) {
        // Add to responses list
        setResponses([...responses, response]);
        
        // Reset form
        setNewResponse('');
        setSelectedOption(null);
        setIsAnonymousResponse(false);
      }
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };
  
  // Handle like on response
  const handleLikeResponse = async (responseId: string) => {
    try {
      const updated = await likeResponse(responseId);
      if (updated) {
        // Update in responses list
        setResponses(responses.map(r => r.id === responseId ? updated : r));
      }
    } catch (error) {
      console.error('Error liking response:', error);
    }
  };
  
  // Mark question as resolved
  const handleResolveQuestion = async (questionId: string) => {
    try {
      const success = await resolveQuestion(questionId);
      if (success && selectedQuestion) {
        // Update in questions lists
        const updatedQuestion = { ...selectedQuestion, isResolved: true };
        setSelectedQuestion(updatedQuestion);
        
        setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
        setUserQuestions(userQuestions.map(q => q.id === questionId ? updatedQuestion : q));
      }
    } catch (error) {
      console.error('Error resolving question:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get filtered questions based on current tab and filter
  const getFilteredQuestions = () => {
    const currentQuestions = currentTab === 'community' ? questions : userQuestions;
    
    if (!filter) {
      return currentQuestions;
    }
    
    return currentQuestions.filter(q => q.category === filter);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left sidebar - Questions list */}
        <div className="w-full md:w-1/3 border-r border-gray-200 p-4">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Financial Advice</h2>
              <button
                onClick={() => setIsAskingQuestion(true)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Ask Question
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex mb-4 border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium ${
                  currentTab === 'community'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setCurrentTab('community')}
              >
                Community
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  currentTab === 'myQuestions'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setCurrentTab('myQuestions')}
              >
                My Questions
              </button>
            </div>
            
            {/* Category filters */}
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.keys(categoryConfig).map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    filter === category
                      ? `bg-blue-600 text-white`
                      : `${categoryConfig[category as keyof typeof categoryConfig].color}`
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Questions list */}
            <div className="flex-grow overflow-y-auto">
              {getFilteredQuestions().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {currentTab === 'myQuestions' ? "You haven't asked any questions yet." : "No questions found."}
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredQuestions().map(question => (
                    <div
                      key={question.id}
                      onClick={() => handleSelectQuestion(question)}
                      className={`cursor-pointer p-3 rounded-md ${
                        selectedQuestion?.id === question.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'border border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${categoryConfig[question.category as keyof typeof categoryConfig].color}`}>
                          {categoryConfig[question.category as keyof typeof categoryConfig].icon}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-sm">{question.question}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{formatDate(question.createdAt)}</span>
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {responses.length} {responses.length === 1 ? 'response' : 'responses'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content - Question detail and responses */}
        <div className="w-full md:w-2/3 p-4">
          {selectedQuestion ? (
            <div className="flex flex-col h-full">
              {/* Question detail */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex gap-2 items-center mb-3">
                  <div className={`px-2 py-1 rounded-md text-xs ${categoryConfig[selectedQuestion.category as keyof typeof categoryConfig].color}`}>
                    {selectedQuestion.category.charAt(0).toUpperCase() + selectedQuestion.category.slice(1)}
                  </div>
                  
                  {selectedQuestion.isResolved && (
                    <div className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                      Resolved
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold mb-2">{selectedQuestion.question}</h2>
                
                {selectedQuestion.context && (
                  <p className="text-gray-600 mb-4">{selectedQuestion.context}</p>
                )}
                
                {selectedQuestion.options && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-md">
                    <h4 className="text-blue-800 font-medium mb-2">Poll Options:</h4>
                    <div className="space-y-2">
                      {selectedQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="pollOption"
                            id={`option-${index}`}
                            checked={selectedOption === index}
                            onChange={() => setSelectedOption(index)}
                            className="mr-2"
                            disabled={
                              responses.some(r => 
                                r.userId === (user?.id || 'user123') && 
                                r.questionId === selectedQuestion.id
                              )
                            }
                          />
                          <label htmlFor={`option-${index}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(selectedQuestion.createdAt)}
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {selectedQuestion.isAnonymous ? 'Anonymous' : selectedQuestion.userId === (user?.id || 'user123') ? 'You' : 'User'}
                  </div>
                </div>
                
                {selectedQuestion.userId === (user?.id || 'user123') && !selectedQuestion.isResolved && (
                  <button
                    onClick={() => handleResolveQuestion(selectedQuestion.id)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
              
              {/* Responses */}
              <div className="flex-grow overflow-y-auto mb-4">
                <h3 className="text-lg font-medium mb-3">
                  Responses ({responses.length})
                </h3>
                
                {responses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No responses yet. Be the first to respond!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {responses.map(response => (
                      <div key={response.id} className="bg-gray-50 rounded-md p-4">
                        <p className="mb-3">{response.response}</p>
                        
                        {selectedQuestion.options && response.optionSelected !== undefined && (
                          <div className="mb-3 bg-blue-50 p-2 rounded-md text-sm">
                            <p className="text-blue-800">
                              Selected option: <strong>{selectedQuestion.options[response.optionSelected]}</strong>
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-500">
                            <span>{formatDate(response.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {response.isAnonymous
                                ? 'Anonymous'
                                : response.userId === (user?.id || 'user123')
                                ? 'You'
                                : 'User'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleLikeResponse(response.id)}
                            className="flex items-center text-gray-500 hover:text-blue-600"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {response.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add response form */}
              {!selectedQuestion.isResolved && (
                <div className="mt-auto border-t border-gray-200 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-grow">
                      <textarea
                        value={newResponse}
                        onChange={e => setNewResponse(e.target.value)}
                        placeholder="Type your response..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      ></textarea>
                      
                      <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={isAnonymousResponse}
                            onChange={e => setIsAnonymousResponse(e.target.checked)}
                            className="mr-2"
                          />
                          Respond anonymously
                        </label>
                        
                        <button
                          onClick={handleSubmitResponse}
                          disabled={!newResponse.trim()}
                          className={`px-4 py-2 rounded-md ${
                            !newResponse.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Select a question to view responses
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Choose a question from the list or ask your own to get advice from the community.
              </p>
              <button
                onClick={() => setIsAskingQuestion(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Ask a Question
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* New question dialog */}
      {isAskingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold">Ask a Financial Question</h2>
              <button
                onClick={() => setIsAskingQuestion(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question*
                  </label>
                  <input
                    type="text"
                    name="question"
                    value={newQuestion.question}
                    onChange={handleQuestionInputChange}
                    placeholder="e.g., Should I buy a bike or save money for an emergency fund?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    name="context"
                    value={newQuestion.context}
                    onChange={handleQuestionInputChange}
                    placeholder="Provide more details to get better advice..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={newQuestion.category}
                    onChange={handleQuestionInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="saving">Saving</option>
                    <option value="spending">Spending</option>
                    <option value="investing">Investing</option>
                    <option value="budgeting">Budgeting</option>
                    <option value="debt">Debt</option>
                    <option value="planning">Planning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAnonymous"
                      name="isAnonymous"
                      checked={newQuestion.isAnonymous}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                      Ask anonymously
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPoll"
                      name="isPoll"
                      checked={newQuestion.isPoll}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <label htmlFor="isPoll" className="text-sm text-gray-700">
                      Create a poll
                    </label>
                  </div>
                </div>
                
                {/* Poll options */}
                {newQuestion.isPoll && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium mb-3">Poll Options</h4>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={e => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                        />
                        {index > 1 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {newQuestion.options.length < 5 && (
                      <button
                        onClick={addOption}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsAskingQuestion(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdviceSharing;