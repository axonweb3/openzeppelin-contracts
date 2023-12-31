require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-web3');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

// const INFURA_PROJECT_ID = '719d739434254b88ac95d53e2b6ac997';

const argv = require('yargs/yargs')()
  .env('')
  .options({
    ci: {
      type: 'boolean',
      default: false,
    },
    coverage: {
      type: 'boolean',
      default: false,
    },
    gas: {
      alias: 'enableGasReport',
      type: 'boolean',
      default: false,
    },
    mode: {
      alias: 'compileMode',
      type: 'string',
      choices: ['production', 'development'],
      default: 'development',
    },
    compiler: {
      alias: 'compileVersion',
      type: 'string',
      default: '0.8.9',
    },
    coinmarketcap: {
      alias: 'coinmarketcapApiKey',
      type: 'string',
    },
  })
  .argv;

require('@nomiclabs/hardhat-truffle5');

if (argv.enableGasReport) {
  require('hardhat-gas-reporter');
}

for (const f of fs.readdirSync(path.join(__dirname, 'hardhat'))) {
  require(path.join(__dirname, 'hardhat', f));
}

const withOptimizations = argv.enableGasReport || argv.compileMode === 'production';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: argv.compiler,
    settings: {
      optimizer: {
        enabled: withOptimizations,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'testRpc',
  networks: {
    hardhat: {
      loggingEnabled: true,
      blockGasLimit: 10000000,
      allowUnlimitedContractSize: !withOptimizations,
    },
    axonLocal: {
      url: 'http://localhost:8000',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        path: 'm/44\'/60\'/0\'/0',
        initialIndex: 0,
        count: 20,
        passphrase: '',
      },
    },
    testRpc: {
      url: process.env.TEST_RPC,
      // gas:10000000,
      accounts: {
        mnemonic: process.env.MNEMONIC_STR,
        path: 'm/44\'/60\'/0\'/0',
        initialIndex: 0,
        count: 60,
        passphrase: '',
      },
    },
  },
  // defaultNetwork: 'axonLocal',
  mocha: {
    timeout: 100000,
    reporter: 'mochawesome',
  },

};

if (argv.coverage) {
  require('solidity-coverage');
  module.exports.networks.hardhat.initialBaseFeePerGas = 0;
}
