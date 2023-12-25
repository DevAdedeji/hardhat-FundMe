const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", () => {
    let FundMeContract
    let contractDeployer
    let MockV3Aggregator
    const sendValue = ethers.parseEther("1")
    beforeEach(async () => {
        const { deployer } = await getNamedAccounts()
        contractDeployer = deployer
        await deployments.fixture(["all"])
        FundMeContract = await ethers.getContract("FundMe", deployer)
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer,
        )
    })

    describe("constructor", () => {
        it("Sets the aggragator address correctly", async () => {
            const response = await FundMeContract.getPriceFeed()
            const address = await MockV3Aggregator.getAddress()
            assert.equal(response, address)
        })
        it("Sets the contract owner variable address to the deploper", async () => {
            const expectedValue = await FundMeContract.getOwner()
            assert.equal(contractDeployer, expectedValue)
        })
    })

    describe("fund", () => {
        it("Fails if you dont save enough ETH", async () => {
            await expect(FundMeContract.fund()).to.be.reverted
        })
        it("Updated the amount funded data structure", async () => {
            await FundMeContract.fund({ value: sendValue })
            const response =
                await FundMeContract.getAmountAdded(contractDeployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("updated the funders data stucture", async () => {
            await FundMeContract.fund({ value: sendValue })
            const funder = await FundMeContract.getFunder(0)
            assert.equal(funder, contractDeployer)
        })
    })

    describe("withdraw", () => {
        beforeEach(async () => {
            await FundMeContract.fund({ value: sendValue })
        })
        it("withdraw ETH from a single funder", async () => {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                await FundMeContract.getAddress(),
            )
            const startingDeployerBalance =
                await ethers.provider.getBalance(contractDeployer)
            // Act
            const transactionResponse = await FundMeContract.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(
                await FundMeContract.getAddress(),
            )
            const endingDeployerBalance =
                await ethers.provider.getBalance(contractDeployer)
            //Assert
            assert.equal(endingFundMeBalance.toString(), 0)
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString(),
            )
        })

        it("cheaper withdraw ETH from a single funder", async () => {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(
                await FundMeContract.getAddress(),
            )
            const startingDeployerBalance =
                await ethers.provider.getBalance(contractDeployer)
            // Act
            const transactionResponse = await FundMeContract.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(
                await FundMeContract.getAddress(),
            )
            const endingDeployerBalance =
                await ethers.provider.getBalance(contractDeployer)
            //Assert
            assert.equal(endingFundMeBalance.toString(), 0)
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString(),
            )
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await FundMeContract.connect(
                accounts[1],
            )
            await expect(fundMeConnectedContract.withdraw()).to.be.reverted
        })
    })
})
