// SPDX-License-Identifier: MPL-2.0
pragma solidity  ^0.8.27;
interface IUSDCSmartWallet {
    function recordJob(uint256 _jobId, uint256 _amountInDollars) external;
}