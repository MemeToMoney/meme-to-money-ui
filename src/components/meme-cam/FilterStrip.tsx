'use client';

import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import filterPresets, { FilterPreset } from '@/data/filter-presets';

interface FilterStripProps {
  imageSrc: string;
  selectedFilter: string;
  onSelectFilter: (filter: FilterPreset) => void;
}

function FilterThumbnail({
  filter,
  imageSrc,
  isSelected,
  onClick,
}: {
  filter: FilterPreset;
  imageSrc: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 2,
          overflow: 'hidden',
          border: isSelected
            ? '3px solid #8B5CF6'
            : '3px solid transparent',
          transition: 'border-color 0.2s ease',
        }}
      >
        <img
          src={imageSrc}
          alt={filter.label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: filter.css,
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: isSelected ? '#8B5CF6' : '#9CA3AF',
          fontWeight: isSelected ? 700 : 400,
          fontSize: '0.65rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {filter.label}
      </Typography>
    </Box>
  );
}

export default function FilterStrip({ imageSrc, selectedFilter, onSelectFilter }: FilterStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll selected filter into view
  useEffect(() => {
    const idx = filterPresets.findIndex((f) => f.name === selectedFilter);
    if (idx > 0 && scrollRef.current) {
      const child = scrollRef.current.children[idx] as HTMLElement;
      child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedFilter]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        py: 1.5,
        px: 2,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {filterPresets.map((filter) => (
        <FilterThumbnail
          key={filter.name}
          filter={filter}
          imageSrc={imageSrc}
          isSelected={selectedFilter === filter.name}
          onClick={() => onSelectFilter(filter)}
        />
      ))}
    </Box>
  );
}
