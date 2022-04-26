### ERC728 DID claim holder例子

可以先看
[**erc725 使用例子**](
https://hackernoon.com/first-impressions-with-erc-725-and-erc-735-identity-and-claims-4a87ff2509c9)
里面有DID持有，发行，验证的例子
然后 main.js 是与这些合约交互的步骤。

----

### js给数据签名和验签

signData.js 是看[**web3, secp256k1 签名与Solidity验签**](https://zhuanlan.zhihu.com/p/69542679)写的。
里面有给数据用secp256k1签名，可以用solidity的keccak256 验签。

[**secp256k1包API**](https://github.com/cryptocoinjs/secp256k1-node/blob/v3.x/API.md)

signString 函数里给数据签名后，recover 后的公钥是 *04caa5418a17c694e5ec4d898f60f5b5f75be6586a7cefb8c53ae581dc3bc0f821febe79f60a48722b0fd7fdff9585dd2f4afbe2434df6faad4d0a25da992c6140*

该私钥对应的以太坊地址是 0x73d6189c34C0A357A5850f315eE2120be1F2E5cd

[**这篇文章介绍了以太坊私钥怎么生成公钥，公钥再生成地址**](https://zhuanlan.zhihu.com/p/149821832)

signdata演示了给数据签名，验签，和公钥生成以太坊地址的过程。

```
npm install 
npm run signdata 
```

[**web3js方法列表**](http://cw.hubwiz.com/card/c/web3.js-1.0/1/2/23/l)

## Did合约

实现了createVC 和 removeVC。signature长为32字节。

secp256k1 签名后的signature 长为65字节。使用`Web3.utils.soliditySha3(dataHex);`可以讲仍以长度hex格式数据hash到32字节。

```json
{
  message: '0x666b212121',
  messageHash: '0x6bae94bd7e35d811f5de76e1315297f77808ef8e7d69aaae41ce35a52863cfb0',
  v: '0x1b',
  r: '0xd976332072787ea6648950a336e6f33bf59c2da4f8aee50938ce294ddd5fe4b6',
  s: '0x6266dcf4fb72051082c6dd0c266b5bde920edcab9b06b9582170480d0789e62d',
  signature: '0xd976332072787ea6648950a336e6f33bf59c2da4f8aee50938ce294ddd5fe4b66266dcf4fb72051082c6dd0c266b5bde920edcab9b06b9582170480d0789e62d1b'
}
```

