// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from  "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDCMock is ERC20 {
    constructor(uint256 _initialSupply, address _initialHolder) ERC20("USDC Mock", "USDC") {
        _mint(_initialHolder, _initialSupply);
    }
    function getTokens(uint256 _amount) external {
        _mint(msg.sender, _amount);
    }
}