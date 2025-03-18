const {task} = require("hardhat/config");
/**
 * 部署合约
 */
task("deploy-fundme","deploy-contract fundMe").setAction(async (taskArgs, hre) => {
    //crate factory
    waitSecV = 100
    const fundMeFactory = await ethers.getContractFactory("FundMe");//合约工厂，负责对合约进行部署

    //deploy contract from factory
    const fundMe = await fundMeFactory.deploy(waitSecV);//合约构造函数 参数
    await fundMe.waitForDeployment();//等待合约入块
    console.log(`contract has been deployed! addrsss ${fundMe.target}`);

    //verify FundMe
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for 5 confirmations...");
        await fundMe.deploymentTransaction().wait(5)
        await verifyFundMe(fundMe.target, waitSecV);
    } else {
        console.log("no verify as chanId no || no API KEY");
    }
});

async function verifyFundMe(addr, args) {
    await hre.run("verify:verify", {
        address: addr, constructorArguments: [args],
    });
}

module.exports = {}