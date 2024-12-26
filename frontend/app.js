let web3;
let contract;
let userAccount;
const contractAddress = "0xac50d0c24489ebfc6403d0f92873cc83afa5e9a1";
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

window.addEventListener('load', () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
            userAccount = accounts[0];
            document.getElementById("account").innerText = userAccount;
            initContract();
        }).catch(err => {
            console.log(err);
            alert('Please connect MetaMask');
        });
    } else {
        alert('MetaMask not installed!');
    }
});

function initContract() {
    contract = new web3.eth.Contract(contractABI, contractAddress);
}

// Connect MetaMask
async function connectMetaMask() {
    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            document.getElementById("account").innerText = userAccount;
        } catch (err) {
            console.log(err);
            alert('Connection failed');
        }
    } else {
        alert('MetaMask not installed!');
    }
}

// Log Time function
async function logTime() {
    const projectId = document.getElementById("project-id").value;
    const hoursWorked = document.getElementById("hours-worked").value;
    const hourlyRate = document.getElementById("hourly-rate").value;

    if (!projectId || !hoursWorked || !hourlyRate) {
        displayError("All fields are required.");
        return;
    }

    try {
        const result = await contract.methods.logTime(projectId, hoursWorked, hourlyRate).send({ from: userAccount });
        console.log(result);
        displaySuccess("Time logged successfully!");
    } catch (err) {
        displayError("Error logging time: " + err.message);
    }
}

// Approve Time and Pay function
async function approveTime() {
    const freelancerAddress = document.getElementById("freelancer-address").value;
    const projectId = document.getElementById("project-id-approve").value;

    if (!freelancerAddress || !projectId) {
        displayError("All fields are required.");
        return;
    }

    try {
        const result = await contract.methods.approveTime(projectId, freelancerAddress).send({ from: userAccount });
        console.log(result);
        displaySuccess("Time approved and payment made successfully!");
    } catch (err) {
        displayError("Error approving time: " + err.message);
    }
}

// Display error message
function displayError(message) {
    document.getElementById("error-message").innerText = message;
    document.getElementById("success-message").innerText = '';
}

// Display success message
function displaySuccess(message) {
    document.getElementById("success-message").innerText = message;
    document.getElementById("error-message").innerText = '';
}
