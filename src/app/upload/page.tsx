'use client';

import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function UploadPageContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    monetizationEnabled: true
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only images (JPG, PNG, GIF) and videos (MP4, WebM) are allowed');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      alert('Please select a file and provide a title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // TODO: Implement actual upload API call
      console.log('Uploading file:', selectedFile);
      console.log('Form data:', formData);

      // Simulate API call
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setSelectedFile(null);
          setFormData({
            title: '',
            description: '',
            category: '',
            tags: '',
            monetizationEnabled: true
          });
          alert('Content uploaded successfully!');
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <UploadIcon /> Upload Content
      </Typography>

      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Select File</Typography>

            {!selectedFile ? (
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.50' }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drop files here or click to browse
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: JPG, PNG, GIF, MP4, WebM (Max 50MB)
                </Typography>
              </Box>
            ) : (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {selectedFile.type.startsWith('image/') ? (
                        <ImageIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      ) : (
                        <VideoIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                      )}
                      <Box>
                        <Typography variant="subtitle1">{selectedFile.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {formatFileSize(selectedFile.size)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      onClick={removeFile}
                      startIcon={<DeleteIcon />}
                      color="error"
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </Paper>
        </Grid>

        {/* Content Details Form */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Content Details</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  placeholder="Give your content a catchy title..."
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Describe your content..."
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    label="Category"
                  >
                    <MenuItem value="memes">Memes</MenuItem>
                    <MenuItem value="comedy">Comedy</MenuItem>
                    <MenuItem value="educational">Educational</MenuItem>
                    <MenuItem value="entertainment">Entertainment</MenuItem>
                    <MenuItem value="lifestyle">Lifestyle</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tags"
                  value={formData.tags}
                  onChange={handleInputChange('tags')}
                  placeholder="funny, viral, trending..."
                  helperText="Separate tags with commas"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Monetization Settings */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Monetization</Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Enable monetization to earn tips and revenue from your content.
              You can change this setting later.
            </Alert>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label="Tips Enabled"
                color={formData.monetizationEnabled ? 'success' : 'default'}
                onClick={() => setFormData(prev => ({ ...prev, monetizationEnabled: !prev.monetizationEnabled }))}
                clickable
              />
            </Box>
          </Paper>
        </Grid>

        {/* Upload Progress */}
        {isUploading && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Uploading...</Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                {Math.round(uploadProgress)}% completed
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Upload Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedFile(null);
                setFormData({
                  title: '',
                  description: '',
                  category: '',
                  tags: '',
                  monetizationEnabled: true
                });
              }}
              disabled={isUploading}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || !formData.title.trim() || isUploading}
              startIcon={<UploadIcon />}
            >
              {isUploading ? 'Uploading...' : 'Upload Content'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadPageContent />
    </ProtectedRoute>
  );
}