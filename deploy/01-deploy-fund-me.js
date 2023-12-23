const { networkConfig } = require("../helper-hardhat-config");
const {network} = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments  })=>{
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId
    let ethUSDPriceFeedAddress;
    // when going for localhost or network, we want to use a mock
    // if the contract doesnt exist, we deploy a minimal version for our local testing
    console.log(network.name);
    if(developmentChains.includes(network.name)){
        const ethUSDAggreggator = await deployments.get("MockV3Aggregator");
        ethUSDPriceFeedAddress = ethUSDAggreggator.address
    }else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeed"];
    }
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUSDPriceFeedAddress], //
        log: true,
        waitConfirmations: network.config.blockConfirmations
    })
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address, [ethUSDPriceFeedAddress]);
    }
    log("-------------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"];