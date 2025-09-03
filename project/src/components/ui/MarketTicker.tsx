import { useEffect, useRef } from 'react';
import { useMarketData } from '../../hooks/useMarketData';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MarketTicker = () => {
  const { marketData, isLoading } = useMarketData();
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const animateTicker = () => {
      if (!ticker) return;
      const firstItem = ticker.querySelector('.ticker-item');
      if (!firstItem) return;

      const width = firstItem.clientWidth;
      ticker.style.transform = `translateX(-${width}px)`;
      ticker.style.transition = 'transform 15s linear';

      setTimeout(() => {
        if (!ticker) return;
        ticker.style.transform = 'translateX(0)';
        ticker.style.transition = 'none';
        
        // Move first item to the end
        const firstChild = ticker.firstElementChild;
        if (firstChild) {
          ticker.appendChild(firstChild);
        }
        
        // Immediately trigger next animation
        requestAnimationFrame(() => {
          requestAnimationFrame(animateTicker);
        });
      }, 15000);
    };

    animateTicker();
    
    return () => {
      if (ticker) {
        ticker.style.transition = 'none';
      }
    };
  }, [marketData]);

  if (isLoading || marketData.length === 0) {
    return (
      <div className="h-10 bg-gradient-to-r from-blue-600 to-green-600 text-white flex items-center overflow-hidden">
        <div className="animate-pulse flex space-x-10 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-32 bg-white/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Duplicate items to ensure continuous scrolling
  const tickerItems = [...marketData, ...marketData];

  return (
    <div className="h-10 bg-gradient-to-r from-blue-600 to-green-600 text-white flex items-center overflow-hidden">
      <div className="flex whitespace-nowrap" ref={tickerRef}>
        {tickerItems.map((item, index) => (
          <div 
            key={`${item.symbol}-${index}`} 
            className="ticker-item flex items-center px-6 text-sm font-medium"
          >
            <span className="font-bold mr-2">{item.name}:</span>
            <span>₹{item.price.toLocaleString('en-IN')}</span>
            
            <span 
              className={`ml-2 flex items-center ${
                item.changePercent >= 0 ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {item.changePercent >= 0 ? (
                <ArrowUpRight size={16} className="mr-1" />
              ) : (
                <ArrowDownRight size={16} className="mr-1" />
              )}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;