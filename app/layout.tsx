import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import MainWrapper from "@/components/MainWrapper";

export const metadata: Metadata = {
  title: "Swasth - Endobot & Homosep Data Management",
  description:
    "A Solinas platform for managing robot data, customer info, and inspection details.",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className="scrollbar-none">
      <body className="font-poppins">
        <MainWrapper>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </MainWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
