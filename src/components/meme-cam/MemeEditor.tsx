'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Line as KonvaLine, Group } from 'react-konva';
import Konva from 'konva';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  FormatSize as FontSizeIcon,
  FormatBold as BoldIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Brush as DrawIcon,
  EmojiEmotions as StickerIcon,
  TextFields as TextIcon,
  Delete as DeleteIcon,
  FormatItalic as ItalicIcon,
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

const FONTS = ['Impact', 'Arial Black', 'Comic Sans MS', 'Montserrat', 'Courier New', 'Georgia'];
const COLORS = ['#FFFFFF', '#000000', '#FFFF00', '#FF0000', '#00AAFF', '#00FF00', '#FF69B4', '#FFA500'];
const CANVAS_SIZE = 400;

// Sticker categories with emoji stickers
const STICKER_CATEGORIES = [
  {
    label: 'Faces',
    stickers: [
      '\u{1F602}', '\u{1F923}', '\u{1F60E}', '\u{1F914}', '\u{1F631}', '\u{1F62D}',
      '\u{1F620}', '\u{1F97A}', '\u{1F60F}', '\u{1F928}', '\u{1F92F}', '\u{1F976}',
      '\u{1F921}', '\u{1F47B}', '\u{1F480}', '\u{1F4A9}',
    ],
  },
  {
    label: 'Hands',
    stickers: [
      '\u{1F44D}', '\u{1F44E}', '\u{1F44F}', '\u{1F4AA}', '\u{270C}\uFE0F', '\u{1F918}',
      '\u{1F91D}', '\u{1F64F}', '\u{1F448}', '\u{1F449}', '\u{261D}\uFE0F', '\u{1F596}',
    ],
  },
  {
    label: 'Objects',
    stickers: [
      '\u{1F525}', '\u{2764}\uFE0F', '\u{1F4AF}', '\u{2B50}', '\u{1F3AF}', '\u{1F389}',
      '\u{1F4A5}', '\u{1F4B0}', '\u{1F451}', '\u{1F3C6}', '\u{1F4A3}', '\u{26A1}',
      '\u{1F680}', '\u{1F308}', '\u{1F4F8}', '\u{1F3B5}',
    ],
  },
  {
    label: 'Meme',
    stickers: [
      '\u{1F4AC}', '\u{1F4AD}', '\u{2757}', '\u{2753}', '\u{1F6A8}', '\u{274C}',
      '\u{2705}', '\u{1F198}', '\u{1F4A2}', '\u{1F440}', '\u{1F449}\u{1F448}',
      '\u{1F916}', '\u{1F47D}', '\u{1F9E0}', '\u{1F37F}', '\u{1F3AD}',
    ],
  },
];

// Drawing line type
interface DrawLine {
  id: string;
  points: number[];
  color: string;
  strokeWidth: number;
}

// Sticker placement type
interface StickerPlacement {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

// History snapshot type
interface EditorSnapshot {
  drawLines: DrawLine[];
  stickers: StickerPlacement[];
  topText: string;
  bottomText: string;
}

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
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');

  // Tab state: 0=Text, 1=Stickers, 2=Draw
  const [activeTab, setActiveTab] = useState(0);

  // Drawing state
  const [drawLines, setDrawLines] = useState<DrawLine[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#FF0000');
  const [drawBrushSize, setDrawBrushSize] = useState(4);
  const currentLineRef = useRef<DrawLine | null>(null);

  // Sticker state
  const [stickers, setStickers] = useState<StickerPlacement[]>([]);
  const [stickerCategory, setStickerCategory] = useState(0);
  const [stickerSize, setStickerSize] = useState(40);

  // Undo/Redo history
  const [history, setHistory] = useState<EditorSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isRestoringRef = useRef(false);

  const [image, loaded] = useImage(imageSrc, filterCss);

  // Save initial snapshot
  useEffect(() => {
    if (history.length === 0) {
      const initial: EditorSnapshot = {
        drawLines: [],
        stickers: [],
        topText,
        bottomText,
      };
      setHistory([initial]);
      setHistoryIndex(0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Push to history on significant changes
  const pushHistory = useCallback(() => {
    if (isRestoringRef.current) return;
    const snapshot: EditorSnapshot = {
      drawLines: [...drawLines],
      stickers: [...stickers],
      topText,
      bottomText,
    };
    setHistory(prev => {
      const newHist = prev.slice(0, historyIndex + 1);
      newHist.push(snapshot);
      // Limit history size
      if (newHist.length > 30) newHist.shift();
      return newHist;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  }, [drawLines, stickers, topText, bottomText, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIdx = historyIndex - 1;
    const snapshot = history[newIdx];
    if (!snapshot) return;
    isRestoringRef.current = true;
    setDrawLines(snapshot.drawLines);
    setStickers(snapshot.stickers);
    onTopTextChange(snapshot.topText);
    onBottomTextChange(snapshot.bottomText);
    setHistoryIndex(newIdx);
    setTimeout(() => { isRestoringRef.current = false; }, 50);
  }, [historyIndex, history, onTopTextChange, onBottomTextChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIdx = historyIndex + 1;
    const snapshot = history[newIdx];
    if (!snapshot) return;
    isRestoringRef.current = true;
    setDrawLines(snapshot.drawLines);
    setStickers(snapshot.stickers);
    onTopTextChange(snapshot.topText);
    onBottomTextChange(snapshot.bottomText);
    setHistoryIndex(newIdx);
    setTimeout(() => { isRestoringRef.current = false; }, 50);
  }, [historyIndex, history, onTopTextChange, onBottomTextChange]);

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

  // Drawing handlers
  const handleDrawStart = useCallback((e: any) => {
    if (activeTab !== 2) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const newLine: DrawLine = {
      id: `line-${Date.now()}`,
      points: [pos.x, pos.y],
      color: drawColor,
      strokeWidth: drawBrushSize,
    };
    currentLineRef.current = newLine;
    setIsDrawing(true);
    setDrawLines(prev => [...prev, newLine]);
  }, [activeTab, drawColor, drawBrushSize]);

  const handleDrawMove = useCallback((e: any) => {
    if (!isDrawing || activeTab !== 2 || !currentLineRef.current) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    currentLineRef.current.points = [...currentLineRef.current.points, pos.x, pos.y];
    setDrawLines(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...currentLineRef.current! };
      return updated;
    });
  }, [isDrawing, activeTab]);

  const handleDrawEnd = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      currentLineRef.current = null;
      // Push to history after drawing
      setTimeout(() => pushHistory(), 10);
    }
  }, [isDrawing, pushHistory]);

  // Sticker handlers
  const handleAddSticker = useCallback((emoji: string) => {
    const newSticker: StickerPlacement = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji,
      x: canvasWidth / 2,
      y: canvasWidth / 2,
      size: stickerSize * (canvasWidth / CANVAS_SIZE),
      rotation: 0,
    };
    setStickers(prev => [...prev, newSticker]);
    setTimeout(() => pushHistory(), 10);
  }, [canvasWidth, stickerSize, pushHistory]);

  const handleRemoveSticker = useCallback((id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
    setTimeout(() => pushHistory(), 10);
  }, [pushHistory]);

  const handleStickerDragEnd = useCallback((id: string, e: any) => {
    setStickers(prev => prev.map(s =>
      s.id === id ? { ...s, x: e.target.x(), y: e.target.y() } : s
    ));
    setTimeout(() => pushHistory(), 10);
  }, [pushHistory]);

  // Text change with history
  const handleTopTextChange = useCallback((val: string) => {
    onTopTextChange(val);
  }, [onTopTextChange]);

  const handleBottomTextChange = useCallback((val: string) => {
    onBottomTextChange(val);
  }, [onBottomTextChange]);

  // Debounced history push for text changes
  const textChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isRestoringRef.current) return;
    if (textChangeTimerRef.current) clearTimeout(textChangeTimerRef.current);
    textChangeTimerRef.current = setTimeout(() => {
      if (history.length > 0) pushHistory();
    }, 800);
    return () => {
      if (textChangeTimerRef.current) clearTimeout(textChangeTimerRef.current);
    };
  }, [topText, bottomText]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearDrawing = useCallback(() => {
    setDrawLines([]);
    setTimeout(() => pushHistory(), 10);
  }, [pushHistory]);

  const scale = canvasWidth / CANVAS_SIZE;

  const textCommonProps = {
    fontFamily: selectedFont,
    fontSize: fontSize * scale,
    fill: textColor,
    stroke: textColor === '#000000' ? '#FFFFFF' : '#000000',
    strokeWidth: strokeWidth * scale,
    width: canvasWidth - 20,
    align: 'center' as const,
    wrap: 'word' as const,
    textTransform: selectedFont === 'Impact' ? ('uppercase' as const) : undefined,
    fontStyle: fontStyle as string,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    listening: activeTab !== 2,
    draggable: activeTab !== 2,
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Undo/Redo toolbar */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Undo" arrow>
            <span>
              <IconButton
                size="small"
                onClick={handleUndo}
                disabled={!canUndo}
                sx={{ color: canUndo ? '#6B46C1' : '#D1D5DB' }}
              >
                <UndoIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo" arrow>
            <span>
              <IconButton
                size="small"
                onClick={handleRedo}
                disabled={!canRedo}
                sx={{ color: canRedo ? '#6B46C1' : '#D1D5DB' }}
              >
                <RedoIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        {activeTab === 2 && drawLines.length > 0 && (
          <Tooltip title="Clear all drawing" arrow>
            <IconButton size="small" onClick={handleClearDrawing} sx={{ color: '#EF4444' }}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

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
          cursor: activeTab === 2 ? 'crosshair' : 'default',
          touchAction: activeTab === 2 ? 'none' : 'auto',
        }}
      >
        {loaded && (
          <Stage
            ref={stageRef}
            width={canvasWidth}
            height={canvasWidth}
            onMouseDown={handleDrawStart}
            onMouseMove={handleDrawMove}
            onMouseUp={handleDrawEnd}
            onMouseLeave={handleDrawEnd}
            onTouchStart={handleDrawStart}
            onTouchMove={handleDrawMove}
            onTouchEnd={handleDrawEnd}
          >
            <Layer>
              {/* Background image with filter applied */}
              <KonvaImage
                image={image!}
                {...getImageConfig()}
              />
              {/* Drawing lines */}
              {drawLines.map((line) => (
                <KonvaLine
                  key={line.id}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                  listening={false}
                />
              ))}
              {/* Stickers */}
              {stickers.map((sticker) => (
                <KonvaText
                  key={sticker.id}
                  text={sticker.emoji}
                  x={sticker.x}
                  y={sticker.y}
                  fontSize={sticker.size}
                  offsetX={sticker.size / 2}
                  offsetY={sticker.size / 2}
                  rotation={sticker.rotation}
                  draggable={activeTab !== 2}
                  listening={activeTab !== 2}
                  onDragEnd={(e) => handleStickerDragEnd(sticker.id, e)}
                  onDblClick={() => handleRemoveSticker(sticker.id)}
                  onDblTap={() => handleRemoveSticker(sticker.id)}
                />
              ))}
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
                  y={canvasWidth - fontSize * scale * 2 - 15}
                  {...textCommonProps}
                />
              )}
              {/* Watermark */}
              <KonvaText
                text="MemeToMoney"
                x={canvasWidth - 100 * scale}
                y={canvasWidth - 18 * scale}
                fontSize={10 * scale}
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

      {/* Tool Tabs */}
      <Box sx={{ width: '100%', borderBottom: '1px solid #E5E7EB', mb: 1.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              color: '#6B7280',
              '&.Mui-selected': { color: '#6B46C1' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#6B46C1', height: 2 },
          }}
        >
          <Tab icon={<TextIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Text" />
          <Tab icon={<StickerIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Stickers" />
          <Tab icon={<DrawIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Draw" />
        </Tabs>
      </Box>

      {/* Tab panels */}
      <Box sx={{ width: '100%', px: 1 }}>
        {/* TEXT TAB */}
        {activeTab === 0 && (
          <>
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
                  onChange={(e) => handleTopTextChange(e.target.value)}
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
                  onChange={(e) => handleBottomTextChange(e.target.value)}
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
                      {font === 'Comic Sans MS' ? 'Comic' : font === 'Courier New' ? 'Courier' : font}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Style toggles: italic */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 36 }}>
                Style
              </Typography>
              <Box
                onClick={() => setFontStyle(prev => prev === 'normal' ? 'italic' : 'normal')}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  border: fontStyle === 'italic' ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                  bgcolor: fontStyle === 'italic' ? '#FAF5FF' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <ItalicIcon sx={{ fontSize: 16, color: fontStyle === 'italic' ? '#6B46C1' : '#9CA3AF' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: fontStyle === 'italic' ? '#6B46C1' : '#9CA3AF' }}>
                  Italic
                </Typography>
              </Box>
            </Box>

            {/* Color picker */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 36 }}>
                Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
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
          </>
        )}

        {/* STICKERS TAB */}
        {activeTab === 1 && (
          <>
            {/* Sticker category tabs */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mb: 1.5,
                overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {STICKER_CATEGORIES.map((cat, idx) => (
                <Box
                  key={cat.label}
                  onClick={() => setStickerCategory(idx)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    flexShrink: 0,
                    border: stickerCategory === idx ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                    bgcolor: stickerCategory === idx ? '#FAF5FF' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: stickerCategory === idx ? '#6B46C1' : '#6B7280' }}>
                    {cat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Sticker size slider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 30 }}>
                Size
              </Typography>
              <Slider
                value={stickerSize}
                onChange={(_, val) => setStickerSize(val as number)}
                min={20}
                max={80}
                size="small"
                sx={{
                  flex: 1,
                  color: '#8B5CF6',
                  '& .MuiSlider-thumb': { width: 16, height: 16 },
                }}
              />
              <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 24 }}>
                {stickerSize}
              </Typography>
            </Box>

            {/* Sticker grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 0.5,
                mb: 1.5,
              }}
            >
              {STICKER_CATEGORIES[stickerCategory].stickers.map((emoji, idx) => (
                <Box
                  key={`${emoji}-${idx}`}
                  onClick={() => handleAddSticker(emoji)}
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: '#FAF5FF', transform: 'scale(1.2)' },
                    '&:active': { transform: 'scale(0.9)' },
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>

            {/* Placed stickers list */}
            {stickers.length > 0 && (
              <Box sx={{ borderTop: '1px solid #E5E7EB', pt: 1 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                  Placed stickers (drag to move, double-tap to remove)
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {stickers.map((s) => (
                    <Box
                      key={s.id}
                      onClick={() => handleRemoveSticker(s.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        '&:hover': { borderColor: '#EF4444', bgcolor: '#FEF2F2' },
                      }}
                    >
                      {s.emoji}
                      <DeleteIcon sx={{ fontSize: 12, color: '#9CA3AF' }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}

        {/* DRAW TAB */}
        {activeTab === 2 && (
          <>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1.5, textAlign: 'center' }}>
              Draw directly on the canvas above
            </Typography>

            {/* Draw color picker */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 36 }}>
                Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setDrawColor(color)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: color,
                      border: drawColor === color
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

            {/* Brush size slider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DrawIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
              <Slider
                value={drawBrushSize}
                onChange={(_, val) => setDrawBrushSize(val as number)}
                min={1}
                max={20}
                size="small"
                sx={{
                  flex: 1,
                  color: '#8B5CF6',
                  '& .MuiSlider-thumb': { width: 16, height: 16 },
                }}
              />
              <Typography variant="caption" sx={{ color: '#9CA3AF', minWidth: 24 }}>
                {drawBrushSize}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
