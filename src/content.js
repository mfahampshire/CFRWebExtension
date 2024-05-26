import { ethers, Contract, keccak256, utils, solidityPackedKeccak256 } from 'ethers';
// onstart tests
console.log('Content script running');
// ethers tests
let connection = ethers.getDefaultProvider("https://eth-sepolia.g.alchemy.com/v2/HlY_GE0m9-VFgw7bJGzZKv7qC08Xeut4")
console.log(connection.getBlockNumber().then(response => {
  console.log('block number: ', response);
}).catch(error => {
  console.log('error: ', error);
}))

// send message to background.js to start listening to out to intercept network requests for JS 
// files in the background in the future this will enable verification of the served build a level 'deeper' than we're 
// doing currently which currently involves naively checking the HTML code itself 
//
// the only reason this deeper level wasn't fully implemented was due to time constraints (｡•́︿•̀｡)
browser.runtime.sendMessage({ action: "startListener" });

let sepAbi = [
  "function getFrontendFull(bytes32 enshash) external view returns (bytes32[] memory files, uint128 timestamp, uint256 versionNumber)"
]
let sepContract = new Contract("0x0ff64e781b0fc0b5595604c2f9b660a40b73c231", sepAbi, connection);
console.log(sepContract)

// hack to check by TLD for this demo as we know we're checking nascent.energy 
let url = window.location.hostname
if (url.endsWith('/')) {
  url = url.slice(0, -1);
}
let parts = url.split('.');
let tld = parts[parts.length - 1];

let enshash = solidityPackedKeccak256(["string"], [tld]);
try {
  let getFrontend = await sepContract.getFrontendFull(enshash);
  console.log("returned from getFrontendFull: ", getFrontend[0][0].substring(2));
  let contractHash = getFrontend[0][0].substring(2)

  async function hashContent(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async function getAndHashPageContent() {
    try {
      const response = await fetch(window.location.href);
      if (!response.ok) {
        console.error('Failed to fetch the page content');
        return;
      }
      const content = await response.text();
      let hash = await hashContent(content);
      console.log('Page content hash:', hash);
      console.log('typeof hash in getAndHashPageContent ' + typeof hash)
      return hash
    } catch (error) {
      console.error('Error hashing page content:', error);
    }
  }

  // happypath
  if (await getAndHashPageContent() == contractHash) {
    window.alert("( ˘▽˘)っ♨ everything is all good! the frontend code has passed verification - you can rest assured that this frontend is doing what the developers say it is and it hasn't been compromised by a 3rd party (◕ᴗ◕✿)")
  } else {
    window.alert("(｡+･`ω･´) STOP! the frontend code has failed verification: you might be interacting with a compromised frontend which could steal your funds or take other actions on your behalf than what you think you are confirming. Cancel your tx or proceed with extreme caution! (⊙▂⊙✖ )")
    console.log(`typeof hash ` + typeof hash)
    console.log(`typeof contractHash ` + typeof contractHash)
  }

  /*
  // sadpath
  let badContractHash = getFrontend[0][0].substring(4)
  
  if (await getAndHashPageContent() == badContractHash) {
    window.alert("( ˘▽˘)っ♨ everything is all good!")
  } else {
    window.alert("(｡+･`ω･´) STOP! the frontend code has failed verification: you might be interacting with a compromised frontend which could steal your funds or take other actions on your behalf than what you think you are confirming. Cancel your tx or proceed with extreme caution! (⊙▂⊙✖ )")
    console.log(`typeof hash ` + typeof hash)
    console.log(`typeof contractHash ` + typeof contractHash)
  }
  */
} catch (error) {
  console.log(error)
}


