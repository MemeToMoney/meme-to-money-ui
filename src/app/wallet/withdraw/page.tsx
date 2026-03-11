'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MonetizationAPI, WalletResponse, Payout } from '@/lib/api/monetization';
import { isApiSuccess } from '@/lib/api/client';

function WithdrawContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [coins, setCoins] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'info',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletRes, payoutsRes] = await Promise.all([
        MonetizationAPI.getWallet(),
        MonetizationAPI.getPayouts(),
      ]);
      if (isApiSuccess(walletRes)) setWallet(walletRes.data);
      if (isApiSuccess(payoutsRes)) setPayouts(payoutsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const coinAmount = parseInt(coins) || 0;
  const amountINR = coinAmount / 100;

  const handleWithdraw = async () => {
    if (coinAmount < 10000) {
      setSnackbar({ open: true, message: 'Minimum withdrawal is 10,000 coins (\u20B9100)', severity: 'error' });
      return;
    }
    if (wallet && coinAmount > wallet.coinBalance) {
      setSnackbar({ open: true, message: 'Insufficient coin balance', severity: 'error' });
      return;
    }
    if (method === 'UPI' && (!upiId || !upiId.includes('@'))) {
      setSnackbar({ open: true, message: 'Please enter a valid UPI ID (e.g. name@upi)', severity: 'error' });
      return;
    }
    if (method === 'BANK' && (!accountNumber || !ifscCode)) {
      setSnackbar({ open: true, message: 'Please enter bank account number and IFSC code', severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await MonetizationAPI.requestPayout({
        coins: coinAmount,
        payoutMethod: method,
        upiId: method === 'UPI' ? upiId : undefined,
        bankAccountNumber: method === 'BANK' ? accountNumber : undefined,
        ifscCode: method === 'BANK' ? ifscCode : undefined,
      });
      if (isApiSuccess(res)) {
        setSnackbar({ open: true, message: `Withdrawal request submitted! \u20B9${amountINR.toFixed(2)} via ${method}`, severity: 'success' });
        setCoins('');
        setUpiId('');
        setAccountNumber('');
        setIfscCode('');
        loadData();
      } else {
        setSnackbar({ open: true, message: (res as any).message || 'Withdrawal failed', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Withdrawal failed', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: '#F59E0B',
    APPROVED: '#3B82F6',
    PROCESSING: '#8B5CF6',
    COMPLETED: '#10B981',
    REJECTED: '#EF4444',
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
          Withdraw
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 428, mx: 'auto', p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#6B46C1' }} />
          </Box>
        ) : (
          <>
            {/* Balance */}
            <Card sx={{
              borderRadius: 3, mb: 3,
              background: 'linear-gradient(135deg, #059669, #10B981)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Available Balance</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {(wallet?.coinBalance || 0).toLocaleString()} coins
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  = {'\u20B9'}{((wallet?.coinBalance || 0) / 100).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            {/* Method toggle */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Withdraw Via</Typography>
            <ToggleButtonGroup
              value={method}
              exclusive
              onChange={(_, v) => v && setMethod(v)}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="UPI" sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: '12px 0 0 12px',
                '&.Mui-selected': { bgcolor: '#FAF5FF', color: '#6B46C1', borderColor: '#6B46C1' },
              }}>
                UPI
              </ToggleButton>
              <ToggleButton value="BANK" sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: '0 12px 12px 0',
                '&.Mui-selected': { bgcolor: '#FAF5FF', color: '#6B46C1', borderColor: '#6B46C1' },
              }}>
                Bank Transfer
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Amount */}
            <TextField
              fullWidth
              label="Coins to Withdraw"
              type="number"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              placeholder="Min 10,000 coins"
              size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText={coinAmount > 0 ? `= \u20B9${amountINR.toFixed(2)}` : 'Minimum: 10,000 coins (\u20B9100)'}
            />

            {/* UPI fields */}
            {method === 'UPI' && (
              <TextField
                fullWidth
                label="UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                size="small"
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}

            {/* Bank fields */}
            {method === 'BANK' && (
              <>
                <TextField
                  fullWidth
                  label="Bank Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  size="small"
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="IFSC Code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  size="small"
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </>
            )}

            {/* Submit */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting || coinAmount < 10000}
              onClick={handleWithdraw}
              sx={{
                bgcolor: '#059669', borderRadius: 3, py: 1.5,
                fontWeight: 700, textTransform: 'none',
                '&:hover': { bgcolor: '#047857' },
              }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> :
                `Withdraw \u20B9${amountINR.toFixed(2)} via ${method}`}
            </Button>

            {/* Payout History */}
            {payouts.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Withdrawal History</Typography>
                {payouts.map((p) => (
                  <Card key={p.id} sx={{ borderRadius: 2, mb: 1.5 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.coins.toLocaleString()} coins ({'\u20B9'}{p.amountINR.toFixed(2)})
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          via {p.payoutMethod || 'BANK'} {p.upiId ? `(${p.upiId})` : ''} {p.bankAccountNumber ? `(****${p.bankAccountNumber.slice(-4)})` : ''}
                        </Typography>
                      </Box>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{ bgcolor: `${statusColors[p.status] || '#6B7280'}15`, color: statusColors[p.status] || '#6B7280', fontWeight: 600 }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
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

export default function WithdrawPage() {
  return (
    <ProtectedRoute>
      <WithdrawContent />
    </ProtectedRoute>
  );
}
