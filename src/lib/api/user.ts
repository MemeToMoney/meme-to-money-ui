import { userServiceClient, handleApiResponse, ApiResponse, User } from './client';

export interface UserSummary {
    id: string;
    name: string;
    displayName?: string;
    username?: string;
    profilePicture?: string;
    bio?: string;
    isContentCreator?: boolean;
    creatorHandle?: string;
    isPrivateAccount?: boolean;
    followerCount: number;
    followingCount: number;
}

export interface SearchResult {
    users: UserSummary[];
    page: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export interface FollowStatus {
    following: boolean;
    followedBy: boolean;
    blocked: boolean;
    pending: boolean;
}

export interface PaginatedUsers {
    users: UserSummary[];
    page: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export class UserAPI {
    /**
     * Follow a user
     * POST /api/users/{userId}/follow
     */
    static async followUser(userId: string): Promise<ApiResponse<any>> {
        return handleApiResponse<any>(
            userServiceClient.post(`/api/users/${userId}/follow`, {})
        );
    }

    /**
     * Unfollow a user
     * DELETE /api/users/{userId}/follow
     */
    static async unfollowUser(userId: string): Promise<ApiResponse<any>> {
        return handleApiResponse<any>(
            userServiceClient.delete(`/api/users/${userId}/follow`)
        );
    }

    /**
     * Get user profile by ID
     * GET /api/users/{userId}
     */
    static async getUserProfile(userId: string): Promise<ApiResponse<any>> {
        return handleApiResponse<any>(
            userServiceClient.get(`/api/users/${userId}`)
        );
    }

    /**
     * Get follow status between current user and target user
     * GET /api/users/{userId}/follow-status
     */
    static async getFollowStatus(userId: string): Promise<ApiResponse<FollowStatus>> {
        return handleApiResponse<FollowStatus>(
            userServiceClient.get(`/api/users/${userId}/follow-status`)
        );
    }

    /**
     * Get followers of a user (paginated)
     * GET /api/users/{userId}/followers
     */
    static async getFollowers(userId: string, page = 0, size = 20): Promise<ApiResponse<PaginatedUsers>> {
        return handleApiResponse<PaginatedUsers>(
            userServiceClient.get(`/api/users/${userId}/followers`, { params: { page, size } })
        );
    }

    /**
     * Get following of a user (paginated)
     * GET /api/users/{userId}/following
     */
    static async getFollowing(userId: string, page = 0, size = 20): Promise<ApiResponse<PaginatedUsers>> {
        return handleApiResponse<PaginatedUsers>(
            userServiceClient.get(`/api/users/${userId}/following`, { params: { page, size } })
        );
    }

    /**
     * Search users by name, username, displayName, or creatorHandle
     * GET /api/users/search
     */
    static async searchUsers(query: string, page = 0, size = 20): Promise<ApiResponse<SearchResult>> {
        return handleApiResponse<SearchResult>(
            userServiceClient.get('/api/users/search', { params: { q: query, page, size } })
        );
    }

    /**
     * Get suggested users to follow
     * GET /api/users/suggestions
     */
    static async getSuggestions(limit = 10): Promise<ApiResponse<UserSummary[]>> {
        return handleApiResponse<UserSummary[]>(
            userServiceClient.get('/api/users/suggestions', { params: { limit } })
        );
    }

    /**
     * Get mutual followers between current user and target user
     * GET /api/users/{userId}/mutual-followers
     */
    static async getMutualFollowers(userId: string): Promise<ApiResponse<UserSummary[]>> {
        return handleApiResponse<UserSummary[]>(
            userServiceClient.get(`/api/users/${userId}/mutual-followers`)
        );
    }

    /**
     * Block a user
     * POST /api/users/{userId}/block
     */
    static async blockUser(userId: string): Promise<ApiResponse<void>> {
        return handleApiResponse<void>(
            userServiceClient.post(`/api/users/${userId}/block`, {})
        );
    }

    /**
     * Unblock a user
     * DELETE /api/users/{userId}/block
     */
    static async unblockUser(userId: string): Promise<ApiResponse<void>> {
        return handleApiResponse<void>(
            userServiceClient.delete(`/api/users/${userId}/block`)
        );
    }

    /**
     * Get pending follow requests for current user
     * GET /api/users/me/follow-requests
     */
    static async getFollowRequests(): Promise<ApiResponse<UserSummary[]>> {
        return handleApiResponse<UserSummary[]>(
            userServiceClient.get('/api/users/me/follow-requests')
        );
    }

    /**
     * Accept a follow request
     * POST /api/users/{userId}/accept-follow
     */
    static async acceptFollowRequest(userId: string): Promise<ApiResponse<any>> {
        return handleApiResponse<any>(
            userServiceClient.post(`/api/users/${userId}/accept-follow`, {})
        );
    }

    /**
     * Reject a follow request
     * POST /api/users/{userId}/reject-follow
     */
    static async rejectFollowRequest(userId: string): Promise<ApiResponse<any>> {
        return handleApiResponse<any>(
            userServiceClient.post(`/api/users/${userId}/reject-follow`, {})
        );
    }

    /**
     * Check if a handle is available
     * GET /api/users/check-handle/{handle}
     */
    static async checkHandleAvailability(handle: string): Promise<ApiResponse<{ available: boolean; valid: boolean; handle: string; reason?: string }>> {
        return handleApiResponse<{ available: boolean; valid: boolean; handle: string; reason?: string }>(
            userServiceClient.get(`/api/users/check-handle/${encodeURIComponent(handle)}`)
        );
    }

    /**
     * Update a user's handle
     * PATCH /api/users/{userId}/handle
     */
    static async updateHandle(userId: string, handle: string): Promise<ApiResponse<string>> {
        return handleApiResponse<string>(
            userServiceClient.patch(`/api/users/${userId}/handle`, { handle })
        );
    }
}
