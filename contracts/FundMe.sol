//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface IFundMe {
    function setFundMAmount(address addr, uint256 amount) external;

    function setERC20Addr(address addr) external;

    function getFunderMAmount(address addr) external returns (uint256);
}
/**
1. 创建首款
2.记录投资人
3.锁定期内，达到目标值，生产商可以提取
4.在锁定期内，没有达到目标，投资人退款
**/
contract FundMe {
    mapping(address => uint256) public funderMAmount;
    uint256 constant MIN_VAL = 100 * 10 ** 18; //100 USD
    uint256 constant TARGET = 1000 * 10 ** 18; //1000 USD
    AggregatorV3Interface public dataFeed;
    address public owner;
    uint256 public endCd;
    uint256 public deTiemAt;
    address public  ERC20Addr;

    event fundWithdrawByOwner(uint256);
    event fundWithRe(address, uint256);

    constructor(uint256 _endCd, address dataFeedAddr) {
        //Sepolia Testnet ETH / USD
        dataFeed = AggregatorV3Interface(
            dataFeedAddr//接口对应的智能合约地址
        );
        owner = msg.sender;
        deTiemAt = block.timestamp;
        endCd = _endCd;
    }
    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MIN_VAL, "Ether need more");
        require(block.timestamp < deTiemAt + endCd, "Fund close");
        funderMAmount[msg.sender] = msg.value;
    }
    //draw fund
    function getFound() external foundClose {
        require(convertEthToUsd(address(this).balance) >= TARGET, "Target no");
        require(msg.sender == owner, "no owner");
        uint256 balanceFund = address(this).balance;
        payable(msg.sender).transfer(balanceFund);
        funderMAmount[msg.sender] = 0;
        emit fundWithdrawByOwner(balanceFund);
    }
    //return fund
    function reFund() external foundClose {
        require(convertEthToUsd(address(this).balance) < TARGET, "Target Ok");
        require(funderMAmount[msg.sender] != 0, "no fund");
        uint256 balanceFund = funderMAmount[msg.sender];
        payable(msg.sender).transfer(balanceFund);
        funderMAmount[msg.sender] = 0;
        emit fundWithRe(msg.sender, balanceFund);
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
        /* uint80 roundID */,
            int answer,
        /*uint startedAt*/,
        /*uint timeStamp*/,
        /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount)
    internal
    view
    returns (uint256)
    {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (ethAmount * ethPrice) / (10 ** 8);
    }

    function setFundMAmount(address addr, uint256 amount) external {
        require(msg.sender == ERC20Addr, "cant call");
        funderMAmount[addr] = amount;
    }

    function setERC20Addr(address addr) external {
        ERC20Addr = addr;
    }
    modifier foundClose(){
        require(block.timestamp > deTiemAt + endCd, "fund doing");
        _;
    }
}
