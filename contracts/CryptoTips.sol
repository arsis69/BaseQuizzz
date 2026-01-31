// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CryptoTips
 * @dev Contract for users to acknowledge crypto tips - allows re-acknowledging the same tip
 */
contract CryptoTips {
    // Mapping of user address => total tips acknowledged (can be same tip multiple times)
    mapping(address => uint256) public totalAcknowledgments;

    // Total number of available tips
    uint256 public constant TOTAL_TIPS = 20;

    // Event emitted when a user acknowledges a tip
    event TipAcknowledged(
        address indexed user,
        uint256 indexed tipId,
        uint256 timestamp,
        uint256 totalAcknowledgmentsByUser
    );

    /**
     * @dev Acknowledge a specific tip (can acknowledge same tip multiple times)
     * @param tipId The ID of the tip being acknowledged (0-19)
     */
    function acknowledgeTip(uint256 tipId) external {
        require(tipId < TOTAL_TIPS, "Invalid tip ID");

        // No check for already acknowledged - users can acknowledge same tip multiple times!
        totalAcknowledgments[msg.sender]++;

        emit TipAcknowledged(
            msg.sender,
            tipId,
            block.timestamp,
            totalAcknowledgments[msg.sender]
        );
    }

    /**
     * @dev Get total acknowledgments by a user
     * @param user The user's address
     * @return uint256 Total number of acknowledgments (can include same tip multiple times)
     */
    function getUserStats(address user) external view returns (uint256) {
        return totalAcknowledgments[user];
    }
}
