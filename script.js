let allWords = []; // Повний список із файлу
let wordsToLearn = []; // Тільки ті, що залишилися
let currentIndex = 0;
const synth = window.speechSynthesis;

/**
 * 1. Завантаження словника
 */
async function loadWords() {
    try {
        const response = await fetch('./words.json?v=' + new Date().getTime());
        if (!response.ok) throw new Error("JSON не знайдено");
        allWords = await response.json();
        
        initApp();
    } catch (error) {
        document.getElementById('txt-eng').innerText = "Помилка!";
        document.getElementById('txt-ukr').innerText = error.message;
    }
}

/**
 * 2. Фільтрація вивчених слів та ініціалізація
 */
function initApp() {
    // Отримуємо список ID вивчених слів
    const learnedIds = JSON.parse(localStorage.getItem('learnedWords_AZ') || "[]");
    
    // Залишаємо лише ті слова, ID яких немає в списку вивчених
    wordsToLearn = allWords.filter(word => !learnedIds.includes(word.id));

    if (wordsToLearn.length === 0) {
        showFinishScreen();
        return;
    }

    // Відновлюємо останню позицію (закладку)
    const savedId = localStorage.getItem('lastWordId_AZ');
    const foundIndex = wordsToLearn.findIndex(w => w.id == savedId);
    currentIndex = foundIndex !== -1 ? foundIndex : 0;
    
    renderCard();
}

/**
 * 3. Функція "Вивчено" (Назавжди)
 */
function markAsLearned() {
    if (wordsToLearn.length === 0) return;

    const currentWord = wordsToLearn[currentIndex];
    
    // 1. Додаємо ID у список вивчених в localStorage
    const learnedIds = JSON.parse(localStorage.getItem('learnedWords_AZ') || "[]");
    if (!learnedIds.includes(currentWord.id)) {
        learnedIds.push(currentWord.id);
        localStorage.setItem('learnedWords_AZ', JSON.stringify(learnedIds));
    }

    // Візуальний ефект
    const card = document.getElementById('card');
    card.style.boxShadow = "0 0 40px rgba(52, 168, 83, 0.8)";

    setTimeout(() => {
        // 2. Видаляємо з поточного масиву
        wordsToLearn.splice(currentIndex, 1);

        if (wordsToLearn.length === 0) {
            showFinishScreen();
        } else {
            if (currentIndex >= wordsToLearn.length) currentIndex = 0;
            card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
            renderCard();
        }
    }, 300);
}

/**
 * 4. Відображення картки
 */
function renderCard() {
    if (wordsToLearn.length === 0) return;

    document.getElementById('card').classList.remove('is-flipped');
    const currentWord = wordsToLearn[currentIndex];

    document.getElementById('txt-eng').innerText = currentWord.eng;
    document.getElementById('txt-ukr').innerText = currentWord.ukr;
    document.getElementById('progress').innerText = `Залишилось: ${wordsToLearn.length} із ${allWords.length}`;

    const imgElement = document.getElementById('img-front');
    const firstWord = currentWord.eng.split(' ')[0];
    imgElement.src = `https://loremflickr.com/350/450/${encodeURIComponent(firstWord)}?random=${currentWord.id}`;

    // Зберігаємо закладку (щоб знати, де зупинилися)
    localStorage.setItem('lastWordId_AZ', currentWord.id);
    speak(currentWord.eng);
}

/**
 * 5. Екран завершення
 */
function showFinishScreen() {
    document.getElementById('txt-eng').innerText = "🎉 Готово!";
    document.getElementById('txt-ukr').innerText = "Ви вивчили всі слова зі списку!";
    document.getElementById('progress').innerText = "100% виконано";
    document.getElementById('img-front').src = "https://loremflickr.com/350/450/success?random=1";
}

/**
 * Додатково: Скидання всієї статистики (якщо захочете почати з нуля)
 */
function resetProgress() {
    if (confirm("Це видалить весь прогрес і поверне всі 1000 слів. Продовжити?")) {
        localStorage.removeItem('learnedWords_AZ');
        localStorage.removeItem('lastWordId_AZ');
        location.reload();
    }
}

// Решта функцій (flipCard, nextWord, prevWord, speak) залишаються без змін
function flipCard() {
    const card = document.getElementById('card');
    card.classList.toggle('is-flipped');
    if (!card.classList.contains('is-flipped')) speak(wordsToLearn[currentIndex].eng);
}

function nextWord() {
    if (wordsToLearn.length <= 1) return;
    currentIndex = (currentIndex + 1) % wordsToLearn.length;
    renderCard();
}

function prevWord() {
    if (wordsToLearn.length <= 1) return;
    currentIndex = (currentIndex - 1 + wordsToLearn.length) % wordsToLearn.length;
    renderCard();
}

function speak(text) {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synth.speak(utterance);
}

window.addEventListener('load', loadWords);
