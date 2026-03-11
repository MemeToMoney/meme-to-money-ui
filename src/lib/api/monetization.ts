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

export interface CoinConversionInfo {
  coinsPerRupee: number;
  minRedeemCoins: number;
  minRedeemRupees: number;
  rewards: {
    upload: number;
    per100Views: number;
    perLike: number;
    perComment: number;
    perShare: number;
    perFollower: number;
    dailyLogin: number;
  };
  dailyCaps: {
    upload: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    followers: number;
  };
}

export type TransactionType =
  | 'TIP_RECEIVED'
  | 'TIP_SENT'
  | 'BATTLE_WIN'
  | 'BATTLE_ENTRY'
  | 'REFERRAL_BONUS'
  | 'DAILY_REWARD'
  | 'PAYOUT'
  | 'COIN_PURCHASE'
  | 'CONTENT_BONUS'
  | 'MILESTONE_REWARD';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  coins: number;
  description: string;
  contentId?: string;
  relatedUserId?: string;
  createdAt: string;
}

export interface PagedTransactions {
  content: Transaction[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
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
  payoutMethod: 'BANK' | 'UPI';
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface Payout {
  id: string;
  userId: string;
  coins: number;
  amountINR: number;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  payoutMethod: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  amountINR: number;
  coins: number;
  currency: string;
  keyId: string;
  paymentId: string;
}

export interface PaymentInfo {
  keyId: string;
  coinsPerRupee: number;
  minCoins: number;
  maxCoins: number;
  currency: string;
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

  // --- Coins ---
  static async claimDailyLogin(): Promise<ApiResponse<Earning>> {
    return handleApiResponse(monetizationServiceClient.post('/api/monetization/coins/daily-login'));
  }

  static async getConversionInfo(): Promise<ApiResponse<CoinConversionInfo>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/coins/conversion'));
  }

  // --- Leaderboard ---
  static async getLeaderboard(period: string = 'weekly', limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    return handleApiResponse(monetizationServiceClient.get(`/api/monetization/leaderboard?period=${period}&limit=${limit}`));
  }

  // --- Transactions ---
  static async getTransactions(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedTransactions>> {
    return handleApiResponse(
      monetizationServiceClient.get('/api/monetization/transactions', {
        params: { userId, page, size },
      })
    );
  }

  // --- Payments (Buy Coins) ---
  static async createPaymentOrder(coins: number): Promise<ApiResponse<PaymentOrderResponse>> {
    return handleApiResponse(monetizationServiceClient.post('/api/monetization/payments/create-order', { coins }));
  }

  static async verifyPayment(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): Promise<ApiResponse<any>> {
    return handleApiResponse(monetizationServiceClient.post('/api/monetization/payments/verify', {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
    }));
  }

  static async getPaymentInfo(): Promise<ApiResponse<PaymentInfo>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/payments/info'));
  }

  static async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/payments/history'));
  }

  // --- Payouts ---
  static async requestPayout(request: PayoutRequest): Promise<ApiResponse<Payout>> {
    return handleApiResponse(monetizationServiceClient.post('/api/monetization/payouts', request));
  }

  static async getPayouts(): Promise<ApiResponse<Payout[]>> {
    return handleApiResponse(monetizationServiceClient.get('/api/monetization/payouts'));
  }
}
