// Notification Service API Integration
// Note: Notification service returns raw responses (not wrapped in { status, message, data })

import { notificationServiceClient, ApiResponse } from './client';

/**
 * Handle notification service responses which return data directly (not wrapped).
 */
async function handleNotificationResponse<T>(apiCall: Promise<any>): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall;
    return {
      status: response.status || 200,
      message: 'success',
      data: response.data as T,
    };
  } catch (error: any) {
    console.error('Notification API Error:', error);
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        data: null as T,
      };
    } else if (error.request) {
      return { status: 0, message: 'Network error.', data: null as T };
    }
    return { status: -1, message: 'An unexpected error occurred', data: null as T };
  }
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: 'FOLLOW' | 'FOLLOW_REQUEST' | 'LIKE' | 'COMMENT';
  entityId: string;
  entityType: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PagedNotifications {
  content: Notification[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export class NotificationAPI {
  /**
   * Get notifications for current user (paginated)
   * GET /api/notifications
   */
  static async getNotifications(
    userId: string,
    page = 0,
    size = 20
  ): Promise<ApiResponse<PagedNotifications>> {
    return handleNotificationResponse<PagedNotifications>(
      notificationServiceClient.get('/api/notifications', {
        params: { page, size },
        headers: { 'X-User-Id': userId },
      })
    );
  }

  /**
   * Mark a notification as read
   * POST /api/notifications/{id}/read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<ApiResponse<void>> {
    return handleNotificationResponse<void>(
      notificationServiceClient.post(`/api/notifications/${notificationId}/read`, {}, {
        headers: { 'X-User-Id': userId },
      })
    );
  }

  /**
   * Mark all notifications as read
   * POST /api/notifications/read-all
   */
  static async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    return handleNotificationResponse<void>(
      notificationServiceClient.post('/api/notifications/read-all', {}, {
        headers: { 'X-User-Id': userId },
      })
    );
  }
}
