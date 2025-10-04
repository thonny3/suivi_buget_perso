// Variables de couleurs du thème MyJalako
export const colors = {
  // Couleurs principales
  primary: '#93A664',      // Couleur globale principale
  secondary: '#426128',    // Couleur des boutons
  light: '#DCEDE7',        // Couleur classique/arrière-plan
  
  // Variations de couleurs
  primaryDark: '#7A8A52',  // Version plus sombre du primary
  primaryLight: '#A8B87A', // Version plus claire du primary
  secondaryDark: '#2F4A1C', // Version plus sombre du secondary
  secondaryLight: '#5A7A3A', // Version plus claire du secondary
  
  // Couleurs de statut
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Couleurs neutres
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
}

// Classes CSS Tailwind personnalisées
export const customClasses = {
  // Boutons
  buttonPrimary: 'bg-[#426128] hover:bg-[#2F4A1C] text-white',
  buttonSecondary: 'bg-[#93A664] hover:bg-[#7A8A52] text-white',
  buttonLight: 'bg-[#DCEDE7] hover:bg-[#C5D9D1] text-[#426128]',
  
  // Bordures
  borderPrimary: 'border-[#93A664]',
  borderSecondary: 'border-[#426128]',
  borderLight: 'border-[#DCEDE7]',
  
  // Textes
  textPrimary: 'text-[#426128]',
  textSecondary: 'text-[#93A664]',
  textLight: 'text-[#DCEDE7]',
  
  // Arrière-plans
  bgPrimary: 'bg-[#93A664]',
  bgSecondary: 'bg-[#426128]',
  bgLight: 'bg-[#DCEDE7]',
  
  // Focus
  focusPrimary: 'focus:ring-[#93A664] focus:border-[#93A664]',
  focusSecondary: 'focus:ring-[#426128] focus:border-[#426128]'
}
