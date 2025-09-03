import { useState } from 'react';
import { TrendingUp, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '../services/marketService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

type RiskLevel = 'low' | 'normal' | 'high';

interface FormData {
  monthlyIncome: number;
  monthlyExpenses: number;
  riskTolerance: RiskLevel;
  quizAnswers: number[];
}

interface SIPFormData {
  monthlyInvestment: number;
  expectedReturn: number;
  timePeriod: number;
}

interface Recommendation {
  name: string;
  allocation: number;
  description: string;
  color: string;
  info: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
}

const riskAssessmentQuiz: QuizQuestion[] = [
  {
    question: "How would you react if your investment lost 20% of its value in a month?",
    options: [
      "Sell immediately to prevent further losses",
      "Sell a portion to reduce risk",
      "Hold and wait for recovery",
      "Buy more at lower prices"
    ]
  },
  {
    question: "What's your primary investment goal?",
    options: [
      "Preserve capital with minimal risk",
      "Generate steady income",
      "Balance growth with stability",
      "Maximize long-term growth"
    ]
  },
  {
    question: "How long can you keep your money invested without needing it?",
    options: [
      "Less than 1 year",
      "1-3 years",
      "3-5 years",
      "More than 5 years"
    ]
  },
  {
    question: "Which investment portfolio would you be most comfortable with?",
    options: [
      "100% safe, low-return investments",
      "70% safe, 30% higher-risk investments",
      "50% safe, 50% higher-risk investments",
      "30% safe, 70% higher-risk investments"
    ]
  },
  {
    question: "How much financial knowledge do you have?",
    options: [
      "Very limited",
      "Basic understanding",
      "Good understanding",
      "Advanced knowledge"
    ]
  }
];

const Calculator = () => {
  const [activeCalculator, setActiveCalculator] = useState<'investment' | 'sip'>('investment');
  const [showQuiz, setShowQuiz] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    riskTolerance: 'normal',
    quizAnswers: [],
  });
  const [sipFormData, setSipFormData] = useState<SIPFormData>({
    monthlyInvestment: 5000,
    expectedReturn: 12,
    timePeriod: 10,
  });
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const calculateRiskProfile = (answers: number[]): RiskLevel => {
    const score = answers.reduce((sum, answer) => sum + answer, 0);
    const average = score / answers.length;
    
    if (average <= 2) return 'low';
    if (average <= 3) return 'normal';
    return 'high';
  };

  const handleQuizSubmit = () => {
    if (formData.quizAnswers.length !== riskAssessmentQuiz.length) {
      setError('Please answer all questions');
      return;
    }
    
    const riskProfile = calculateRiskProfile(formData.quizAnswers);
    setFormData(prev => ({ ...prev, riskTolerance: riskProfile }));
    setShowQuiz(false);
    setError(null);
  };

  const handleQuizAnswer = (questionIndex: number, answerValue: number) => {
    const newAnswers = [...formData.quizAnswers];
    newAnswers[questionIndex] = answerValue;
    setFormData(prev => ({ ...prev, quizAnswers: newAnswers }));
  };

  const generateRecommendations = (risk: RiskLevel, investableAmount: number): Recommendation[] => {
    switch (risk) {
      case 'low':
        return [
          {
            name: 'Ultra-Safe Investments',
            allocation: 0.75,
            description: 'High-grade bonds and fixed deposits for maximum security',
            color: 'bg-blue-100 border-blue-500 text-blue-700',
            info: 'These include government bonds, AAA-rated corporate bonds, and bank fixed deposits. They offer stable returns with minimal risk, suitable for conservative investors.',
          },
          {
            name: 'Liquid Savings',
            allocation: 0.15,
            description: 'Emergency fund and short-term needs',
            color: 'bg-green-100 border-green-500 text-green-700',
            info: 'Liquid funds and savings accounts that provide immediate access to your money while earning modest returns. Essential for emergency expenses.',
          },
          {
            name: 'Conservative Equity',
            allocation: 0.10,
            description: 'Large-cap blue-chip stocks and conservative equity funds',
            color: 'bg-purple-100 border-purple-500 text-purple-700',
            info: 'Investment in established, stable companies with strong track records. These provide potential for growth while maintaining relatively lower risk.',
          },
        ];
      case 'normal':
        return [
          {
            name: 'Balanced Portfolio',
            allocation: 0.45,
            description: 'Mix of bonds and safe mutual funds',
            color: 'bg-blue-100 border-blue-500 text-blue-700',
            info: 'A diversified mix of debt and equity instruments that balances risk and returns. Includes government securities, corporate bonds, and balanced mutual funds.',
          },
          {
            name: 'Large-Cap Equity',
            allocation: 0.25,
            description: 'Stable large-cap stocks and index funds',
            color: 'bg-green-100 border-green-500 text-green-700',
            info: 'Investment in top 100 companies by market capitalization. These companies are market leaders with proven business models and stable returns.',
          },
          {
            name: 'Moderate Risk Funds',
            allocation: 0.30,
            description: 'Balanced mutual funds with moderate risk profile',
            color: 'bg-purple-100 border-purple-500 text-purple-700',
            info: 'Multi-cap funds that invest across market capitalizations. These offer higher growth potential while maintaining moderate risk through diversification.',
          },
        ];
      case 'high':
        return [
          {
            name: 'Growth Equity',
            allocation: 0.65,
            description: 'Mix of large-cap, mid-cap, and thematic funds',
            color: 'bg-blue-100 border-blue-500 text-blue-700',
            info: 'Aggressive equity portfolio focusing on high-growth sectors and companies. Includes mid-cap and small-cap stocks with high growth potential.',
          },
          {
            name: 'High-Yield Instruments',
            allocation: 0.15,
            description: 'High-yield bonds and credit opportunities',
            color: 'bg-green-100 border-green-500 text-green-700',
            info: 'Higher-yielding debt instruments including corporate bonds and credit opportunity funds. These offer better returns but come with higher credit risk.',
          },
          {
            name: 'Aggressive Growth',
            allocation: 0.20,
            description: 'Sector ETFs and small-cap growth funds',
            color: 'bg-purple-100 border-purple-500 text-purple-700',
            info: 'Focused investments in specific sectors or themes with high growth potential. Includes sector ETFs, small-cap funds, and international funds.',
          },
        ];
    }
  };

  const calculateSIP = () => {
    const { monthlyInvestment, expectedReturn, timePeriod } = sipFormData;
    const monthlyRate = expectedReturn / (12 * 100);
    const months = timePeriod * 12;
    
    const amount = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const totalInvestment = monthlyInvestment * months;
    const wealthGained = amount - totalInvestment;
    
    return {
      totalAmount: amount,
      totalInvestment,
      wealthGained,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.monthlyExpenses > formData.monthlyIncome) {
      setError('Expenses cannot exceed income');
      setRecommendations(null);
      return;
    }

    const investableAmount = (formData.monthlyIncome - formData.monthlyExpenses) * 0.3;
    const recommendations = generateRecommendations(formData.riskTolerance, investableAmount);
    setRecommendations(recommendations);
  };

  const handleReset = () => {
    setFormData({
      monthlyIncome: 0,
      monthlyExpenses: 0,
      riskTolerance: 'normal',
      quizAnswers: [],
    });
    setSipFormData({
      monthlyInvestment: 5000,
      expectedReturn: 12,
      timePeriod: 10,
    });
    setRecommendations(null);
    setError(null);
    setShowQuiz(true);
  };

  const isFormValid = formData.monthlyIncome > 0 && formData.monthlyExpenses >= 0;
  const sipResults = calculateSIP();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setActiveCalculator('investment');
                setShowQuiz(true);
              }}
              className={`flex-1 py-2 px-4 rounded-md ${
                activeCalculator === 'investment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Investment Recommendations
            </button>
            <button
              onClick={() => setActiveCalculator('sip')}
              className={`flex-1 py-2 px-4 rounded-md ${
                activeCalculator === 'sip'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              SIP Calculator
            </button>
          </div>

          {activeCalculator === 'investment' ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Investment Calculator</h1>
              <p className="text-gray-600 mb-8">
                Get personalized investment recommendations based on your financial profile
              </p>

              {showQuiz ? (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold">Risk Assessment Quiz</h2>
                  <p className="text-gray-600">
                    Please answer these questions to help us understand your investment preferences better.
                  </p>

                  {riskAssessmentQuiz.map((q, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                      <p className="font-medium">{q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => handleQuizAnswer(qIndex, oIndex + 1)}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                              formData.quizAnswers[qIndex] === oIndex + 1
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                      <AlertCircle size={20} className="mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleQuizSubmit}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => {
                        setShowQuiz(false);
                        setFormData(prev => ({ ...prev, quizAnswers: [] }));
                      }}
                      className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Skip Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                  <div>
                    <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      id="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Expenses (₹)
                    </label>
                    <input
                      type="number"
                      id="monthlyExpenses"
                      value={formData.monthlyExpenses}
                      onChange={(e) => setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Tolerance
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['low', 'normal', 'high'] as const).map((risk) => (
                        <button
                          key={risk}
                          type="button"
                          onClick={() => setFormData({ ...formData, riskTolerance: risk })}
                          className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                            formData.riskTolerance === risk
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {risk.charAt(0).toUpperCase() + risk.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                      <AlertCircle size={20} className="mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={!isFormValid}
                      className={`flex-1 py-2 px-4 rounded-md text-white ${
                        isFormValid
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Get Recommendations
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}

              {recommendations && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Your Investment Plan</h2>
                  
                  <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <h3 className="font-medium text-blue-800 mb-2">Monthly Financial Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Income:</span>
                        <span className="font-medium">{formatIndianCurrency(formData.monthlyIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expenses:</span>
                        <span className="font-medium">{formatIndianCurrency(formData.monthlyExpenses)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Recommended Monthly Investment:</span>
                        <span className="font-bold text-green-600">
                          {formatIndianCurrency((formData.monthlyIncome - formData.monthlyExpenses) * 0.3)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${rec.color} relative`}
                        onMouseEnter={() => setShowTooltip(rec.name)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{rec.name}</h3>
                            <Info
                              size={16}
                              className="text-gray-500 cursor-help"
                            />
                          </div>
                          <span className="font-bold">
                            {(rec.allocation * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-sm">{rec.description}</p>
                        <p className="text-sm font-medium mt-2">
                          Monthly allocation: {formatIndianCurrency((formData.monthlyIncome - formData.monthlyExpenses) * 0.3 * rec.allocation)}
                        </p>
                        {showTooltip === rec.name && (
                          <div className="absolute z-10 w-72 p-3 bg-white border rounded-md shadow-lg -right-80 top-0">
                            <p className="text-sm text-gray-600">{rec.info}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">SIP Calculator</h1>
              <p className="text-gray-600 mb-8">
                Calculate your wealth through Systematic Investment Plan (SIP)
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Investment (₹)
                  </label>
                  <input
                    type="number"
                    value={sipFormData.monthlyInvestment}
                    onChange={(e) => setSipFormData({ ...sipFormData, monthlyInvestment: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Annual Return (%)
                  </label>
                  <input
                    type="number"
                    value={sipFormData.expectedReturn}
                    onChange={(e) => setSipFormData({ ...sipFormData, expectedReturn: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Period (Years)
                  </label>
                  <input
                    type="number"
                    value={sipFormData.timePeriod}
                    onChange={(e) => setSipFormData({ ...sipFormData, timePeriod: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="40"
                  />
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Investment Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Investment:</span>
                      <span className="font-medium">{formatIndianCurrency(sipResults.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wealth Gained:</span>
                      <span className="font-medium text-green-600">{formatIndianCurrency(sipResults.wealthGained)}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span className="font-medium">Total Value:</span>
                      <span className="font-bold text-blue-600">{formatIndianCurrency(sipResults.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Calculator;