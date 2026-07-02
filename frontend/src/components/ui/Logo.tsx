import React from 'react'

interface LogoProps {
  className?: string
  size?: number
}

export const Logo: React.FC<LogoProps> = ({ className, size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Glow */}
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Styled Dumbbell Shaft */}
      <rect
        x="20"
        y="45"
        width="60"
        height="10"
        rx="5"
        fill="url(#logo-grad)"
        transform="rotate(-45 50 50)"
      />

      {/* Dumbbell Left Plates */}
      <rect
        x="15"
        y="30"
        width="10"
        height="40"
        rx="4"
        fill="url(#logo-grad)"
        transform="rotate(-45 50 50)"
      />
      
      {/* Dumbbell Right Plates */}
      <rect
        x="75"
        y="30"
        width="10"
        height="40"
        rx="4"
        fill="url(#logo-grad)"
        transform="rotate(-45 50 50)"
      />

      {/* Overlay Chart Metrics Bars representing growth/analysis */}
      <rect x="42" y="55" width="6" height="25" rx="3" fill="#10b981" className="opacity-80" />
      <rect x="54" y="40" width="6" height="40" rx="3" fill="#06b6d4" className="opacity-90" />
      <rect x="66" y="25" width="6" height="55" rx="3" fill="#22c55e" />
      
      {/* Target Dot */}
      <circle cx="69" cy="20" r="5" fill="#22c55e" />
    </svg>
  )
}
