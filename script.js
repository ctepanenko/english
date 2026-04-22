// Основні змінні
let words = [];
let currentIndex = 0;
const synth = window.speechSynthesis; // API озвучування

/**
 * 1. Завантаження словника з JSON
 */
async function loadWords() {
    try {
        // fetch з параметром часу, щоб уникнути кешування на мобільному
        const response = await fetch('words.json?v=' + new Date().getTime());
        if (!response.ok) throw new Error("JSON не знайдено");
        words = await response.json();
        
        // Перевіряємо, чи є слова
        if (words.length === 0) {
            document.getElementById('txt-eng').innerText = "JSON порожній";
            return;
        }

        console.log(`Завантажено слів: ${words.length}`);
        initApp(); // Запускаємо додаток
    } catch (error) {
        console.error("Помилка:", error);
        document.getElementById('txt-eng').innerText = "Помилка JSON";
    }
}

/**
 * 2. Ініціалізація та закладка
 */
function initApp() {
    // Шукаємо в пам'яті телефону ID останнього слова
    const savedId = localStorage.getItem('lastWordId_AZ');
    
    if (savedId) {
        // Знаходимо індекс слова за його ID
        const foundIndex = words.findIndex(w => w.id == savedId);
        // Якщо знайшли — використовуємо, інакше — 0 (початок)
        currentIndex = foundIndex !== -1 ? foundIndex : 0;
    } else {
        currentIndex = 0; // Якщо пам'ять порожня
    }
    
    renderCard(); // Відображаємо картку
}

/**
 * 3. Відображення даних на картці
 */
function renderCard() {
    if (words.length === 0) return;

    // Скидаємо обертання картки (показуємо передню сторону)
    document.getElementById('card').classList.remove('is-flipped');

    const currentWord = words[currentIndex];

    // Оновлюємо текст
    document.getElementById('txt-eng').innerText = currentWord.eng;
    document.getElementById('txt-ukr').innerText = currentWord.ukr;
    
    // Оновлюємо прогрес (зверху)
    document.getElementById('progress').innerText = `Слово ${currentIndex + 1} із ${words.length}`;

    // Автоматичний підбір малюнка з loremflickr (350x450, random=id)
    const imgElement = document.getElementById('img-front');
    // Обробка для слів із кількох частин (беремо перше слово)
    const firstWord = currentWord.eng.split(' ')[0];
    imgElement.src = `https://loremflickr.com/350/450/${encodeURIComponent(firstWord)}?random=${currentWord.id}`;

    // Зберігаємо закладку в пам'ять телефону
    localStorage.setItem('lastWordId_AZ', currentWord.id);

    // Автоматично озвучуємо англійське слово при появі
    speak(currentWord.eng);
}

/**
 * 4. Логіка обертання картки (Tap)
 */
function flipCard() {
    const card = document.getElementById('card');
    card.classList.toggle('is-flipped');
    
    // Якщо картку повернули назад до англійської, озвучуємо знову
    if (!card.classList.contains('is-flipped')) {
        speak(words[currentIndex].eng);
    }
}

/**
 * 5. Функція Озвучування (SpeechSynthesis)
 */
function speak(text) {
    // Якщо телефон вже говорить, скасовуємо попередню мову
    if (synth.speaking) synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Американська англійська
    utterance.rate = 0.9;     // Трохи повільніше (для навчання)
    synth.speak(utterance);
}

/**
 * 6. Навігація
 */
function nextWord() {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        renderCard();
    } else {
        // Якщо дійшли до кінця, озвучуємо "Вітаємо"
        speak("Congratulations! You finished the list.");
        alert("🎉 Ви пройшли весь список!");
    }
}

function prevWord() {
    if (currentIndex > 0) {
        currentIndex--;
        renderCard();
    }
}

/**
 * 7. Скидання прогресу
 */
function resetProgress() {
    if (confirm("Видалити закладку і почати з 1-го слова?")) {
        localStorage.removeItem('lastWordId_AZ');
        currentIndex = 0;
        renderCard();
    }
}

// Запуск після повного завантаження DOM
window.addEventListener('load', loadWords);
