import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});


export const metadata = {
  title: "Chingu Demographics",
  description: "Get to know where your Chingu members live",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
