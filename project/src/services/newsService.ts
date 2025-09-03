import { NewsItem } from '../types';

// Mock news data
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Nifty, Sensex Hit Record Highs as FII Inflows Surge',
    description: 'Indian benchmark indices reached new all-time highs, driven by strong foreign institutional investor inflows and positive global cues.',
    date: '2025-04-08',
    category: 'Markets',
    imageUrl: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg',
    source: 'Economic Times',
    url: 'https://economictimes.indiatimes.com/markets/stocks/news/',
  },
  {
    id: '2',
    title: 'RBI Introduces New Guidelines for Digital Lending',
    description: 'The Reserve Bank of India has issued fresh guidelines for digital lending platforms, focusing on consumer protection and data security.',
    date: '2025-04-07',
    category: 'Policy',
    imageUrl: 'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg',
    source: 'Mint',
    url: 'https://www.livemint.com/news/',
  },
  {
    id: '3',
    title: 'Major Tech Companies Report Strong Q4 Earnings',
    description: 'Leading Indian IT companies surpass market expectations with robust Q4 results, signaling continued growth in the technology sector.',
    date: '2025-04-06',
    category: 'Earnings',
    imageUrl: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg',
    source: 'Business Standard',
    url: 'https://www.business-standard.com/companies',
  },
  {
    id: '4',
    title: 'Government Announces New Tax Benefits for Mutual Fund Investors',
    description: 'Finance Ministry introduces additional tax incentives for long-term mutual fund investments to promote retail participation.',
    date: '2025-04-05',
    category: 'Policy',
    imageUrl: 'https://images.pexels.com/photos/53621/calculator-calculation-insurance-finance-53621.jpeg',
    source: 'Financial Express',
    url: 'https://www.financialexpress.com/market/',
  },
  {
    id: '5',
    title: 'Startup Funding in India Reaches New Heights',
    description: 'Indian startup ecosystem witnesses record-breaking funding rounds as global investors show increased confidence.',
    date: '2025-04-04',
    category: 'Startups',
    imageUrl: 'https://images.pexels.com/photos/7376/startup-photos.jpg',
    source: 'YourStory',
    url: 'https://yourstory.com/news',
  },
  {
    id: '6',
    title: 'Green Energy Investments Surge as India Commits to Net Zero',
    description: 'Renewable energy sector sees massive investment boost following government\'s commitment to ambitious climate goals.',
    date: '2025-04-03',
    category: 'ESG',
    imageUrl: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg',
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/markets',
  }
];

export function fetchNewsData(): Promise<NewsItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNews);
    }, 500);
  });
}