const DECIMAL = 8
const INITIAL_ANSWER = 300000000000 //1Ether=3000USD
const devChains = ["hardhat", "local"]
const END_CD = 180
//https://chainlist.org/ chainID查找
const networkConfig = {
    11155111: {
        etherUSDDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}

module.exports = {
    DECIMAL, INITIAL_ANSWER, devChains, networkConfig, END_CD
}