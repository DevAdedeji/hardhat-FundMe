const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const FundMeContract = await ethers.getContract("FundMe", deployer)
    const transactionResponse = await FundMeContract.cheaperWithdraw()
    await transactionResponse.wait(1)
    console.log("withdrawn")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
