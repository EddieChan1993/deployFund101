// 引入依赖库
const {ethers, deployments, getNamedAccounts} = require("hardhat"); // Hardhat 核心库
const {assert, expect} = require("chai"); // 断言库
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {devChains} = require("../../hardhat.helper.config")

//npx hardhat test --network sepolia 集成测试
// 定义测试套件
devChains.includes(network.name) ? describe.skip : describe("test fundme contract", async function () {
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
    it('getFund success', async function () {
        await fundMe.fund({value: ethers.parseEther("1")})
        await new Promise(resolve => setTimeout(resolve, 181 * 1000));
        const getFundTx = await fundMe.getFund()
        const getFundRec = await getFundTx.wait()
        await expect(getFundRec).to.emit(fundMe, "fundWithdrawByOwner")
            .withArgs(ethers.parseEther("1"))
    });
})