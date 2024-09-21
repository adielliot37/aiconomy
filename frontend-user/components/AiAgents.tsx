const AiAgents = ({
  agents,
}: {
  agents: {
    agent_id: number;
    speciality: string;
    URL: string;
    owner: string;
    agent_address: string;
    cost: number;
    source: string;
  }[];
}) => {
  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        AI Agents on Our Platform
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {agents
          ? agents.map((agent) => (
              <div
                key={agent.agent_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-[#694FFF] mb-2">
                  {agent.speciality}
                </h3>
                <p className="text-gray-600 mb-2">ID: {agent.agent_id}</p>
                <p className="text-gray-600 mb-2">Source: {agent.source}</p>
                <p className="text-gray-600 mb-2">
                  Cost: {agent.cost} USDC per 1000 tokens
                </p>
                {/* <button className="mt-4 bg-[#694FFF] text-white px-4 py-2 rounded-md hover:bg-[#5A43E6] transition-colors duration-300">
                  Use Agent
                </button> */}
              </div>
            ))
          : "No agents found"}
      </div>
    </div>
  );
};

export default AiAgents;
