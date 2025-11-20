import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Larissa Interface - AI Chat Platform',
  description: 'Production-ready interface for Larissa 70B Router with Volcano SDK integration',
  keywords: ['AI', 'Chat', 'Larissa', 'Volcano SDK', 'GPT', 'Accountant'],
  authors: [{ name: 'Larissa Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
