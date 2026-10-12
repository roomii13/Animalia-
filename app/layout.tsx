import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Animalia | Comunidad que cuida',
  description: 'Una comunidad para el bienestar animal, la protección, el rescate y la adopción responsable.',
  icons: {
    icon: [
      { url: '/icons/animalia-logo.png', sizes: '751x751', type: 'image/png' },
      { url: '/icons/animalia-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/animalia-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f8f5ef',
};

export default function RootLayout({ children }: { children: import('react').ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
