export type ArticleCategory = 'neurociencia' | 'psicologia' | 'bienestar' | 'ciencia';
export type ArticleLevel = 'basico' | 'intermedio' | 'avanzado';

export interface Article {
  id: string;
  title: string;
  summary: string;
  body: string;
  funFact: string;
  category: ArticleCategory;
  level: ArticleLevel;
  author: string;
  institution: string;
  publishedAt: string;
  readingMinutes: number;
  imageUrl: string;
  slug: string;
  tags: string[];
  relatedIds: string[];
}
