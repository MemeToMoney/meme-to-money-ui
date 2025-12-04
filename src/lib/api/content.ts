// Content Service API Integration
// Connects with Content Service endpoints for content management

import { contentServiceClient, handleApiResponse, ApiResponse } from './client';

// Request/Response types based on Content Service API spec
export interface UploadUrlRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  type: 'MEME' | 'SHORT_VIDEO';
}

export interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  expiresAt: string;
  contentId: string;
  maxFileSize: number;
  supportedFormats: string[];
  maxDurationSeconds?: number;
}

export interface ContentCreationRequest {
  title: string;
  description?: string;
  type: 'MEME' | 'SHORT_VIDEO';
  tags?: string[];
  hashtags?: string[];
  category?: string;
  monetizationEnabled?: boolean;
  s3Key: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  durationSeconds?: number;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: 'MEME' | 'SHORT_VIDEO';
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'PUBLISHED' | 'FAILED' | 'DELETED';
  creatorId: string;
  creatorHandle: string;
  originalFile: MediaFile;
  processedFile?: MediaFile;
  thumbnailUrl?: string;
  tags: string[];
  hashtags: string[];
  category?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  monetizationEnabled: boolean;
}

export interface MediaFile {
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  s3Key: string;
  cdnUrl: string;
  durationSeconds?: number;
  resolution?: string;
  width?: number;
  height?: number;
  format: string;
}

export interface UIFeedResponse {
  content: {
    content: Content[];
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    empty: boolean;
  };
  userEngagements: { [contentId: string]: UserEngagementStatus };
  recentComments: { [contentId: string]: Comment[] };
  metadata: FeedMetadata;
  userAuthenticated: boolean;
}

export interface UserEngagementStatus {
  contentId: string;
  userId: string;
  liked: boolean;
  shared: boolean;
  bookmarked: boolean;
  likedAt?: string;
  sharedAt?: string;
  bookmarkedAt?: string;
}

export interface FeedMetadata {
  authenticated: boolean;
  userId?: string;
  feedType: string;
  timestamp: number;
  totalEngagedContent: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Comment {
  id: string;
  contentId: string;
  userId: string;
  username: string;
  userHandle: string;
  text: string;
  parentCommentId?: string;
  likeCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
}

export interface EngagementRequest {
  action: 'VIEW' | 'LIKE' | 'UNLIKE' | 'SHARE' | 'COMMENT';
  source?: string;
  watchDuration?: number;
  referrer?: string;
}

export interface CommentRequest {
  text: string;
  parentCommentId?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// Content Service API functions
export class ContentAPI {
  /**
   * Get presigned upload URL for content
   * GET /api/content/upload-url
   */
  static async getUploadUrl(
    request: UploadUrlRequest,
    userId: string,
    userHandle: string
  ): Promise<ApiResponse<UploadUrlResponse>> {
    const response = await handleApiResponse<UploadUrlResponse>(
      contentServiceClient.get('/api/content/upload-url', {
        params: request,
        headers: {
          'X-User-Id': userId,
          'X-User-Handle': userHandle
        }
      })
    );

    return response;
  }

  /**
   * Upload file to content service (Server-Side Upload)
   * POST /api/images/upload
   */
  static async uploadFile(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await handleApiResponse<string>(
      contentServiceClient.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );

    return response;
  }

  /**
   * Create content after file upload
   * POST /api/content
   */
  static async createContent(
    contentId: string,
    contentData: ContentCreationRequest,
    userId: string
  ): Promise<ApiResponse<Content>> {
    const response = await handleApiResponse<Content>(
      contentServiceClient.post('/api/content', contentData, {
        params: { contentId },
        headers: {
          'X-User-Id': userId
        }
      })
    );

    return response;
  }

  /**
   * Get content by ID
   * GET /api/content/{contentId}
   */
  static async getContent(contentId: string): Promise<ApiResponse<Content>> {
    const response = await handleApiResponse<Content>(
      contentServiceClient.get(`/api/content/${contentId}`)
    );

    return response;
  }

  /**
   * Get personalized home feed
   * GET /api/content/feed
   */
  static async getHomeFeed(
    page = 0,
    size = 10,
    userId?: string
  ): Promise<ApiResponse<UIFeedResponse>> {
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await handleApiResponse<UIFeedResponse>(
      contentServiceClient.get('/api/content/feed', {
        params: { page, size },
        headers
      })
    );

    return response;
  }

  /**
   * Get trending feed
   * GET /api/content/feed/trending
   */
  static async getTrendingFeed(
    page = 0,
    size = 10,
    hours = 24,
    userId?: string
  ): Promise<ApiResponse<UIFeedResponse>> {
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await handleApiResponse<UIFeedResponse>(
      contentServiceClient.get('/api/content/feed/trending', {
        params: { page, size, hours },
        headers
      })
    );

    return response;
  }

  /**
   * Get fresh content feed
   * GET /api/content/feed/fresh
   */
  static async getFreshFeed(
    page = 0,
    size = 10,
    hours = 6,
    userId?: string
  ): Promise<ApiResponse<UIFeedResponse>> {
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await handleApiResponse<UIFeedResponse>(
      contentServiceClient.get('/api/content/feed/fresh', {
        params: { page, size, hours },
        headers
      })
    );

    return response;
  }

  /**
   * Get user's content
   * GET /api/content/profile/{userId}/content
   */
  static async getUserContent(
    userId: string,
    page = 0,
    size = 10,
    viewerUserId?: string
  ): Promise<ApiResponse<PageResponse<Content>>> {
    const headers: any = {};
    if (viewerUserId) {
      headers['X-User-Id'] = viewerUserId;
    }

    const response = await handleApiResponse<PageResponse<Content>>(
      contentServiceClient.get(`/api/content/creator/${userId}`, {
        params: { page, size },
        headers
      })
    );

    return response;
  }

  /**
   * Get user's liked content
   * GET /api/content/profile/{userId}/liked
   */
  static async getUserLikedContent(
    userId: string,
    page = 0,
    size = 10,
    viewerUserId?: string
  ): Promise<ApiResponse<UIFeedResponse>> {
    const headers: any = {};
    if (viewerUserId) {
      headers['X-User-Id'] = viewerUserId;
    }

    const response = await handleApiResponse<UIFeedResponse>(
      contentServiceClient.get(`/api/content/profile/${userId}/liked`, {
        params: { page, size },
        headers
      })
    );

    return response;
  }

  /**
   * Record content engagement
   * POST /api/content/{contentId}/engage
   */
  static async recordEngagement(
    contentId: string,
    engagement: EngagementRequest,
    userId: string,
    userHandle?: string
  ): Promise<ApiResponse<any>> {
    const headers: any = {
      'X-User-Id': userId
    };
    if (userHandle) {
      headers['X-User-Handle'] = userHandle;
    }

    const response = await handleApiResponse<any>(
      contentServiceClient.post(`/api/content/${contentId}/engage`, engagement, {
        headers
      })
    );

    return response;
  }

  /**
   * Record content view
   * POST /api/content/{contentId}/view
   */
  static async recordView(
    contentId: string,
    userId?: string
  ): Promise<ApiResponse<Content>> {
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await handleApiResponse<Content>(
      contentServiceClient.post(`/api/content/${contentId}/view`, {}, {
        headers
      })
    );

    return response;
  }

  /**
   * Get content comments
   * GET /api/content/{contentId}/comments
   */
  static async getComments(
    contentId: string,
    page = 0,
    size = 20
  ): Promise<ApiResponse<{ content: Comment[]; totalPages: number; totalElements: number }>> {
    const response = await handleApiResponse<any>(
      contentServiceClient.get(`/api/content/${contentId}/comments`, {
        params: { page, size }
      })
    );

    return response;
  }

  /**
   * Add comment to content
   * POST /api/content/{contentId}/comments
   */
  static async addComment(
    contentId: string,
    comment: CommentRequest,
    userId: string,
    userHandle: string
  ): Promise<ApiResponse<Comment>> {
    const response = await handleApiResponse<Comment>(
      contentServiceClient.post(`/api/content/${contentId}/comments`, comment, {
        headers: {
          'X-User-Id': userId,
          'X-User-Handle': userHandle
        }
      })
    );

    return response;
  }

  /**
   * Search content
   * GET /api/content/search
   */
  static async searchContent(
    query?: string,
    category?: string,
    type?: string,
    hashtag?: string,
    page = 0,
    size = 10,
    userId?: string
  ): Promise<ApiResponse<any>> {
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const params: any = { page, size };
    if (query) params.q = query;
    if (category) params.category = category;
    if (type) params.type = type;
    if (hashtag) params.hashtag = hashtag;

    const response = await handleApiResponse<any>(
      contentServiceClient.get('/api/content/search', {
        params,
        headers
      })
    );

    return response;
  }

  /**
   * Get search suggestions
   * GET /api/content/search/suggestions
   */
  static async getSearchSuggestions(): Promise<ApiResponse<any>> {
    const response = await handleApiResponse<any>(
      contentServiceClient.get('/api/content/search/suggestions')
    );

    return response;
  }

  /**
   * Get category statistics
   * GET /api/content/categories/stats
   */
  static async getCategoryStats(): Promise<ApiResponse<any>> {
    const response = await handleApiResponse<any>(
      contentServiceClient.get('/api/content/categories/stats')
    );

    return response;
  }

  /**
   * Get bulk engagement status for multiple content items
   * POST /api/content/bulk-engagement-status
   */
  static async getBulkEngagementStatus(
    contentIds: string[],
    userId: string
  ): Promise<ApiResponse<{ [contentId: string]: UserEngagementStatus }>> {
    const response = await handleApiResponse<any>(
      contentServiceClient.post('/api/content/bulk-engagement-status', contentIds, {
        headers: {
          'X-User-Id': userId
        }
      })
    );

    return response;
  }
}