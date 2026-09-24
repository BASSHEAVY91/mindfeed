import { ArticleCategory, ArticleLevel } from './article.model';

export interface Favorite {
  articleId: string;
  title: string;
  category: ArticleCategory;
  level: ArticleLevel;
  readingMinutes: number;
  imageUrl: string;
  slug: string;
  savedAt: string;
}
