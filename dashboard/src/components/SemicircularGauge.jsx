import React from 'react';

/**
 * Semicircular Gauge (180-degree arc)
 * Renders an arc from -180 deg (left) to 0 deg (right)
 */
export default function SemicircularGauge({
  percentage = 0,
  size = 140,
  strokeWidth = 10,
  color = '#4F46E5',
  gradientId,
  label = '',
  sublabel = ''
}) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - clamped / 100);

  // Path for 180 deg semicircle: starts at (-r, 0) and curves to (+r, 0)
  const pathD = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  const uniqueId = gradientId || `gauge-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ position: 'relative', width: size, height: size * 0.65, margin: '0 auto' }}>
      <svg
        width={size}
        height={size * 0.75}
        viewBox={`0 0 ${size} ${size * 0.75}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Background Track Arc */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--bg-muted)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress Arc */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${uniqueId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </svg>

      {/* Center Label / Percentage */}
      <div
        style={{
          position: 'absolute',
          bottom: 2,
          left: 0,
          right: 0,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontSize: size > 120 ? '18px' : '15px',
            fontWeight: 800,
            color: 'var(--ink)',
            lineHeight: 1
          }}
        >
          {Math.round(clamped)}%
        </span>
        {label && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--ink-soft)',
              marginTop: 2
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
