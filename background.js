// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  // 创建右键菜单
  chrome.contextMenus.create({
    id: "createCard",
    title: "使用 TextSnap 生成卡片",
    contexts: ["selection"]
  });
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "createCard") {
    try {
      // 确保tab存在且有效
      if (!tab?.id) {
        console.error('Invalid tab');
        return;
      }

      // 首先检查content script是否已注入
      try {
        await chrome.tabs.sendMessage(tab.id, { action: "ping" });
      } catch (error) {
        // 如果content script未注入，则注入它
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      }

      // 发送创建卡片的消息
      await chrome.tabs.sendMessage(tab.id, {
        action: "createCard",
        selectedText: info.selectionText
      });

    } catch (error) {
      console.error('Error in context menu handler:', error);
    }
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ping") {
    sendResponse({ status: "ok" });
  }
  return true;
});