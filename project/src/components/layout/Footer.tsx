import { TrendingUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-blue-500" />
            <span className="font-bold text-xl">InvestSmart</span>
          </div>
          <p className="text-gray-400 mb-8 max-w-2xl">
            AI-powered investment recommendations tailored for Indian investors.
          </p>
          
          <hr className="w-full border-gray-800 mb-8" />
          
          <div className="text-gray-500 text-sm">
            <p className="mb-4">
              Disclaimer: The information provided on this website is for general informational purposes only and does not constitute financial advice. Investment markets fluctuate and your capital may be at risk. Past performance is not indicative of future results. Please consult with a qualified financial advisor before making any investment decisions.
            </p>
            <p>
              © {currentYear} InvestSmart. All rights reserved. SEBI Registration No: XXXXXXXXXX
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;