import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "./ProviderWrapper";
import { Toaster } from "react-hot-toast";

// ✅ Import Jost and configure weights
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // You can include more weights if needed
});

export const metadata: Metadata = {
  title: "Desi Tracker",
  description: "Desi tracker business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jost.variable} font-jost`}>
        <ProviderWrapper>
          <Toaster />
          {children}
        </ProviderWrapper>
      </body>
    </html>
  );
}
