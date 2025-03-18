const {task} = require("hardhat/config");
/**
 * 交互合约
 */
task("interact-fundme", "interact contract fundMe")
    .addParam("addr", "fundme contract addr")
    .setAction(async (taskArgs, hre) => {
        const fundMeIns = await ethers.getContractFactory("FundMe")
        const fundMe = fundMeIns.attach(taskArgs.addr)
        //init 2 accounts
        const [Account1, Account2] = await ethers.getSigners();
        //Account1 fund contract with first account
        const fundTx = await fundMe.fund({value: ethers.parseEther("0.5")});
        await fundTx.wait();//等待交易成功
        //check balance of contract
        const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
        console.log("now balance of contract: ", balanceOfContract);
        //Account2 fund contract with first account
        const fundTx2 = await fundMe.connect(Account2).fund({value: ethers.parseEther("0.5")});
        await fundTx2.wait();//等待交易成功
        //check balance of contract
        const balanceOfContract2 = await ethers.provider.getBalance(fundMe.target)
        console.log("now balance of contract: ", balanceOfContract2);

        const acc1Balance = await fundMe.funderMAmount(Account1.address)
        const acc2Balance = await fundMe.funderMAmount(Account2.address)
        console.log("balance of fund acc1: ", Account1.address, acc1Balance);
        console.log("balance of fund acc2: ", Account2.address, acc2Balance);
    });

module.exports = {}