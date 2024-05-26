console.log('Background script running');

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  console.log("calling addistener changeinfo");
  if (changeInfo.status === 'complete') {
    // browser.tabs.executeScript(tabId, { allFrames: true, file: './content.js' });
    browser.tabs.executeScript(tabId, { allFrames: true, code: "console.log('changeinfo status = complete')" });
  } else {
    //console.log("oh no: status:")
    //  console.log("changeinfostatus", changeInfo.status)
  }
});

browser.tabs.onCreated.addListener((tab) => {
  console.log(`New tab created: ${tab.id}`);
});

// this is clunky as we need to then fetch the code @ the URL to compare but i cant think of an elegant way to access the cache storage  
// should do some matching on the contract and then pass notification to the `content.js` script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "startListener") {
    console.log("got start listener message from content.js")
    let urlArray = []
    browser.webRequest.onBeforeRequest.addListener(
      // create the array to loop thru 
      function(details) {
        if (
          details.method === "GET" && // parse on GET request
          details.type === "script" && // parse on script file
          details.url.endsWith(".js") // parse on JavaScript file
        ) {
          let urlExists = false;

          for (let i = 0; i < urlArray.length; i++) {
            if (urlArray[i] === details.url) {
              urlExists = true;
              break;
            }
          }
          if (!urlExists) {
            urlArray.push(details.url);
          }
          console.log(urlArray);
          /*
           Future work:
           This is the point where you do the following: 
           * for the enshash, grab all associated hashes from the contract
           * check that each hash is able to be matched to one present in urlArray 
           * either continue or send a message to content.js to throw a warning to the user
          
          this accounts for the fact that one of the hashes uploaded by the devs hasn't been 
          **changed**: it doesn't yet account for the possibility of another file being **added**. 

          this is because there might be e.g. html elements that pull files from other domains which would 
          cause the warning to be falsly triggered if we were making sure that both arrays were identical. 

          some sort of 'common domains' list to parse against might be one avenue to explore in order to 
          make the testing of additional files more rigourous. 
          */
        }
      },
      { urls: ["<all_urls>"] }, // match all urls 
      ["blocking"] //  "blocking" request intercept 
    );
  }
});

