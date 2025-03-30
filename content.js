// 移除动态加载逻辑，因为我们已经在 manifest.json 中声明了 html2canvas.min.js
let html2canvasLib = window.html2canvas;

// 创建一个可重用的生成图片函数
async function generateImage(content) {
  // 确保 html2canvas 已加载
  if (!window.html2canvas) {
    throw new Error('html2canvas not loaded');
  }

  const canvas = await window.html2canvas(content, {
    willReadFrequently: true,
    backgroundColor: '#FFFFFF',
    scale: 2,
    logging: false,
    useCORS: true,
    removeContainer: true
  });
  return canvas;
}

// 创建弹窗样式
const style = document.createElement('style');
style.textContent = `
  .card-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 24px; /* 调整内边距 */
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    z-index: 10000;
    width: 680px;
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 9999;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .modal-title {
    font-size: 24px; /* 符合 Material 3 的大标题规范 */
    font-weight: 600; /* 中等加粗，突出标题 */
    color: #1C1B1F; /* 主文本颜色 */
    margin: 0 0 24px 0; /* 下边距为 24px，与内容区域保持间距 */
    padding-top: 24px; /* 上边距为 24px，与模态框顶部保持间距 */
  }

  .card-content {
    margin: 24px 0;
  }

  .card-preview {
    background: #FFFFFF;
    padding: 40px;
    border-radius: 16px;
    position: relative;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid #F0F0F0;
  }

  .card-preview-title {
    position: absolute;
    bottom: 16px; /* 调整到底部 */
    right: 16px; /* 调整到右侧 */
    color: rgba(103, 80, 164, 0.6); /* 调整颜色和透明度 */
    font-size: 14px; /* 调整字体大小 */
    font-weight: 500; /* 调整字体粗细 */
    letter-spacing: 0.5px;
    opacity: 0.85;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
  }

  .card-preview-content {
    background: #F8F5FF;
    padding: 32px;
    border-radius: 12px;
    margin-top: 32px;
    color: #1C1B1F;
    font-size: 18px;
    line-height: 1.6;
    letter-spacing: 0.15px;
    white-space: pre-wrap;
    padding-bottom: 60px; /* 增加底部内边距，避免内容被遮挡 */
  }

  .button-container {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .button {
    border: none;
    padding: 12px 24px;
    border-radius: 100px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    text-transform: uppercase;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.5px;
  }

  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .primary-button {
    background: #6750A4;
    color: white;
  }

  .primary-button:hover {
    background: #7C6BBF;
  }

  .secondary-button {
    background: #F3EEFF;
    color: #6750A4;
  }

  .secondary-button:hover {
    background: #E8DEF8;
  }

  .close-button {
    position: absolute;
    top: 24px;
    right: 24px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s ease;
    color: #1C1B1F;
  }

  .close-button:hover {
    background: #F5F5F5;
    transform: rotate(90deg);
  }

  .button svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    .card-modal {
      width: 90vw;
      padding: 24px;
    }
    
    .card-preview {
      padding: 32px 24px;
    }
    
    .card-preview-content {
      padding: 24px;
      font-size: 16px;
    }
    
    .button-container {
      flex-wrap: wrap;
    }
    
    .button {
      width: 100%;
      justify-content: center;
    }
  }
`;

document.head.appendChild(style);

// 添加ping处理程序
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "ok" });
    return true;
  }
  if (request.action === "createCard") {
    createCardModal(request.selectedText);
    sendResponse({ status: "ok" });
    return true;
  }
});

// 通知background script内容脚本已加载
chrome.runtime.sendMessage({ action: "contentScriptLoaded" });

async function createCardModal(selectedText) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'card-modal';

  const modalContent = `
    <div class="modal-header">
      <h2 class="modal-title">TextSnap, 分享从未如此美妙</h2>
      <button class="close-button" type="button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    <div class="card-content">
      <div class="card-preview">
        <div class="card-preview-title">TextSnap</div>
        <div class="card-preview-content">${selectedText}</div>
      </div>
    </div>
    <div class="button-container">
      <button type="button" class="button secondary-button" id="copyBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z"/>
          <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2"/>
        </svg>
        复制
      </button>
      <button type="button" class="button secondary-button" id="downloadBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <path d="M7 10l5 5 5-5"/>
          <path d="M12 15V3"/>
        </svg>
        下载
      </button>
      <button type="button" class="button primary-button" id="shareBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5 0-.28-.03-.56-.08-.83A7.72 7.72 0 0023 3z"/>
        </svg>
        分享到 X
      </button>
    </div>
  `;

  modal.innerHTML = modalContent;
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  const closeModal = () => {
    overlay.remove();
    modal.remove();
  };

  modal.querySelector('.close-button').addEventListener('click', closeModal);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // 复制按钮事件
  modal.querySelector('#copyBtn').addEventListener('click', async () => {
    const previewElement = modal.querySelector('.card-preview');
    if (!previewElement) {
      showToast('获取预览内容失败');
      return;
    }

    try {
      const canvas = await generateImage(previewElement);
      if (!canvas) {
        throw new Error('Canvas generation failed');
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Blob creation failed');
        }

        try {
          const clipboardItem = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([clipboardItem]);
          showToast('已复制到剪贴板');
        } catch (error) {
          console.error('复制到剪贴板失败:', error);
          showToast('复制失败，请重试');
        }
      }, 'image/png');
    } catch (error) {
      console.error('生成图片失败:', error);
      showToast('生成图片失败，请重试');
    }
  });

  // 下载按钮事件
  modal.querySelector('#downloadBtn').addEventListener('click', async () => {
    const previewElement = modal.querySelector('.card-preview');
    if (!previewElement) {
      showToast('获取预览内容失败');
      return;
    }

    try {
      const canvas = await generateImage(previewElement);
      if (!canvas) {
        throw new Error('Canvas generation failed');
      }

      const link = document.createElement('a');
      link.download = 'textsnap-card.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('下载成功');
    } catch (error) {
      console.error('下载失败:', error);
      showToast('下载失败，请重试');
    }
  });

  // 分享按钮事件
  modal.querySelector('#shareBtn').addEventListener('click', () => {
    const text = encodeURIComponent(selectedText);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(shareUrl, '_blank');
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #333333;
    color: white;
    padding: 12px 24px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}