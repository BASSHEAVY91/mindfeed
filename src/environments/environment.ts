export const environment = {
  production: false,
  // The Guardian Open Platform – free key: https://open-platform.theguardian.com/access/
  // Use 'test' for demo (works but rate-limited + limited fields)
  guardianApiKey: 'test',
  // rss2json.com – free tier, no key required for public RSS feeds
  rss2jsonApiUrl: 'https://api.rss2json.com/v1/api.json',
  // PubMed E-utilities – no key needed (add email for higher rate limits)
  pubmedEmail: 'mindfeed@example.com',
  // Enable dynamic news (set false to use only static data)
  useDynamicNews: true,
};
