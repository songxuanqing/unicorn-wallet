chrome.runtime.onInstalled.addListener(() => {
    console.log("installed");
});


//수신된 메세지를 백그라운드에서 받음.
//chrome extension open

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("received");
        console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
        if (request.greeting === "hello"){
            console.log("received");
            chrome.windows.create({ url: 'index.html', type: 
             "popup", height : 600, width : 375 });
            sendResponse({farewell: "goodbye"});
        }
    }
);

  
//현재 탭이 업데이트 될때 리스너 등록. contents script발동
chrome.tabs.onUpdated.addListener(function(tab) {
    chrome.tabs.executeScript({ //해당 함수 동작을 위해서 꼭 다른 함수 안에 포함되어야 한다.
        file: 'content-script.js'
    }); 

});
