// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FreelancerIncomeLog
 * @dev Immutable audit trail for Pakistani freelancer income verification
 * @notice Stores keccak256 hashes of transaction data on Polygon Amoy
 * Enables freelancers to prove income for bank loans without traditional salary slips
 */
contract FreelancerIncomeLog {
    address public owner;

    struct TransactionRecord {
        bytes32 dataHash;       // keccak256 hash of transaction metadata
        uint256 timestamp;      // block timestamp
        uint256 amountPKR;      // transaction amount in PKR (paisa precision)
        string txType;          // "CREDIT" or "DEBIT"
        string category;        // "freelance_income", "transfer", "bill_payment", etc.
    }

    // freelancerId => array of transaction records
    mapping(string => TransactionRecord[]) private records;

    // freelancerId => total income logged (PKR)
    mapping(string => uint256) public totalIncome;

    // freelancerId => total transactions count
    mapping(string => uint256) public transactionCount;

    // Events for efficient querying via Polygonscan
    event TransactionLogged(
        string indexed freelancerId,
        bytes32 dataHash,
        uint256 amountPKR,
        string txType,
        string category,
        uint256 timestamp
    );

    event IncomeProofGenerated(
        string indexed freelancerId,
        uint256 totalIncome,
        uint256 transactionCount,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Log a transaction on-chain
     * @param freelancerId Unique identifier for the freelancer
     * @param dataHash keccak256 hash of the full transaction JSON
     * @param amountPKR Transaction amount in PKR
     * @param txType "CREDIT" or "DEBIT"
     * @param category Transaction category
     */
    function logTransaction(
        string calldata freelancerId,
        bytes32 dataHash,
        uint256 amountPKR,
        string calldata txType,
        string calldata category
    ) external onlyOwner {
        TransactionRecord memory record = TransactionRecord({
            dataHash: dataHash,
            timestamp: block.timestamp,
            amountPKR: amountPKR,
            txType: txType,
            category: category
        });

        records[freelancerId].push(record);
        transactionCount[freelancerId]++;

        // Track total income for credit scoring
        if (keccak256(bytes(txType)) == keccak256(bytes("CREDIT"))) {
            totalIncome[freelancerId] += amountPKR;
        }

        emit TransactionLogged(
            freelancerId,
            dataHash,
            amountPKR,
            txType,
            category,
            block.timestamp
        );
    }

    /**
     * @dev Generate an income proof event (for loan applications)
     * @param freelancerId Unique identifier for the freelancer
     */
    function generateIncomeProof(string calldata freelancerId) external onlyOwner {
        require(transactionCount[freelancerId] > 0, "No transactions found");

        emit IncomeProofGenerated(
            freelancerId,
            totalIncome[freelancerId],
            transactionCount[freelancerId],
            block.timestamp
        );
    }

    /**
     * @dev Verify a transaction hash exists on-chain
     * @param freelancerId Freelancer identifier
     * @param dataHash Hash to verify
     * @return exists Whether the hash exists
     * @return timestamp When it was recorded
     */
    function verifyTransaction(
        string calldata freelancerId,
        bytes32 dataHash
    ) external view returns (bool exists, uint256 timestamp) {
        TransactionRecord[] storage userRecords = records[freelancerId];
        for (uint256 i = 0; i < userRecords.length; i++) {
            if (userRecords[i].dataHash == dataHash) {
                return (true, userRecords[i].timestamp);
            }
        }
        return (false, 0);
    }

    /**
     * @dev Get transaction count for a freelancer
     */
    function getTransactionCount(string calldata freelancerId) external view returns (uint256) {
        return transactionCount[freelancerId];
    }

    /**
     * @dev Get total logged income for a freelancer
     */
    function getTotalIncome(string calldata freelancerId) external view returns (uint256) {
        return totalIncome[freelancerId];
    }
}
