import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";

const IndexPage = () => {
  const [isElectron, setIsElectron] = useState(false);
  const handleMessage = useCallback((_event, args) => alert(args), []);

  useEffect(() => {
    setIsElectron(!!window.electron);
  }, []);

  useEffect(() => {
    if (isElectron) {
      window.electron.receiveHello(handleMessage);

      return () => {
        window.electron.stopReceivingHello(handleMessage);
      };
    }
  }, [handleMessage, isElectron]);

  const onSayHiClick = () => {
    if (isElectron) {
      window.electron.sayHello();
    } else {
      alert("This feature is only available in the desktop application!");
    }
  };

  return (
    <Layout title="Home | Next.js + TypeScript + Electron Example">
      <h1>Hello Next.gggggjs 👋</h1>
      <button onClick={onSayHiClick}>
        {isElectron ? "Say hi to electron" : "Desktop App Only"}
      </button>
      <p>
      </p>
    </Layout>
  );
};

export default IndexPage;
