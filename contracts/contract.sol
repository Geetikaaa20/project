// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TokenizedTimeTracking {

    // ERC-20 token used for payments
    IERC20 public paymentToken;

    // Structure to store logged time information
    struct TimeLog {
        uint256 hoursWorked;     // Total hours worked
        uint256 hourlyRate;      // Rate per hour (in tokens)
        bool isApproved;         // Whether the logged time is approved
    }

    // Mapping to store time logs for each freelancer (freelancer address -> project id -> TimeLog)
    mapping(address => mapping(uint256 => TimeLog)) public timeLogs;

    // Mapping to store projects and their respective employers (project id -> employer address)
    mapping(uint256 => address) public projectOwners;

    // Event to log when time is logged
    event TimeLogged(address indexed freelancer, uint256 indexed projectId, uint256 hoursWorked, uint256 hourlyRate);

    // Event to log when time is approved and payment is made
    event TimeApproved(address indexed freelancer, uint256 indexed projectId, uint256 paymentAmount);

    // Constructor to initialize the payment token
    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }

    // Modifier to ensure only the employer can approve time for their project
    modifier onlyEmployer(uint256 projectId) {
        require(msg.sender == projectOwners[projectId], "Only the employer can approve time for this project.");
        _;
    }

    // Function 1: Log the time worked on a specific project
    function logTime(uint256 projectId, uint256 hoursWorked, uint256 hourlyRate) external {
        require(hoursWorked > 0, "Hours worked must be greater than 0.");
        require(hourlyRate > 0, "Hourly rate must be greater than 0.");

        // Store the time log for the freelancer
        timeLogs[msg.sender][projectId] = TimeLog({
            hoursWorked: hoursWorked,
            hourlyRate: hourlyRate,
            isApproved: false
        });

        // Emit an event for the logged time
        emit TimeLogged(msg.sender, projectId, hoursWorked, hourlyRate);
    }

    // Function 2: Employer approves the time worked and triggers payment
    function approveTime(uint256 projectId, address freelancer) external onlyEmployer(projectId) {
        // Retrieve the time log for the freelancer on the specific project
        TimeLog storage log = timeLogs[freelancer][projectId];

        // Ensure the time has not been approved already
        require(!log.isApproved, "Time already approved.");

        // Calculate the payment amount based on hours worked and hourly rate
        uint256 paymentAmount = log.hoursWorked * log.hourlyRate;

        // Ensure the employer has enough tokens to make the payment
        require(paymentToken.balanceOf(msg.sender) >= paymentAmount, "Insufficient balance to pay freelancer.");

        // Transfer the tokens to the freelancer
        bool success = paymentToken.transfer(freelancer, paymentAmount);
        require(success, "Payment failed.");

        // Mark the time log as approved
        log.isApproved = true;

        // Emit an event for the time approval and payment
        emit TimeApproved(freelancer, projectId, paymentAmount);
    }

    // Function to set the employer for a project (only once when project is created)
    function setProjectOwner(uint256 projectId, address employer) external {
        require(projectOwners[projectId] == address(0), "Project owner already set.");
        projectOwners[projectId] = employer;
    }
}
