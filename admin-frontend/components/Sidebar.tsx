import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";
import axios from "axios";
type agent = {
  agent_id: string;
  speciality: string;
  URL: string;
  owner: string;
  agent_address: string;
  cost: number;
  source: string;
};

const Sidebar = () => {
  const { address, isConnected } = useAccount();
  const path = usePathname();
  const [agents, setAgents] = useState<agent[] | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_MARKETPLACE_BACKEND_URL}/agents`
      );
      console.log(res.data.agents, address);
      console.log(
        res.data.agents.filter(
          (t: agent) => t.owner.toLowerCase() == address?.toLowerCase()
        )
      );
      setAgents(
        res.data.agents.filter(
          (t: agent) => t.owner.toLowerCase() == address?.toLowerCase()
        )
      );
    };
    if (!agents && isConnected) {
      fetchAgents();
    }
  }, [agents, address]);
  const Sidebar_comps = [
    {
      title: "Home",
      route: "/",
    },
    {
      title: "Agents",
      route: "/agents",
    },
  ];
  return (
    <div className="flex flex-col items-center bg-gray-200 justify-between h-[100vh] p-[25px] w-[30vh] rounded-r-md text-left">
      <div>
        {" "}
        <a
          href="/"
          className="flex flex-row gap-2 items-center text-xl font-bold"
        >
          <Image
            priority
            src={logo}
            alt="EnigmAi Logo"
            width={40}
            className="my-8"
          />
          <p>Aiconomy</p>
        </a>
        <hr className="w-[80%] ml-5 border-2 border-black" />
      </div>
      <div className="flex flex-col items-start">
        {Sidebar_comps.map((comp, index) => (
          <div key={index} className="mb-[30px] text-2xl">
            <Link
              href={comp.route}
              className={path == comp.route ? "text-black" : "text-gray-700"}
            >
              {comp.title}
            </Link>
          </div>
        ))}
        {agents &&
          agents?.map((value, index) => (
            <div key={index} className="ml-4 cursor-pointer">{"=> "}{value.agent_id}</div>
          ))}
      </div>
      <div className="justify-end space-y-4">
        <ConnectButton showBalance={false} chainStatus={"none"} />
      </div>
    </div>
  );
};

export default Sidebar;
