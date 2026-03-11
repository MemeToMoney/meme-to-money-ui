'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Star as CoinIcon,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MonetizationAPI, PaymentInfo } from '@/lib/api/monetization';
import { isApiSuccess } from '@/lib/api/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRESET_AMOUNTS = [
  { coins: 100, label: '100' },
  { coins: 500, label: '500' },
  { coins: 1000, label: '1K' },
  { coins: 5000, label: '5K' },
  { coins: 10000, label: '10K' },
  { coins: 50000, label: '50K' },
];

function BuyCoinsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [selectedCoins, setSelectedCoins] = useState(1000);
  const [customCoins, setCustomCoins] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'info',
  });

  useEffect(() => {
    loadPaymentInfo();
    loadRazorpayScript();
  }, []);

  const loadPaymentInfo = async () => {
    try {
      const res = await MonetizationAPI.getPaymentInfo();
      if (isApiSuccess(res)) setPaymentInfo(res.data);
    } catch (err) {
      console.error('Failed to load payment info:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    if (document.getElementById('razorpay-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const coins = customCoins ? parseInt(customCoins) || 0 : selectedCoins;
  const amountINR = paymentInfo ? coins / paymentInfo.coinsPerRupee : coins / 100;

  const handleBuyCoins = async () => {
    if (!paymentInfo) return;
    if (coins < paymentInfo.minCoins) {
      setSnackbar({ open: true, message: `Minimum purchase is ${paymentInfo.minCoins} coins`, severity: 'error' });
      return;
    }
    if (coins > paymentInfo.maxCoins) {
      setSnackbar({ open: true, message: `Maximum purchase is ${paymentInfo.maxCoins} coins`, severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const orderRes = await MonetizationAPI.createPaymentOrder(coins);
      if (!isApiSuccess(orderRes)) {
        setSnackbar({ open: true, message: (orderRes as any).message || 'Failed to create order', severity: 'error' });
        setLoading(false);
        return;
      }

      const order = orderRes.data;

      // Open Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'MemeToMoney',
        description: `Buy ${order.coins} Coins`,
        order_id: order.orderId,
        handler: async (response: any) => {
          // Verify payment on backend
          try {
            const verifyRes = await MonetizationAPI.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            if (isApiSuccess(verifyRes)) {
              setSnackbar({ open: true, message: `+${order.coins} coins added to wallet!`, severity: 'success' });
              setTimeout(() => router.push('/wallet'), 1500);
            } else {
              setSnackbar({ open: true, message: 'Payment verification failed', severity: 'error' });
            }
          } catch {
            setSnackbar({ open: true, message: 'Payment verification failed', severity: 'error' });
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#6B46C1',
        },
      };

      if (typeof window.Razorpay === 'undefined') {
        setSnackbar({ open: true, message: 'Payment gateway loading, please try again', severity: 'error' });
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setSnackbar({ open: true, message: resp.error?.description || 'Payment failed', severity: 'error' });
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to initiate payment', severity: 'error' });
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
      {/* Header */}
      <Box sx={{
        position: 'sticky', top: 0, bgcolor: 'white', zIndex: 1,
        p: 2, borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <IconButton onClick={() => router.back()}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6B46C1' }}>
          Buy Coins
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 428, mx: 'auto', p: 3 }}>
        {pageLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : (
          <>
            {/* Current Balance */}
            <Card sx={{
              borderRadius: 3, mb: 3,
              background: 'linear-gradient(135deg, #6B46C1, #9333EA)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Current Balance</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {(user.coinBalance || 0).toLocaleString()} coins
                </Typography>
              </CardContent>
            </Card>

            {/* Preset amounts */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Select Coins</Typography>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {PRESET_AMOUNTS.map(({ coins: c, label }) => (
                <Grid item xs={4} key={c}>
                  <Card
                    onClick={() => { setSelectedCoins(c); setCustomCoins(''); }}
                    sx={{
                      borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                      border: selectedCoins === c && !customCoins ? '2px solid #6B46C1' : '2px solid #E5E7EB',
                      bgcolor: selectedCoins === c && !customCoins ? '#FAF5FF' : 'white',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: '#6B46C1' },
                    }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#6B46C1' }}>{label}</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {'\u20B9'}{(c / (paymentInfo?.coinsPerRupee || 100)).toFixed(0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Custom amount */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Or Enter Custom Amount</Typography>
            <TextField
              fullWidth
              type="number"
              value={customCoins}
              onChange={(e) => setCustomCoins(e.target.value)}
              placeholder="Enter number of coins"
              size="small"
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                endAdornment: <Typography variant="caption" sx={{ color: '#6B7280', whiteSpace: 'nowrap' }}>coins</Typography>,
              }}
            />

            {/* Summary */}
            <Card sx={{ borderRadius: 3, mb: 3, bgcolor: '#F9FAFB' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>Coins</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{coins.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>Rate</Typography>
                  <Typography variant="body2">100 coins = {'\u20B9'}1</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #E5E7EB' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6B46C1' }}>
                    {'\u20B9'}{amountINR.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Pay via */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['UPI', 'Card', 'NetBanking', 'Wallet'].map((method) => (
                <Chip key={method} label={method} size="small" variant="outlined"
                  sx={{ borderColor: '#D1D5DB', color: '#6B7280', fontSize: '0.75rem' }} />
              ))}
            </Box>

            {/* Buy button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || coins < (paymentInfo?.minCoins || 100)}
              onClick={handleBuyCoins}
              sx={{
                bgcolor: '#6B46C1', borderRadius: 3, py: 1.5,
                fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                '&:hover': { bgcolor: '#553C9A' },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> :
                `Pay ${'\u20B9'}${amountINR.toFixed(2)} via Razorpay`}
            </Button>

            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center', mt: 2 }}>
              Secured by Razorpay. Supports UPI, Cards, NetBanking & Wallets.
            </Typography>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function BuyCoinsPage() {
  return (
    <ProtectedRoute>
      <BuyCoinsContent />
    </ProtectedRoute>
  );
}
