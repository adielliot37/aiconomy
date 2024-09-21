"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import debounce from "lodash-debounce-tiny";
import { HashLoader } from "react-spinners";
import AiAgents from "./AiAgents";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import USDC_ABI from "../USDC_ABI.json";

const Chat = () => {
  const { address } = useAccount();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<
    "fetching-quote" | "choose-quote" | "fetching-answer" | "completed" | null
  >(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [showQuoteUI, setShowQuoteUI] = useState(false);
  const [agents, setAgents] = useState<
    {
      agent_id: number;
      speciality: string;
      URL: string;
      owner: string;
      agent_address: string;
      cost: number;
      source: string;
    }[]
  >([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const isLoading = status === "fetching-answer" || status === "fetching-quote";
  const [hashes, setHashes] = useState<string[]>([]);
  const [agentOrder, setAgentOrder] = useState<number[]>([]);
  const [response, setResponse] = useState<string | null>(null);

  const { writeContract } = useWriteContract();

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_MARKETPLACE_BACKEND_URL}/agents`
      );
      setAgents(response.data.agents);
    };

    fetchAgents();
  }, []);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status === "fetching-answer") {
      const timer = setInterval(() => {
        setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 2500);

      return () => clearInterval(timer);
    }
  }, [status]);

  const steps = [
    { name: "Scrapper", description: "Gathering information" },
    { name: "SEO Improver", description: "Optimizing content" },
    { name: "Copy Improver", description: "Refining the text" },
  ];

  const isPreFetchingQuote = status === "fetching-quote" || status === null;

  const fetchQuote = debounce(async (message: string) => {
    if (!message) {
      return;
    }

    setStatus("fetching-quote");
    setShowQuoteUI(false);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_MARKETPLACE_BACKEND_URL}/quotation`,
      { prompt: message }
    );
    setQuote((response.data.quote / 10 ** 6).toString());
    setStatus("choose-quote");
    setShowQuoteUI(true);
  }, 1500);

  const executePrompt = async () => {
    if (!inputRef.current?.value || !quote) {
      return;
    }
    setShowQuoteUI(false);
    setStatus("fetching-answer");
    setPrompt(inputRef.current.value);

    try {
      // Approve USDC
      await writeContract({
        address: "0xF72C8Fe9Af2FC838A60b02B38c3A3C4af1979ebD",
        abi: USDC_ABI,
        functionName: "approve",
        args: [
          "0x4a78FB45F544BAc5ab59b71f1Fd53F67b6785129",
          parseUnits(quote, 6),
        ],
      });

      // Execute the prompt
      const {
        data: { response, agentOrder, hashes },
      } = await axios.post(
        `${process.env.NEXT_PUBLIC_MARKETPLACE_BACKEND_URL}/execute`,
        { prompt: inputRef.current.value, chainId: 84532, userAddress: address }
      );
      console.log(response, agentOrder, hashes);
      setResponse(response);
      setAgentOrder(agentOrder);
      setHashes(hashes);
      setStatus("completed");
    } catch (error) {
      console.error("Error executing prompt:", error);
      setStatus(null);
    }
  };

  return (
    <div
      className={`flex flex-col ${
        isPreFetchingQuote ? "h-[50vh]" : "h-[80vh]"
      } bg-white`}
    >
      {isPreFetchingQuote ? (
        <div className="mt-24 mb-5">
          <h1 className="text-5xl text-center text-[#5A43E6]">
            Stripe for AI Agents
          </h1>
        </div>
      ) : (
        <div className="flex-grow overflow-auto p-4">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full">
                  <img src="https://picsum.photos/200" alt="User" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{address}</span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-sm pl-10 pt-2">{prompt}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full">
                  <img src="https://picsum.photos/200" alt="Agent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">AIConomy</span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-sm pl-10 pt-2">{prompt}</div>
            </div>
          </div>
        </div>
      )}

      {showQuoteUI && (
        <div className="flex justify-between items-center bg-white border rounded-xl p-4">
          <div>
            <p className="text-sm font-semibold">Estimated cost:</p>
            <p className="text-lg font-bold">{quote} USDC</p>
          </div>
          <div className="space-x-2">
            {/* <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
              onClick={() => {
                setShowQuoteUI(false);
                fetchQuote(message);
              }}
            >
              Get New Quote
            </button> */}
            <button
              className="bg-[#694FFF] hover:bg-[#5A43E6] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
              onClick={executePrompt}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {(status === "fetching-answer" || status === "completed") && (
        <div className="mb-4 px-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.name}>
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? "bg-[#5A43E6] text-white"
                        : "bg-gray-200"
                    }`}
                    initial={{ scale: 1 }}
                    animate={{ scale: index === currentStep ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </motion.div>
                  <p className="text-sm mt-2">{step.name}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-grow h-0.5 bg-gray-200">
                    <motion.div
                      className="h-full bg-[#5A43E6]"
                      initial={{ width: "0%" }}
                      animate={{ width: index < currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            {status === "completed"
              ? "Process completed"
              : steps[currentStep].description}
          </p>
        </div>
      )}

      <footer
        className={`p-4 relative mt-4 ${
          isPreFetchingQuote ? "border-none" : "border-t"
        }`}
      >
        <div className="flex items-center bg-white border rounded-full p-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Tell us what you need..."
            className="flex-grow px-4 py-2 bg-transparent outline-none"
            onChange={(e) => {
              fetchQuote(e.target.value);
            }}
          />

          {isLoading ? (
            <div className="w-18 p-2 rounded-full">
              <HashLoader
                color="#5A43E6"
                size={22}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          ) : null}
        </div>
      </footer>

      {isPreFetchingQuote && <AiAgents agents={agents} />}
    </div>
  );
};

export default Chat;
