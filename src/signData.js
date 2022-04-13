import Web3 from 'web3'
import secp256k1 from 'secp256k1';

const privateKey = '0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131';
const publicKey = '0x73d6189c34C0A357A5850f315eE2120be1F2E5cd';



function createAccount(web3) {
  // {
  //   address: '0x73d6189c34C0A357A5850f315eE2120be1F2E5cd',
  //   privateKey: '0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131',
  //   signTransaction: [Function: signTransaction],
  //   sign: [Function: sign],
  //   encrypt: [Function: encrypt]
  // }
  return web3.eth.accounts.create();
}

function signString(string, privateKey) {

  const dataHex = Web3.utils.utf8ToHex(string);
  console.log(dataHex);
  const sha_hash = Web3.utils.soliditySha3(dataHex); // 转成32bytes长
  const bytes32_sha_hash = Web3.utils.hexToBytes(sha_hash);
  
  const buf_sha_hash = Buffer.from(bytes32_sha_hash);
  const buf_privateKey = Buffer.from(Web3.utils.hexToBytes(privateKey));

  const sig = secp256k1.sign(buf_sha_hash, buf_privateKey);
  console.log(sig);
  const ret = {};
  ret.r = "0x" + sig.signature.slice(0, 32).toString('hex');
  ret.s = "0x" + sig.signature.slice(32, 64).toString('hex');
  ret.v = "0x" + (sig.recovery + 27).toString(16);
  console.log(sig.signature);
  // const buf_sig = Buffer.from(Web3.utils.hexToBytes(sig.signature));
  const  buf_pubKey = Buffer.from(Web3.utils.hexToBytes(publicKey));

  // secp256k1.verify(buf_sha_hash, sig.signature, buf_pubKey);
  // const recover = secp256k1.recover(buf_sha_hash, sig.signature, 0).toString("hex");
  // console.log(recover, recover.length);
  return ret;
}

function secp (web3) {
  const orderHash = web3.utils.asciiToHex("fk!!!");
  // const orderHash = "0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131";
  console.log("直接使用web3.eth.accounts.sign, 会自动带上preifix。签名结果: ", web3.eth.accounts.sign(orderHash, privateKey));
}


(async () => {
  // const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4fd2305497f349fb81fba70405c9f9fe"))
  const web3 = await new Web3();
  web3.eth.accounts.privateKeyToAccount('0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131');
  // console.log(createAccount(web3));
  // const accounts = await web3.eth.personal.getAccounts();
  // console.log(await web3.eth.getAccounts())
  
  // secp(web3);
  const dataString = JSON.stringify({
    "name": "张三",
    "stuId": 124346356,
    "major": "cs"
  });
  console.log(signString(dataString, privateKey));


})()