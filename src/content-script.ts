
//웹사이트로부터 메세지 수신

window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }

  if (event.data.type && (event.data.type == "UNICORN_WALLET")) {
    console.log("Content script received: " + event.data.text);
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
        console.log(response.farewell);
      });
  }
}, false);