const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const FundMeContract = await ethers.getContract("FundMe", deployer)
    const transactionResponse = await FundMeContract.fund({
        value: ethers.parseEther("1"),
    })
    await transactionResponse.wait(1)
    console.log("funded")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
