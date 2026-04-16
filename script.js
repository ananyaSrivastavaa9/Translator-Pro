const endpointEl = document.getElementById('endpoint');
const keyEl = document.getElementById('key');
const inputTextEl = document.getElementById('inputText');
const targetLangEl = document.getElementById('targetLang');
const outputEl = document.getElementById('outputText');
const voiceBtn = document.getElementById('voiceBtn');
const cameraBtn = document.getElementById('cameraBtn');
const cameraBox = document.getElementById('cameraBox');
const saveBtn = document.getElementById('saveBtn');
const translateBtn = document.getElementById('translateBtn');
const ocrStatus = document.getElementById('ocrStatus');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startCamBtn = document.getElementById('startCamBtn');
const stopCamBtn = document.getElementById('stopCamBtn');
const captureBtn = document.getElementById('captureBtn');
const imageFile = document.getElementById('imageFile');
const tiltCard = document.getElementById('tiltCard');
const swapBtn = document.getElementById('swapBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const charCount = document.getElementById('charCount');
const currentLangLabel = document.getElementById('currentLangLabel');
const historyList = document.getElementById('historyList');
const historySearch = document.getElementById('historySearch');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const chatFab = document.getElementById('chatFab');
const chatDialog = document.getElementById('chatDialog');
const chatClose = document.getElementById('chatClose');
const chatLog = document.getElementById('chatLogPopup');
const chatInput = document.getElementById('chatInputPopup');
const chatSend = document.getElementById('chatSendPopup');

let stream = null;
let tiltFrame = null;
let history = JSON.parse(localStorage.getItem('translationHistory') || '[]');

const langNames = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  hi: 'Hindi',
  ja: 'Japanese',
  'zh-Hans': 'Chinese (Simplified)',
  ar: 'Arabic',
  ru: 'Russian',
  pt: 'Portuguese',
  it: 'Italian',
  en: 'English',
  ko: 'Korean',
  tr: 'Turkish',
  nl: 'Dutch',
  '': 'Auto Detect'
};

function updateLangLabel() {
  currentLangLabel.textContent = `Selected: ${langNames[targetLangEl.value] || targetLangEl.value}`;
}

function saveHistoryItem(item) {
  history.unshift(item);
  history = history.slice(0, 20);
  localStorage.setItem('translationHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const q = historySearch.value.trim().toLowerCase();
  historyList.innerHTML = '';
  history
    .filter(item =>
      !q ||
      item.input.toLowerCase().includes(q) ||
      item.output.toLowerCase().includes(q) ||
      item.lang.toLowerCase().includes(q)
    )
    .forEach(item => {
      const div = document.createElement('div');
      div.className = 'historyItem';
      div.innerHTML = `
        <div class="historyMeta">${item.time} • ${item.lang}</div>
        <div class="historyText"><strong>Input:</strong> ${item.input}</div>
        <div class="historyText"><strong>Output:</strong> ${item.output}</div>
      `;
      historyList.appendChild(div);
    });
}

endpointEl.value = localStorage.getItem('azureEndpoint') || '';
keyEl.value = localStorage.getItem('azureKey') || '';
updateLangLabel();
charCount.textContent = `${inputTextEl.value.length} characters`;
renderHistory();

saveBtn.onclick = () => {
  localStorage.setItem('azureEndpoint', endpointEl.value.trim());
  localStorage.setItem('azureKey', keyEl.value.trim());
  outputEl.textContent = 'API settings saved locally for reuse.';
};

cameraBtn.onclick = () => cameraBox.classList.toggle('open');

inputTextEl.addEventListener('input', () => {
  charCount.textContent = `${inputTextEl.value.length} characters`;
});

targetLangEl.addEventListener('change', updateLangLabel);

swapBtn.onclick = () => {
  const current = targetLangEl.value;
  targetLangEl.value = current === 'en' ? 'es' : 'en';
  updateLangLabel();
  outputEl.textContent = `Target language changed to ${langNames[targetLangEl.value] || targetLangEl.value}.`;
};

clearBtn.onclick = () => {
  inputTextEl.value = '';
  outputEl.textContent = 'Your translation will appear here.';
  charCount.textContent = '0 characters';
};

copyBtn.onclick = async () => {
  const text = outputEl.textContent.trim();
  if (!text || text === 'Your translation will appear here.') return;
  try {
    await navigator.clipboard.writeText(text);
    outputEl.textContent = 'Output copied to clipboard.';
  } catch {
    outputEl.textContent = 'Copy failed in this browser.';
  }
};

speakBtn.onclick = () => {
  const text = outputEl.textContent.trim();
  if (!text || text === 'Your translation will appear here.') return;
  if (!('speechSynthesis' in window)) {
    outputEl.textContent = 'Text-to-speech is not supported in this browser.';
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = targetLangEl.value === 'zh-Hans' ? 'zh-CN' : (targetLangEl.value || 'en');
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
};

async function detectLanguage(text, endpoint, key) {
  const res = await fetch(`${endpoint}/translator/text/v3.0/detect?api-version=3.0`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': 'global',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ Text: text }])
  });
  if (!res.ok) throw new Error(`Detect HTTP ${res.status}`);
  const data = await res.json();
  return data?.[0]?.language || '';
}

async function translateText() {
  const text = inputTextEl.value.trim();
  const endpoint = endpointEl.value.trim().replace(/\/$/, '');
  const key = keyEl.value.trim();
  const target = targetLangEl.value;

  if (!text) return outputEl.textContent = 'Enter or capture text first.';
  if (!endpoint || !key) return outputEl.textContent = 'Add your Azure endpoint and key first.';

  outputEl.textContent = 'Translating...';

  try {
    let from = '';
    if (!target) from = await detectLanguage(text, endpoint, key);

    const url = `${endpoint}/translator/text/v3.0/translate?api-version=3.0${target ? `&to=${encodeURIComponent(target)}` : ''}`;
    const headers = {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': 'global',
      'Content-Type': 'application/json'
    };
    if (from) headers['from'] = from;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ Text: text }])
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.[0]?.translations?.[0]?.text || 'No translation returned.';
    outputEl.textContent = translated;

    saveHistoryItem({
      time: new Date().toLocaleString(),
      lang: target ? (langNames[target] || target) : `Auto (${from || 'unknown'})`,
      input: text,
      output: translated
    });
  } catch (err) {
    outputEl.textContent = `Translation error: ${err.message}`;
  }
}

translateBtn.onclick = translateText;

function addPopupMsg(text, who = 'bot') {
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function popupBotReply(q) {
  const s = q.toLowerCase();
  if (/^(hi|hello|hey)\b/.test(s)) return 'Hello! I can help with voice input, OCR, API setup, history, and translation.';
  if (s.includes('help')) return 'Use the input box, select a language, and press Translate. You can also use voice and OCR.';
  if (s.includes('ocr') || s.includes('image')) return 'Open the camera section or upload an image, then run OCR to fill the input box.';
  if (s.includes('voice') || s.includes('speech')) return 'Click Voice and speak. The browser will convert your speech into text.';
  if (s.includes('history')) return 'Your translations are saved in localStorage and shown in the history panel.';
  if (s.includes('api') || s.includes('azure')) return 'Paste your Azure Translator endpoint and key, then save them for reuse.';
  return 'I can guide you through translation, OCR, voice input, history, and API setup.';
}

chatFab.onclick = () => {
  if (chatDialog.open) chatDialog.close();
  else chatDialog.showModal();
};

chatClose.onclick = () => chatDialog.close();

chatSend.onclick = () => {
  const q = chatInput.value.trim();
  if (!q) return;
  addPopupMsg(q, 'user');
  addPopupMsg(popupBotReply(q), 'bot');
  chatInput.value = '';
};

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') chatSend.click();
});

historySearch.addEventListener('input', renderHistory);

clearHistoryBtn.onclick = () => {
  history = [];
  localStorage.removeItem('translationHistory');
  renderHistory();
};

voiceBtn.onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    outputEl.textContent = 'SpeechRecognition is not supported in this browser.';
    return;
  }
  const recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  outputEl.textContent = 'Listening...';
  recognition.onresult = e => {
    inputTextEl.value = e.results[0][0].transcript;
    charCount.textContent = `${inputTextEl.value.length} characters`;
    outputEl.textContent = 'Speech captured and placed into the input box.';
  };
  recognition.onerror = e => {
    outputEl.textContent = `Voice error: ${e.error}`;
  };
  recognition.start();
};

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    await video.play();
    ocrStatus.textContent = 'Camera ready.';
  } catch (err) {
    ocrStatus.textContent = `Camera error: ${err.message}`;
  }
}

function stopCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  video.srcObject = null;
  ocrStatus.textContent = 'Camera stopped.';
}

startCamBtn.onclick = startCamera;
stopCamBtn.onclick = stopCamera;

captureBtn.onclick = async () => {
  if (!video.videoWidth) return ocrStatus.textContent = 'Start the camera first.';
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  ocrStatus.textContent = 'Running OCR...';
  try {
    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    inputTextEl.value = text.trim();
    charCount.textContent = `${inputTextEl.value.length} characters`;
    ocrStatus.textContent = 'Text extracted into the input box.';
  } catch (err) {
    ocrStatus.textContent = `OCR error: ${err.message}`;
  }
};

imageFile.onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;
  ocrStatus.textContent = 'Running OCR on uploaded image...';
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    inputTextEl.value = text.trim();
    charCount.textContent = `${inputTextEl.value.length} characters`;
    ocrStatus.textContent = 'Image text extracted into the input box.';
  } catch (err) {
    ocrStatus.textContent = `OCR error: ${err.message}`;
  }
};

function setTilt(clientX, clientY) {
  const r = tiltCard.getBoundingClientRect();
  const x = (clientX - r.left) / r.width - 0.5;
  const y = (clientY - r.top) / r.height - 0.5;
  const rx = (-y * 1.5).toFixed(2);
  const ry = (x * 2).toFixed(2);
  tiltCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
}

document.querySelector('.app').addEventListener('mousemove', e => {
  if (tiltFrame) cancelAnimationFrame(tiltFrame);
  tiltFrame = requestAnimationFrame(() => setTilt(e.clientX, e.clientY));
});

document.querySelector('.app').addEventListener('mouseleave', () => {
  tiltCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
});