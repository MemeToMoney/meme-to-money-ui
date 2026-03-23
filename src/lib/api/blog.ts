import { contentServiceClient, handleApiResponse, ApiResponse } from './client';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  creatorId: string;
  creatorHandle: string;
  status: 'DRAFT' | 'PUBLISHED';
  seoTitle?: string;
  seoDescription?: string;
  coverImageUrl?: string;
  shareImageUrl?: string;
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface BlogPostCreateRequest {
  title: string;
  description: string;
  tags?: string[];
  category?: string;
  publish?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export class BlogAPI {
  static async createBlogPost(
    request: BlogPostCreateRequest,
    userId: string,
    userHandle?: string
  ): Promise<ApiResponse<BlogPost>> {
    const headers: Record<string, string> = { 'X-User-Id': userId };
    if (userHandle) {
      headers['X-User-Handle'] = userHandle;
    }
    return handleApiResponse<BlogPost>(
      contentServiceClient.post('/api/blogs', request, { headers })
    );
  }

  static async getPublishedBlogs(page = 0, size = 20): Promise<ApiResponse<PageResponse<BlogPost>>> {
    return handleApiResponse<PageResponse<BlogPost>>(
      contentServiceClient.get('/api/blogs', { params: { page, size } })
    );
  }

  static async getBlogsByCreator(creatorId: string, page = 0, size = 20): Promise<ApiResponse<PageResponse<BlogPost>>> {
    return handleApiResponse<PageResponse<BlogPost>>(
      contentServiceClient.get(`/api/blogs/creator/${creatorId}`, { params: { page, size } })
    );
  }

  static async getBlogBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    return handleApiResponse<BlogPost>(
      contentServiceClient.get(`/api/blogs/${encodeURIComponent(slug)}`)
    );
  }
}
