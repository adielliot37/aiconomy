// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDCSmartWallet is Ownable {
    IERC20 public usdcToken;
    string public aiAgentId;
    uint256 public ratePerToken;

    mapping(string => uint256) public jobAmounts;
    uint256 public totalEarnings;
    string[] public jobIds;

    event Withdrawal(address indexed to, uint256 amount);
    event JobRecorded(string indexed jobId, uint256 amount);

    
    constructor(
        address _usdcTokenAddress,
        address initialOwner,
        string memory _aiAgentId,
        uint256 _ratePerToken
    ) Ownable(initialOwner) {
        usdcToken = IERC20(_usdcTokenAddress);
        aiAgentId = _aiAgentId;
        ratePerToken = _ratePerToken;
    }

    function withdrawUSDC(address _to, uint256 _amount) external onlyOwner {
        require(usdcToken.balanceOf(address(this)) >= _amount, "Insufficient balance");
        require(usdcToken.transfer(_to, _amount), "Transfer failed");
        emit Withdrawal(_to, _amount);
    }

    
    function recordJob(string memory _jobId, uint256 _amountInDollars) external onlyOwner{
        uint256 amountInCents = _amountInDollars * 100;
        jobAmounts[_jobId] = amountInCents;

        if (jobAmounts[_jobId] > 0) {
            jobIds.push(_jobId);
        }

        totalEarnings += amountInCents;
        emit JobRecorded(_jobId, amountInCents);
    }

    function getJobAmount(string memory _jobId) external view returns (uint256) {
        return jobAmounts[_jobId];
    }

    function getBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    function getTotalEarnings() external view returns (uint256) {
        return totalEarnings;
    }

    function listJobs() external view returns (string[] memory, uint256[] memory) {
        uint256[] memory amounts = new uint256[](jobIds.length);
        for (uint256 i = 0; i < jobIds.length; i++) {
            amounts[i] = jobAmounts[jobIds[i]];
        }
        return (jobIds, amounts);
    }

    function getAIAgentId() external view returns (string memory) {
        return aiAgentId;
    }

    function getRatePerToken() external view returns (uint256) {
        return ratePerToken;
    }

    function setRatePerToken(uint256 _ratePerToken) external onlyOwner {
        ratePerToken = _ratePerToken;
    }

}
