// Головні змінні
let words = [];
let currentIndex = 0;

// Елементи DOM (переконайтеся, що у вас є елементи з такими ID в HTML)
const engElement = document.getElementById('word-eng');
const ukrElement = document.getElementById('word-ukr');
const progressElement = document.getElementById('progress');

/**
 * Завантаження слів із файлу words.json
 */
async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
        
        // Ініціалізація прогресу після завантаження даних
        initApp();
    } catch (error) {
        console.error("Помилка завантаження словника:", error);
        engElement.innerText = "Помилка завантаження JSON";
    }
}

/**
 * Ініціалізація додатка та перевірка закладки
 */
function initApp() {
    // Отримуємо збережений ID слова з пам'яті телефону
    const savedId = localStorage.getItem('lastWordId');
    
    if (savedId) {
        // Шукаємо індекс слова за його ID
        const foundIndex = words.findIndex(w => w.id == savedId);
        currentIndex = foundIndex !== -1 ? foundIndex : 0;
    } else {
        currentIndex = 0;
    }
    
    updateDisplay();
}

/**
 * Оновлення тексту на екрані та збереження закладки
 */
function updateDisplay() {
    if (words.length === 0) return;

    const currentWord = words[currentIndex];
    
    // Вивід на екран
    engElement.innerText = currentWord.eng;
    ukrElement.innerText = currentWord.ukr;
    progressElement.innerText = `Слово ${currentIndex + 1} із ${words.length} (ID: ${currentWord.id})`;

    // Автоматичне збереження закладки (ID поточного слова)
    localStorage.setItem('lastWordId', currentWord.id);
}

/**
 * Навігація: Наступне слово
 */
function nextWord() {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        updateDisplay();
    }
}

/**
 * Навігація: Попереднє слово
 */
function prevWord() {
    if (currentIndex > 0) {
        currentIndex--;
        updateDisplay();
    }
}

/**
 * Скидання прогресу
 */
function resetProgress() {
    if (confirm("Почати вивчення з першого слова?")) {
        localStorage.removeItem('lastWordId');
        currentIndex = 0;
        updateDisplay();
    }
}

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', loadWords);
