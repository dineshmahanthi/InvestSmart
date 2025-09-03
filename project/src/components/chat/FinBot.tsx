import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, ChevronDown } from 'lucide-react';
import { fetchNewsData } from '../../services/newsService';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string | React.ReactNode;
  options?: string[];
}

const FinBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleInitialMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInitialMessage = () => {
    const initialMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: "Hi! I'm FinBot, your personal finance assistant. Would you like help setting your financial goals, learning about investment options, or seeing today's financial news?",
      options: ['Set Goals', 'Learn Investments', 'Financial News']
    };
    setMessages([initialMessage]);
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleOptionClick = async (option: string) => {
    // Add user's choice as a message
    addMessage({
      id: Date.now().toString(),
      type: 'user',
      content: option
    });

    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (option) {
      case 'Set Goals':
        addMessage({
          id: Date.now().toString(),
          type: 'bot',
          content: "What's your top financial priority right now?",
          options: [
            'Retirement Planning',
            'Emergency Fund',
            'Buying a House',
            'Children\'s Education'
          ]
        });
        break;

      case 'Learn Investments':
        addMessage({
          id: Date.now().toString(),
          type: 'bot',
          content: (
            <div className="space-y-4">
              <p>Here are the main investment options available:</p>
              <div className="space-y-2">
                <div className="font-medium">1. Mutual Funds</div>
                <p className="text-sm">
                  • Equity Funds: High growth potential, higher risk<br />
                  • Debt Funds: Stable returns, lower risk<br />
                  • Hybrid Funds: Balanced mix of both
                </p>
                <div className="font-medium">2. Stocks</div>
                <p className="text-sm">Direct investment in company shares. Higher risk but potential for better returns.</p>
                <div className="font-medium">3. Fixed Deposits</div>
                <p className="text-sm">Safe investment with guaranteed returns. Good for short-term goals.</p>
                <div className="font-medium">4. Government Bonds</div>
                <p className="text-sm">Very safe investment backed by government. Lower returns but zero risk.</p>
              </div>
              <p className="text-sm">Which would you like to learn more about?</p>
            </div>
          ),
          options: ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Government Bonds']
        });
        break;

      case 'Financial News':
        const news = await fetchNewsData();
        addMessage({
          id: Date.now().toString(),
          type: 'bot',
          content: (
            <div className="space-y-4">
              <p>Here are today's top financial headlines:</p>
              {news.slice(0, 3).map((item, index) => (
                <div key={index} className="text-sm">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {item.title}
                  </a>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          ),
          options: ['Set Goals', 'Learn Investments', 'More News']
        });
        break;

      default:
        if (option === 'Retirement Planning' || option === 'Emergency Fund' || 
            option === 'Buying a House' || option === "Children's Education") {
          addMessage({
            id: Date.now().toString(),
            type: 'bot',
            content: "How long do you plan to invest for this goal?",
            options: [
              'Short-term (0-2 years)',
              'Mid-term (2-5 years)',
              'Long-term (5+ years)'
            ]
          });
        } else if (option.includes('term')) {
          addMessage({
            id: Date.now().toString(),
            type: 'bot',
            content: "Based on your timeline, I can help you create a suitable investment strategy. Would you like to:",
            options: [
              'See investment recommendations',
              'Learn about risk management',
              'Calculate required savings'
            ]
          });
        } else if (option === 'Mutual Funds' || option === 'Stocks' || 
                   option === 'Fixed Deposits' || option === 'Government Bonds') {
          // Provide detailed information about specific investment types
          const explanations: Record<string, string> = {
            'Mutual Funds': `Mutual funds pool money from multiple investors to invest in stocks, bonds, and other securities. They offer:
              • Professional management
              • Diversification
              • Various risk levels
              • Starting from ₹500/month
              • Suitable for both beginners and experienced investors`,
            'Stocks': `Stocks represent ownership in companies. Key points:
              • Potential for high returns
              • Higher risk than mutual funds
              • Requires market knowledge
              • Need careful research
              • Best for long-term investment`,
            'Fixed Deposits': `Bank FDs are safe investments with:
              • Guaranteed returns
              • Fixed interest rates
              • Various tenure options
              • No market risk
              • Suitable for conservative investors`,
            'Government Bonds': `Government securities offer:
              • Highest safety
              • Regular interest payments
              • Tax benefits
              • Long-term stability
              • Lower returns than stocks`
          };

          addMessage({
            id: Date.now().toString(),
            type: 'bot',
            content: explanations[option],
            options: ['Learn about another option', 'Set investment goals', 'See latest news']
          });
        }
        break;
    }

    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    addMessage({
      id: Date.now().toString(),
      type: 'user',
      content: inputValue
    });

    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      addMessage({
        id: Date.now().toString(),
        type: 'bot',
        content: "I understand your question. Let me help you with that. Would you like to:",
        options: ['Set Goals', 'Learn Investments', 'Financial News']
      });
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <MessageSquare size={20} className="text-blue-600 mr-2" />
              <h3 className="font-semibold">FinBot</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left px-3 py-2 rounded bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinBot;