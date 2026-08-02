// ---------------------------------------------
// Brand Tokens - JobPortal Design System
// Shared across DashboardLayout and Dashboard
// ---------------------------------------------
export const BRAND = {
  primary: '#FAF92A',
  secondary: '#FDBF2D',
  dark: '#06124A',
  bg: '#08153D',
  card: '#10205F',
  text: '#FFFFFF',
  textSecondary: '#AEB8D0',
  success: '#22C55E',
  danger: '#EF4444',
  radius: 20,
};

export const LogoMark = ({ size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 6px 16px rgba(250, 249, 42, 0.3)`,
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
      <path d="M4 8.5C4 7.4 4.9 6.5 6 6.5H18C19.1 6.5 20 7.4 20 8.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8.5Z" stroke={BRAND.dark} strokeWidth="1.8" />
      <path d="M9 6.5V5.2C9 4.5 9.5 4 10.2 4H13.8C14.5 4 15 4.5 15 5.2V6.5" stroke={BRAND.dark} strokeWidth="1.8" />
      <path d="M6.5 13.5L10 11L12.5 12.8L17.5 9" stroke={BRAND.dark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 9H17.5V11.8" stroke={BRAND.dark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const GlassCard = ({ children, style, className = '' }) => (
  <div className={`jp-glass-card ${className}`} style={style}>
    {children}
  </div>
);