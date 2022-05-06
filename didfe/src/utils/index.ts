import secp256k1 from 'secp256k1';
import createKeccakHash from 'keccak';
import Web3 from "web3";
import didAbi from './DidABI.json';
import didBytecode from './DidBytecode.json';
import Chains from './chains';

async function signString(content: string, web3: Web3, account: string): Promise<DID.SignResult> {
  const dataHex = Web3.utils.utf8ToHex(content);
  const sha_hash = Web3.utils.soliditySha3(dataHex);
  const signature = web3.utils.hexToBytes(await web3.eth.sign(String(sha_hash), account));
  const buf_sig = Buffer.from(signature)
  const res = {
    r: "0x" + buf_sig.slice(0, 32).toString('hex'),
    s: "0x" + buf_sig.slice(32, 64).toString('hex'),
    v: "0x" + buf_sig[64].toString(16),
    signature: "0x" + buf_sig.toString('hex'),
  };

  return res;
}

function recoverPublicKey(data: string, signature: string, recid: number) {
  const dataHex = Web3.utils.utf8ToHex(data);
  const hex32bytes: any = Web3.utils.soliditySha3(dataHex);
  const bytes32_hash = Web3.utils.hexToBytes(hex32bytes);
  const uint8_hash = Uint8Array.from(Buffer.from(bytes32_hash));
  const uint8_sig = Uint8Array.from(Buffer.from(Web3.utils.hexToBytes(signature)).slice(0, 64));
  const recover = secp256k1.ecdsaRecover(uint8_sig, recid, uint8_hash, false);

  return recover;
}

function publicKeyToAccount(publicKey: Uint8Array) {

  publicKey = Buffer.from(secp256k1.publicKeyConvert(publicKey, false)).slice(1)
  const hash = createKeccakHash('keccak256').update(publicKey).digest()
  return Web3.utils.toChecksumAddress(hash.slice(-20).toString('hex'))
}

const verifyOwner = async (web3: Web3, didAddress: string, didAbi: any, account: string): Promise<boolean> => {
  try {
    let didInstance = new web3.eth.Contract(didAbi, didAddress);
    const res = await didInstance.methods.owner().call();
    if(res === account) return true;
    return false;
  } catch(error) {
    return false
  }
}

const enDisableVc = async (web3: Web3, account: string, didAddr: string, signature: string, toStatus: boolean) => {
  try {
    let didInstance = new web3.eth.Contract(didAbi, didAddr);
    const sig_32bytes = web3.utils.soliditySha3(signature);
    const res_created = await didInstance.methods.createdVC(sig_32bytes).call();
    if(res_created === toStatus) 
      return true;
    if(toStatus) {
      const res = await didInstance.methods.createVC(sig_32bytes).send({
        from: account 
      });
    } else {
      await didInstance.methods.removeVC(sig_32bytes).send({
        from: account
      })
    }
    return true;
  } catch(error) {
    return false;
  }

}

const queryVcEnabled = async (signature: string, web3: Web3, contractAddr: string): Promise<boolean> => {
  let didInstance = new web3.eth.Contract(didAbi, contractAddr);
  const sig_32bytes = web3.utils.soliditySha3(signature);
  const res_created = await didInstance.methods.createdVC(sig_32bytes).call();
  console.log("queryVcEnabled", res_created);
  return res_created; 
};


export { 
  signString, 
  recoverPublicKey, 
  publicKeyToAccount, 
  didAbi, 
  didBytecode,
  Chains,
  verifyOwner,
  queryVcEnabled,
  enDisableVc,
};
