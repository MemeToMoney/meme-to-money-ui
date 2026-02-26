// Monetization Service API Integration
// Connects with Monetization Service endpoints for tips, earnings, wallet, payouts

import { monetizationServiceClient, handleApiResponse, ApiResponse } from './client';

// Types
export interface TipRequest {
  contentId: string;
  toUserId: string;
  coins: number;
  message?: string;
}

export interface Tip {
  id: string;
  fromUserId: string;
  toUserId: string;
  contentId: string;
  coins: number;
  message?: string;
  createdAt: string;
}

export interface WalletResponse {
  userId: string;
  coinBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
}

export interface EarningsSummary {
  userId: string;
  totalCoins: number;
  thisWeekCoins: number;
  thisMonthCoins: number;
  earningsByType: Record<string, number>;
}

export interface Earning {
  id: string;
  userId: string;
  contentId?: string;
  type: string;
  coins: number;
  description: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName?: string;
  handle?: string;
  profilePicture?: string;
  totalCoins: number;
  rank: number;
}

export interface PayoutRequest {
  coins: number;
  bankAccountNumber: string;
  ifscCode: string;
}

export interface Payout {
  id: string;
  userId: string;
  coins: number;
  amountINR: number;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  bankAccountNumber: string;
  ifscCode: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

// Tips API
export class MonetizationAPI {

  // --- Tips ---
  static async sendTip(request: TipRequest): Promise<ApiResponse<Tip>> {
    return handleApiResponse(monetizationServiceClient.post('/api/monetization/tips', request));
  }

  static async getTipsReceived(): Promise<ApiResponse<Tip[]>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/tips/received'));
  }

  static async getTipsSent(): Promise<ApiResponse<Tip[]>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/tips/sent'));
  }

  static async getTipsForContent(contentId: string): Promise<ApiResponse<Tip[]>> {
    return handleApiResponse(monetizationServiceClient.get(`/api/monetization/tips/content/${contentId}`));
  }

  static async getTotalTipsForContent(contentId: string): Promise<ApiResponse<number>> {
    return handleApiResponse(monetizationServiceClient.get(`/api/monetization/tips/content/${contentId}/total`));
  }

  // --- Wallet ---
  static async getWallet(): Promise<ApiResponse<WalletResponse>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/wallet'));
  }

  static async getBalance(): Promise<ApiResponse<number>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/wallet/balance'));
  }

  // --- Earnings ---
  static async getEarnings(): Promise<ApiResponse<Earning[]>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/earnings'));
  }

  static async getEarningsSummary(): Promise<ApiResponse<EarningsSummary>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/earnings/summary'));
  }

  static async getContentEarnings(contentId: string): Promise<ApiResponse<Earning[]>> {
    return handleApiResponse(monetizationServiceClient.get(`/api/monetization/earnings/content/${contentId}`));
  }

  // --- Leaderboard ---
  static async getLeaderboard(period: string = 'weekly', limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    return handleApiResponse(monetizationServiceClient.get(`/api/monetization/leaderboard?period=${period}&limit=${limit}`));
  }

  // --- Payouts ---
  static async requestPayout(request: PayoutRequest): Promise<ApiResponse<Payout>> {
    return handleApiResponse(monetizationServiceClient.post('/api/monetization/payouts', request));
  }

  static async getPayouts(): Promise<ApiResponse<Payout[]>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/payouts'));
  }
}
