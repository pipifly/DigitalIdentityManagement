
可以先看
[**erc725 使用例子**](
https://hackernoon.com/first-impressions-with-erc-725-and-erc-735-identity-and-claims-4a87ff2509c9)
里面有DID持有，发行，验证的例子
然后 main.js 是与这些合约交互的步骤。

signData.js 是看[**web3, secp256k1 签名与Solidity验签**](https://zhuanlan.zhihu.com/p/69542679)写的。
里面有给数据用secp256k1签名，可以用solidity的keccak256 验签。

[**secp256k1包API**](https://github.com/cryptocoinjs/secp256k1-node/blob/v3.x/API.md)

signString 函数里给数据签名后，不知道怎么用keccak256验签
recover 后的公钥是 0x02caa5418a17c694e5ec4d898f60f5b5f75be6586a7cefb8c53ae581dc3bc0f821

但公钥应该是 0x73d6189c34C0A357A5850f315eE2120be1F2E5cd
```
  secp256k1.verify(buf_sha_hash, sig.signature, buf_pubKey);
  const recover = secp256k1.recover(buf_sha_hash, sig.signature, 0).toString("hex");
  console.log(recover, recover.length); 
```


```
npm install 
npm run signdata 
```

[**web3js方法列表**](http://cw.hubwiz.com/card/c/web3.js-1.0/1/2/23/l)
