import React, { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";
import TitleBar from "./TitleBar";

type Props = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children }: Props) => (
  <div className="flex h-screen flex-col">
    <TitleBar />
    <main className="flex-1 overflow-hidden">{children}</main>
  </div>
);

export default Layout;
