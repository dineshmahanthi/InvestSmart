import { Portfolio, Investment, RiskTolerance, UserProfile } from '../types';

// Generate portfolio recommendations based on risk tolerance
export function generatePortfolioRecommendations(user: UserProfile): Portfolio {
  const { riskTolerance, investableAmount } = user;
  let investments: Investment[] = [];
  let expectedReturns = '';

  switch (riskTolerance) {
    case 'low':
      investments = [
        {
          name: 'SBI Magnum Income Fund',
          allocation: 0.4,
          amount: investableAmount * 0.4,
          category: 'Debt Mutual Funds',
          returns: '7-9%',
        },
        {
          name: 'HDFC FMP',
          allocation: 0.3,
          amount: investableAmount * 0.3,
          category: 'Fixed Maturity Plans',
          returns: '6-8%',
        },
        {
          name: 'Axis Bluechip Fund',
          allocation: 0.2,
          amount: investableAmount * 0.2,
          category: 'Large Cap Equity',
          returns: '10-12%',
        },
        {
          name: 'Gold ETF',
          allocation: 0.1,
          amount: investableAmount * 0.1,
          category: 'Gold',
          returns: '8-10%',
        },
      ];
      expectedReturns = '7-9%';
      break;
    
    case 'medium':
      investments = [
        {
          name: 'Mirae Asset Emerging Bluechip',
          allocation: 0.35,
          amount: investableAmount * 0.35,
          category: 'Mid-Cap Growth Funds',
          returns: '12-15%',
        },
        {
          name: 'ICICI Prudential Bluechip',
          allocation: 0.25,
          amount: investableAmount * 0.25,
          category: 'Large Cap Equity',
          returns: '10-12%',
        },
        {
          name: 'Reliance Industries',
          allocation: 0.15,
          amount: investableAmount * 0.15,
          category: 'Blue Chip Stocks',
          returns: '15-18%',
        },
        {
          name: 'HDFC Hybrid',
          allocation: 0.15,
          amount: investableAmount * 0.15,
          category: 'Hybrid Equity Funds',
          returns: '9-11%',
        },
        {
          name: 'ELSS Tax Saver Funds',
          allocation: 0.1,
          amount: investableAmount * 0.1,
          category: 'Tax Saving',
          returns: '12-14%',
        },
      ];
      expectedReturns = '12-14%';
      break;
    
    case 'high':
      investments = [
        {
          name: 'Parag Parikh Flexi Cap Fund',
          allocation: 0.3,
          amount: investableAmount * 0.3,
          category: 'Flexi Cap Funds',
          returns: '15-18%',
        },
        {
          name: 'TCS',
          allocation: 0.2,
          amount: investableAmount * 0.2,
          category: 'IT Stocks',
          returns: '18-22%',
        },
        {
          name: 'Infosys',
          allocation: 0.15,
          amount: investableAmount * 0.15,
          category: 'Technology Stocks',
          returns: '16-20%',
        },
        {
          name: 'Small Cap Funds',
          allocation: 0.15,
          amount: investableAmount * 0.15,
          category: 'Small Cap',
          returns: '18-25%',
        },
        {
          name: 'LIC IPO',
          allocation: 0.1,
          amount: investableAmount * 0.1,
          category: 'IPO Opportunities',
          returns: '20-30%',
        },
        {
          name: 'Nifty 50 Index Fund',
          allocation: 0.1,
          amount: investableAmount * 0.1,
          category: 'Index Funds',
          returns: '12-15%',
        },
      ];
      expectedReturns = '15-20%';
      break;
  }

  return {
    investments,
    totalAmount: investableAmount,
    expectedReturns,
  };
}

// Calculate financial metrics
export function calculateFinancialMetrics(formData: {
  salary: number;
  additionalIncome?: number;
  fixedExpenses: number;
  variableExpenses: number;
}) {
  const { salary, additionalIncome = 0, fixedExpenses, variableExpenses } = formData;
  
  const totalIncome = salary + additionalIncome;
  const monthlySurplus = totalIncome - fixedExpenses - variableExpenses;
  const emergencyFund = (fixedExpenses + variableExpenses) * 6;
  const investableAmount = Math.max(0, monthlySurplus * 0.3);
  
  return {
    monthlySurplus,
    emergencyFund,
    investableAmount,
  };
}