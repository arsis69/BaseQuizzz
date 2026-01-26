// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QuizCheckIn
 * @notice Simple contract for tracking daily quiz check-ins and streaks
 * @dev Stores check-in timestamps and calculates streaks
 */
contract QuizCheckIn {
    // Events
    event CheckIn(address indexed user, uint256 timestamp, uint256 totalCheckIns);

    // Mappings
    mapping(address => uint256) public lastCheckIn;
    mapping(address => uint256) public totalCheckIns;
    mapping(address => uint256) public currentStreak;
    mapping(address => uint256) public longestStreak;

    // Constants
    uint256 private constant ONE_DAY = 1 days;

    /**
     * @notice Check in for today
     * @dev Can only check in once per day (based on timestamp)
     */
    function checkIn() external {
        address user = msg.sender;
        uint256 currentTime = block.timestamp;
        uint256 lastTime = lastCheckIn[user];

        // Calculate days since last check-in
        uint256 daysSince = (currentTime - lastTime) / ONE_DAY;

        // Update streak
        if (lastTime == 0) {
            // First check-in ever
            currentStreak[user] = 1;
        } else if (daysSince == 0) {
            // Already checked in today - don't allow duplicate
            revert("Already checked in today");
        } else if (daysSince == 1) {
            // Continuing streak
            currentStreak[user]++;
        } else {
            // Streak broken, start fresh
            currentStreak[user] = 1;
        }

        // Update longest streak if current is higher
        if (currentStreak[user] > longestStreak[user]) {
            longestStreak[user] = currentStreak[user];
        }

        // Update check-in data
        lastCheckIn[user] = currentTime;
        totalCheckIns[user]++;

        emit CheckIn(user, currentTime, totalCheckIns[user]);
    }

    /**
     * @notice Get user's current streak
     * @param user Address to check
     * @return Current streak count (0 if broken)
     */
    function getStreak(address user) external view returns (uint256) {
        if (lastCheckIn[user] == 0) return 0;

        uint256 daysSince = (block.timestamp - lastCheckIn[user]) / ONE_DAY;

        // Streak is valid if checked in today or yesterday
        if (daysSince <= 1) {
            return currentStreak[user];
        }

        return 0; // Streak broken
    }

    /**
     * @notice Check if user can check in today
     * @param user Address to check
     * @return true if user hasn't checked in today
     */
    function canCheckInToday(address user) external view returns (bool) {
        if (lastCheckIn[user] == 0) return true;

        uint256 daysSince = (block.timestamp - lastCheckIn[user]) / ONE_DAY;
        return daysSince >= 1;
    }

    /**
     * @notice Get comprehensive user stats
     * @param user Address to check
     * @return total Total check-ins
     * @return streak Current active streak
     * @return longest Longest streak ever
     * @return lastTime Last check-in timestamp
     */
    function getUserStats(address user) external view returns (
        uint256 total,
        uint256 streak,
        uint256 longest,
        uint256 lastTime
    ) {
        total = totalCheckIns[user];
        longest = longestStreak[user];
        lastTime = lastCheckIn[user];

        // Calculate current streak (accounting for expiration)
        if (lastTime == 0) {
            streak = 0;
        } else {
            uint256 daysSince = (block.timestamp - lastTime) / ONE_DAY;
            streak = daysSince <= 1 ? currentStreak[user] : 0;
        }
    }
}
