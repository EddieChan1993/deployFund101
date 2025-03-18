// 引入依赖库
const {ethers, deployments, getNamedAccounts} = require("hardhat"); // Hardhat 核心库
const {assert} = require("chai"); // 断言库

// 定义测试套件
describe("test fundme contract", async function () {
    let fundMe; // 存储 FundMe 合约实例
    let firstAccount; // 存储部署者账户地址

    // 在每个测试用例前重置合约状态
    beforeEach(async function () {
        // 重新部署所有带 "all" 标签的合约（依赖 hardhat-deploy 插件）
        await deployments.fixture(["all"]);

        // 获取配置中预定义的账户（需在 hardhat.config.js 的 namedAccounts 中定义）
        firstAccount = (await getNamedAccounts()).firstAccount;

        // 获取 FundMe 合约的部署信息（地址、ABI 等）
        const fundMeDeployment = await deployments.get("FundMe");

        // 创建合约实例：通过 ABI 和地址连接到合约
        fundMe = await ethers.getContractAt("FundMe", // 合约名称
            fundMeDeployment.address // 合约部署地址
        );
    });

    // 测试用例 1：验证合约所有者是否正确
    it("test if the owner is msg.sender", async function () {
        // 等待合约部署确认（如果尚未完成）
        await fundMe.waitForDeployment();

        // 断言：合约的 owner() 返回值应等于部署者地址
        assert.equal(await fundMe.owner(), firstAccount);
    });

    // 测试用例 2：验证数据预言机地址是否正确
    it("test if dataFeed is ok", async function () {
        // 等待合约部署确认
        await fundMe.waitForDeployment();

        // 断言：合约的 dataFeed() 返回值应等于预设的 Chainlink 地址
        assert.equal(await fundMe.dataFeed(), "0x694AA1769357215DE4FAC081bf1f309aDC325306" // Sepolia 测试网 ETH/USD 预言机地址
        );
    });
});