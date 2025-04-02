import React, { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";
import TitleBar from "./TitleBar";

type Props = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "This is the default title" }: Props) => (
  <div>
    <Head>
      <title>{title}hiddddddddd</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <TitleBar />
    <main>{children}</main>
    <style jsx>{`
      main {
        padding: 20px;
      }
    `}</style>
  </div>
);

export default Layout;
