import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tabs } from '../components/ui/SimpleTabs';
import ExpenseTracker from '../components/expense/ExpenseTracker';
import ExpenseDashboard from '../components/expense/ExpenseDashboard';
import BudgetManager from '../components/expense/BudgetManager';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tracker');

  const tabOptions = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tracker', label: 'Track Expenses' },
    { id: 'budget', label: 'Budgets' },
  ];

  const renderContent = () => {
    if (!user) return <div>Please log in to access this feature.</div>;

    switch (activeTab) {
      case 'dashboard':
        return <ExpenseDashboard userId={user.id || ''} />;
      case 'tracker':
        return <ExpenseTracker userId={user.id || ''} />;
      case 'budget':
        return <BudgetManager userId={user.id || ''} />;
      default:
        return <ExpenseTracker userId={user.id || ''} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Expense Management
            </h1>
            <p className="text-xl mb-6 max-w-3xl">
              Track, analyze, and optimize your spending with our comprehensive expense tools.
            </p>
            {user && (
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-md">
                <span>Personalized for {user.name}</span>
              </div>
            )}
          </div>
        </section>
      
        <div className="container mx-auto px-4 py-8">
          <Tabs 
            options={tabOptions} 
            activeTab={activeTab} 
            onChange={setActiveTab}
          />
          
          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Expenses;