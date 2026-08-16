import {Injectable, signal} from '@angular/core';

export interface MarketTickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  type: 'crypto' | 'stock' | 'forex';
}

@Injectable({
  providedIn: 'root'
})
export class TickerService {
  readonly items = signal<MarketTickerItem[]>([
    { symbol: 'USD / LKR', name: 'US Dollar', price: 'Rs. 308.50', change: '+0.12%', isPositive: true, type: 'forex' },
    { symbol: 'EUR / LKR', name: 'Euro', price: 'Rs. 336.20', change: '-0.24%', isPositive: false, type: 'forex' },
    { symbol: 'BTC', name: 'Bitcoin', price: '$96,450', change: '+2.85%', isPositive: true, type: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,780', change: '+1.40%', isPositive: true, type: 'crypto' },
    { symbol: 'NVDA', name: 'NVIDIA', price: '$138.25', change: '+3.15%', isPositive: true, type: 'stock' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$232.80', change: '+0.65%', isPositive: true, type: 'stock' },
    { symbol: 'GOOGL', name: 'Alphabet Google', price: '$184.60', change: '+1.10%', isPositive: true, type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Motors', price: '$248.30', change: '-1.05%', isPositive: false, type: 'stock' },
    { symbol: 'SOL', name: 'Solana', price: '$198.40', change: '+4.20%', isPositive: true, type: 'crypto' },
    { symbol: 'GBP / LKR', name: 'British Pound', price: 'Rs. 392.10', change: '+0.30%', isPositive: true, type: 'forex' }
  ]);

  constructor() {
    // Periodically fetch or gently update live rate fluctuations in the background
    if (typeof window !== 'undefined') {
      this.fetchLiveForexCrypto();
      setInterval(() => this.fetchLiveForexCrypto(), 3 * 60 * 1000); // every 3 minutes
    }
  }

  async fetchLiveForexCrypto() {
    try {
      // 1. Fetch live Crypto (CoinGecko free API - no auth required)
      const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
      if (cryptoRes.ok) {
        const data = await cryptoRes.json();
        this.items.update(curr => {
          return curr.map(item => {
            if (item.symbol === 'BTC' && data.bitcoin) {
              const change = data.bitcoin.usd_24h_change || 0;
              return {
                ...item,
                price: `$${data.bitcoin.usd.toLocaleString()}`,
                change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                isPositive: change >= 0
              };
            }
            if (item.symbol === 'ETH' && data.ethereum) {
              const change = data.ethereum.usd_24h_change || 0;
              return {
                ...item,
                price: `$${data.ethereum.usd.toLocaleString()}`,
                change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                isPositive: change >= 0
              };
            }
            if (item.symbol === 'SOL' && data.solana) {
              const change = data.solana.usd_24h_change || 0;
              return {
                ...item,
                price: `$${data.solana.usd.toLocaleString()}`,
                change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                isPositive: change >= 0
              };
            }
            return item;
          });
        });
      }
    } catch {
      // Keep robust defaults if API is rate limited
    }
  }
}
