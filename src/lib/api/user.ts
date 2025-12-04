import { userServiceClient, handleApiResponse, ApiResponse, User } from './client';

export class UserAPI {
    /**
     * Follow a user
     * POST /api/users/{userId}/follow
     */
    static async followUser(userId: string): Promise<ApiResponse<any>> {
        const response = await handleApiResponse<any>(
            userServiceClient.post(`/api/users/${userId}/follow`, {})
        );
        return response;
    }

    /**
     * Unfollow a user
     * POST /api/users/{userId}/unfollow
     */
    static async unfollowUser(userId: string): Promise<ApiResponse<any>> {
        const response = await handleApiResponse<any>(
            userServiceClient.post(`/api/users/${userId}/unfollow`, {})
        );
        return response;
    }

    /**
     * Get user profile by ID
     * GET /api/users/{userId}
     */
    static async getUserProfile(userId: string): Promise<ApiResponse<User>> {
        const response = await handleApiResponse<User>(
            userServiceClient.get(`/api/users/${userId}`)
        );
        return response;
    }

    /**
     * Check if following a user
     * GET /api/users/{userId}/is-following
     */
    static async isFollowing(userId: string): Promise<ApiResponse<boolean>> {
        const response = await handleApiResponse<boolean>(
            userServiceClient.get(`/api/users/${userId}/is-following`)
        );
        return response;
    }
}
