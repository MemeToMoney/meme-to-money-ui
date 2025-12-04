'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const themeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#8B5CF6', // Violet
            light: '#A78BFA',
            dark: '#7C3AED',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#EC4899', // Pink
            light: '#F472B6',
            dark: '#DB2777',
            contrastText: '#ffffff',
        },
        background: {
            default: '#0f1117', // Deep dark blue-gray
            paper: '#1f2937',   // Lighter dark blue-gray
        },
        text: {
            primary: '#F9FAFB',
            secondary: '#9CA3AF',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
    },
    typography: {
        fontFamily: inter.style.fontFamily,
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: '16px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
};

const theme = createTheme(themeOptions);

export default theme;
