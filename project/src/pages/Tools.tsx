import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import TimeMachineSimulator from '../components/tools/TimeMachineSimulator';
import FinancialJournal from '../components/tools/FinancialJournal';
import FinancialHabitTracker from '../components/tools/FinancialHabitTracker';
import UserAdviceSharing from '../components/tools/UserAdviceSharing';
import { Calculator, LineChart, History, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Placeholder for future features we'll implement
const PlaceholderFeature = ({ title, description, icon }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 h-full">
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm">
        This feature is coming soon! Stay tuned for updates.
      </div>
    </div>
  );
};

const Tools = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Advanced Investment Tools
            </h1>
            <p className="text-xl mb-6 max-w-3xl">
              Powerful tools to help you make smarter investment decisions and achieve your financial goals.
            </p>
            {user && (
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-md">
                <span>Personalized for {user.name}</span>
              </div>
            )}
          </div>
        </section>

        {/* Tools Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="time-machine" className="w-full">
              <div className="mb-8">
                <TabsList className="flex justify-center space-x-2 p-1 bg-blue-50 rounded-lg mb-2 overflow-x-auto">
                  <TabsTrigger value="time-machine" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                    <History className="mr-2 h-4 w-4" />
                    Time Machine
                  </TabsTrigger>
                  <TabsTrigger value="financial-journal" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                    <LineChart className="mr-2 h-4 w-4" />
                    Financial Journal
                  </TabsTrigger>
                  <TabsTrigger value="habit-tracker" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Habit Tracker
                  </TabsTrigger>
                  <TabsTrigger value="advice-sharing" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Community Advice
                  </TabsTrigger>
                  <TabsTrigger value="emotional-temp" className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                    <Calculator className="mr-2 h-4 w-4" />
                    Emotional Temperature
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="time-machine" className="mt-4">
                <TimeMachineSimulator />
              </TabsContent>
              
              <TabsContent value="financial-journal" className="mt-4">
                <FinancialJournal />
              </TabsContent>
              
              <TabsContent value="habit-tracker" className="mt-4">
                <FinancialHabitTracker />
              </TabsContent>
              
              <TabsContent value="advice-sharing" className="mt-4">
                <UserAdviceSharing />
              </TabsContent>
              
              <TabsContent value="emotional-temp" className="mt-4">
                <PlaceholderFeature
                  title="Emotional Temperature Check"
                  description="Assess your emotional state before making investment decisions to avoid common behavioral pitfalls."
                  icon={<Calculator size={40} className="text-blue-600" />}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Educational Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">How These Tools Help You Invest Better</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Our advanced investment tools are designed to help you make data-driven decisions
                while managing the psychological aspects of investing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4">
                  <History size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Learn From the Past</h3>
                <p className="text-gray-600">
                  Use the Time Machine to understand how different investment timing strategies
                  would have performed. Gain insights from historical data to improve future decisions.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-green-600 mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Build Financial Habits</h3>
                <p className="text-gray-600">
                  Track your financial habits daily and build consistency with our habit tracker.
                  Small consistent actions lead to significant financial improvements over time.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-purple-600 mb-4">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Community Wisdom</h3>
                <p className="text-gray-600">
                  Get advice from other users on financial questions and dilemmas. Share your experiences
                  and help others make better financial decisions through collaborative insights.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4">
                  <LineChart size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Track Your Growth</h3>
                <p className="text-gray-600">
                  Journal your investment decisions and review their outcomes over time. Identify patterns
                  in your successful investments and learn from mistakes.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4">
                  <Calculator size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Control Emotions</h3>
                <p className="text-gray-600">
                  Emotional decisions often lead to investment mistakes. Our tools help you recognize
                  when emotions might be clouding your judgment, promoting rational decision-making.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tools;
