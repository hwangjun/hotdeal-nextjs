import type { Metadata, Viewport } from "next";
import "./globals.css";
import '../lib/init'; // 시스템 초기화 자동 실행
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: '🔥 핫딜사이트 - 실시간 할인 정보',
  description: '실시간으로 업데이트되는 7개 주요 쇼핑몰의 핫딜 정보를 한곳에서! 쿠팡, 네이버쇼핑, G마켓, 29CM 등의 최저가 상품을 놓치지 마세요.',
  keywords: ['핫딜', '할인', '쇼핑', '최저가', '쿠팡', '네이버쇼핑', 'G마켓', '29CM', '옥션', '위메프', '티몬'],
  authors: [{ name: '핫딜사이트' }],
  creator: '핫딜사이트',
  publisher: '핫딜사이트',
  
  // Open Graph
  openGraph: {
    title: '🔥 핫딜사이트 - 실시간 할인 정보',
    description: '7개 주요 쇼핑몰의 핫딜을 실시간으로! 최저가 상품을 놓치지 마세요.',
    url: 'https://hotdeals-site.vercel.app',
    siteName: '핫딜사이트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '핫딜사이트 - 실시간 할인 정보',
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '🔥 핫딜사이트 - 실시간 할인 정보',
    description: '7개 주요 쇼핑몰의 핫딜을 실시간으로! 최저가 상품을 놓치지 마세요.',
    images: ['/og-image.jpg'],
  },
  
  // PWA
  manifest: '/manifest.json',
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  // Other
  category: 'shopping',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Additional meta tags for mobile optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="핫딜사이트" />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "핫딜사이트",
              "description": "실시간 할인 정보 및 핫딜 모음",
              "url": "https://hotdeals-site.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://hotdeals-site.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="antialiased bg-gray-50">
        {/* Skip to content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50 rounded-br-lg"
        >
          메인 콘텐츠로 바로가기
        </a>
        
        <div id="main-content" className="min-h-screen">
          {children}
        </div>
        
        {/* Vercel Speed Insights */}
        <SpeedInsights />
        
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}