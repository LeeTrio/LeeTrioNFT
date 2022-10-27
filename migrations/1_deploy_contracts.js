const Utils = artifacts.require("Utils");
const LeeTrioNFT = artifacts.require("LeeTrioNFT");
const LeeTrioToken = artifacts.require("LeeTrioToken");

module.exports = async function (deployer) {
  await deployer.deploy(LeeTrioToken);
  await deployer.deploy(LeeTrioNFT);
  await deployer.deploy(Utils, LeeTrioToken.address, LeeTrioNFT.address);
};
