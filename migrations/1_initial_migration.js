var FaireumToken = artifacts.require("./FaireumToken.sol");

module.exports = function(deployer) {
  deployer.deploy(FaireumToken);
};