import { MetaData } from './strapi';

export interface ICategory {
  id: number;
  title: string;
  description: string;
  slug: string;
  metaData?: MetaData[];

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
