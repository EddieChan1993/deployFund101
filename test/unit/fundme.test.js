// 引入依赖库
const {ethers, deployments, getNamedAccounts} = require("hardhat"); // Hardhat 核心库
const {assert, expect} = require("chai"); // 断言库
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {devChains} = require("../../hardhat.helper.config")
//npx hardhat test --network sepolia 本地网络测试

// 定义测试套件
!devChains.includes(network.name) ? describe.skip : describe("test fundme contract", async function () {
    let fundMe; // 存储 FundMe 合约实例
    let fundMeSecAcc;
    let firstAccount; // 存储部署者账户地址
    let secondAccount; // 存储部署者账户地址
    let mockV3Aggregator;
    // 在每个测试用例前重置合约状态
    beforeEach(async function () {
        // 重新部署所有带 "all" 标签的合约（依赖 hardhat-deploy 插件）
        await deployments.fixture(["all"]);

        // 获取配置中预定义的账户（需在 hardhat.config.js 的 namedAccounts 中定义）
        firstAccount = (await getNamedAccounts()).firstAccount;
        secondAccount = (await getNamedAccounts()).secondAccount;

        // 获取 FundMe 合约的部署信息（地址、ABI 等）
        const fundMeDeployment = await deployments.get("FundMe");

        // 创建合约实例：通过 ABI 和地址连接到合约
        fundMe = await ethers.getContractAt("FundMe", // 合约名称
            fundMeDeployment.address // 合约部署地址
        );

        mockV3Aggregator = await deployments.get("MockV3Aggregator");

        fundMeSecAcc = await ethers.getContract("FundMe", secondAccount)
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
        assert.equal(await fundMe.dataFeed(), mockV3Aggregator.address // Sepolia 测试网 ETH/USD 预言机地址
        );
    });

    /*-------------fund---------------*/
    it('fund window close', async function () {
        await helpers.time.increase(200);
        await helpers.mine()
        expect(fundMe.fund({value: ethers.parseEther("0.1")})).to.be.revertedWith("fund close")//wei
    });

    it('fund value < min', async function () {
        expect(fundMe.fund({value: ethers.parseEther("0.000001")})).to.be.revertedWith("Ether need more")//wei
    });

    it('fund fund success', async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        const balance = await fundMe.funderMAmount(firstAccount)
        assert.equal(balance, ethers.parseEther("0.1"))
    });

    /*-------------getFund---------------*/
    it('getFund no owner', async function () {
        await fundMe.fund({value: ethers.parseEther("1")})
        await helpers.time.increase(200);
        await helpers.mine()
        await expect(fundMeSecAcc.getFund()).to.be.revertedWith("no owner")//wei
    });

    it('getFund window open', async function () {
        await expect(fundMe.getFund()).to.be.revertedWith("fund doing")//wei
    });

    it('getFund balance< target', async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await helpers.time.increase(200);
        await helpers.mine()
        await expect(fundMe.getFund()).to.be.revertedWith("Target no")//wei
    });

    it('getFund success', async function () {
        await fundMe.fund({value: ethers.parseEther("1")})
        await helpers.time.increase(200);
        await helpers.mine()
        await expect(fundMe.getFund()).to.emit(fundMe, "fundWithdrawByOwner")
            .withArgs(ethers.parseEther("1.1"))//fund函数 支付了0.1
    });
    /*-------------reFund---------------*/
    it('reFund no fund', async function () {
        await helpers.time.increase(100);
        await helpers.mine()
        await expect(fundMe.reFund()).to.be.revertedWith("fund doing")//wei
    });

    it('reFund Target Ok', async function () {
        await fundMe.fund({value: ethers.parseEther("1")})
        await helpers.time.increase(200);
        await helpers.mine()
        await expect(fundMe.reFund()).to.be.revertedWith("Target Ok")//wei
    });

    it('getFund window open', async function () {
        await expect(fundMe.reFund()).to.be.revertedWith("fund doing")//wei
    });

    it('reFund success', async function () {
        await fundMeSecAcc.fund({value: ethers.parseEther("0.1")})
        await helpers.time.increase(200);
        await helpers.mine()
        await expect(fundMeSecAcc.reFund()).to.emit(fundMe, "fundWithRe")
            .withArgs(secondAccount, ethers.parseEther("0.1"))
    });
});