const {task} = require("hardhat/config");
/**
 * 交互合约
 */
task("interact-fundme", "interact contract fundMe")
    .addParam("addr", "fundme contract addr")
    .setAction(async (taskArgs, hre) => {
            // 获取 FundMe 合约的工厂对象（用于操作合约）
            const fundMeIns = await ethers.getContractFactory("FundMe")

// 通过合约地址连接到已部署的 FundMe 合约实例
            const fundMe = fundMeIns.attach(taskArgs.addr)

// 初始化两个测试账户（默认使用 Hardhat 提供的本地测试账户）
            const [Account1, Account2] = await ethers.getSigners()

// ------------ 账户 1 的操作 ------------
// Account1 向合约充值 0.5 ETH
            const fundTx = await fundMe.fund({ value: ethers.parseEther("0.5") })
            await fundTx.wait() // 等待交易上链确认

// 查询合约当前 ETH 余额
            const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
            console.log("当前合约余额: ", balanceOfContract)

// ------------ 账户 2 的操作 ------------
// 使用 .connect() 切换操作账户为 Account2 进行充值
            const fundTx2 = await fundMe.connect(Account2).fund({ value: ethers.parseEther("0.5") })
            await fundTx2.wait()

// 再次查询合约 ETH 余额（预期累计 1 ETH）
            const balanceOfContract2 = await ethers.provider.getBalance(fundMe.target)
            console.log("更新后合约余额: ", balanceOfContract2)

// ------------ 验证合约内部记录 ------------
// 查询 Account1 在合约中记录的充值金额（通过合约的 funderMAmount 映射）
            const acc1Balance = await fundMe.funderMAmount(Account1.address)

// 查询 Account2 在合约中记录的充值金额
            const acc2Balance = await fundMe.funderMAmount(Account2.address)

// 打印两个账户的充值记录（验证数据正确性）
            console.log("账户 1 存款金额: ", Account1.address, acc1Balance)
            console.log("账户 2 存款金额: ", Account2.address, acc2Balance)
    });

module.exports = {}