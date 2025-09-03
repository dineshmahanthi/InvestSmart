import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { fetchNewsData } from '../services/newsService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const News = () => {
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNewsData,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Financial News & Updates</h1>
            <p className="text-xl opacity-90">
              Stay informed with the latest financial news, market updates, and investment insights
            </p>
          </div>
        </section>

        {/* News Grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsData?.map((news) => (
              <article key={news.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {news.imageUrl && (
                  <img 
                    src={news.imageUrl} 
                    alt={news.title} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">{news.category}</span>
                    <span className="text-sm text-gray-500">{news.date}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-3">{news.title}</h2>
                  <p className="text-gray-600 mb-4">{news.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{news.source}</span>
                    {news.url && (
                      <a 
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700"
                      >
                        Read more <ArrowRight size={16} className="ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default News;