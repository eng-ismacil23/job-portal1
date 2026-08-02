import React from 'react';
import { BRAND } from '../theme';

// Reusable glassmorphism card used across Home, Dashboard, and all pages.
const GlassCard = ({ children, style, className = '' }) => (
  <div
    className={className}
    style={{
      background: 'rgba(16, 32, 95, 0.5)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: '1px solid rgba(250, 249, 42, 0.14)',
      borderRadius: BRAND.radius,
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      ...style,
    }}
  >
    {children}
  </div>
);

export default GlassCard;