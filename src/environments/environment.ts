export const environment = {
  production: false,
  // The Guardian Open Platform – free key: https://open-platform.theguardian.com/access/
  // 'test' key was deprecated by The Guardian – register for a free developer key.
  // Once you have a real key, replace the empty string below and set useDynamicNews: true
  guardianApiKey: '85793848-611d-48cf-90c5-3c93fe5d754d',
  // rss2json.com – free tier, no key required for public RSS feeds
  rss2jsonApiUrl: 'https://api.rss2json.com/v1/api.json',
  // PubMed E-utilities – no key needed (add email for higher rate limits)
  pubmedEmail: 'mindfeed@example.com',
  // Set to true only when guardianApiKey has a valid developer key
  useDynamicNews: true,
};
