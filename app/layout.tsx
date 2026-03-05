import type { Metadata } from "next";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Orderly Network",
  description: "Omnichain orderbook infrastructure for DeFi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#000" }}>
        <div style={{ width: "100vw", overflowX: "hidden" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
