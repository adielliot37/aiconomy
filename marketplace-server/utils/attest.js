import {
  EvmChains,
  delegateSignAttestation,
  SignProtocolClient,
  SpMode,
} from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
import agentData from "../constants/agents.json";

dotenv.config();
const delegationPrivateKey = `0x${process.env.PRIVATE_KEY}`;

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.chain,
  account: privateKeyToAccount(delegationPrivateKey),
});

async function createAttestation(
  chain,
  agentId,
  jobId,
  from,
  to,
  value,
  dataCid
) {
  const info = await delegateSignAttestation(
    {
      schemaId: "0x2cc",
      data: {
        agent_id: agentId,
        agent_address: agentData[agentId].agent_address,
        job_id: jobId,
        amount: value,
        data_cid: dataCid,
        agent_owner: agentData[agentId].owner,
        timestamp: Math.floor(Date.now() / 1000),
      },
      indexingValue: "xxx",
    },
    {
      chain: chain,
      delegationAccount: privateKeyToAccount(delegationPrivateKey),
    }
  );

  const delegationCreateAttestationRes = await client.createAttestation(
    info.attestation,
    {
      delegationSignature: info.delegationSignature,
      extraData: { from, to, value, agentId, _agentId: agentId, _jobId: jobId },
    }
  );
  console.log(delegationCreateAttestationRes);
}

createAttestation();