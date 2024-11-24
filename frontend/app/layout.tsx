import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import { getSession } from "@/authOptions";
import Providers from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next-Auth",
  description: "Setting Next-Auth with Node Express, and google and credeintials auth",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
