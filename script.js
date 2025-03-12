// 全局变量
const ITEMS_PER_PAGE = 6; // 每页显示的项目数
let currentWordPage = 1;
let currentSentencePage = 1;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化
    initThemeToggle();
    initTabs();
    renderWords();
    renderSentences();
    initEventListeners();

    // 隐藏加载动画
    document.getElementById('word-loading').style.display = 'none';
    document.getElementById('sentence-loading').style.display = 'none';
});

// 初始化标签页
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-content`).classList.add('active');
        });
    });
}

// 初始化事件监听器
function initEventListeners() {
    // 添加单词
    document.getElementById('add-word-btn').addEventListener('click', addWord);

    // 添加句子
    document.getElementById('add-sentence-btn').addEventListener('click', addSentence);

    // 单词搜索
    document.getElementById('word-search').addEventListener('input', (e) => {
        filterItems('word', e.target.value);
    });

    // 句子搜索
    document.getElementById('sentence-search').addEventListener('input', (e) => {
        filterItems('sentence', e.target.value);
    });

    // 单词排序
    document.getElementById('sort-word-new').addEventListener('click', () => {
        sortItems('word', 'new');
    });

    document.getElementById('sort-word-az').addEventListener('click', () => {
        sortItems('word', 'az');
    });

    // 句子排序
    document.getElementById('sort-sentence-new').addEventListener('click', () => {
        sortItems('sentence', 'new');
    });

    document.getElementById('sort-sentence-az').addEventListener('click', () => {
        sortItems('sentence', 'az');
    });

    // 导出数据
    document.getElementById('export-btn').addEventListener('click', exportData);

    // 导入数据
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', importData);
}

// 本地存储相关函数
function saveWords(words) {
    localStorage.setItem('words', JSON.stringify(words));
}

function getWords() {
    return JSON.parse(localStorage.getItem('words') || '[]');
}

function saveSentences(sentences) {
    localStorage.setItem('sentences', JSON.stringify(sentences));
}

function getSentences() {
    return JSON.parse(localStorage.getItem('sentences') || '[]');
}

// 渲染单词列表
function renderWords(page = currentWordPage) {
    const wordList = document.getElementById('word-list');
    const words = getWords();
    const pagination = document.getElementById('word-pagination');

    // 更新当前页
    currentWordPage = page;

    // 计算分页
    const totalPages = Math.ceil(words.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageItems = words.slice(startIndex, endIndex);

    // 清空列表
    wordList.innerHTML = '';

    // 如果没有单词
    if (words.length === 0) {
        wordList.innerHTML = '<div class="empty-message">暂无单词，请添加新单词</div>';
        pagination.innerHTML = '';
        return;
    }

    // 渲染当前页的单词
    currentPageItems.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <button class="delete-btn" data-index="${startIndex + index}">
                <i class="fas fa-times"></i>
            </button>
            <h3>${word.text}</h3>
            <div class="phonetic">${word.phonetic || ''}</div>
            <div class="translation">${word.translation || ''}</div>
            <button class="play-btn" data-text="${word.text}">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        wordList.appendChild(wordItem);

        // 添加动画效果
        setTimeout(() => {
            wordItem.style.opacity = '1';
            wordItem.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // 添加删除事件
    document.querySelectorAll('.word-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteItem('word', index);
        });
    });

    // 添加播放发音事件
    document.querySelectorAll('.word-item .play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.currentTarget.dataset.text;
            playAudio(text);
        });
    });

    // 渲染分页
    renderPagination('word', page, totalPages);
}

// 渲染句子列表
function renderSentences(page = currentSentencePage) {
    const sentenceList = document.getElementById('sentence-list');
    const sentences = getSentences();
    const pagination = document.getElementById('sentence-pagination');

    // 更新当前页
    currentSentencePage = page;

    // 计算分页
    const totalPages = Math.ceil(sentences.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageItems = sentences.slice(startIndex, endIndex);

    // 清空列表
    sentenceList.innerHTML = '';

    // 如果没有句子
    if (sentences.length === 0) {
        sentenceList.innerHTML = '<div class="empty-message">暂无句子，请添加新句子</div>';
        pagination.innerHTML = '';
        return;
    }

    // 渲染当前页的句子
    currentPageItems.forEach((sentence, index) => {
        const sentenceItem = document.createElement('div');
        sentenceItem.className = 'sentence-item';
        sentenceItem.innerHTML = `
            <button class="delete-btn" data-index="${startIndex + index}">
                <i class="fas fa-times"></i>
            </button>
            <h3>英文句子</h3>
            <div class="translation">${sentence.text}</div>
            <h3>翻译</h3>
            <div class="translation">${sentence.translation || '无翻译'}</div>
            <button class="play-btn" data-text="${sentence.text}">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        sentenceList.appendChild(sentenceItem);

        // 添加动画效果
        setTimeout(() => {
            sentenceItem.style.opacity = '1';
            sentenceItem.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // 添加删除事件
    document.querySelectorAll('.sentence-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteItem('sentence', index);
        });
    });

    // 添加播放发音事件
    document.querySelectorAll('.sentence-item .play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.currentTarget.dataset.text;
            playAudio(text);
        });
    });

    // 渲染分页
    renderPagination('sentence', page, totalPages);
}

// 渲染分页控件
function renderPagination(type, currentPage, totalPages) {
    const paginationElement = document.getElementById(`${type}-pagination`);
    paginationElement.innerHTML = '';

    // 如果总页数小于等于1，不显示分页
    if (totalPages <= 1) {
        return;
    }

    // 创建上一页按钮
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => {
            if (type === 'word') {
                renderWords(currentPage - 1);
            } else {
                renderSentences(currentPage - 1);
            }
        });
        paginationElement.appendChild(prevBtn);
    }

    // 创建页码按钮
    for (let i = 1; i <= totalPages; i++) {
        // 如果页数太多，只显示当前页附近的页码
        if (totalPages > 5 &&
            (i !== 1 && i !== totalPages &&
                (i < currentPage - 1 || i > currentPage + 1) &&
                i !== currentPage)) {
            // 添加省略号
            if (i === 2 || i === totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                paginationElement.appendChild(ellipsis);
            }
            continue;
        }

        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            if (type === 'word') {
                renderWords(i);
            } else {
                renderSentences(i);
            }
        });
        paginationElement.appendChild(pageBtn);
    }

    // 创建下一页按钮
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => {
            if (type === 'word') {
                renderWords(currentPage + 1);
            } else {
                renderSentences(currentPage + 1);
            }
        });
        paginationElement.appendChild(nextBtn);
    }
}

// 添加单词
async function addWord() {
    const wordInput = document.getElementById('word-input');
    const wordError = document.getElementById('word-error');
    const wordLoading = document.getElementById('word-loading');

    const word = wordInput.value.trim();

    if (!word) {
        wordError.textContent = '请输入单词';
        shakeElement(wordInput);
        return;
    }

    wordError.textContent = '';
    wordLoading.style.display = 'flex';

    try {
        const { phonetic, translation } = await translateWord(word);

        const words = getWords();
        words.push({
            text: word,
            phonetic,
            translation,
            timestamp: Date.now()
        });

        saveWords(words);
        renderWords();

        wordInput.value = '';

        // 添加成功动画
        const addBtn = document.getElementById('add-word-btn');
        addBtn.textContent = '添加成功！';
        addBtn.style.background = 'linear-gradient(to right, #4caf50, #45a049)';

        setTimeout(() => {
            addBtn.textContent = '添加单词';
            addBtn.style.background = '';
        }, 2000);

    } catch (error) {
        wordError.textContent = '获取翻译时出错';
        console.error(error);
    } finally {
        wordLoading.style.display = 'none';
    }
}

// 添加句子
async function addSentence() {
    const sentenceInput = document.getElementById('sentence-input');
    const translationInput = document.getElementById('translation-input');
    const sentenceError = document.getElementById('sentence-error');
    const sentenceLoading = document.getElementById('sentence-loading');

    const sentence = sentenceInput.value.trim();
    let translation = translationInput.value.trim();

    if (!sentence) {
        sentenceError.textContent = '请输入句子';
        shakeElement(sentenceInput);
        return;
    }

    sentenceError.textContent = '';

    // 如果没有提供翻译，调用翻译API
    if (!translation) {
        sentenceLoading.style.display = 'flex';
        try {
            translation = await translateSentence(sentence);
        } catch (error) {
            console.error('翻译出错:', error);
            translation = '翻译服务出错';
        } finally {
            sentenceLoading.style.display = 'none';
        }
    }

    const sentences = getSentences();
    sentences.push({
        text: sentence,
        translation,
        timestamp: Date.now()
    });

    saveSentences(sentences);
    renderSentences();

    sentenceInput.value = '';
    translationInput.value = '';

    // 添加成功动画
    const addBtn = document.getElementById('add-sentence-btn');
    addBtn.textContent = '添加成功！';
    addBtn.style.background = 'linear-gradient(to right, #4caf50, #45a049)';

    setTimeout(() => {
        addBtn.textContent = '添加句子';
        addBtn.style.background = '';
    }, 2000);
}

// 删除项目
function deleteItem(type, index) {
    if (type === 'word') {
        const words = getWords();
        words.splice(index, 1);
        saveWords(words);
        renderWords();
    } else {
        const sentences = getSentences();
        sentences.splice(index, 1);
        saveSentences(sentences);
        renderSentences();
    }
}

// 过滤项目
function filterItems(type, keyword) {
    keyword = keyword.toLowerCase().trim();

    if (type === 'word') {
        const words = getWords();
        const filteredWords = keyword ?
            words.filter(word =>
                word.text.toLowerCase().includes(keyword) ||
                word.translation.toLowerCase().includes(keyword)
            ) : words;

        // 保存原始数据
        localStorage.setItem('filteredWords', JSON.stringify(filteredWords));
        currentWordPage = 1;
        renderFilteredWords();
    } else {
        const sentences = getSentences();
        const filteredSentences = keyword ?
            sentences.filter(sentence =>
                sentence.text.toLowerCase().includes(keyword) ||
                sentence.translation.toLowerCase().includes(keyword)
            ) : sentences;

        // 保存原始数据
        localStorage.setItem('filteredSentences', JSON.stringify(filteredSentences));
        currentSentencePage = 1;
        renderFilteredSentences();
    }
}

// 渲染过滤后的单词
function renderFilteredWords() {
    const wordList = document.getElementById('word-list');
    const filteredWords = JSON.parse(localStorage.getItem('filteredWords') || '[]');
    const pagination = document.getElementById('word-pagination');

    // 计算分页
    const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
    const startIndex = (currentWordPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageItems = filteredWords.slice(startIndex, endIndex);

    // 清空列表
    wordList.innerHTML = '';

    // 如果没有单词
    if (filteredWords.length === 0) {
        wordList.innerHTML = '<div class="empty-message">没有找到匹配的单词</div>';
        pagination.innerHTML = '';
        return;
    }

    // 渲染当前页的单词
    currentPageItems.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <button class="delete-btn" data-index="${getWords().findIndex(w => w.text === word.text)}">
                <i class="fas fa-times"></i>
            </button>
            <h3>${word.text}</h3>
            <div class="phonetic">${word.phonetic || ''}</div>
            <div class="translation">${word.translation || ''}</div>
            <button class="play-btn" data-text="${word.text}">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        wordList.appendChild(wordItem);
    });

    // 添加删除事件
    document.querySelectorAll('.word-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteItem('word', index);
        });
    });

    // 添加播放发音事件
    document.querySelectorAll('.word-item .play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.currentTarget.dataset.text;
            playAudio(text);
        });
    });

    // 渲染分页
    renderPagination('word', currentWordPage, totalPages);
}

// 渲染过滤后的句子
function renderFilteredSentences() {
    const sentenceList = document.getElementById('sentence-list');
    const filteredSentences = JSON.parse(localStorage.getItem('filteredSentences') || '[]');
    const pagination = document.getElementById('sentence-pagination');

    // 计算分页
    const totalPages = Math.ceil(filteredSentences.length / ITEMS_PER_PAGE);
    const startIndex = (currentSentencePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageItems = filteredSentences.slice(startIndex, endIndex);

    // 清空列表
    sentenceList.innerHTML = '';

    // 如果没有句子
    if (filteredSentences.length === 0) {
        sentenceList.innerHTML = '<div class="empty-message">没有找到匹配的句子</div>';
        pagination.innerHTML = '';
        return;
    }

    // 渲染当前页的句子
    currentPageItems.forEach((sentence, index) => {
        const sentenceItem = document.createElement('div');
        sentenceItem.className = 'sentence-item';
        sentenceItem.innerHTML = `
            <button class="delete-btn" data-index="${getSentences().findIndex(s => s.text === sentence.text)}">
                <i class="fas fa-times"></i>
            </button>
            <h3>英文句子</h3>
            <div class="translation">${sentence.text}</div>
            <h3>翻译</h3>
            <div class="translation">${sentence.translation || '无翻译'}</div>
            <button class="play-btn" data-text="${sentence.text}">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        sentenceList.appendChild(sentenceItem);
    });

    // 添加删除事件
    document.querySelectorAll('.sentence-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteItem('sentence', index);
        });
    });

    // 添加播放发音事件
    document.querySelectorAll('.sentence-item .play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.currentTarget.dataset.text;
            playAudio(text);
        });
    });

    // 渲染分页
    renderPagination('sentence', currentSentencePage, totalPages);
}

// 排序项目
function sortItems(type, sortType) {
    if (type === 'word') {
        // 更新排序按钮状态
        document.getElementById('sort-word-new').classList.toggle('active', sortType === 'new');
        document.getElementById('sort-word-az').classList.toggle('active', sortType === 'az');

        const words = getWords();

        if (sortType === 'new') {
            words.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            words.sort((a, b) => a.text.localeCompare(b.text));
        }

        saveWords(words);
        renderWords();
    } else {
        // 更新排序按钮状态
        document.getElementById('sort-sentence-new').classList.toggle('active', sortType === 'new');
        document.getElementById('sort-sentence-az').classList.toggle('active', sortType === 'az');

        const sentences = getSentences();

        if (sortType === 'new') {
            sentences.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            sentences.sort((a, b) => a.text.localeCompare(b.text));
        }

        saveSentences(sentences);
        renderSentences();
    }
}

// 获取单词音标 (修改为优先获取美式音标)
async function getPhonetic(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            // 尝试获取美式音标
            if (data[0].phonetics && data[0].phonetics.length > 0) {
                // 查找带有 "audio" 且包含 "us" 的音标条目
                const usPhonetic = data[0].phonetics.find(p =>
                    p.audio && p.audio.includes('us') && p.text
                );

                // 如果找到美式音标，则返回
                if (usPhonetic && usPhonetic.text) {
                    return usPhonetic.text;
                }

                // 如果没有明确的美式音标，返回第一个有文本的音标
                const anyPhonetic = data[0].phonetics.find(p => p.text);
                if (anyPhonetic && anyPhonetic.text) {
                    return anyPhonetic.text;
                }
            }

            // 如果没有在 phonetics 数组中找到，则使用主音标
            return data[0].phonetic || `/${word}/`;
        }

        return `/${word}/`;
    } catch (error) {
        console.error('获取音标出错:', error);
        return `/${word}/`;
    }
}

// 播放音频
function playAudio(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';

        // 获取可用的声音列表
        const voices = window.speechSynthesis.getVoices();

        // 选择英语声音 (优先选择美式英语女声)
        const englishVoices = voices.filter(voice => voice.lang.includes('en-US'));
        if (englishVoices.length > 0) {
            // 尝试找到女声
            const femaleVoice = englishVoices.find(voice =>
                voice.name.includes('female') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Alex') ||
                voice.name.includes('Victoria')
            );

            // 如果找到女声，使用它，否则使用第一个英语声音
            utterance.voice = femaleVoice || englishVoices[0];
        }

        // 调整音调和语速
        utterance.pitch = 1.1; // 稍微提高音调 (0.1-2)
        utterance.rate = 0.9;  // 稍微降低语速 (0.1-10)

        speechSynthesis.speak(utterance);

        // 添加动画效果
        const playBtns = document.querySelectorAll(`.play-btn[data-text="${text}"]`);
        playBtns.forEach(btn => {
            btn.classList.add('pulse');
            setTimeout(() => {
                btn.classList.remove('pulse');
            }, 500);
        });
    } else {
        alert('您的浏览器不支持语音合成API');
    }
}

// 导出数据
function exportData() {
    const data = {
        words: getWords(),
        sentences: getSentences()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);

    // 添加成功动画
    const exportBtn = document.getElementById('export-btn');
    exportBtn.innerHTML = '<i class="fas fa-check"></i> 导出成功';
    exportBtn.style.background = 'linear-gradient(to right, #4caf50, #45a049)';

    setTimeout(() => {
        exportBtn.innerHTML = '<i class="fas fa-download"></i> 导出数据';
        exportBtn.style.background = '';
    }, 2000);
}

// 导入数据
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (data.words) {
                saveWords(data.words);
                renderWords();
            }

            if (data.sentences) {
                saveSentences(data.sentences);
                renderSentences();
            }

            // 添加成功动画
            const importBtn = document.getElementById('import-btn');
            importBtn.innerHTML = '<i class="fas fa-check"></i> 导入成功';
            importBtn.style.background = 'linear-gradient(to right, #4caf50, #45a049)';

            setTimeout(() => {
                importBtn.innerHTML = '<i class="fas fa-upload"></i> 导入数据';
                importBtn.style.background = '';
            }, 2000);

        } catch (error) {
            alert('导入失败，文件格式不正确！');
            console.error(error);
        }
    };

    reader.readAsText(file);
}

// 添加元素抖动效果
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// 翻译单词函数
async function translateWord(word) {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.responseData) {
            // 获取音标（优先获取美式音标）
            let phonetic = '';
            try {
                const phoneticResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                const phoneticData = await phoneticResponse.json();
                if (Array.isArray(phoneticData) && phoneticData.length > 0) {
                    // 尝试获取美式音标
                    if (phoneticData[0].phonetics && phoneticData[0].phonetics.length > 0) {
                        // 查找带有美式音频的音标
                        const usPhonetic = phoneticData[0].phonetics.find(p =>
                            p.audio && p.audio.includes('us') && p.text
                        );

                        if (usPhonetic && usPhonetic.text) {
                            phonetic = usPhonetic.text;
                        } else {
                            // 如果没有找到美式音标，使用默认音标
                            phonetic = phoneticData[0].phonetic || `/${word}/`;
                        }
                    } else {
                        phonetic = phoneticData[0].phonetic || `/${word}/`;
                    }
                } else {
                    phonetic = `/${word}/`;
                }
            } catch (error) {
                console.error('获取音标出错:', error);
                phonetic = `/${word}/`;
            }

            return {
                phonetic,
                translation: result.responseData.translatedText
            };
        }

        return {
            phonetic: '',
            translation: '未找到翻译'
        };
    } catch (error) {
        console.error('翻译出错:', error);
        return {
            phonetic: '',
            translation: '翻译服务出错'
        };
    }
}

// 翻译句子函数
async function translateSentence(sentence) {
    try {
        // 使用MyMemory翻译API
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=en|zh`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.responseData) {
            return result.responseData.translatedText;
        }

        return '未找到翻译';
    } catch (error) {
        console.error('翻译出错:', error);
        return '翻译服务出错';
    }
}

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化
    initTabs();
    renderWords();
    renderSentences();
    initEventListeners();
    initAboutButton(); // 添加这一行

    // 隐藏加载动画
    document.getElementById('word-loading').style.display = 'none';
    document.getElementById('sentence-loading').style.display = 'none';
});

// 添加元素抖动效果
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// 添加关于本站按钮和弹窗
function initAboutButton() {
    // 创建悬浮按钮
    const aboutButton = document.createElement('button');
    aboutButton.className = 'about-button';
    aboutButton.innerHTML = '<i class="fas fa-info-circle"></i>';
    aboutButton.title = '关于本站';
    document.body.appendChild(aboutButton);

    // 创建弹窗
    const aboutModal = document.createElement('div');
    aboutModal.className = 'about-modal';
    aboutModal.innerHTML = `
        <div class="about-modal-content">
            <button class="about-close-btn">&times;</button>
            <h2>词汇学习助手</h2>
            <div class="about-divider"></div>
            <div class="about-section">
                <h3><i class="fas fa-star"></i> 主要功能</h3>
                <ul>
                    <li><strong>单词管理</strong>：添加、存储、搜索和删除英语单词</li>
                    <li><strong>句子管理</strong>：添加、存储、搜索和删除英语句子</li>
                    <li><strong>自动翻译</strong>：自动获取单词的中文翻译和音标</li>
                    <li><strong>语音朗读</strong>：支持单词和句子的语音朗读功能</li>
                    <li><strong>数据导入导出</strong>：支持将词汇数据导出为JSON文件，方便备份和迁移</li>
                </ul>
            </div>
            <div class="about-section">
                <h3><i class="fas fa-lightbulb"></i> 使用技巧</h3>
                <ul>
                    <li><strong>添加单词</strong>：在单词输入框中输入英文单词，系统会自动获取音标和翻译</li>
                    <li><strong>添加句子</strong>：在句子输入框中输入英文句子，可选择手动输入翻译或让系统自动翻译</li>
                    <li><strong>搜索功能</strong>：使用搜索框可以快速查找已添加的单词和句子</li>
                    <li><strong>排序功能</strong>：可以按添加时间或字母顺序排序单词和句子</li>
                    <li><strong>语音朗读</strong>：点击单词或句子旁边的喇叭图标可以听取发音</li>
                </ul>
            </div>
            <div class="about-section">
                <h3><i class="fas fa-cog"></i> 技术特点</h3>
                <ul>
                    <li>纯前端实现，数据存储在浏览器本地</li>
                    <li>响应式设计，适配不同设备屏幕</li>
                    <li>使用Web Speech API提供语音朗读功能</li>
                    <li>使用MyMemory翻译API提供翻译服务</li>
                    <li>使用Dictionary API获取单词音标</li>
                </ul>
            </div>
            <div class="about-footer">
                <p>感谢使用词汇学习助手！希望它能帮助您更高效地学习英语。</p>
            </div>
        </div>
    `;
    document.body.appendChild(aboutModal);

    // 添加按钮点击事件
    aboutButton.addEventListener('click', () => {
        aboutModal.classList.add('show');
        // 添加动画效果
        setTimeout(() => {
            aboutModal.querySelector('.about-modal-content').style.transform = 'translateY(0)';
            aboutModal.querySelector('.about-modal-content').style.opacity = '1';
        }, 10);
    });

    // 添加关闭按钮事件
    aboutModal.querySelector('.about-close-btn').addEventListener('click', () => {
        aboutModal.querySelector('.about-modal-content').style.transform = 'translateY(20px)';
        aboutModal.querySelector('.about-modal-content').style.opacity = '0';
        setTimeout(() => {
            aboutModal.classList.remove('show');
        }, 300);
    });

    // 点击弹窗外部关闭
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.querySelector('.about-modal-content').style.transform = 'translateY(20px)';
            aboutModal.querySelector('.about-modal-content').style.opacity = '0';
            setTimeout(() => {
                aboutModal.classList.remove('show');
            }, 300);
        }
    });
}
