import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  generateTimeMachineSimulation,
  getSimulationPresets,
  SimulationPreset,
  TimeSimulation,
  formatIndianCurrency
} from '../../services/timeMachineService';
import { TrendingUp, TrendingDown, Calendar, Clock, IndianRupee, DollarSign, ChevronRight } from 'lucide-react';

const TimeMachineSimulator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [initialAmount, setInitialAmount] = useState<number>(100000);
  const [startDate, setStartDate] = useState<string>('');
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [presets, setPresets] = useState<SimulationPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [simulation, setSimulation] = useState<TimeSimulation | null>(null);
  const [error, setError] = useState<string>('');
  
  // Load presets on component mount
  useEffect(() => {
    const loadPresets = () => {
      const availablePresets = getSimulationPresets();
      setPresets(availablePresets);
      
      // Select the first preset by default
      if (availablePresets.length > 0) {
        selectPreset(availablePresets[0].id);
      }
    };
    
    loadPresets();
  }, []);
  
  // Handle preset selection
  const selectPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setStartDate(preset.startDate);
      setStockSymbols(preset.stockSymbols);
      setSimulation(null);
    }
  };
  
  // Generate the simulation
  const runSimulation = async () => {
    if (!startDate || stockSymbols.length === 0) {
      setError('Please select a time period and stocks to include.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await generateTimeMachineSimulation(
        initialAmount,
        startDate,
        stockSymbols
      );
      
      setSimulation(result);
    } catch (err) {
      setError('Failed to generate simulation. Please try again.');
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Investment Time Machine</h2>
        <p className="text-gray-600">
          See how much your money would be worth if you had invested in the past.
        </p>
      </div>
      
      <div className="bg-blue-50 p-5 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount (₹)
            </label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              min="1000"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time Period
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => selectPreset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}: {preset.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Calculating...
              </>
            ) : (
              'Calculate Returns'
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {simulation && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">
            If you had invested {formatIndianCurrency(simulation.initialAmount)}...
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
              <span className="text-gray-600 text-sm mb-1">From</span>
              <div className="flex items-center">
                <Calendar className="text-blue-600 mr-2" size={20} />
                <span className="font-medium">{format(new Date(simulation.startDate), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
              <span className="text-gray-600 text-sm mb-1">To</span>
              <div className="flex items-center">
                <Calendar className="text-blue-600 mr-2" size={20} />
                <span className="font-medium">{format(new Date(simulation.endDate), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
              <span className="text-gray-600 text-sm mb-1">Value Today</span>
              <div className="flex items-center">
                <IndianRupee className="text-green-600 mr-2" size={20} />
                <span className="font-bold text-xl text-green-600">
                  {formatIndianCurrency(simulation.potentialValue)}
                </span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
              <span className="text-gray-600 text-sm mb-1">Total Growth</span>
              <div className="flex items-center">
                {simulation.growthPercentage >= 0 ? (
                  <TrendingUp className="text-green-600 mr-2" size={20} />
                ) : (
                  <TrendingDown className="text-red-600 mr-2" size={20} />
                )}
                <span className={`font-bold text-xl ${
                  simulation.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {simulation.growthPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3">Performance Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Initial Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {simulation.breakdown.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatIndianCurrency(item.initialPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatIndianCurrency(item.finalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.growthPercentage >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.growthPercentage >= 0 ? '+' : ''}
                          {item.growthPercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatIndianCurrency(item.finalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-3">Key Insights</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ChevronRight size={18} className="text-blue-600 mr-2 mt-0.5" />
                <span>
                  Your investment would have grown by {formatIndianCurrency(simulation.potentialValue - simulation.initialAmount)}, 
                  a {simulation.growthPercentage.toFixed(2)}% return.
                </span>
              </li>
              
              <li className="flex items-start">
                <ChevronRight size={18} className="text-blue-600 mr-2 mt-0.5" />
                <span>
                  Best performer: <strong>{simulation.bestPerformer.name}</strong> with {simulation.bestPerformer.growthPercentage.toFixed(2)}% growth
                </span>
              </li>
              
              <li className="flex items-start">
                <ChevronRight size={18} className="text-blue-600 mr-2 mt-0.5" />
                <span>
                  {simulation.growthPercentage > 15 
                    ? "This demonstrates how long-term investing can yield significant returns."
                    : simulation.growthPercentage > 0
                    ? "While you made a profit, consider diversifying your portfolio for potentially better returns."
                    : "This period wasn't ideal for these investments. Markets are cyclical, which demonstrates the importance of long-term investing."}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeMachineSimulator;
