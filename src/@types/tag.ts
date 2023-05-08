import { MetaData } from './strapi';

export interface ITag {
  id: number;
  tag: string;
  color: string;
  metaData?: MetaData[];

  createdAt?: string;
  updatedAt?: string;
}
