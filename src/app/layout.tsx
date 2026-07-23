import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TMC ボランティア | 東洋医療専門学校",
  description: "学生のボランティア活動記録アプリ",
  applicationName: "TMC ボランティア",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TMC ボランティア",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
