// Messaging Service API Integration
// Note: Messaging service returns raw responses (not wrapped in { status, message, data })

import { messagingServiceClient, ApiResponse } from './client';

/**
 * Handle messaging service responses which return data directly (not wrapped).
 * Wraps them into the standard ApiResponse format for compatibility with isApiSuccess().
 */
async function handleMessagingResponse<T>(apiCall: Promise<any>): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall;
    // Messaging service returns raw data directly in response.data
    return {
      status: response.status || 200,
      message: 'success',
      data: response.data as T,
    };
  } catch (error: any) {
    console.error('Messaging API Error:', error);
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.response.data?.error || 'An error occurred',
        data: null as T,
      };
    } else if (error.request) {
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        data: null as T,
      };
    }
    return {
      status: -1,
      message: 'An unexpected error occurred',
      data: null as T,
    };
  }
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  participantIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageId?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  name?: string;
  avatarUrl?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM' | 'CALL_INVITE';
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'DELETED';
  callSessionId?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export class MessagingAPI {
  /**
   * Get all conversations for current user (paginated)
   * GET /api/messaging/conversations
   */
  static async getConversations(page = 0, size = 20): Promise<ApiResponse<PagedResponse<Conversation>>> {
    return handleMessagingResponse<PagedResponse<Conversation>>(
      messagingServiceClient.get('/api/messaging/conversations', { params: { page, size } })
    );
  }

  /**
   * Get a specific conversation
   * GET /api/messaging/conversations/{conversationId}
   */
  static async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return handleMessagingResponse<Conversation>(
      messagingServiceClient.get(`/api/messaging/conversations/${conversationId}`)
    );
  }

  /**
   * Create a direct conversation
   * POST /api/messaging/conversations/direct
   */
  static async createDirectConversation(otherUserId: string): Promise<ApiResponse<Conversation>> {
    return handleMessagingResponse<Conversation>(
      messagingServiceClient.post('/api/messaging/conversations/direct', { otherUserId })
    );
  }

  /**
   * Create a group conversation
   * POST /api/messaging/conversations/group
   */
  static async createGroupConversation(
    name: string,
    participantIds: string[],
    avatarUrl?: string
  ): Promise<ApiResponse<Conversation>> {
    return handleMessagingResponse<Conversation>(
      messagingServiceClient.post('/api/messaging/conversations/group', { name, participantIds, avatarUrl })
    );
  }

  /**
   * Get messages for a conversation (paginated)
   * GET /api/messaging/conversations/{conversationId}/messages
   */
  static async getMessages(conversationId: string, page = 0, size = 50): Promise<ApiResponse<PagedResponse<Message>>> {
    return handleMessagingResponse<PagedResponse<Message>>(
      messagingServiceClient.get(`/api/messaging/conversations/${conversationId}/messages`, {
        params: { page, size },
      })
    );
  }

  /**
   * Send a message to a conversation
   * POST /api/messaging/conversations/{conversationId}/messages
   */
  static async sendMessage(
    conversationId: string,
    message: { type: string; text?: string; mediaUrl?: string; mediaType?: string }
  ): Promise<ApiResponse<Message>> {
    return handleMessagingResponse<Message>(
      messagingServiceClient.post(`/api/messaging/conversations/${conversationId}/messages`, message)
    );
  }

  /**
   * Mark conversation as read
   * POST /api/messaging/conversations/{conversationId}/read
   */
  static async markAsRead(conversationId: string, lastReadMessageId: string): Promise<ApiResponse<void>> {
    return handleMessagingResponse<void>(
      messagingServiceClient.post(`/api/messaging/conversations/${conversationId}/read`, { lastReadMessageId })
    );
  }
}
