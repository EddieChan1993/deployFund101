// function deployFunction() {
//     console.log("OK")
// }
//
// module.exports.default = deployFunction;

// module.exports = async (hre) => {
//     const getNamedAccounts = hre.getNamedAccounts
//     const deployments = hre.deployments
//     console.log("OK")
// }

// 部署脚本主逻辑，Hardhat 会自动调用此函数
const {network} = require("hardhat");
const {devChains, networkConfig, END_CD} = require("../hardhat.helper.config")

module.exports = async ({getNamedAccounts, deployments}) => {
    // 1. 获取配置中定义的命名账户（在 hardhat.config.js 的 namedAccounts 中配置）
    const {firstAccount} = await getNamedAccounts();
    // 2. 获取部署方法（来自 hardhat-deploy 插件）
    const {deploy} = deployments;
    let chainId = 11155111
    let dataFeedAddr
    let waitBlock = 5
    if (devChains.includes(network.name)) {
        const mockFeedDataContract = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockFeedDataContract.address
        waitBlock = 0
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].etherUSDDataFeed
    }
    // 3. 执行部署动作：部署名为 "FundMe" 的合约
    const fundMe = await deploy("FundMe", {
        from: firstAccount,    // 使用 firstAccount 地址作为部署者
        args: [END_CD, dataFeedAddr],           // 合约构造函数的参数（⚠️ 注意：此处可能有误，应为地址而非数字）
        log: true,               // 打印部署日志（方便调试）
        waitConfirmations: waitBlock
    });
    //remove deployments dir or add --reset flag if you redeploy contract

    if (hre.network.config.chainId == chainId && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fundMe.address, constructorArguments: [END_CD, dataFeedAddr],
        });
    } else {
        console.log("IS LOCAL NETWORK")
    }
}

// 4. 定义部署标签（tags），用于选择性部署
// 执行 `npx hardhat deploy` 会部署所有带 "all" 标签的脚本
// 执行 `npx hardhat deploy --tags fundme` 仅部署当前脚本
module.exports.tags = ["all", "fundme"];