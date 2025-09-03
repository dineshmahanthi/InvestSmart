import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import LoadingSpinner from './components/ui/LoadingSpinner';
import FinBot from './components/chat/FinBot';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Strategies = lazy(() => import('./pages/Strategies'));
const News = lazy(() => import('./pages/News'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/news" element={<News />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FinBot />
      </Router>
    </QueryClientProvider>
  );
}

export default App;