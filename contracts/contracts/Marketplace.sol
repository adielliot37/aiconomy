// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.27;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISPHook} from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {USDCSmartWallet} from "./USDCSmartWallet.sol";
import {IUSDCSmartWallet} from "./interface/IUSDCSmartWallet.sol";

interface IPlonkVerifier {
	function verifyProof(
		bytes memory proof,
		uint256[] memory pubSignals
	) external view returns (bool);
}

contract AgentMarketPlace is Ownable {
	// state variables
	address public usdcAddress;
	// total earned by each agent
	mapping(string => address) public agentIdToAgentAddress;
	// attester whitelist
	mapping(address attester => bool allowed) public whitelist;
	IPlonkVerifier public verifier;

	event agentFactoryDeployed(
		address agentFactoryAddress,
		address agentDeveloper,
		string agentId,
		uint256 ratePerToken
	);

	enum JobStatus {
		InProgress,
		Completed,
		Canceled
	}
	struct Job {
		address fromUserWallet;
		address toAgentAddress;
		uint256 value;
		uint256 time;
		JobStatus jobstatus;
	}

	mapping(string => mapping(string => Job)) public agentId_To_JobId_To_Job;
	// errors
	error UnauthorizedAttester();

	constructor(
		address _usdcAddress,
		address _verifierAddress
	) Ownable(_msgSender()) {
		usdcAddress = _usdcAddress;
		verifier = IPlonkVerifier(_verifierAddress);
	}

	// Attestation whitelisting
	function setWhitelist(address attester, bool allowed) external onlyOwner {
		whitelist[attester] = allowed;
	}

	function _checkAttesterWhitelistStatus(address attester) internal view {
		// solhint-disable-next-line custom-errors
		require(whitelist[attester], UnauthorizedAttester());
	}

	function _safeTransferFrom(
		address _token,
		address _from,
		address _to,
		uint256 _value
	) internal {
		IERC20(_token).transferFrom(_from, _to, _value);
	}

	// Attestation Status
	function didReceiveAttestation(
		string memory _agentId,
		string memory _jobId,
		address from,
		address to,
		uint256 value,
		bytes memory proof,
		uint256[] memory pubSignals
	) external payable {
		bool verified = verifier.verifyProof(proof, pubSignals);
		require(verified, "Invalid proof");
		agentId_To_JobId_To_Job[_agentId][_jobId] = Job(
			from,
			to,
			value,
			block.timestamp,
			JobStatus.InProgress
		);
	}

	function deployAgentFactory(
		string memory _agentId,
		uint256 _ratePerToken,
		address _agentDeveloper
	) external returns (address) {
		require(
			agentIdToAgentAddress[_agentId] == address(0),
			"Agent already deployed"
		);
		require(_ratePerToken > 0, "Rate per token should be greater than 0");
		require(
			msg.sender == _agentDeveloper,
			"Only agent developer can deploy agent factory"
		);
		USDCSmartWallet agentFactory = new USDCSmartWallet(
			usdcAddress,
			_agentDeveloper,
			_agentId,
			_ratePerToken
		);
		agentIdToAgentAddress[_agentId] = address(agentFactory);
		emit agentFactoryDeployed(
			address(agentFactory),
			_agentDeveloper,
			_agentId,
			_ratePerToken
		);
		return address(agentFactory);
	}

	function hasAllowance(address _from) external view returns (uint256) {
		return IERC20(usdcAddress).allowance(_from, address(this));
	}

	function approveToMarketplace(address _to, uint256 _value) external {
		IERC20(usdcAddress).approve(_to, _value);
	}

	function getAgentJobStatus(
		string memory _agentId,
		string memory _jobId
	) external view returns (JobStatus) {
		return agentId_To_JobId_To_Job[_agentId][_jobId].jobstatus;
	}

	// from chainlink function
	function updateJobStatus(
		string memory _agentId,
		string memory _jobId,
		JobStatus _jobStatus
	) external {
		// bool result = chailink function to check
		// if(result == true) {
		//     agentId_To_JobId_To_Job[_agentId][_jobId].jobstatus = JobStatus.Completed;
		// }
		// else {
		//     agentId_To_JobId_To_Job[_agentId][_jobId].jobstatus = JobStatus.Canceled;
		// }
	}

	// chainlink period automation
	function disBurseFunds(
		string memory _agentId,
		string memory _jobId,
		uint256 _amount
	) external {
		require(
			agentId_To_JobId_To_Job[_agentId][_jobId].time + 3600 <
				block.timestamp,
			"Time not elapsed"
		);
		require(
			agentId_To_JobId_To_Job[_agentId][_jobId].value == _amount,
			"Amount mismatch"
		);

		_safeTransferFrom(
			usdcAddress,
			agentId_To_JobId_To_Job[_agentId][_jobId].fromUserWallet,
			agentIdToAgentAddress[_agentId],
			_amount
		);
		agentId_To_JobId_To_Job[_agentId][_jobId].jobstatus = JobStatus
			.Completed;
	}
}
