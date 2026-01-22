// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LogosCashbackVault is Ownable, ReentrancyGuard {
    /// @notice Cashback balance per user
    mapping(address => uint256) public cashbackBalance;

    /// @notice Total ETH allocated to users (not yet claimed)
    uint256 public totalAllocated;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event CashbackAssigned(address indexed user, uint256 amount);
    event CashbackClaimed(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed admin, uint256 amount);
    event FundsDeposited(address indexed admin, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address admin) Ownable(admin) {}

    /*//////////////////////////////////////////////////////////////
                            ADMIN ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Deposit ETH into the contract
    function deposit() external payable onlyOwner {
        require(msg.value > 0, "No ETH sent");
        emit FundsDeposited(msg.sender, msg.value);
    }

    /// @notice Assign cashback to a user (amount in wei)
    function assignCashback(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Amount must be > 0");
        require(
            address(this).balance >= totalAllocated + amount,
            "Insufficient contract balance"
        );

        cashbackBalance[user] += amount;
        totalAllocated += amount;

        emit CashbackAssigned(user, amount);
    }

    /// @notice Withdraw ETH that is NOT allocated to users
    function adminWithdraw(uint256 amount) external onlyOwner {
        uint256 available = address(this).balance - totalAllocated;
        require(amount <= available, "Amount exceeds unallocated balance");

        (bool success, ) = owner().call{value: amount}("");
        require(success, "ETH transfer failed");

        emit FundsWithdrawn(owner(), amount);
    }

    /*//////////////////////////////////////////////////////////////
                            USER ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Claim assigned cashback
    function claim() external nonReentrant {
        uint256 amount = cashbackBalance[msg.sender];
        require(amount > 0, "No cashback to claim");

        cashbackBalance[msg.sender] = 0;
        totalAllocated -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit CashbackClaimed(msg.sender, amount);
    }

    /// @notice View claimable cashback for a user
    function claimable(address user) external view returns (uint256) {
        return cashbackBalance[user];
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Total ETH held by the contract (allocated + unallocated)
    function totalEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice ETH available for new assignments or admin withdrawal
    function unallocatedBalance() external view returns (uint256) {
        return address(this).balance - totalAllocated;
    }

    /*//////////////////////////////////////////////////////////////
                            RECEIVE
    //////////////////////////////////////////////////////////////*/

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}