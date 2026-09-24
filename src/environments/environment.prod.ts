export const environment = {
  production: true,
  // Set your real Guardian API key as Render/CI environment variable: GUARDIAN_API_KEY
  // 'test' key was deprecated by The Guardian – register for a free developer key:
  // https://open-platform.theguardian.com/access/
  guardianApiKey: '',
  rss2jsonApiUrl: 'https://api.rss2json.com/v1/api.json',
  pubmedEmail: 'mindfeed@example.com',
  // Set to true only when guardianApiKey has a valid developer key
  useDynamicNews: false,
};
