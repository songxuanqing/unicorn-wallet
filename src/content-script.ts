
//웹사이트로부터 메세지 수신
window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }

  if (event.data.type && (event.data.type == "UNICORN_WALLET_SEND")) {
    console.log("리스너 등록 횟수",event);
    console.log("event",event);
    console.log("Content script received: " + event.data);
    chrome.runtime.sendMessage({type:"sendTxn", data: event.data}, function(response) {
      console.log(response.data);
    });
  };
}, false);

window.removeEventListener('message', (event)=>{
  console.log("removed");
  console.log("removed",event);
},false);