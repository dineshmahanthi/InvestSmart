import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LineChart, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Types for our financial journal entries
interface JournalEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  stockSymbol?: string;
  entryType: 'buy' | 'sell' | 'hold' | 'research';
  reasoning: string[];
  emotions: string[];
  outcome?: 'success' | 'failure' | 'neutral';
  outcomeNotes?: string;
  reviewDate?: string;
}

// Sample reasons for investment decisions
const reasonOptions = [
  'Technical analysis',
  'Fundamental analysis',
  'News catalyst',
  'Earnings report',
  'Dividend announcement',
  'Industry trend',
  'Macro-economic factors',
  'Company valuation',
  'Product launch',
  'Management change',
  'Analyst recommendation',
  'Sector rotation',
  'Chart pattern',
];

// Sample emotions that might influence decisions
const emotionOptions = [
  'Confident',
  'Uncertain',
  'Excited',
  'Fearful',
  'FOMO (Fear of Missing Out)',
  'Greedy',
  'Cautious',
  'Optimistic',
  'Pessimistic',
  'Impatient',
  'Regretful',
  'Neutral',
];

// Mock data for initial entries
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2025-09-01',
    title: 'Purchased INFY shares',
    description: 'Bought 10 shares of Infosys at ₹1,850 per share',
    stockSymbol: 'INFY',
    entryType: 'buy',
    reasoning: ['Technical analysis', 'Sector rotation', 'Analyst recommendation'],
    emotions: ['Confident', 'Optimistic'],
    outcome: 'success',
    outcomeNotes: 'Stock rose 5% within a week due to positive Q2 outlook',
    reviewDate: '2025-09-08',
  },
  {
    id: '2',
    date: '2025-08-15',
    title: 'Held RELIANCE through earnings',
    description: 'Decided to maintain position in Reliance despite market volatility',
    stockSymbol: 'RELIANCE',
    entryType: 'hold',
    reasoning: ['Fundamental analysis', 'Company valuation', 'Earnings report'],
    emotions: ['Uncertain', 'Cautious'],
    outcome: 'neutral',
    outcomeNotes: 'Stock traded sideways after earnings. No significant gain or loss.',
    reviewDate: '2025-08-22',
  },
  {
    id: '3',
    date: '2025-07-20',
    title: 'Sold HDFCBANK position',
    description: 'Sold 15 shares of HDFC Bank at ₹1,720 per share',
    stockSymbol: 'HDFCBANK',
    entryType: 'sell',
    reasoning: ['Technical analysis', 'Macro-economic factors'],
    emotions: ['Fearful', 'Uncertain'],
    outcome: 'failure',
    outcomeNotes: 'Stock rallied 10% in the following month. Sold too early.',
    reviewDate: '2025-08-20',
  }
];

const FinancialJournal: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<JournalEntry, 'id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    description: '',
    stockSymbol: '',
    entryType: 'buy',
    reasoning: [],
    emotions: [],
  });
  
  // Load entries on component mount
  useEffect(() => {
    // In a real app, you'd fetch from an API
    // For now, use mock data
    setEntries(mockEntries);
  }, []);
  
  // Reset form to default values
  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      title: '',
      description: '',
      stockSymbol: '',
      entryType: 'buy',
      reasoning: [],
      emotions: [],
    });
    setEditingEntry(null);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEntry) {
      // Update existing entry
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id ? { ...formData, id: entry.id } : entry
      ));
    } else {
      // Add new entry
      const newEntry: JournalEntry = {
        ...formData,
        id: Date.now().toString(),
      };
      setEntries([newEntry, ...entries]);
    }
    
    resetForm();
    setShowForm(false);
  };
  
  // Handle editing an entry
  const handleEdit = (entry: JournalEntry) => {
    setFormData({
      date: entry.date,
      title: entry.title,
      description: entry.description,
      stockSymbol: entry.stockSymbol || '',
      entryType: entry.entryType,
      reasoning: entry.reasoning,
      emotions: entry.emotions,
      outcome: entry.outcome,
      outcomeNotes: entry.outcomeNotes,
      reviewDate: entry.reviewDate,
    });
    setEditingEntry(entry);
    setShowForm(true);
  };
  
  // Handle deleting an entry
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };
  
  // Toggle a reasoning item
  const toggleReasoning = (reason: string) => {
    if (formData.reasoning.includes(reason)) {
      setFormData({
        ...formData,
        reasoning: formData.reasoning.filter(r => r !== reason)
      });
    } else {
      setFormData({
        ...formData,
        reasoning: [...formData.reasoning, reason]
      });
    }
  };
  
  // Toggle an emotion item
  const toggleEmotion = (emotion: string) => {
    if (formData.emotions.includes(emotion)) {
      setFormData({
        ...formData,
        emotions: formData.emotions.filter(e => e !== emotion)
      });
    } else {
      setFormData({
        ...formData,
        emotions: [...formData.emotions, emotion]
      });
    }
  };
  
  // Update outcome for an entry
  const updateOutcome = (id: string, outcome: 'success' | 'failure' | 'neutral') => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { 
            ...entry, 
            outcome, 
            reviewDate: format(new Date(), 'yyyy-MM-dd')
          } 
        : entry
    ));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Financial Decision Journal</h2>
          <p className="text-gray-600">
            Track your investment decisions, reasoning, and outcomes to improve over time.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          New Entry
        </button>
      </div>
      
      {/* Entry Form */}
      {showForm && (
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-4">
            {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decision Type
                </label>
                <select
                  value={formData.entryType}
                  onChange={(e) => setFormData({ ...formData, entryType: e.target.value as any })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                  <option value="hold">Hold</option>
                  <option value="research">Research</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., Bought INFY shares"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Symbol (optional)
                </label>
                <input
                  type="text"
                  value={formData.stockSymbol}
                  onChange={(e) => setFormData({ ...formData, stockSymbol: e.target.value })}
                  placeholder="E.g., INFY, RELIANCE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your decision in detail..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reasoning Behind Decision
                </label>
                <div className="flex flex-wrap gap-2">
                  {reasonOptions.map((reason) => (
                    <label
                      key={reason}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        formData.reasoning.includes(reason)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.reasoning.includes(reason)}
                        onChange={() => toggleReasoning(reason)}
                        className="sr-only"
                      />
                      {reason}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emotions During Decision
                </label>
                <div className="flex flex-wrap gap-2">
                  {emotionOptions.map((emotion) => (
                    <label
                      key={emotion}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        formData.emotions.includes(emotion)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.emotions.includes(emotion)}
                        onChange={() => toggleEmotion(emotion)}
                        className="sr-only"
                      />
                      {emotion}
                    </label>
                  ))}
                </div>
              </div>
              
              {editingEntry && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outcome
                    </label>
                    <select
                      value={formData.outcome || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        outcome: e.target.value ? e.target.value as any : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Not Reviewed Yet</option>
                      <option value="success">Success</option>
                      <option value="neutral">Neutral</option>
                      <option value="failure">Failure</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review Date
                    </label>
                    <input
                      type="date"
                      value={formData.reviewDate || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        reviewDate: e.target.value || undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outcome Notes
                    </label>
                    <textarea
                      value={formData.outcomeNotes || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        outcomeNotes: e.target.value || undefined
                      })}
                      placeholder="What happened? What did you learn?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Journal Entries */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <LineChart className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-xl font-medium text-gray-700 mb-1">No journal entries yet</h3>
            <p className="text-gray-500">
              Start recording your investment decisions to track your progress.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between mb-4">
                <div className="flex items-start">
                  {/* Entry type badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium mr-3 ${
                    entry.entryType === 'buy' 
                      ? 'bg-green-100 text-green-800'
                      : entry.entryType === 'sell'
                      ? 'bg-red-100 text-red-800'
                      : entry.entryType === 'hold'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {entry.entryType.charAt(0).toUpperCase() + entry.entryType.slice(1)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{entry.title}</h3>
                    <div className="text-sm text-gray-500 flex items-center">
                      <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                      {entry.stockSymbol && (
                        <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          {entry.stockSymbol}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit entry"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete entry"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{entry.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Reasoning</h4>
                  <div className="flex flex-wrap gap-1">
                    {entry.reasoning.map((reason) => (
                      <span 
                        key={reason} 
                        className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Emotional State</h4>
                  <div className="flex flex-wrap gap-1">
                    {entry.emotions.map((emotion) => (
                      <span 
                        key={emotion} 
                        className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Outcome section */}
              {entry.outcome ? (
                <div className={`mt-4 p-4 rounded-md ${
                  entry.outcome === 'success'
                    ? 'bg-green-50 border border-green-100'
                    : entry.outcome === 'failure'
                    ? 'bg-red-50 border border-red-100'
                    : 'bg-yellow-50 border border-yellow-100'
                }`}>
                  <div className="flex items-start mb-2">
                    {entry.outcome === 'success' ? (
                      <CheckCircle2 className="text-green-600 mr-2 mt-0.5" size={18} />
                    ) : entry.outcome === 'failure' ? (
                      <XCircle className="text-red-600 mr-2 mt-0.5" size={18} />
                    ) : (
                      <AlertCircle className="text-yellow-600 mr-2 mt-0.5" size={18} />
                    )}
                    <div>
                      <h4 className={`font-medium ${
                        entry.outcome === 'success'
                          ? 'text-green-800'
                          : entry.outcome === 'failure'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {entry.outcome === 'success'
                          ? 'Successful Decision'
                          : entry.outcome === 'failure'
                          ? 'Unsuccessful Decision'
                          : 'Neutral Outcome'}
                      </h4>
                      <p className="text-sm">
                        Reviewed on {format(new Date(entry.reviewDate!), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  {entry.outcomeNotes && (
                    <p className={`text-sm ${
                      entry.outcome === 'success'
                        ? 'text-green-700'
                        : entry.outcome === 'failure'
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}>
                      {entry.outcomeNotes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Record Outcome</h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateOutcome(entry.id, 'success')}
                      className="flex items-center bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md text-sm transition-colors"
                    >
                      <TrendingUp size={16} className="mr-1" />
                      Success
                    </button>
                    <button
                      onClick={() => updateOutcome(entry.id, 'neutral')}
                      className="flex items-center bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-md text-sm transition-colors"
                    >
                      <AlertCircle size={16} className="mr-1" />
                      Neutral
                    </button>
                    <button
                      onClick={() => updateOutcome(entry.id, 'failure')}
                      className="flex items-center bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-sm transition-colors"
                    >
                      <TrendingDown size={16} className="mr-1" />
                      Failure
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {entries.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md text-blue-800">
          <h3 className="font-medium mb-2">Journaling Tips</h3>
          <ul className="text-sm space-y-1">
            <li>• Record your decisions as you make them, not after seeing the results</li>
            <li>• Be honest about your emotional state when making decisions</li>
            <li>• Review entries regularly to identify patterns in successful decisions</li>
            <li>• Use failures as learning opportunities, not discouragement</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FinancialJournal;
