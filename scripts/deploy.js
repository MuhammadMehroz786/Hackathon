const hre = require("hardhat");

async function main() {
    console.log("Deploying FreelancerIncomeLog to Polygon Amoy...");

    const FreelancerIncomeLog = await hre.ethers.getContractFactory("FreelancerIncomeLog");
    const contract = await FreelancerIncomeLog.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`FreelancerIncomeLog deployed to: ${address}`);
    console.log(`\nAdd this to your .env file:`);
    console.log(`CONTRACT_ADDRESS=${address}`);
    console.log(`\nView on Polygonscan: https://amoy.polygonscan.com/address/${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
