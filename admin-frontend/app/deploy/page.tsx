"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  createConfig,
  http,
  useAccount,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import AgentMarketPlace from "@/constant/AgentMarketPlace.json";
import { gnosisChiado } from "viem/chains";
import { waitForTransactionReceipt } from "wagmi/actions";
const page = () => {
  const [agentId, setAgentId] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [url, setUrl] = useState("");
  const [cost, setCost] = useState(0);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const handleChange = (
    type: "agentId" | "speciality" | "url" | "cost",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    switch (type) {
      case "agentId":
        setAgentId(e.target.value);
        break;
      case "speciality":
        setSpeciality(e.target.value);
        break;
      case "url":
        setUrl(e.target.value);
        break;
      case "cost":
        setCost(Number(e.target.value));
        break;

      default:
        break;
    }
  };

  const publicClient = usePublicClient({ chainId: gnosisChiado.id });

  const createAgent = async (e: any) => {
    e.preventDefault();
    const hash = await writeContractAsync({
      abi: AgentMarketPlace.abi,
      chain: gnosisChiado,
      address: AgentMarketPlace.address as `0x${string}`,
      functionName: "deployAgentFactory",
      args: [agentId, cost, address],
    });
    await waitForTransactionReceipt(
      createConfig({
        chains: [gnosisChiado],
        transports: { [gnosisChiado.id]: http() },
      }),
      { hash }
    );
    const agent_address = await publicClient?.readContract({
      abi: AgentMarketPlace.abi,
      address: AgentMarketPlace.address as `0x${string}`,
      functionName: "agentIdToAgentAddress",
      args: [agentId],
    });
    console.log(agent_address);
    await axios.post(
      `${process.env.NEXT_PUBLIC_MARKETPLACE_BACKEND_URL}/register-agent`,
      {
        agent_id: agentId,
        speciality,
        URL: url,
        owner: address!,
        agent_address,
        cost,
        source: "AGENT",
      }
    );
  };
  return (
    <div
      className="flex items-start justify-items-start min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      onSubmit={createAgent}
    >
      <main className="flex flex-col gap-8 ">
        <h1 className="text-2xl font-semibold">
          Monetize AI Agent on Aiconomy
        </h1>
        <form className="w-full mx-auto">
          <div className="relative z-0 w-full mb-8 group">
            <input
              type="text"
              name="agent_id"
              id="agent_id"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={(e) => {
                handleChange("agentId", e);
              }}
              required
            />
            <label
              htmlFor="agent_id"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Agent ID (Think of a cool name for you agent)
            </label>
          </div>
          <div className="relative z-0 w-full mb-8 group">
            <input
              type="speciality"
              name="speciality"
              id="speciality"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={(e) => {
                handleChange("speciality", e);
              }}
              required
            />
            <label
              htmlFor="speciality"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Speciality (You think your Ai agent is special? WHY?)
            </label>
          </div>
          <div className="relative z-0 w-full mb-8 group">
            <input
              type="text"
              name="URL"
              id="URL"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={(e) => {
                handleChange("url", e);
              }}
              required
            />
            <label
              htmlFor="floating_repeat_password"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              REST API URL
            </label>
          </div>
          <div className="relative z-0 w-full mb-8 group">
            <input
              type="text"
              name="cost"
              id="cost"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={(e) => {
                handleChange("cost", e);
              }}
              required
            />
            <label
              htmlFor="cost"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Cost (Charge per output token)
            </label>
          </div>
          <button
            type="submit"
            className="border py-2 px-6 rounded-md bg-gray-200"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default page;
