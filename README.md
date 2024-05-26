# Canonical Frontend Registry Web Extension

Web extension which verifies that frontend builds of projects registered in a smart contract and associated with a particular ENS domain are legit / not compromised.

Developers can attest that they own the ENS domain of a particular web frontend and then can upload the hashes of their most recent frontend builds to a contract.

When someone goes to the frontend, the web extension will get each file as it is pulled down and hash it, checking against the information in the contract. **Please note** that due to time constraints, verification of JS files was not implemented - only the initial index file. A listener is present in `src/background.js` to intercept network requests and grab the contents of the requested files, but this has not been integrated into the verification logic yet. 

## Install

```
npm install
```

## Use 
* Build the `dist/`
```
npm run build 
```

* Open Firefox's web developer tools window by navigating to `about:debugging#/runtime/this-firefox`

* Click on `Load Temporary Add-on` and select the `manifest.json` file in the project root. Also press `Inspect`: this will open another window which will show you the URLs of the files intercepted by the listener to be parsed. 

* Navigate to `nascent.energy` - you will get a popup that the frontend code was verified against the contract and all is well. To see the failure conditions, comment out the `happypath` code block on `src/content.js#LN65` and uncomment the `sadpath`. 

