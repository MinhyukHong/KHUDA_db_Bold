import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/lib/codemirror.js';
import stringSimilarity from 'string-similarity'; // 추가
require('codemirror/mode/markdown/markdown');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/search/searchcursor');

// 초기 키워드 리스트
let keywords: string[] = [];
let sentences: string[] = [];

// 서버와 통신하여 문서 분석 결과 받기
async function analyzeText(text: string) {
    const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error(`Failed to analyze text: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

// 문장 분리 함수
function splitTextIntoSentences(text: string): string[] {
    const sentenceEndings = /(?<!\d)([.!?]+)(?!\d)/g;
    return text.split(sentenceEndings).reduce((acc, part, index, array) => {
        if (part.match(sentenceEndings)) {
            acc[acc.length - 1] += part;
        } else if (index < array.length - 1) {
            acc.push(part);
        }
        return acc;
    }, ['']).filter(sentence => sentence.trim().length > 0);
}

// 중요한 문장과 단어를 강조 처리
function highlightText(sentences: string[], words: string[]) {
    const content = document.querySelector('.editor-content');
    if (!content) return;

    let html = content.innerHTML;
    console.log('Original HTML:', html);  // 원본 HTML 로그

    // 중복 강조 방지를 위한 세트
    const highlightedSections = new Set<string>();

    // 중요한 문장 강조
    sentences.forEach(sentence => {
        const cleanedSentence = sentence.trim();
        const sentenceWithMark = `### ${cleanedSentence}`;
        const regex = new RegExp(cleanedSentence.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');

        if (!highlightedSections.has(cleanedSentence)) {
            html = html.replace(regex, sentenceWithMark);
            highlightedSections.add(cleanedSentence);
        }
    });

    // 중요한 단어 강조
    words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        html = html.replace(regex, `<strong>${word}</strong>`);
    });

    // 중복 강조 방지 및 유사도 계산을 위한 문장 강조
    sentences.forEach(sentence => {
        const regex = new RegExp(`###\\s${sentence}`, 'gi');
        const matches = html.match(regex);

        if (matches && matches.length > 0) {
            matches.forEach(match => {
                const index = html.indexOf(match);
                const start = index + match.length;
                const end = html.indexOf('.', start) + 1;

                if (end > start) {
                    const sentenceCandidate = html.substring(start, end).trim();
                    const similarity = stringSimilarity.compareTwoStrings(sentence, sentenceCandidate);

                    if (similarity >= 0.8 && !highlightedSections.has(sentenceCandidate)) {
                        html = html.replace(sentenceCandidate, `### ${sentenceCandidate}`);
                        highlightedSections.add(sentenceCandidate);
                    }
                }
            });
        }
    });

    console.log('Updated HTML:', html);  // 업데이트된 HTML 로그
    content.innerHTML = html;
}

// 키워드를 굵게 표시
function wrapKeywordsInBold(text: string): string {
    const keywordPattern = new RegExp(`(${keywords.join("|")})`, "gi");
    return text.replace(keywordPattern, '**$1**');
}

// 미리보기 업데이트
function updatePreview(content: string) {
    const previewElement = document.querySelector('#preview .sc-eGRUor');
    if (previewElement) {
        previewElement.innerHTML = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } else {
        console.error("Preview element not found.");
    }
}

// 팝업 창 생성
function createPopup() {
    const popup = document.createElement('div');
    popup.id = 'analyzing-popup';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.zIndex = '10000';

    const popupContent = document.createElement('div');
    popupContent.style.backgroundColor = 'white';
    popupContent.style.padding = '20px';
    popupContent.style.borderRadius = '5px';
    popupContent.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    popupContent.style.textAlign = 'center';
    popupContent.textContent = '문서를 분석하고 있습니다...';

    popup.appendChild(popupContent);
    document.body.appendChild(popup);
}

// 팝업 창 제거
function removePopup() {
    const popup = document.getElementById('analyzing-popup');
    if (popup) {
        document.body.removeChild(popup);
    }
}

// CodeMirror 초기화
function initializeCodeMirror(): CodeMirror.Editor | null {
    const textArea = document.querySelector('.sc-fvxzrP textarea') as HTMLTextAreaElement;
    if (textArea) {
        const editor = CodeMirror.fromTextArea(textArea, {
            mode: 'markdown',
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: {
                'Ctrl-B': function (cm) {
                    const cursor = cm.getCursor();
                    const token = cm.getTokenAt(cursor);
                    const keyword = token.string;
                    if (keywords.includes(keyword)) {
                        cm.replaceRange(`**${keyword}**`, { line: cursor.line, ch: token.start }, { line: cursor.line, ch: token.end });
                    }
                }
            }
        });

        // Placeholder 설정
        editor.on('blur', () => {
            if (editor.getValue() === '') {
                editor.getWrapperElement().classList.add('empty');
            }
        });

        editor.on('focus', () => {
            editor.getWrapperElement().classList.remove('empty');
        });

        if (editor.getValue() === '') {
            editor.getWrapperElement().classList.add('empty');
        }

        return editor;
    } else {
        console.error("Textarea for CodeMirror not found.");
        return null;
    }
}

// 볼드체 변환 버튼 추가
function addBoldButton(editor: CodeMirror.Editor | null) {
    const existingButton = document.getElementById('boldButton');
    if (existingButton) {
        existingButton.remove();
    }

    const myButton = document.createElement('button');
    myButton.id = 'boldButton';
    myButton.textContent = '볼드체 변환';
    myButton.style.position = 'fixed';
    myButton.style.bottom = '13px';
    myButton.style.right = '1000px';
    myButton.style.zIndex = '1000';
    myButton.style.backgroundColor = '#33CC99';
    myButton.style.color = 'white';
    myButton.style.padding = '10px 15px';
    myButton.style.fontSize = '16px';
    myButton.style.border = 'none';
    myButton.style.borderRadius = '4px';
    myButton.style.fontFamily = 'Arial, sans-serif';
    myButton.style.fontWeight = 'bold';
    myButton.style.textTransform = 'uppercase';
    myButton.style.cursor = 'pointer';

    myButton.onclick = async function () {
        if (!editor) {
            console.error("CodeMirror editor not initialized.");
            return;
        }
        const text = editor.getValue();
        try {
            createPopup();
            const data = await analyzeText(text);
            sentences = data.sentences;
            keywords = data.words;
            highlightText(sentences, keywords);
            const wrappedText = wrapKeywordsInBold(text);
            editor.setValue(wrappedText);
            updatePreview(wrappedText);
        } catch (error) {
            console.error('Error analyzing text:', error);
        } finally {
            removePopup();
        }
    };

    document.body.appendChild(myButton);
}

window.addEventListener('load', () => {
    const editor = initializeCodeMirror();
    addBoldButton(editor);
});

// Placeholder 스타일 추가
const style = document.createElement('style');
style.innerHTML = `
    .CodeMirror.empty .CodeMirror-scroll::before {
        content: attr(data-placeholder);
        color: #999;
        padding: 0 4px;
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Placeholder 설정
const textArea = document.querySelector('.sc-fvxzrP .CodeMirror') as HTMLElement;
if (textArea) {
    textArea.setAttribute('data-placeholder', '당신의 이야기를 적어보세요...');
}