'use client';

import React from 'react';
import {
    Box,
    Typography,
    Container,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    ListItemButton,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import ChatWindow from '@/components/chat/ChatWindow';

const mockMessages = [
    {
        id: 1,
        user: 'john_doe',
        avatar: '/api/placeholder/40/40',
        lastMessage: 'Hey, loved your latest meme!',
        time: '2m ago',
        unread: true
    },
    {
        id: 2,
        user: 'jane_smith',
        avatar: '/api/placeholder/40/40',
        lastMessage: 'When are you posting next?',
        time: '1h ago',
        unread: false
    },
    {
        id: 3,
        user: 'mike_wilson',
        avatar: '/api/placeholder/40/40',
        lastMessage: 'Haha that was hilarious 😂',
        time: '1d ago',
        unread: false
    }
];

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = React.useState<number | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleChatSelect = (id: number) => {
        setSelectedChat(id);
    };

    const handleBack = () => {
        setSelectedChat(null);
    };

    const selectedUser = mockMessages.find(m => m.id === selectedChat);

    return (
        <Container maxWidth={false} sx={{ p: 0, height: '100%', display: 'flex', overflow: 'hidden' }}>
            {/* Chat List - Hidden on mobile when chat is selected */}
            <Box sx={{
                width: { xs: '100%', md: 360 },
                borderRight: '1px solid rgba(0,0,0,0.06)',
                bgcolor: 'white',
                display: { xs: selectedChat ? 'none' : 'flex', md: 'flex' },
                flexDirection: 'column',
                height: '100%'
            }}>
                {/* Header */}
                <Box sx={{
                    p: 3,
                    borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: '#111827',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Messages
                    </Typography>
                </Box>

                {/* Messages List */}
                <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                    {mockMessages.map((message) => (
                        <ListItem
                            key={message.id}
                            disablePadding
                        >
                            <ListItemButton
                                onClick={() => handleChatSelect(message.id)}
                                selected={selectedChat === message.id}
                                sx={{
                                    px: 3,
                                    py: 2,
                                    transition: 'all 0.2s',
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(107, 70, 193, 0.04)',
                                        borderRight: '3px solid #6B46C1',
                                        '&:hover': {
                                            bgcolor: 'rgba(107, 70, 193, 0.08)',
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.02)'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={message.avatar}
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            bgcolor: '#F3F4F6',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {message.user[0].toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                                                {message.user}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: message.unread ? '#6B46C1' : '#9CA3AF', fontWeight: message.unread ? 700 : 500 }}>
                                                {message.time}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: message.unread ? '#111827' : '#6B7280',
                                                fontWeight: message.unread ? 600 : 400,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {message.lastMessage}
                                        </Typography>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Chat Window - Hidden on mobile when no chat selected */}
            <Box sx={{
                flex: 1,
                display: { xs: selectedChat ? 'block' : 'none', md: 'block' },
                height: '100%',
                bgcolor: '#F9FAFB'
            }}>
                {selectedChat && selectedUser ? (
                    <ChatWindow
                        user={{
                            name: selectedUser.user,
                            avatar: selectedUser.avatar
                        }}
                        onBack={handleBack}
                    />
                ) : (
                    <Box sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9CA3AF',
                        p: 4,
                        textAlign: 'center'
                    }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'rgba(107, 70, 193, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3
                        }}>
                            <SendIcon sx={{ fontSize: 40, color: '#6B46C1' }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>
                            Your Messages
                        </Typography>
                        <Typography variant="body1">
                            Select a conversation to start chatting
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
}
