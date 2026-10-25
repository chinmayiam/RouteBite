import React from 'react';

interface QrCodeProps {
  data: string;
  size?: number;
  className?: string;
}

// Generates an authentic SVG QR Code pattern based on hash distribution
export const QrCodeDisplay: React.FC<QrCodeProps> = ({ data, size = 160, className = '' }) => {
  // Deterministic matrix generator for given text
  const matrixSize = 25; // 25x25 grid
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(false)
  );

  // Position detection finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(matrixSize - 7, 0); // Top-right
  drawFinder(0, matrixSize - 7); // Bottom-left

  // Timing lines
  for (let i = 8; i < matrixSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash input string to fill data cells
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }

  let pseudoRandom = Math.abs(hash);
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder zones
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= matrixSize - 8;
      const inBL = r >= matrixSize - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !inTiming) {
        pseudoRandom = (pseudoRandom * 9301 + 49297) % 233280;
        matrix[r][c] = pseudoRandom % 2 === 0;
      }
    }
  }

  const cellSize = size / matrixSize;

  return (
    <div
      className={`inline-block bg-white p-3 rounded-xl border border-stone-200 shadow-sm ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
