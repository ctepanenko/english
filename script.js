let words = [];
let currentIndex = 0;

async function loadWords() {
    try {
        // Додаємо випадковий параметр, щоб браузер не кешував старий файл
        const response = await fetch('words.json?v=' + new Date().getTime());
        if (!response.ok) throw new Error("Файл words.json не знайдено");
        
        words = await response.json();
        console.log("Слова завантажено:", words.length);
        
        initApp();
    } catch (error) {
        console.error("Помилка:", error);
        const engElem = document.getElementById('word-eng');
        if (engElem) engElem.innerText = "Помилка завантаження JSON";
    }
}

function initApp() {
    const savedId = localStorage.getItem('lastWordId');
    
    if (savedId && words.length > 0) {
        const foundIndex = words.findIndex(w => w.id == savedId);
        currentIndex = foundIndex !== -1 ? foundIndex : 0;
    }
    
    updateDisplay();
}

function updateDisplay() {
    const engElement = document.getElementById('word-eng');
    const ukrElement = document.getElementById('word-ukr');
    const progressElement = document.getElementById('progress');

    if (!engElement || !ukrElement || words.length === 0) return;

    const currentWord = words[currentIndex];
    
    engElement.innerText = currentWord.eng;
    ukrElement.innerText = currentWord.ukr;
    progressElement.innerText = `Слово ${currentIndex + 1} із ${words.length}`;

    localStorage.setItem('lastWordId', currentWord.id);
}

function nextWord() {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        updateDisplay();
    }
}

function prevWord() {
    if (currentIndex > 0) {
        currentIndex--;
        updateDisplay();
    }
}

function resetProgress() {
    if (confirm("Почати спочатку?")) {
        localStorage.removeItem('lastWordId');
        currentIndex = 0;
        updateDisplay();
    }
}

// Чекаємо повного завантаження DOM
window.addEventListener('load', loadWords);
