// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DidYouKnow
 * @dev Contract for users to acknowledge crypto facts - no time restrictions
 */
contract DidYouKnow {
    // Mapping of user address => fact ID => acknowledged
    mapping(address => mapping(uint256 => bool)) public hasAcknowledged;

    // Mapping of user address => total facts acknowledged
    mapping(address => uint256) public totalAcknowledged;

    // Total number of available facts
    uint256 public constant TOTAL_FACTS = 20;

    // Event emitted when a user acknowledges a fact
    event FactAcknowledged(
        address indexed user,
        uint256 indexed factId,
        uint256 timestamp,
        uint256 totalAcknowledgedByUser
    );

    /**
     * @dev Acknowledge a specific fact
     * @param factId The ID of the fact being acknowledged (0-19)
     */
    function acknowledgeFact(uint256 factId) external {
        require(factId < TOTAL_FACTS, "Invalid fact ID");
        require(!hasAcknowledged[msg.sender][factId], "Fact already acknowledged");

        hasAcknowledged[msg.sender][factId] = true;
        totalAcknowledged[msg.sender]++;

        emit FactAcknowledged(
            msg.sender,
            factId,
            block.timestamp,
            totalAcknowledged[msg.sender]
        );
    }

    /**
     * @dev Check if a user has acknowledged a specific fact
     * @param user The user's address
     * @param factId The fact ID to check
     * @return bool True if acknowledged, false otherwise
     */
    function hasUserAcknowledgedFact(address user, uint256 factId) external view returns (bool) {
        require(factId < TOTAL_FACTS, "Invalid fact ID");
        return hasAcknowledged[user][factId];
    }

    /**
     * @dev Get total facts acknowledged by a user
     * @param user The user's address
     * @return uint256 Total number of facts acknowledged
     */
    function getUserStats(address user) external view returns (uint256) {
        return totalAcknowledged[user];
    }

    /**
     * @dev Get all acknowledged facts for a user
     * @param user The user's address
     * @return uint256[] Array of acknowledged fact IDs
     */
    function getUserAcknowledgedFacts(address user) external view returns (uint256[] memory) {
        uint256 count = totalAcknowledged[user];
        uint256[] memory acknowledgedFacts = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < TOTAL_FACTS; i++) {
            if (hasAcknowledged[user][i]) {
                acknowledgedFacts[index] = i;
                index++;
            }
        }

        return acknowledgedFacts;
    }

    /**
     * @dev Get next unacknowledged fact for a user
     * @param user The user's address
     * @return uint256 The next unacknowledged fact ID, returns TOTAL_FACTS if all acknowledged
     */
    function getNextUnacknowledgedFact(address user) external view returns (uint256) {
        for (uint256 i = 0; i < TOTAL_FACTS; i++) {
            if (!hasAcknowledged[user][i]) {
                return i;
            }
        }
        return TOTAL_FACTS; // All facts acknowledged
    }
}
