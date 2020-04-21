const { program } = require('commander');
const ethers = require("ethers");
const bip39 = require("bip39");
const prompt = require("prompt");
const qrcode = require("qrcode-terminal");

/*
program ini digunakan untuk 
1 generate mnemonic
2 mengambil address dari mnemonic
    1. input mnemonic
    2. input blockchain [eth, tt]
*/

// generate mnemonic, length should be 128, 256, 512
program
  .command('generate [length]')
  .action(function (length) {
    if (!length) length = 24;
    if ([12, 24].findIndex(v => v == parseInt(length)) < 0) return console.error("invalid length, should be 12 or 24");

    length = length == 12 ? 128 : 256;

    console.log(bip39.generateMnemonic(length));
  })

// chain should be 
const knownChain = {
  eth: 60,
  tt: 1001,
  etc: 61,
  btc: 0,
  bch: 145,
  bsv: 236,
  doge: 3,
  ltc: 2
}
program
  .command('address <chain> [path]')
  .action(function (chain, path) {
    // get mnemonic from prompt
    prompt.start();
    prompt.get([{
      name: "mnemonic",
      hidden: true
    }], function (err, result) {
      const mnemonic = result.mnemonic;
      if (['eth', 'etc', 'tt'].findIndex(v => v == chain) >= 0) {
        if (ethers.utils.HDNode.isValidMnemonic(mnemonic)) {
          const rootNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
          // console.log(rootNode.extendedKey);

          // 44'/60'/0'
          const coin = knownChain[chain];
          let coinId = parseInt(coin);
          if (isNaN(coinId) || !isFinite(coinId)) return console.error("INVALID COIN", coin, chain);
          const accountExtendedNode = rootNode.derivePath(`44'/${coinId}'/0'`);
          // console.log(accountExtendedNode.extendedKey);

          // 44'/60'/0'/0
          const extendedNode = accountExtendedNode.derivePath('0');
          // console.log(extendedNode.extendedKey);

          if (!path) path = '0';
          const addressNode = extendedNode.derivePath(path);
          const address = addressNode.address;
          qrcode.generate(address);
          console.log(address);
        } else {
          console.error("Invalid Mnemonic")
        }
      } else {
        console.log(`chain ${chain} not supported yet`);
      }
    })
  })

program.parse(process.argv);
