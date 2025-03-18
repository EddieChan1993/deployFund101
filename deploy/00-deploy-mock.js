const {DECIMAL, INITIAL_ANSWER, devChains} = require("../hardhat.helper.config")
const {network} = require("hardhat");
// 部署脚本主逻辑，Hardhat 会自动调用此函数
module.exports = async ({getNamedAccounts, deployments}) => {
    if (devChains.includes(network.name)) {

        // 1. 获取配置中定义的命名账户（在 hardhat.config.js 的 namedAccounts 中配置）
        const {firstAccount} = await getNamedAccounts();

        // 2. 获取部署方法（来自 hardhat-deploy 插件）
        const {deploy} = deployments;

        // 3. 执行部署动作：部署名为 "FundMe" 的合约
        await deploy("MockV3Aggregator", {
            from: firstAccount,    // 使用 firstAccount 地址作为部署者
            args: [DECIMAL, INITIAL_ANSWER],           // 合约构造函数的参数（⚠️ 注意：此处可能有误，应为地址而非数字）
            log: true               // 打印部署日志（方便调试）
        });
    } else {
        console.log("NOT IS LOCAL NETWORK")
    }
}

// 4. 定义部署标签（tags），用于选择性部署
// 执行 `npx hardhat deploy` 会部署所有带 "all" 标签的脚本
// 执行 `npx hardhat deploy --tags fundme` 仅部署当前脚本
module.exports.tags = ["all", "mock"];