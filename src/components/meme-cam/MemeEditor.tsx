'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import Konva from 'konva';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  FormatSize as FontSizeIcon,
  FormatBold as BoldIcon,
} from '@mui/icons-material';

interface MemeEditorProps {
  imageSrc: string;
  filterCss: string;
  topText: string;
  bottomText: string;
  onTopTextChange: (text: string) => void;
  onBottomTextChange: (text: string) => void;
  stageRef: React.RefObject<Konva.Stage>;
}

const FONTS = ['Impact', 'Arial Black', 'Comic Sans MS', 'Montserrat'];
const COLORS = ['#FFFFFF', '#000000', '#FFFF00', '#FF0000', '#00AAFF'];
const CANVAS_SIZE = 400;

function useImage(src: string, filterCss: string): [HTMLImageElement | null, boolean] {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    setLoaded(false);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (filterCss && filterCss !== 'none') {
        // Apply CSS filter by drawing to offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.filter = filterCss;
          ctx.drawImage(img, 0, 0);
          const filteredImg = new window.Image();
          filteredImg.onload = () => {
            setImage(filteredImg);
            setLoaded(true);
          };
          filteredImg.src = canvas.toDataURL('image/jpeg', 0.92);
          return;
        }
      }
      setImage(img);
      setLoaded(true);
    };

    img.src = src;
  }, [src, filterCss]);

  return [image, loaded];
}

export default function MemeEditor({
  imageSrc,
  filterCss,
  topText,
  bottomText,
  onTopTextChange,
  onBottomTextChange,
  stageRef,
}: MemeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_SIZE);
  const [selectedFont, setSelectedFont] = useState('Impact');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(32);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [editingField, setEditingField] = useState<'top' | 'bottom'>('top');

  const [image, loaded] = useImage(imageSrc, filterCss);

  // Responsive canvas width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth, CANVAS_SIZE);
        setCanvasWidth(w);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate image dimensions to fit canvas (cover)
  const getImageConfig = useCallback(() => {
    if (!image) return { x: 0, y: 0, width: canvasWidth, height: canvasWidth };

    const imgRatio = image.width / image.height;
    let drawW = canvasWidth;
    let drawH = canvasWidth;

    if (imgRatio > 1) {
      drawH = canvasWidth;
      drawW = canvasWidth * imgRatio;
    } else {
      drawW = canvasWidth;
      drawH = canvasWidth / imgRatio;
    }

    return {
      x: (canvasWidth - drawW) / 2,
      y: (canvasWidth - drawH) / 2,
      width: drawW,
      height: drawH,
    };
  }, [image, canvasWidth]);

  const textCommonProps = {
    fontFamily: selectedFont,
    fontSize: fontSize * (canvasWidth / CANVAS_SIZE),
    fill: textColor,
    stroke: textColor === '#000000' ? '#FFFFFF' : '#000000',
    strokeWidth: strokeWidth * (canvasWidth / CANVAS_SIZE),
    width: canvasWidth - 20,
    align: 'center' as const,
    wrap: 'word' as const,
    textTransform: selectedFont === 'Impact' ? ('uppercase' as const) : undefined,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    listening: true,
    draggable: true,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Canvas */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          maxWidth: CANVAS_SIZE,
          aspectRatio: '1',
          bgcolor: '#000',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
        }}
      >
        {loaded && (
          <Stage ref={stageRef} width={canvasWidth} height={canvasWidth}>
            <Layer>
              {/* Background image with filter applied */}
              <KonvaImage
                image={image!}
                {...getImageConfig()}
              />
              {/* Top text */}
              {topText && (
                <KonvaText
                  text={selectedFont === 'Impact' ? topText.toUpperCase() : topText}
                  x={10}
                  y={15}
                  {...textCommonProps}
                />
              )}
              {/* Bottom text */}
              {bottomText && (
                <KonvaText
                  text={selectedFont === 'Impact' ? bottomText.toUpperCase() : bottomText}
                  x={10}
                  y={canvasWidth - fontSize * (canvasWidth / CANVAS_SIZE) * 2 - 15}
                  {...textCommonProps}
                />
              )}
              {/* Watermark */}
              <KonvaText
                text="MemeToMoney"
                x={canvasWidth - 100 * (canvasWidth / CANVAS_SIZE)}
                y={canvasWidth - 18 * (canvasWidth / CANVAS_SIZE)}
                fontSize={10 * (canvasWidth / CANVAS_SIZE)}
                fontFamily="Arial"
                fontStyle="bold"
                fill="rgba(255,255,255,0.5)"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={0.5}
                listening={false}
              />
            </Layer>
          </Stage>
        )}
      </Box>

      {/* Text editing controls */}
      <Box sx={{ width: '100%', px: 1 }}>
        {/* Text input toggle */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <Box
            onClick={() => setEditingField('top')}
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 1.5,
              border: editingField === 'top' ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
              bgcolor: editingField === 'top' ? '#FAF5FF' : 'white',
              cursor: 'pointer',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem' }}>
              Top text
            </Typography>
            <input
              value={topText}
              onChange={(e) => onTopTextChange(e.target.value)}
              onFocus={() => setEditingField('top')}
              placeholder="Top text..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1a1a1a',
              }}
            />
          </Box>
          <Box
            onClick={() => setEditingField('bottom')}
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 1.5,
              border: editingField === 'bottom' ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
              bgcolor: editingField === 'bottom' ? '#FAF5FF' : 'white',
              cursor: 'pointer',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem' }}>
              Bottom text
            </Typography>
            <input
              value={bottomText}
              onChange={(e) => onBottomTextChange(e.target.value)}
              onFocus={() => setEditingField('bottom')}
              placeholder="Bottom text..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1a1a1a',
              }}
            />
          </Box>
        </Box>

        {/* Font selector */}
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {FONTS.map((font) => (
              <Box
                key={font}
                onClick={() => setSelectedFont(font)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  flexShrink: 0,
                  border: selectedFont === font ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                  bgcolor: selectedFont === font ? '#FAF5FF' : 'white',
                  cursor: 'pointer',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontFamily: font, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap' }}
                >
                  {font === 'Comic Sans MS' ? 'Comic' : font}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Color picker */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 36 }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => setTextColor(color)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: color,
                  border: textColor === color
                    ? '3px solid #8B5CF6'
                    : '2px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.15)' },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Font size slider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <FontSizeIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
          <Slider
            value={fontSize}
            onChange={(_, val) => setFontSize(val as number)}
            min={16}
            max={56}
            size="small"
            sx={{
              flex: 1,
              color: '#8B5CF6',
              '& .MuiSlider-thumb': { width: 16, height: 16 },
            }}
          />
          <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 24 }}>
            {fontSize}
          </Typography>
        </Box>

        {/* Stroke width slider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BoldIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
          <Slider
            value={strokeWidth}
            onChange={(_, val) => setStrokeWidth(val as number)}
            min={0}
            max={8}
            size="small"
            sx={{
              flex: 1,
              color: '#8B5CF6',
              '& .MuiSlider-thumb': { width: 16, height: 16 },
            }}
          />
          <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 24 }}>
            {strokeWidth}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
