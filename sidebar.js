const providerSelect = document.getElementById('providerSelect');
const modelSelect = document.getElementById('modelSelect');
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const newChatBtn = document.getElementById('newChatBtn');
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const historyOverlay = document.getElementById('historyOverlay');
const historyClose = document.getElementById('historyClose');
const historyList = document.getElementById('historyList');
const historyNewBtn = document.getElementById('historyNewBtn');

const modelDropdown = document.getElementById('modelDropdown');
const modelToggle = document.getElementById('modelToggle');
const modelMenu = document.getElementById('modelMenu');
const activeModelIcon = document.getElementById('activeModelIcon');
const activeModelName = document.getElementById('activeModelName');

const modelsByProvider = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'o3-mini', label: 'o3 Mini' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
  ],
  google: [
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  ],
};

const providerIcons = {
  openai: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 11.2a7.13 7.13 0 0 0-1.8-6.17 7.08 7.08 0 0 0-6.14-1.8 7.12 7.12 0 0 0-11 5.4 7.1 7.1 0 0 0 1.8 6.16 7.1 7.1 0 0 0 6.14 1.8 7.1 7.1 0 0 0 11-5.4zm-9.87-8.12a5 5 0 0 1 4 2.1l-6 3.4v-6.9a5.1 5.1 0 0 1 2-1.4zm-7 2.62a5 5 0 0 1 2.3-1.6v6.8l-5.9 3.4a5 5 0 0 1 3.6-8.6zm-1.8 11.4a5 5 0 0 1-1.3-4.1l6-3.4v6.8l-4.7 2.7zm7 2.62a5 5 0 0 1-4-2.1l6-3.4v6.9a5.1 5.1 0 0 1-2 1.4zm7-2.62a5 5 0 0 1-2.3 1.6v-6.8l5.9-3.4a5 5 0 0 1-3.6 8.6zm1.8-11.4a5 5 0 0 1 1.3 4.1l-6 3.4v-6.8l4.7-2.7z"/></svg>',
  anthropic: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>',
  google: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>'
};

let activeChatId = null;
let chatHistory = [];
let isProcessing = false;
let historyOpen = false;
let lastSentText = '';
let ready = false;

const languageNames = {
  js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX',
  ts: 'TypeScript', typescript: 'TypeScript', tsx: 'TSX',
  py: 'Python', python: 'Python',
  rb: 'Ruby', ruby: 'Ruby',
  rs: 'Rust', rust: 'Rust',
  go: 'Go', java: 'Java',
  kt: 'Kotlin', kotlin: 'Kotlin',
  swift: 'Swift',
  c: 'C', cpp: 'C++', csharp: 'C#',
  php: 'PHP',
  sql: 'SQL',
  sh: 'Shell', bash: 'Bash', shell: 'Shell', zsh: 'Zsh',
  json: 'JSON', xml: 'XML', html: 'HTML', css: 'CSS',
  scss: 'SCSS', sass: 'Sass', less: 'Less',
  yaml: 'YAML', yml: 'YAML',
  md: 'Markdown', markdown: 'Markdown',
  diff: 'Diff', dockerfile: 'Dockerfile', makefile: 'Makefile',
  graphql: 'GraphQL', gql: 'GraphQL',
  text: 'Text', plain: 'Text', txt: 'Text',
};

marked.setOptions({
  breaks: true,
  gfm: true,
});

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

const keywordSets = {
  js: ['async','await','break','case','catch','class','const','continue','debugger','default','delete','do','else','enum','export','extends','false','finally','for','function','if','import','in','instanceof','let','new','null','of','return','static','super','switch','this','throw','true','try','typeof','var','void','while','with','yield','from','as'],
  ts: ['async','await','break','case','catch','class','const','continue','debugger','default','delete','do','else','enum','export','extends','false','finally','for','function','if','implements','import','in','instanceof','interface','let','new','null','of','package','private','protected','public','return','static','super','switch','this','throw','true','try','type','typeof','var','void','while','with','yield','from','as','readonly','abstract','declare','namespace','module','keyof','infer','satisfies'],
  py: ['False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield','self','print'],
  rs: ['as','break','const','continue','crate','else','enum','extern','false','fn','for','if','impl','in','let','loop','match','mod','move','mut','pub','ref','return','self','Self','static','struct','super','trait','true','type','unsafe','use','where','while','async','await','dyn'],
  go: ['break','case','chan','const','continue','default','defer','else','fallthrough','for','func','go','goto','if','import','interface','map','package','range','return','select','struct','switch','type','var'],
  java: ['abstract','assert','boolean','break','byte','case','catch','char','class','const','continue','default','do','double','else','enum','extends','false','final','finally','float','for','goto','if','implements','import','instanceof','int','interface','long','native','new','null','package','private','protected','public','return','short','static','strictfp','super','switch','synchronized','this','throw','throws','transient','true','try','void','volatile','while'],
  swift: ['associatedtype','class','deinit','enum','extension','fileprivate','func','import','init','inout','internal','let','open','operator','private','protocol','public','rethrows','static','struct','subscript','typealias','var','break','case','continue','default','defer','do','else','fallthrough','for','guard','if','in','repeat','return','switch','where','while','as','catch','false','is','nil','super','self','Self','throw','throws','true','try'],
  sh: ['if','then','else','elif','fi','for','while','do','done','case','esac','in','function','select','until','declare','local','export','readonly','return','exit','echo','printf','source','set','unset','trap','exec','eval'],
  sql: ['SELECT','FROM','WHERE','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','INDEX','VIEW','JOIN','INNER','LEFT','RIGHT','OUTER','ON','AND','OR','NOT','IN','LIKE','BETWEEN','IS','NULL','AS','ORDER','BY','GROUP','HAVING','DISTINCT','COUNT','SUM','AVG','MIN','MAX','EXISTS','UNION','ALL','CASE','WHEN','THEN','ELSE','END','LIMIT','OFFSET','FOREIGN','KEY','PRIMARY','REFERENCES','CASCADE','INT','VARCHAR','TEXT','BOOLEAN','DATE','FLOAT','DOUBLE','PRECISION','NUMBER','SERIAL'],
};

function getKeywords(lang) {
  return keywordSets[lang] || keywordSets.js;
}

function highlightCode(text, lang) {
  const keywords = new Set(getKeywords(lang));
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    const remaining = text.slice(i);

    const commentMatch = remaining.match(/^\/\/[^\n]*/);
    if (commentMatch) { tokens.push({ t: 'c', v: commentMatch[0] }); i += commentMatch[0].length; continue; }

    const blockCommentMatch = remaining.match(/^\/\*[\s\S]*?\*\//);
    if (blockCommentMatch) { tokens.push({ t: 'c', v: blockCommentMatch[0] }); i += blockCommentMatch[0].length; continue; }

    if (lang === 'py' || lang === 'python' || lang === 'sh' || lang === 'bash' || lang === 'shell' || lang === 'yaml' || lang === 'yml') {
      const pyCommentMatch = remaining.match(/^#[^\n]*/);
      if (pyCommentMatch) { tokens.push({ t: 'c', v: pyCommentMatch[0] }); i += pyCommentMatch[0].length; continue; }
    }

    const htmlCommentMatch = remaining.match(/^<!--[\s\S]*?-->/);
    if (htmlCommentMatch) { tokens.push({ t: 'c', v: htmlCommentMatch[0] }); i += htmlCommentMatch[0].length; continue; }

    const dqMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
    if (dqMatch) { tokens.push({ t: 's', v: dqMatch[0] }); i += dqMatch[0].length; continue; }

    const sqMatch = remaining.match(/^'(?:[^'\\]|\\.)*'/);
    if (sqMatch) { tokens.push({ t: 's', v: sqMatch[0] }); i += sqMatch[0].length; continue; }

    const btMatch = remaining.match(/^`(?:[^`\\]|\\.)*`/);
    if (btMatch) { tokens.push({ t: 's', v: btMatch[0] }); i += btMatch[0].length; continue; }

    const numMatch = remaining.match(/^\b(?:0x[0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/);
    if (numMatch) { tokens.push({ t: 'n', v: numMatch[0] }); i += numMatch[0].length; continue; }

    const funcMatch = remaining.match(/^([a-zA-Z_$][\w$]*)\s*\(/);
    if (funcMatch && !keywords.has(funcMatch[1])) {
      tokens.push({ t: 'f', v: funcMatch[1] }); i += funcMatch[1].length; continue;
    }

    const cssPropMatch = remaining.match(/^([a-zA-Z-]+)\s*:/);
    if ((lang === 'css' || lang === 'scss' || lang === 'sass' || lang === 'less') && cssPropMatch) {
      tokens.push({ t: 'k', v: cssPropMatch[1] }); i += cssPropMatch[1].length; continue;
    }

    const wordMatch = remaining.match(/^[a-zA-Z_$][\w$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywords.has(word)) {
        if (word === 'true' || word === 'false' || word === 'null' || word === 'undefined' || word === 'None' || word === 'True' || word === 'False') {
          tokens.push({ t: 'l', v: word });
        } else if (word[0] === word[0].toUpperCase() && word !== word.toLowerCase()) {
          tokens.push({ t: 't', v: word });
        } else {
          tokens.push({ t: 'k', v: word });
        }
      } else if (word[0] === word[0].toUpperCase() && word.length > 1) {
        tokens.push({ t: 't', v: word });
      } else {
        tokens.push({ t: '', v: word });
      }
      i += word.length;
      continue;
    }

    const cssValMatch = remaining.match(/^(#[0-9a-fA-F]{3,6}|[.\d]+(?:px|em|rem|%|vh|vw|s|ms))/);
    if ((lang === 'css' || lang === 'scss' || lang === 'sass' || lang === 'less') && cssValMatch) {
      tokens.push({ t: 'l', v: cssValMatch[0] }); i += cssValMatch[0].length; continue;
    }

    const opMatch = remaining.match(/^(=>|===|!==|<=|>=|==|!=|&&|\|\|[:?]?|[+\-*/%&|^~<>!=?:;,.{}()\[\]@#])/);
    if (opMatch) { tokens.push({ t: 'o', v: opMatch[0] }); i += opMatch[0].length; continue; }

    tokens.push({ t: '', v: remaining[0] });
    i++;
  }

  return tokens.map(t => {
    const v = escapeHtml(t.v);
    if (!t.t) return v;
    const cls = ({ c: 'c', s: 's', n: 'n', f: 'f', k: 'k', t: 't', o: 'o', l: 'l' })[t.t] || '';
    return `<span class="hl-${cls}">${v}</span>`;
  }).join('');
}

const COLLAPSE_THRESHOLD = 20;
const COLLAPSE_SHOW = 15;

function detectDiff(lines) {
  const hasMarkers = lines.some(l => /^[+\-]\s/.test(l));
  const allMarked = lines.every(l => /^[+\-]?\s*.*/.test(l) && (l.trim() === '' || /^[+\-\s]/.test(l)));
  if (!hasMarkers || !allMarked) return null;
  return lines.map(l => {
    if (/^\+/.test(l)) return { prefix: '+', text: l.replace(/^\+ ?/, '') };
    if (/^\-/.test(l)) return { prefix: '-', text: l.replace(/^\- ?/, '') };
    return { prefix: '', text: l };
  });
}

function enhanceCodeBlocks(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  wrapper.querySelectorAll('pre > code').forEach(codeEl => {
    const pre = codeEl.parentElement;
    if (pre.closest('.cb-wrap')) return;

    const text = codeEl.textContent;
    const classMatch = codeEl.className.match(/language-([\w.+#-]+)/);
    const rawLang = classMatch ? classMatch[1] : '';

    let filename = '', lang = rawLang;
    if (rawLang.includes('.')) {
      const parts = rawLang.split('.');
      lang = parts[0];
      filename = rawLang;
    }

    const langName = languageNames[lang] || lang || 'Text';
    const lines = text.split('\n');
    const lineCount = lines.length;
    const hasLines = lineCount > 1;

    const diffInfo = detectDiff(lines);
    const isDiff = diffInfo !== null;
    const textToHighlight = isDiff ? diffInfo.map(d => d.text).join('\n') : text;

    const highlighted = highlightCode(textToHighlight, lang);
    const hlLines = highlighted.split('\n');

    const codeHtml = hlLines.map((line, i) => {
      const num = hasLines ? `<span class="ln">${i + 1}</span>` : '';
      let extraCls = '';
      if (isDiff && diffInfo[i]) {
        if (diffInfo[i].prefix === '+') extraCls = ' hl-add';
        else if (diffInfo[i].prefix === '-') extraCls = ' hl-del';
      }
      return `<span class="cl${extraCls}">${num}<span class="cc">${line || ' '}</span></span>`;
    }).join('');

    const headerParts = [];
    if (filename) headerParts.push(`<span class="cb-filename">${escapeHtml(filename)}</span>`);
    headerParts.push(`<span class="cb-lang">${langName}</span>`);
    if (hasLines) headerParts.push(`<span class="cb-lines">${lineCount} lines</span>`);
    const leftHeader = headerParts.join('');

    const isCollapsible = lineCount > COLLAPSE_THRESHOLD;
    const collapsed = isCollapsible;
    const previewLines = isCollapsible ? COLLAPSE_SHOW : lineCount;

    const wrap = document.createElement('div');
    wrap.className = `cb-wrap${collapsed ? ' cb-collapsed' : ''}`;
    const collapseHtml = isCollapsible
      ? `<button class="cb-collapse-btn">Show ${lineCount - COLLAPSE_SHOW} more lines</button>`
      : '';
    wrap.innerHTML = `
      <div class="cb-header">
        <div class="cb-header-left">
          <div class="mac-traffic-lights"><span class="mac-close"></span><span class="mac-min"></span><span class="mac-max"></span></div>
          ${leftHeader}
        </div>
        <div class="cb-header-right">
          <button class="cb-wrap-toggle" title="Toggle word wrap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 11h10"/><path d="M4 15h6"/><path d="M4 19h14"/></svg>
          </button>
          <button class="cb-copy" title="Copy code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>
          </button>
        </div>
      </div>
      <pre><code>${codeHtml}</code></pre>
      ${collapseHtml}
    `;

    if (isCollapsible) {
      const codeBlock = wrap.querySelector('pre code');
      const firstLines = [];
      codeBlock.querySelectorAll('.cl').forEach((el, i) => {
        if (i < previewLines) firstLines.push(el);
        else el.style.display = 'none';
      });
    }

    pre.replaceWith(wrap);
  });

  return wrapper.innerHTML;
}

function renderMarkdown(text) {
  if (!text) return '';
  try {
    const raw = marked.parse(text);
    const safe = raw
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '');

    return enhanceCodeBlocks(safe);
  } catch {
    return `<p>${escapeHtml(text)}</p>`;
  }
}

document.addEventListener('click', (e) => {
  const wrap = e.target.closest('.cb-wrap');
  if (!wrap) return;

  const copyBtn = e.target.closest('.cb-copy');
  if (copyBtn) {
    const code = wrap.querySelector('code')?.textContent;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      copyBtn.classList.add('copied');
      setTimeout(() => { 
        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>'; 
        copyBtn.classList.remove('copied'); 
      }, 2000);
    }).catch(() => {
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      setTimeout(() => { 
        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>'; 
      }, 2000);
    });
    return;
  }

  const wrapToggle = e.target.closest('.cb-wrap-toggle');
  if (wrapToggle) {
    wrap.classList.toggle('cb-wrapped');
    const isWrapped = wrap.classList.contains('cb-wrapped');
    wrapToggle.innerHTML = isWrapped
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M17 11l4 4-4 4"/><path d="M4 15h10"/><path d="M4 19h14"/></svg>`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 11h10"/><path d="M4 15h6"/><path d="M4 19h14"/></svg>`;
    return;
  }

  const collapseBtn = e.target.closest('.cb-collapse-btn');
  if (collapseBtn) {
    const wasCollapsed = wrap.classList.contains('cb-collapsed');
    wrap.classList.toggle('cb-collapsed');
    const code = wrap.querySelector('pre code');
    const lines = code.querySelectorAll('.cl');
    if (wasCollapsed) {
      lines.forEach(el => el.style.display = '');
      collapseBtn.textContent = 'Show less';
    } else {
      lines.forEach((el, i) => { if (i >= COLLAPSE_SHOW) el.style.display = 'none'; });
      collapseBtn.textContent = `Show ${lines.length - COLLAPSE_SHOW} more lines`;
    }
    return;
  }
});

async function init() {
  await loadHistory();
  await loadOrCreateActiveChat();

  const settings = await chrome.storage.sync.get(['provider', 'model']);
  if (settings.provider) providerSelect.value = settings.provider;
  if (settings.model) modelSelect.value = settings.model;
  
  updateModels();
  
  const currentProvider = providerSelect.value;
  const currentModel = modelSelect.value;
  const modelObj = modelsByProvider[currentProvider]?.find(m => m.value === currentModel) || modelsByProvider.openai[0];
  
  if (modelObj) {
    modelSelect.value = modelObj.value;
    updateActiveDisplay(currentProvider, modelObj.label);
  }

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  sendBtn.addEventListener('click', sendMessage);
  newChatBtn.addEventListener('click', newChat);
  settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

  modelToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdown.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!modelDropdown.contains(e.target)) modelDropdown.classList.remove('open');
  });

  historyToggle.addEventListener('click', toggleHistory);
  historyClose.addEventListener('click', closeHistory);
  historyOverlay.addEventListener('click', closeHistory);
  historyNewBtn.addEventListener('click', () => { closeHistory(); newChat(); });

  const chat = getActiveChat();
  messages = chat ? [...chat.messages] : [];
  updateModelBar();
  if (messages.length) { scrollInstant = true; renderMessages(); }

  autoResizeInput();

  const selData = await chrome.storage.local.get('selectedText');
  if (selData.selectedText) {
    const text = selData.selectedText;
    await chrome.storage.local.remove('selectedText');
    messages.push({ role: 'user', content: `About this text: "${text}"` });
    await saveCurrentChat();
    renderMessages();
  }

  if (!messages.length) showEmptyState();
  ready = true;

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.selectedText && ready) {
      const text = changes.selectedText.newValue;
      if (text) {
        chrome.storage.local.remove('selectedText');
        if (historyOpen) closeHistory();
        messages.push({ role: 'user', content: `About this text: "${text}"` });
        saveCurrentChat();
        renderMessages();
        scrollToBottom();
        removeEmptyState();
      }
    }
  });
}

// ---- Storage / Data ----

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getActiveChat() {
  return chatHistory.find(c => c.id === activeChatId) || chatHistory[0] || null;
}

async function loadHistory() {
  const data = await chrome.storage.local.get('chat_history');
  chatHistory = data.chat_history || [];
}

async function saveHistory() {
  await chrome.storage.local.set({ chat_history: chatHistory });
}

async function loadOrCreateActiveChat() {
  const data = await chrome.storage.local.get('active_chat_id');
  activeChatId = data.active_chat_id || null;

  if (activeChatId && chatHistory.some(c => c.id === activeChatId)) return;

  if (chatHistory.length > 0) {
    activeChatId = chatHistory[0].id;
    await chrome.storage.local.set({ active_chat_id: activeChatId });
  } else {
    createNewChat();
  }
}

function createNewChat() {
  const chat = {
    id: generateId(),
    title: 'New Chat',
    messages: [],
    timestamp: Date.now(),
    provider: providerSelect.value,
    model: modelSelect.value,
  };
  chatHistory.unshift(chat);
  activeChatId = chat.id;
  saveHistory();
  chrome.storage.local.set({ active_chat_id: activeChatId });
  return chat;
}

async function saveCurrentChat() {
  const chat = getActiveChat();
  if (!chat) return;
  chat.messages = messages.filter(m => m.role !== 'system');
  chat.timestamp = Date.now();
  chat.provider = providerSelect.value;
  chat.model = modelSelect.value;
  if (chat.messages.length > 0 && chat.title === 'New Chat') {
    const first = chat.messages.find(m => m.role === 'user');
    if (first) chat.title = first.content.slice(0, 50) + (first.content.length > 50 ? '...' : '');
  }
  saveHistory();
}

async function switchToChat(chatId) {
  if (isProcessing) return;
  await saveCurrentChat();
  activeChatId = chatId;
  await chrome.storage.local.set({ active_chat_id: chatId });
  const chat = getActiveChat();
  messages = chat ? [...chat.messages] : [];
  updateModelBar();
  scrollInstant = true;
  renderMessages();
  scrollToBottom();
  if (!messages.length) showEmptyState();
  closeHistory();
  messageInput.focus();
}

async function deleteChat(chatId) {
  const chat = chatHistory.find(c => c.id === chatId);
  if (!chat) return;
  const msgCount = chat.messages.length;
  const label = msgCount > 0 ? `"${chat.title}" (${msgCount} messages)` : 'this conversation';
  if (!confirm(`Delete ${label}?`)) return;

  const idx = chatHistory.findIndex(c => c.id === chatId);
  chatHistory.splice(idx, 1);
  await saveHistory();
  renderHistoryList();

  if (activeChatId === chatId) {
    if (chatHistory.length > 0) {
      await switchToChat(chatHistory[0].id);
    } else {
      createNewChat();
      messages = [];
      await chrome.storage.local.set({ active_chat_id: activeChatId });
      renderMessages();
      showEmptyState();
      closeHistory();
      updateModelBar();
    }
  }
}

async function newChat() {
  if (isProcessing) return;
  if (getActiveChat() && messages.length > 0) {
    await saveCurrentChat();
  }
  createNewChat();
  messages = [];
  await chrome.storage.local.set({ active_chat_id: activeChatId });
  renderMessages();
  showEmptyState();
  updateModelBar();
  messageInput.focus();
}

function updateModelBar() {
  const chat = getActiveChat();
  if (chat) {
    if (chat.provider) providerSelect.value = chat.provider;
    if (chat.model) modelSelect.value = chat.model;
    updateModels();
    const modelObj = modelsByProvider[providerSelect.value]?.find(m => m.value === modelSelect.value) || modelsByProvider.openai[0];
    if (modelObj) {
      updateActiveDisplay(providerSelect.value, modelObj.label);
    }
  }
}

// ---- History Panel ----

function toggleHistory() {
  historyOpen ? closeHistory() : openHistory();
}

function openHistory() {
  historyOpen = true;
  historyPanel.classList.add('open');
  historyOverlay.classList.add('open');
  historyToggle.classList.add('active');
  renderHistoryList();
}

function closeHistory() {
  historyOpen = false;
  historyPanel.classList.remove('open');
  historyOverlay.classList.remove('open');
  historyToggle.classList.remove('active');
}

function renderHistoryList() {
  if (chatHistory.length === 0) {
    historyList.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted);font-size:13px;">
        No conversations yet.<br>Start a new chat to begin.
      </div>
    `;
    return;
  }

  const groups = groupByDate(chatHistory);
  let html = '';
  for (const [label, items] of Object.entries(groups)) {
    html += `<div class="history-date-heading">${label}</div>`;
    for (const chat of items) {
      const isActive = chat.id === activeChatId;
      const timeStr = formatTime(chat.timestamp);
      html += `
        <div class="history-item ${isActive ? 'active' : ''}" data-id="${chat.id}">
          <div class="h-item-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>
          </div>
          <div class="h-item-info">
            <div class="h-item-title">${escapeHtml(chat.title)}</div>
            <div class="h-item-meta">${timeStr} · ${chat.provider}</div>
          </div>
          <button class="h-item-delete" data-id="${chat.id}" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
          </button>
        </div>
      `;
    }
  }
  historyList.innerHTML = html;

  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.h-item-delete')) return;
      switchToChat(el.dataset.id);
    });
  });

  historyList.querySelectorAll('.h-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(btn.dataset.id);
    });
  });
}

function groupByDate(chats) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] };

  for (const chat of chats) {
    const t = chat.timestamp;
    if (t >= today) groups.Today.push(chat);
    else if (t >= yesterday) groups.Yesterday.push(chat);
    else if (t >= weekAgo) groups['This Week'].push(chat);
    else groups.Older.push(chat);
  }

  const result = {};
  for (const [label, items] of Object.entries(groups)) {
    if (items.length) result[label] = items;
  }
  return result;
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ---- Messages ----

let messages = [];

function addMessage(role, content) {
  messages.push({ role, content });
  appendMessage(role, content);
  scrollToBottom();
  saveCurrentChat();
}

function appendMessage(role, content) {
  const div = document.createElement('div');
  const isUser = role === 'user';
  div.className = `message ${isUser ? 'user' : 'ai'}`;

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  
  if (isUser) {
    meta.innerHTML = `<div class="avatar user-avatar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div> You`;
  } else {
    const provider = providerSelect.value;
    const modelVal = modelSelect.value;
    const modelObj = modelsByProvider[provider]?.find(m => m.value === modelVal);
    const modelName = modelObj ? modelObj.label : 'AI';
    const icon = providerIcons[provider] || providerIcons.openai;
    meta.innerHTML = `<div class="avatar ai-avatar">${icon}</div> ${modelName}`;
  }

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = renderMarkdown(content);

  div.appendChild(meta);
  div.appendChild(bubble);

  if (!isUser) {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    actions.innerHTML = `<button class="copy-btn" title="Copy"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg></button>`;
    actions.querySelector('.copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(content);
      const btn = actions.querySelector('.copy-btn');
      btn.innerHTML = '<span style="font-size:10px;color:var(--accent)">Copied</span>';
      setTimeout(() => {
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>`;
      }, 1500);
    });
    div.appendChild(actions);
  }
  chatArea.appendChild(div);
  removeEmptyState();
}

function renderMessages() {
  chatArea.innerHTML = '';
  messages.forEach(msg => {
    if (msg.role === 'system') return;
    appendMessage(msg.role, msg.content);
  });
}

let scrollInstant = false;

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: scrollInstant ? 'auto' : 'smooth' });
    scrollInstant = false;
  });
}

function removeEmptyState() {
  const empty = chatArea.querySelector('.empty-state');
  if (empty) empty.remove();
}

function showEmptyState() {
  chatArea.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>
      </div>
      <h3>Start a conversation</h3>
      <p>Ask anything or right-click text on any page to analyze it with AI.</p>
    </div>
  `;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'message ai';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="msg-meta">
      <div class="avatar ai-avatar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 2s linear infinite;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
      </div>
      Thinking...
    </div>
    <div class="msg-bubble" style="background:transparent; padding:0; border:none; width:100%;">
      <div class="skeleton-loader">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>`;
  chatArea.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function showError(errorMsg) {
  const div = document.createElement('div');
  div.className = 'error-msg';
  div.innerHTML = `<div>${escapeHtml(errorMsg)}</div><button class="btn btn-xs retry-btn">Retry</button>`;
  div.querySelector('.retry-btn').addEventListener('click', () => {
    div.remove();
    if (lastSentText && !messageInput.value.trim()) {
      messageInput.value = lastSentText;
    }
    sendMessage();
  });
  chatArea.appendChild(div);
  scrollToBottom();
}

let abortController = null;

async function sendMessage() {
  if (isProcessing) {
    if (abortController) abortController.abort();
    isProcessing = false;
    sendBtn.classList.remove('processing');
    hideTyping();
    return;
  }

  const text = messageInput.value.trim();
  if (!text) return;

  if (historyOpen) closeHistory();

  lastSentText = text;
  messageInput.value = '';
  messageInput.style.height = 'auto';

  const lastError = chatArea.querySelector('.error-msg:last-child');
  if (lastError) lastError.remove();

  addMessage('user', text);

  isProcessing = true;
  sendBtn.classList.add('processing');
  showTyping();

  abortController = new AbortController();

  try {
    const result = await Promise.race([
      chrome.runtime.sendMessage({
        type: 'chat',
        provider: providerSelect.value,
        model: modelSelect.value,
        messages: messages.filter(m => m.role !== 'system')
      }),
      new Promise((_, reject) => {
        abortController.signal.addEventListener('abort', () => reject(new Error('Aborted')));
      })
    ]);

    hideTyping();

    if (result.ok) {
      addMessage('assistant', result.data.content);
    } else {
      showError(result.error || 'Request failed');
    }
  } catch (err) {
    hideTyping();
    if (err.message !== 'Aborted') showError(err.message || 'Connection failed');
  } finally {
    isProcessing = false;
    sendBtn.classList.remove('processing');
    messageInput.focus();
  }
}

function autoResizeInput() {
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
  });
}

function updateModels() {
  const selectedModelVal = modelSelect.value;
  modelMenu.innerHTML = '';
  
  for (const [provider, models] of Object.entries(modelsByProvider)) {
    const group = document.createElement('div');
    group.className = 'select-item-group';
    group.textContent = provider;
    modelMenu.appendChild(group);

    models.forEach(m => {
      const item = document.createElement('div');
      item.className = `select-item ${m.value === selectedModelVal ? 'active' : ''}`;
      item.innerHTML = `${providerIcons[provider]} ${m.label}`;
      item.addEventListener('click', () => {
        modelSelect.value = m.value;
        providerSelect.value = provider;
        chrome.storage.sync.set({ provider: provider, model: m.value });
        modelDropdown.classList.remove('open');
        updateActiveDisplay(provider, m.label);
        updateModels(); // Re-render to update active class
      });
      modelMenu.appendChild(item);
    });
  }
}

function updateActiveDisplay(provider, label) {
  activeModelIcon.innerHTML = providerIcons[provider] || '';
  activeModelName.textContent = label;
}

init();

let ticking = false;
document.addEventListener('mousemove', (e) => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const card = e.target.closest('.input-island, .cb-wrap');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
      ticking = false;
    });
    ticking = true;
  }
});
