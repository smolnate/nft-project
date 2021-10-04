require("@nomiclabs/hardhat-waffle");

const { url, accounts } = require('./config.js');

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: url,
      accounts: accounts,
    }
  }
};
