// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PriceConverter.sol";

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *  @author Adedeji Tewogbade
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    uint public constant minimumUsd = 10 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public immutable owner;
    AggregatorV3Interface public priceFeed;

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds our countract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUsd,
            "You should send atleast I eth"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    /**
     * @notice This function withdraw the funds in the contract
     * @dev This implements price feeds as our library
     */
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // reset the array
        funders = new address[](0);
        // send eth
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }
}
