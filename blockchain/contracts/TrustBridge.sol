// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustBridge
 * @dev Decentralized investment tracking and escrow for startups
 */
contract TrustBridge {
    address public admin;

    struct Startup {
        string id; 
        address wallet; // the startup's crypto address
        uint256 totalFunding;
        bool isRegistered;
    }

    struct Investment {
        string investorId;
        string startupId;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(string => Startup) public startups;
    mapping(string => Investment[]) public startupInvestments;
    mapping(string => Investment[]) public investorInvestments;

    event StartupRegistered(string startupId, address wallet);
    event InvestmentRecorded(string investorId, string startupId, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Register a startup on the blockchain
     */
    function registerStartup(string memory _startupId, address _wallet) external {
        require(!startups[_startupId].isRegistered, "Startup already registered");
        require(msg.sender == admin || msg.sender == _wallet, "Not authorized");

        startups[_startupId] = Startup({
            id: _startupId,
            wallet: _wallet,
            totalFunding: 0,
            isRegistered: true
        });

        emit StartupRegistered(_startupId, _wallet);
    }

    /**
     * @dev Record an investment permanently on-chain.
     * Note: In a fully decentralized system, the investor would send crypto (ETH/MATIC) directly.
     * Here, we just record the INR amount that was successfully processed via Razorpay.
     */
    function recordInvestment(string memory _investorId, string memory _startupId, uint256 _amountUsdc) external onlyAdmin {
        require(startups[_startupId].isRegistered, "Startup not registered");

        Investment memory newInvestment = Investment({
            investorId: _investorId,
            startupId: _startupId,
            amount: _amountUsdc,
            timestamp: block.timestamp
        });

        startupInvestments[_startupId].push(newInvestment);
        investorInvestments[_investorId].push(newInvestment);

        startups[_startupId].totalFunding += _amountUsdc;

        emit InvestmentRecorded(_investorId, _startupId, _amountUsdc);
    }

    /**
     * @dev Retrieve all investments for a startup
     */
    function getStartupInvestments(string memory _startupId) external view returns (Investment[] memory) {
        return startupInvestments[_startupId];
    }

    /**
     * @dev Retrieve all investments by an investor
     */
    function getInvestorInvestments(string memory _investorId) external view returns (Investment[] memory) {
        return investorInvestments[_investorId];
    }
}
