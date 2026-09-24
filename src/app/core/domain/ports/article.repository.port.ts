import { Observable } from 'rxjs';
import { Article, ArticleCategory, ArticleLevel } from '../models/article.model';

export abstract class ArticleRepositoryPort {
  abstract getAll(): Observable<Article[]>;
  abstract getById(id: string): Observable<Article | undefined>;
  abstract getBySlug(slug: string): Observable<Article | undefined>;
  abstract getByCategory(category: ArticleCategory): Observable<Article[]>;
  abstract getByLevel(level: ArticleLevel): Observable<Article[]>;
  abstract getRelated(articleId: string, limit?: number): Observable<Article[]>;
  abstract getFeatured(): Observable<Article | undefined>;
  abstract getRecent(limit: number): Observable<Article[]>;
}
