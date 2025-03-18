// 引入依赖库
require("@nomicfoundation/hardhat-toolbox"); // Hardhat 官方工具包（包含 Ethers、Waffle 等）
require("@chainlink/env-enc").config();      // Chainlink 环境变量加密工具（替代 dotenv）
require("./tasks");                          // 自定义 Hardhat 任务（如果存在 tasks/ 目录）
require("hardhat-deploy");                   // 合约部署管理插件

// 从加密环境变量中读取敏感信息
const SEPOLIA_URL = process.env.SEPOLIA_URL;       // Sepolia 测试网节点 RPC URL
const PRIVATE_KEY = process.env.PRIVATE_KEY;       // 账户 1 的私钥（用于部署和交互）
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2;      // 账户 2 的私钥（备用账户）
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; // Etherscan API 密钥（用于合约验证）

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28", // Solidity 编译器版本（需与合约版本匹配）

    // 网络配置
    networks: {
        sepolia: {
            url: SEPOLIA_URL,          // Sepolia 测试网的 RPC 节点 URL
            accounts: [PRIVATE_KEY, PRIVATE_KEY2], // 使用的账户私钥列表
            chainId: 11155111          // Sepolia 的 Chain ID（必须正确）
        }
    },

    // Etherscan 验证配置
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY // 针对 Sepolia 的 Etherscan API 密钥
        }
    },

    // 命名账户配置（通过索引或别名映射账户地址）
    namedAccounts: {
        firstAccount: {
            default: 0, // 默认使用 accounts[0]（即 PRIVATE_KEY 对应的账户）
        },
        secondAccount: {
            default: 1, // 默认使用 accounts[1]（即 PRIVATE_KEY2 对应的账户）
        }
    }
};