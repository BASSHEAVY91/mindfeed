export type ArticleCategory = 'neurociencia' | 'psicologia' | 'bienestar' | 'ciencia';
export type ArticleLevel = 'basico' | 'intermedio' | 'avanzado';

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  /** Optional fun-fact / "¿Sabías que...?" snippet */
  funFact: string;
  category: ArticleCategory;
  level: ArticleLevel;
  author: string;
  institution: string;
  publishedAt: string; // ISO date string YYYY-MM-DD
  readingMinutes: number;
  imageUrl: string;
  tags: string[];
  relatedIds: string[];
  /** Optional URL to the original source article */
  sourceUrl?: string;
  /** Optional source provider label */
  sourceLabel?: string;
  /** Language of the original article content: 'en' | 'es'. Undefined = Spanish (static data). */
  language?: 'en' | 'es';
}
