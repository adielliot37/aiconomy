"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect } from "react";
import Chat from "./Chat";
import Header from "./header";

export default function Client() {
  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    (async () => {
      await primaryWallet?.switchNetwork(10200);
    })();
  }, [primaryWallet]);

  return (
    <div className="space-y-2">
      <Chat />
    </div>
  );
}
