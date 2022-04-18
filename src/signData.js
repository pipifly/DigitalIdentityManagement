import Web3 from 'web3'
import secp256k1 from 'secp256k1';
import createKeccakHash from 'keccak';

const privateKey = '0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131';
const address = '0x73d6189c34C0A357A5850f315eE2120be1F2E5cd';

function createAccount(Web3) {
  // {
  //   address: '0x73d6189c34C0A357A5850f315eE2120be1F2E5cd',
  //   privateKey: '0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131',
  //   signTransaction: [Function: signTransaction],
  //   sign: [Function: sign],
  //   encrypt: [Function: encrypt]
  // }
  return Web3.eth.accounts.create();
}

function signEthTxn (web3) {
  web3.eth.accounts.privateKeyToAccount('0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131');
  const orderHash = Web3.utils.asciiToHex("fk!!!");
  console.log("直接使用web3.eth.accounts.sign, 会自动带上preifix。签名结果: ", web3.eth.accounts.sign(orderHash, privateKey));
}

function recoverPublicKey(data, signature) {
  const recover = secp256k1.recover(data, signature, 0, false).toString("hex");
  return recover;
}

function signString(string, privateKey) {

  const dataHex = Web3.utils.utf8ToHex(string);
  
  const sha_hash = Web3.utils.soliditySha3(dataHex); // 转成32bytes长
  const bytes32_sha_hash = Web3.utils.hexToBytes(sha_hash);
  
  const buf_sha_hash = Buffer.from(bytes32_sha_hash);
  const buf_privateKey = Buffer.from(Web3.utils.hexToBytes(privateKey));

  const sig = secp256k1.sign(buf_sha_hash, buf_privateKey);
  const ret = {};
  ret.r = "0x" + sig.signature.slice(0, 32).toString('hex');
  ret.s = "0x" + sig.signature.slice(32, 64).toString('hex');
  ret.v = "0x" + (sig.recovery + 27).toString(16);
  
  const recoveredPublicKey = recoverPublicKey(buf_sha_hash, sig.signature);
  console.log("recovered pub key: ", recoveredPublicKey);

  const publicKey = createPublicKey(privateKey);
  console.log("public key from privatekey: ", publicKey);

  console.log("recovered == public key", recoveredPublicKey === publicKey);
  
  const addressFromPublicKey = publicKeyToAddress(publicKey);

  console.log("address from public key: ", addressFromPublicKey)
  console.log("address: ", address);

  return ret;
}


function createPublicKey(privateKey) {
  const uint8_prikey = Uint8Array.from(Buffer.from(Web3.utils.hexToBytes(privateKey)));
  const pubkey = secp256k1.publicKeyCreate(uint8_prikey, false).toString('hex');
  return pubkey;
}


function publicKeyToAddress (publicKey) {
  if (!Buffer.isBuffer(publicKey)) {
    if (typeof publicKey !== 'string') {
      throw new Error('Expected Buffer or string as argument')
    }

    publicKey = publicKey.slice(0, 2) === '0x' ? publicKey.slice(2) : publicKey
    publicKey = Buffer.from(publicKey, 'hex')
  }
  
  publicKey = Buffer.from(secp256k1.publicKeyConvert(publicKey, false)).slice(1)
  const hash = createKeccakHash('keccak256').update(publicKey).digest()
  return Web3.utils.toChecksumAddress(hash.slice(-20).toString('hex'))
}

(async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/4fd2305497f349fb81fba70405c9f9fe"))
  // const web3 = await new Web3();
  // web3.eth.accounts.privateKeyToAccount('0xa641dd97b3e72a419e483b99d61998b3ade7fd8f50296e0df382af74334a0131');
  // const accounts = await web3.eth.personal.getAccounts();
  // console.log(await web3.eth.getAccounts())

  const dataString = JSON.stringify({
    "name": "张三",
    "stuId": 124346356,
    "major": "cs"
  });
  console.log(signString(dataString, privateKey));
  // const address = publicKeyToAddress(createPubkey(privateKey));
  // signEthTxn(web3);
})()