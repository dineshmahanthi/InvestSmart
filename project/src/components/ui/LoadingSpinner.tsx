import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner = ({ size = 24, className = '' }: LoadingSpinnerProps) => {
  return (
    <div className="flex justify-center items-center min-h-[200px] w-full">
      <Loader2 
        size={size} 
        className={`animate-spin text-blue-600 ${className}`} 
      />
    </div>
  );
};

export default LoadingSpinner;