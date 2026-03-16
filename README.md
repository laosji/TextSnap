# TextSnap

A Chrome extension that turns selected text into beautiful shareable cards.

Select any text on a webpage, right-click and choose "TextSnap", and instantly generate a styled card that you can copy, download as PNG, or share to X (Twitter).

## Features

- **Right-click to create** — Select text, right-click, and generate a card instantly
- **Copy to clipboard** — Copy the card as a PNG image to your clipboard
- **Download as PNG** — Save the card as a high-resolution image
- **Share to X** — Share the selected text directly to X (Twitter)
- **Keyboard shortcut** — Press `Escape` to close the card modal

## Installation

### From source (Developer mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/user/textsnap.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `textsnap` folder

## Usage

1. Select any text on a webpage
2. Right-click and choose **"使用 TextSnap 生成卡片"**
3. A modal will appear with a preview of your text card
4. Use the buttons to:
   - **Copy** the card image to clipboard
   - **Download** the card as a PNG file
   - **Share** the text to X (Twitter)

## Screenshots

![TextSnap Card Preview](images/icon128.png)

## Tech Stack

- Chrome Extension Manifest V3
- [html2canvas](https://html2canvas.hertzen.com/) for rendering cards to images
- Vanilla JavaScript — no framework dependencies

## License

[MIT](LICENSE)
