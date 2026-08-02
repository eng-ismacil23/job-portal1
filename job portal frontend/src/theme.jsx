// ---------------------------------------------
// JobPortal Design System - shared brand tokens
// Used across Navbar, Footer, HomePage, Dashboard, etc.
// ---------------------------------------------
import React from 'react';

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

// Fonts + base resets, injected once per page (Home / Dashboard)
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
    .jp-heading { font-family: 'Poppins', sans-serif; }
    .jp-body { font-family: 'Inter', sans-serif; }
    * { box-sizing: border-box; }
  `}</style>
);