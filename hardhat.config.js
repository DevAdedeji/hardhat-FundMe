require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
require("hardhat-gas-reporter");
require("solidity-coverage");
require('hardhat-deploy');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    //   solidity: "0.8.19",
  solidity: {
    compilers: [
        {version: "0.8.19"},
        {version: "0.6.6"},
    ]
  },
  networks: {
    sepolia: {
        url: process.env.RPC_URL,
        accounts: [`0x${process.env.PRIVATE_KEY}`],
        chainId: 11155111,
        blockConfirmations: 6,
    },
    localhost: {
        url: "http://127.0.0.1:8545/",
        chainId: 31337,
    },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        }
    }
};
