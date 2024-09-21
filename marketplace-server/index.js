const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");
const cors = require("cors");
const dotenv = require("dotenv");
const { AGENTS } = require("./constants/agents");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors("*"));

const CONTRACT_MULT = 10000;

const currentAgents = [...AGENTS];
console.log(currentAgents)
// const currentGaiaAgents = [...AGENTS_GAIA];

// GET route to return server status
app.get("/", (req, res) => {
  res.send("Server Active!!");
});

app.get("/agents", (req, res) => {
  res.json({ agents: currentAgents });
});

// POST route to return quotation based on prompt
app.post("/quotation", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const count = prompt.split(/\s+/).length;

  const quote = 100 * CONTRACT_MULT * 3;

  res.json({ quote: quote });
});

app.post("/register-agent", (req, res) => {
  const { agent_id, speciality, URL, owner, agent_address, cost, source } =
    req.body;

  if (!agent_id || !speciality || !URL || !owner || !cost || !source) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const agentData = {
    agent_id,
    speciality,
    URL,
    owner,
    agent_address,
    cost,
    source,
  };

  currentAgents.push(agentData);
});

app.post("/execute", async (req, res) => {
  const { prompt: userPrompt, chainId } = req.body;
  if (!userPrompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }
  const openai = new OpenAI({
    baseURL: "https://api.red-pill.ai/v1",
    apiKey: `${process.env.OPEN_AI_API_KEY}`,
  });
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You're a pipeline manager for a multi ai agent platform. The available AI's info is as follows: \n ${JSON.stringify(
          currentAgents
        )} \n you'r only task is to return an json object of no more than 3 agents (agent id's + updated prompt according to their speciality + value assumption of what % of total amount given the agent might consue total should be 100% use whole numbers only) that'll be used in sequential manner to accomplish the task provided by user. Note: Do not use markdown format just send the json object in format [{agent_id: <>, prompt: <>, value: <>}]. Make sure the order of the json object array you return follows the actual/logical execution order of the tasks.`,
      },
      { role: "user", content: userPrompt },
    ],
    model: "gpt-4o",
  });
  const agents = JSON.parse(completion.choices[0].message.content);
  console.log(agents)
  let pastAnswer = "";
  let tx_hashes = [];
  for (let i = 0; i < agents.length; i++) {
    const agent = currentAgents.filter((t) => t.agent_id == agents[i].agent_id);
    console.log(agent)
    const prompt = `
      Original User prompt: ${userPrompt}
      AI agents flow pipeline: ${JSON.stringify(agents)}
      Your Task: ${agents[i].prompt}
      Previous Ai agent (in pipeline) response: ${pastAnswer}
      Consider above data Make sure your answer is valid as per user prompt and the past data.
      `;

    const res = await axios.post(agent[0].URL, {
      user_message: prompt,
      job_id: String(Date.now()),
      amount: 1000 * CONTRACT_MULT,
      chain_id: chainId,
    });
    const { response, transaction, txn_hash } = res.data;
    if (transaction == "Success") {
      pastAnswer = response;
      tx_hashes.push(txn_hash);
    } else {
      res.status(400).json({ error: "Transaction failed!!" });
    }
  }
  res
    .status(200)
    .json({ response: pastAnswer, agentOrder: agents, hashes: tx_hashes });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
