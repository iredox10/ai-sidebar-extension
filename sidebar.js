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
const historySearch = document.getElementById('historySearch');
const historySearchClear = document.getElementById('historySearchClear');
const historyResizeHandle = document.getElementById('historyResizeHandle');
const contextMenu = document.getElementById('contextMenu');
const historyCount = document.getElementById('historyCount');
const attachBtn = document.getElementById('attachBtn');
const fileInput = document.getElementById('fileInput');
const attachBar = document.getElementById('attachBar');
const attachList = document.getElementById('attachList');
const quotePreview = document.getElementById('quotePreview');
const quotePreviewText = document.getElementById('quotePreviewText');
const quotePreviewDismiss = document.getElementById('quotePreviewDismiss');

const modelDropdown = document.getElementById('modelDropdown');
const modelToggle = document.getElementById('modelToggle');
const modelMenu = document.getElementById('modelMenu');
const activeModelIcon = document.getElementById('activeModelIcon');
const activeModelName = document.getElementById('activeModelName');

const modelsByProvider = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o', vision: true },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', vision: true },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', vision: true },
    { value: 'o3-mini', label: 'o3 Mini', vision: false },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', vision: true },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', vision: true },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', vision: true },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4', vision: true },
  ],
  google: [
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', vision: true },
    { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', vision: true },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', vision: true },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', vision: true },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', vision: true },
  ],
};

function currentModelHasVision() {
  const p = providerSelect.value;
  const m = modelSelect.value;
  const model = modelsByProvider[p]?.find(x => x.value === m);
  return model ? model.vision !== false : true;
}

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
let attachments = [];
let quoteText = '';
const MAX_FILE_SIZE = 20 * 1024 * 1024;

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
          <button class="cb-download" title="Download code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
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

  const downloadBtn = e.target.closest('.cb-download');
  if (downloadBtn) {
    const code = wrap.querySelector('code')?.textContent;
    if (!code) return;
    const langEl = wrap.querySelector('.cb-lang');
    const lang = langEl ? langEl.textContent.trim().toLowerCase() : 'txt';
    const extMap = { javascript: 'js', typescript: 'ts', python: 'py', rust: 'rs', go: 'go', java: 'java', swift: 'swift', kotlin: 'kt', sql: 'sql', css: 'css', html: 'html', json: 'json', xml: 'xml', yaml: 'yml', markdown: 'md', shell: 'sh', bash: 'sh', ruby: 'rb', php: 'php', csharp: 'cs', cpp: 'cpp' };
    const ext = extMap[lang] || lang;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    downloadBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      downloadBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    }, 1500);
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
  updateAttachButton();
  
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

  attachBtn.addEventListener('click', () => {
    fileInput.click();
  });
  fileInput.addEventListener('change', handleFiles);
  updateAttachButton();
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
  historyOverlay.addEventListener('click', (e) => { if (e.target === historyOverlay) { closeHistory(); hideContextMenu(); } });
  historyNewBtn.addEventListener('click', () => { closeHistory(); newChat(); });

  initResize();
  initHistorySearch();
  document.addEventListener('click', (e) => { if (!contextMenu.contains(e.target)) hideContextMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideContextMenu(); });

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
  setVimMode('normal');

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'focus-sidebar-input') {
      messageInput.focus();
      setVimMode('insert');
    }
    if (request.type === 'focus-page') {
      window.blur();
    }
  });

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

async function newChat() {
  if (isProcessing) return;
  if (getActiveChat() && messages.length > 0) {
    await saveCurrentChat();
  }
  if (historyOpen) closeHistory();
  clearAttachments();
  clearQuote();
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
    updateAttachButton();
    const modelObj = modelsByProvider[providerSelect.value]?.find(m => m.value === modelSelect.value) || modelsByProvider.openai[0];
    if (modelObj) {
      updateActiveDisplay(providerSelect.value, modelObj.label);
    }
  }
}

// ---- History Panel ----

let contextChatId = null;
let historySearchQuery = '';

function toggleHistory() {
  historyOpen ? closeHistory() : openHistory();
}

function openHistory() {
  historyOpen = true;
  historyPanel.classList.add('open');
  historyOverlay.classList.add('open');
  historyToggle.classList.add('active');
  historySearch.value = '';
  historySearchQuery = '';
  renderHistoryList();
  setTimeout(() => historySearch.focus(), 150);
}

function closeHistory() {
  historyOpen = false;
  historyPanel.classList.remove('open');
  historyOverlay.classList.remove('open');
  historyToggle.classList.remove('active');
  hideContextMenu();
}

function getPreviewText(chat) {
  const msgs = chat.messages || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'user' || msgs[i].role === 'assistant') {
      const text = msgs[i].content.replace(/\n/g, ' ').trim();
      if (text.length > 0) return text.length > 80 ? text.slice(0, 80) + '...' : text;
    }
  }
  return '';
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const q = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp(`(${q})`, 'gi'), '<span class="hl-match">$1</span>');
}

function renderHistoryList() {
  const query = historySearchQuery.toLowerCase().trim();

  let displayChats = chatHistory;
  if (query) {
    displayChats = chatHistory.filter(chat => {
      if (chat.title && chat.title.toLowerCase().includes(query)) return true;
      return chat.messages.some(m => m.content.toLowerCase().includes(query));
    });
  }

  historyCount.textContent = displayChats.length;

  if (displayChats.length === 0) {
    historyList.innerHTML = query
      ? `<div class="history-empty"><div class="history-empty-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div class="history-empty-text">No matching conversations</div><div class="history-empty-sub">Try a different search term</div></div>`
      : `<div class="history-empty"><div class="history-empty-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><div class="history-empty-text">No conversations yet</div><div class="history-empty-sub">Start a new chat to begin</div></div>`;
    return;
  }

  let html = '';

  const pinned = displayChats.filter(c => c.pinned);
  const unpinned = displayChats.filter(c => !c.pinned);

  if (pinned.length) {
    html += `<div class="history-date-heading">Pinned</div>`;
    for (const chat of pinned) {
      html += buildHistoryItem(chat, query, true);
    }
  }

  const groups = groupByDate(unpinned);
  for (const [label, items] of Object.entries(groups)) {
    html += `<div class="history-date-heading">${label}</div>`;
    for (const chat of items) {
      html += buildHistoryItem(chat, query, false);
    }
  }

  historyList.innerHTML = html;
  bindHistoryEvents();
}

function buildHistoryItem(chat, query, isPinned) {
  const isActive = chat.id === activeChatId;
  const timeStr = formatTime(chat.timestamp);
  const preview = getPreviewText(chat);
  const msgCount = chat.messages ? chat.messages.length : 0;
  const providerLabel = chat.provider || '';

  return `
    <div class="history-item ${isActive ? 'active' : ''}${isPinned ? ' pinned' : ''}" data-id="${chat.id}" tabindex="0">
      <div class="h-item-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      </div>
      <div class="h-item-body">
        <div class="h-item-title">${highlightMatch(chat.title, query)}</div>
        ${preview ? `<div class="h-item-preview">${highlightMatch(preview, query)}</div>` : ''}
        <div class="h-item-meta-row">
          <span class="h-item-time">${timeStr}</span>
          ${providerLabel ? `<span class="h-item-badge">${providerLabel}</span>` : ''}
          ${msgCount > 0 ? `<span class="h-item-badge">${msgCount} msgs</span>` : ''}
        </div>
      </div>
      <div class="h-item-actions">
        <button class="h-item-action-btn${chat.pinned ? ' pinned' : ''}" data-action="pin" title="${chat.pinned ? 'Unpin' : 'Pin'}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="${chat.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>
        </button>
        <button class="h-item-action-btn" data-action="delete" title="Delete">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    </div>
  `;
}

function bindHistoryEvents() {
  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.h-item-action-btn');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === 'delete') { e.stopPropagation(); deleteChat(el.dataset.id); }
        if (action === 'pin') { e.stopPropagation(); togglePin(el.dataset.id); }
        return;
      }
      switchToChat(el.dataset.id);
    });

    el.addEventListener('dblclick', (e) => {
      if (e.target.closest('.h-item-action-btn')) return;
      if (e.target.closest('.h-item-body')) {
        startInlineRename(el.dataset.id);
      }
    });

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, el.dataset.id);
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { switchToChat(el.dataset.id); }
      if (e.key === 'Delete' || e.key === 'Backspace') { deleteChat(el.dataset.id); }
    });
  });
}

function startInlineRename(chatId) {
  const chat = chatHistory.find(c => c.id === chatId);
  if (!chat) return;
  const item = historyList.querySelector(`.history-item[data-id="${chatId}"]`);
  if (!item) return;
  const titleEl = item.querySelector('.h-item-title');
  if (!titleEl) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'h-item-title-edit';
  input.value = chat.title;
  titleEl.replaceWith(input);
  input.focus();
  input.select();

  const finish = (save) => {
    if (save && input.value.trim()) {
      chat.title = input.value.trim();
      saveHistory();
      renderHistoryList();
    } else {
      renderHistoryList();
    }
  };

  input.addEventListener('blur', () => finish(true));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); finish(true); }
    if (e.key === 'Escape') { finish(false); }
  });
}

function togglePin(chatId) {
  const chat = chatHistory.find(c => c.id === chatId);
  if (!chat) return;
  chat.pinned = !chat.pinned;
  saveHistory();
  renderHistoryList();
}

function deleteChat(chatId) {
  const chat = chatHistory.find(c => c.id === chatId);
  if (!chat) return;
  const msgCount = chat.messages.length;
  const label = msgCount > 0 ? `"${chat.title}" (${msgCount} messages)` : 'this conversation';
  if (!confirm(`Delete ${label}?`)) return;

  const idx = chatHistory.findIndex(c => c.id === chatId);
  chatHistory.splice(idx, 1);
  saveHistory();
  renderHistoryList();

  if (activeChatId === chatId) {
    if (chatHistory.length > 0) {
      switchToChat(chatHistory[0].id);
    } else {
      createNewChat();
      messages = [];
      chrome.storage.local.set({ active_chat_id: activeChatId });
      renderMessages();
      showEmptyState();
      closeHistory();
      updateModelBar();
    }
  }
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
  const diff = now.getTime() - d.getTime();
  if (diff < 7 * 86400000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ---- Context Menu ----

function showContextMenu(x, y, chatId) {
  contextChatId = chatId;
  const chat = chatHistory.find(c => c.id === chatId);
  contextMenu.innerHTML = `
    <button class="context-item" data-action="rename">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Rename
    </button>
    <button class="context-item" data-action="pin">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>
      ${chat && chat.pinned ? 'Unpin' : 'Pin to Top'}
    </button>
    <div class="context-divider"></div>
    <button class="context-item" data-action="copy-title">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      Copy Title
    </button>
    <div class="context-divider"></div>
    <button class="context-item danger" data-action="delete">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      Delete
    </button>
  `;

  contextMenu.style.left = Math.min(x, window.innerWidth - 170) + 'px';
  contextMenu.style.top = Math.min(y, window.innerHeight - 200) + 'px';

  contextMenu.querySelectorAll('.context-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'rename') startInlineRename(contextChatId);
      else if (action === 'pin') { togglePin(contextChatId); }
      else if (action === 'copy-title') {
        const c = chatHistory.find(ch => ch.id === contextChatId);
        if (c) navigator.clipboard.writeText(c.title);
      }
      else if (action === 'delete') deleteChat(contextChatId);
      hideContextMenu();
    });
  });

  requestAnimationFrame(() => contextMenu.classList.add('open'));
}

function hideContextMenu() {
  contextMenu.classList.remove('open');
  contextChatId = null;
}

// ---- Resizable Panel ----

function initResize() {
  let isResizing = false;
  let startX, startWidth;

  historyResizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = historyPanel.offsetWidth;
    historyPanel.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const delta = e.clientX - startX;
    const newWidth = Math.max(240, Math.min(440, startWidth + delta));
    historyPanel.style.width = newWidth + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;
    historyPanel.classList.remove('resizing');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}

// ---- History Search ----

function initHistorySearch() {
  historySearch.addEventListener('input', () => {
    historySearchQuery = historySearch.value;
    renderHistoryList();
  });

  historySearch.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      historySearch.value = '';
      historySearchQuery = '';
      renderHistoryList();
      historySearch.blur();
    }
    if (e.key === 'Enter') {
      const first = historyList.querySelector('.history-item');
      if (first) switchToChat(first.dataset.id);
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = historyList.querySelectorAll('.history-item');
      if (!items.length) return;
      const active = historyList.querySelector('.history-item.active') || items[0];
      let idx = Array.from(items).indexOf(active);
      idx = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
      items[idx].focus();
      items[idx].scrollIntoView({ block: 'nearest' });
    }
  });

  historySearchClear.addEventListener('click', () => {
    historySearch.value = '';
    historySearchQuery = '';
    renderHistoryList();
    historySearch.focus();
  });
}

// ---- Messages ----

let messages = [];

function addMessage(role, content, msgAttachments = null) {
  const msg = { role, content };
  if (msgAttachments && msgAttachments.length > 0) {
    msg.attachments = msgAttachments.map(a => ({ ...a }));
  }
  messages.push(msg);
  appendMessage(role, content, msg.attachments);
  scrollToBottom();
  saveCurrentChat();
}

function appendMessage(role, content, msgAttachments = null) {
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

  if (msgAttachments && msgAttachments.length > 0) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-attach-grid';
    for (const a of msgAttachments) {
      if (a.isImage) {
        const img = document.createElement('img');
        img.src = `data:${a.mimeType};base64,${a.data}`;
        img.className = 'msg-attach-img';
        img.alt = a.name;
        img.loading = 'lazy';
        wrap.appendChild(img);
      } else {
        const chip = document.createElement('div');
        chip.className = 'msg-attach-file';
        chip.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>${escapeHtml(a.name)}</span>`;
        wrap.appendChild(chip);
      }
    }
    bubble.prepend(wrap);
  }

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
    appendMessage(msg.role, msg.content, msg.attachments);
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>
      </div>
      <h3>How can I help you today?</h3>
      
      <div class="prompt-grid">
        <button class="prompt-btn" data-prompt="Explain this code to me like I'm 5 years old">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          <div class="prompt-text">
            <span class="prompt-title">Explain code</span>
            <span class="prompt-desc">Like I'm 5 years old</span>
          </div>
        </button>
        <button class="prompt-btn" data-prompt="Summarize the article on the current page">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
          <div class="prompt-text">
            <span class="prompt-title">Summarize page</span>
            <span class="prompt-desc">Extract key points</span>
          </div>
        </button>
        <button class="prompt-btn" data-prompt="Help me write a professional email">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <div class="prompt-text">
            <span class="prompt-title">Draft email</span>
            <span class="prompt-desc">Professional tone</span>
          </div>
        </button>
        <button class="prompt-btn" data-prompt="Brainstorm ideas for my new project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <div class="prompt-text">
            <span class="prompt-title">Brainstorm ideas</span>
            <span class="prompt-desc">For a new project</span>
          </div>
        </button>
      </div>
    </div>
  `;

  chatArea.querySelectorAll('.prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      messageInput.value = btn.dataset.prompt;
      messageInput.focus();
      autoResizeInput();
    });
  });
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

  const rawText = messageInput.value.trim();
  if (!rawText && attachments.length === 0 && !quoteText) return;
  if (historyOpen) closeHistory();

  const text = quoteText
    ? (rawText ? `> ${quoteText}\n\n${rawText}` : `> ${quoteText}`)
    : rawText;

  lastSentText = rawText;
  messageInput.value = '';
  messageInput.style.height = 'auto';

  const apiContent = buildApiContent(text);
  const isMultiPart = Array.isArray(apiContent);

  const displayText = text;

  const lastError = chatArea.querySelector('.error-msg:last-child');
  if (lastError) lastError.remove();

  addMessage('user', displayText, attachments.length > 0 ? [...attachments] : null);

  if (isMultiPart) {
    const hasVision = currentModelHasVision();
    const hasImageParts = apiContent.some(p => p.type === 'image');
    if (!hasVision && hasImageParts) {
      hideTyping();
      isProcessing = false;
      sendBtn.classList.remove('processing');
      clearAttachments();
      clearQuote();
      showToast(`${modelSelect.value} doesn't support images. Image was skipped. Switch to a vision model (e.g. GPT-4o, Claude Sonnet).`);
      messageInput.focus();
      return;
    }
  }

  const apiMessages = messages.filter(m => m.role !== 'system').map(m => ({ ...m }));
  if (isMultiPart) apiMessages[apiMessages.length - 1].content = apiContent;

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
        messages: apiMessages
      }),
      new Promise((_, reject) => {
        abortController.signal.addEventListener('abort', () => reject(new Error('Aborted')));
      })
    ]);

    hideTyping();
    clearAttachments();
    clearQuote();

    if (result.ok) {
      addMessage('assistant', result.data.content);
    } else {
      const errMsg = result.error || 'Request failed';
      if (/image|vision|clipboard/i.test(errMsg) && /not support/i.test(errMsg)) {
        showToast(`${modelSelect.value} doesn't support image input. Switch to GPT-4o, Claude Sonnet, or Gemini Flash.`);
      } else {
        showError(errMsg);
      }
    }
  } catch (err) {
    hideTyping();
    const errMsg = err.message || '';
    if (errMsg !== 'Aborted') {
      if (/image|vision|clipboard/i.test(errMsg) && /not support/i.test(errMsg)) {
        showToast(`${modelSelect.value} doesn't support image input. Switch to a vision-capable model.`);
      } else {
        showError(errMsg);
      }
    }
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

// ---- Attachments ----

function handleFiles(e) {
  const files = Array.from(e.target.files);
  e.target.value = '';
  if (!files.length) return;
  const hasVision = currentModelHasVision();

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      showError(`${file.name} exceeds 20MB limit`);
      continue;
    }
    const isImage = file.type.startsWith('image/');
    if (isImage && !hasVision) {
      showToast(`${modelSelect.value} doesn't support images. "${file.name}" was skipped.`);
      continue;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = isImage ? ev.target.result.split(',')[1] : ev.target.result;
      attachments.push({
        id: generateId(),
        name: file.name,
        size: file.size,
        mimeType: file.type || (isImage ? 'image/png' : 'text/plain'),
        data,
        isImage,
      });
      renderAttachments();
    };
    if (isImage) reader.readAsDataURL(file);
    else reader.readAsText(file);
  }
}

function updateAttachButton() {
  const hasVision = currentModelHasVision();
  const hasOnlyTextFiles = attachments.length > 0 && attachments.every(a => !a.isImage);
  const canAttach = hasVision || hasOnlyTextFiles;
  attachBtn.style.opacity = canAttach ? '1' : '0.35';
  attachBtn.title = !hasVision && attachments.some(a => a.isImage)
    ? 'Switch to a vision-capable model to send images'
    : !hasVision
    ? 'Attach text files only (model does not support images)'
    : 'Add files';
}

function renderAttachments() {
  if (attachments.length === 0) {
    attachBar.style.display = 'none';
    return;
  }
  attachBar.style.display = 'block';

  const hasVision = currentModelHasVision();
  const hasImages = attachments.some(a => a.isImage);
  const warning = !hasVision && hasImages;

  attachList.innerHTML = (warning
    ? `<div class="attach-warning">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        ${modelSelect.value} does not support images. Image attachments will be skipped on send.
      </div>`
    : ''
  ) + attachments.map(a => {
    const icon = a.isImage
      ? `<img class="attach-chip-thumb" src="data:${a.mimeType};base64,${a.data}" alt="">`
      : `<svg class="attach-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    const dimmed = !hasVision && a.isImage;
    return `<div class="attach-chip${dimmed ? ' dimmed' : ''}" data-id="${a.id}">
      ${icon}
      <span class="attach-chip-name">${escapeHtml(a.name)}</span>
      <button class="attach-chip-remove" data-id="${a.id}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>`;
  }).join('');

  attachList.querySelectorAll('.attach-chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      attachments = attachments.filter(a => a.id !== btn.dataset.id);
      renderAttachments();
    });
  });
  updateAttachButton();
}

function renderMessageAttachments() {
  if (!attachments.length) return;
  const lastMsg = chatArea.querySelector('.message.user:last-child .msg-bubble');
  if (!lastMsg) return;
  const wrap = document.createElement('div');
  wrap.className = 'msg-attach-grid';
  for (const a of attachments) {
    if (a.isImage) {
      const img = document.createElement('img');
      img.src = `data:${a.mimeType};base64,${a.data}`;
      img.className = 'msg-attach-img';
      img.alt = a.name;
      img.loading = 'lazy';
      wrap.appendChild(img);
    } else {
      const chip = document.createElement('div');
      chip.className = 'msg-attach-file';
      chip.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>${escapeHtml(a.name)}</span>`;
      wrap.appendChild(chip);
    }
  }
  lastMsg.prepend(wrap);
}

function clearAttachments() {
  attachments = [];
  attachBar.style.display = 'none';
  attachList.innerHTML = '';
  updateAttachButton();
}

function clearQuote() {
  quoteText = '';
  renderQuotePreview();
}

function renderQuotePreview() {
  if (quoteText) {
    quotePreviewText.textContent = quoteText;
    quotePreview.style.display = 'flex';
  } else {
    quotePreview.style.display = 'none';
  }
}

function showToast(msg, type = 'warning') {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.innerHTML = `<span>${escapeHtml(msg)}</span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('open'));
  setTimeout(() => { el.classList.remove('open'); setTimeout(() => el.remove(), 200); }, 3500);
}

// ---- Build API content with attachments ----

function buildApiContent(text) {
  if (attachments.length === 0) return text;
  const hasVision = currentModelHasVision();
  const parts = [{ type: 'text', text: text || 'Analyze the attached files.' }];
  for (const a of attachments) {
    if (a.isImage) {
      if (!hasVision) continue;
      parts.push({ type: 'image', mimeType: a.mimeType, data: a.data });
    } else {
      parts.push({ type: 'text', text: `\n--- File: ${a.name} ---\n${a.data}\n--- End ${a.name} ---\n` });
    }
  }
  return parts;
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
      const visionBadge = m.vision !== false ? '' : '<span class="model-no-vision">text</span>';
      item.innerHTML = `${providerIcons[provider]} ${m.label} ${visionBadge}`;
      item.addEventListener('click', () => {
        modelSelect.value = m.value;
        providerSelect.value = provider;
        chrome.storage.sync.set({ provider: provider, model: m.value });
        modelDropdown.classList.remove('open');
        updateActiveDisplay(provider, m.label);
        updateModels();
        updateAttachButton();
        renderAttachments();
      });
      modelMenu.appendChild(item);
    });
  }
}

function updateActiveDisplay(provider, label) {
  activeModelIcon.innerHTML = providerIcons[provider] || '';
  activeModelName.textContent = label;
}

// ---- Selection Toolbar ----

const selToolbar = document.getElementById('selToolbar');
const selQuoteBtn = document.getElementById('selQuoteBtn');
let selToolbarHideTimer = null;

function hideSelToolbar() {
  selToolbar.classList.remove('open');
}

function showSelToolbar(left, top, text) {
  selToolbar.dataset.text = text;
  selToolbar.style.left = left + 'px';
  selToolbar.style.top = top + 'px';
  selToolbar.classList.add('open');
}

selQuoteBtn.addEventListener('click', () => {
  const text = selToolbar.dataset.text;
  if (!text) return;
  quoteText = text;
  renderQuotePreview();
  messageInput.focus();
  hideSelToolbar();
  window.getSelection()?.removeAllRanges();
});

quotePreviewDismiss.addEventListener('click', () => {
  quoteText = '';
  renderQuotePreview();
  messageInput.focus();
});

selToolbar.addEventListener('mousedown', (e) => {
  e.preventDefault();
});

function isAIRubyOrBubble(el) {
  return el && el.closest('.message.ai .msg-bubble');
}

function isInsideCodeBlock(el) {
  return el && el.closest('.cb-wrap, pre code');
}

document.addEventListener('mouseup', (e) => {
  if (e.target.closest('.sel-toolbar')) return;
  clearTimeout(selToolbarHideTimer);
  selToolbarHideTimer = setTimeout(() => {
    const bubble = isAIRubyOrBubble(e.target);
    if (!bubble) { hideSelToolbar(); return; }
    if (isInsideCodeBlock(e.target)) { hideSelToolbar(); return; }
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (!text || text.length < 2) { hideSelToolbar(); return; }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) { hideSelToolbar(); return; }
    const tw = 150;
    let left = rect.left + rect.width / 2 - tw / 2;
    let top = rect.top - 12;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    if (top < 4) top = rect.bottom + 12;
    showSelToolbar(left, top, text);
  }, 80);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideSelToolbar();
}, true);

document.addEventListener('scroll', hideSelToolbar, true);

// ---- Vim Mode ----

let vimMode = 'normal';
let vimPartial = '';
let vimPartialTimer = null;

const vimIndicator = document.getElementById('vimIndicator');
const vimHelpOverlay = document.getElementById('vimHelpOverlay');

function setVimMode(mode) {
  vimMode = mode;
  const labels = { normal: 'N', insert: 'I', visual: 'V' };
  vimIndicator.textContent = labels[mode] || 'N';
  vimIndicator.className = `vim-indicator ${mode}`;
  if (mode !== 'visual') clearVisualSelection();
}

function vimScrollChat(amount) {
  if (amount === 'top') { chatArea.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (amount === 'bottom') { chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' }); return; }
  chatArea.scrollBy({ top: amount, behavior: 'smooth' });
}

function toggleVimHelp() {
  const isOpen = vimHelpOverlay.style.display !== 'none';
  vimHelpOverlay.style.display = isOpen ? 'none' : 'flex';
}

// ---- Visual Mode ----

let vimMessages = [];
let vimVisualIndex = -1;

function clearVisualSelection() {
  chatArea.querySelectorAll('.message.vim-visual').forEach(el => el.classList.remove('vim-visual'));
  vimVisualIndex = -1;
}

function refreshVimMessages() {
  vimMessages = Array.from(chatArea.querySelectorAll('.message'));
}

function selectVimMessage(index) {
  clearVisualSelection();
  vimVisualIndex = Math.max(0, Math.min(index, vimMessages.length - 1));
  const el = vimMessages[vimVisualIndex];
  if (!el) { vimVisualIndex = -1; return; }
  el.classList.add('vim-visual');
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function getVimSelectedText() {
  const el = vimMessages[vimVisualIndex];
  if (!el) return '';
  const bubble = el.querySelector('.msg-bubble');
  return bubble ? bubble.textContent.trim() : '';
}

const visualBindings = {
  j() {
    refreshVimMessages();
    if (vimMessages.length === 0) return;
    const next = vimVisualIndex < 0 ? 0 : Math.min(vimVisualIndex + 1, vimMessages.length - 1);
    selectVimMessage(next);
  },
  k() {
    refreshVimMessages();
    if (vimMessages.length === 0) return;
    const prev = vimVisualIndex < 0 ? vimMessages.length - 1 : Math.max(vimVisualIndex - 1, 0);
    selectVimMessage(prev);
  },
  q() {
    const text = getVimSelectedText();
    if (text) {
      quoteText = text;
      renderQuotePreview();
      messageInput.focus();
      setVimMode('insert');
    }
  },
  y() {
    const text = getVimSelectedText();
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard');
      });
      setVimMode('normal');
    }
  },
};

// ---- Keydown Handler ----

document.addEventListener('keydown', (e) => {
  const tag = e.target.tagName;
  const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

  if (e.key === 'Escape') {
    if (isInput) {
      e.target.blur();
      setVimMode('normal');
      e.preventDefault();
      return;
    }
    if (historyOpen) { closeHistory(); e.preventDefault(); return; }
    if (contextMenu.classList.contains('open')) { hideContextMenu(); e.preventDefault(); return; }
    hideSelToolbar();
    if (vimMode === 'visual') { setVimMode('normal'); e.preventDefault(); return; }
    return;
  }

  if (isInput) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (vimMode === 'normal') {
    const key = e.key;

    if (vimPartial === 'g') {
      clearTimeout(vimPartialTimer);
      vimPartial = '';
      if (key === 'g') { vimScrollChat('top'); e.preventDefault(); return; }
      const cmd = vimBindings[key];
      if (cmd) { cmd(); e.preventDefault(); }
      return;
    }

    const cmd = vimBindings[key];
    if (cmd) { cmd(); e.preventDefault(); return; }

    if (key === 'g') {
      vimPartial = 'g';
      vimPartialTimer = setTimeout(() => { vimPartial = ''; }, 500);
      e.preventDefault();
    }
  }

  if (vimMode === 'visual') {
    const cmd = visualBindings[e.key];
    if (cmd) { cmd(); e.preventDefault(); }
  }
});

const vimBindings = {
  j() { vimScrollChat(50); },
  k() { vimScrollChat(-50); },
  d() { vimScrollChat(chatArea.clientHeight * 0.5); },
  u() { vimScrollChat(-(chatArea.clientHeight * 0.5)); },
  G() { vimScrollChat('bottom'); },
  i() { setVimMode('insert'); messageInput.focus(); },
  v() {
    refreshVimMessages();
    if (vimMessages.length === 0) return;
    selectVimMessage(vimMessages.length - 1);
    setVimMode('visual');
  },
  H() { toggleHistory(); },
  q() { chrome.runtime.sendMessage({ type: 'focus-page' }); },
  '?': toggleVimHelp,
};

document.getElementById('vimHelpClose').addEventListener('click', () => {
  vimHelpOverlay.style.display = 'none';
});

vimHelpOverlay.addEventListener('click', (e) => {
  if (e.target === vimHelpOverlay) vimHelpOverlay.style.display = 'none';
});

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
