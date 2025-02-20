const apiKey = 'OPENAI_API_KEY'; // Keep the API key if needed for backend, not in frontend

// DOM Elements
const inputText = document.getElementById('input');
const translateButton = document.getElementById('translate-btn');
const languageRadios = document.querySelectorAll('.language-checkbox');
const txtContainer = document.querySelector('.txt-container');
const txtBox = document.querySelector('.txt-box h1');
const langBox = document.querySelector('.lang-box');
const langBoxTitle = document.querySelector('.lang-box h1');
const langBoxUl = document.querySelector('.lang-box ul');

// Translate Button
translateButton.addEventListener('click', async () => {
    const text = inputText.value.trim();
    const selectedLanguage = getSelectedLanguage();

    if (!text) {
        alert('Please enter some text to translate.');
        return;
    }
    if (!selectedLanguage) {
        alert('Please select a language.');
        return;
    }

    // Show loading state
    translateButton.textContent = 'Translating...';
    translateButton.disabled = true;

    try {
        // Make request to backend API
        const response = await fetch('http://localhost:3000/translate', { // Ensure correct backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                targetLanguage: selectedLanguage
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get translation');
        }

        const data = await response.json();
        const translation = data.translation;

        // Update UI with translation
        txtBox.textContent = 'Original Text 👇';
        langBoxTitle.textContent = 'Your Translation 👇';

        // Display original text in textarea
        inputText.value = text;
        inputText.disabled = true;

        // Create new textarea for the translation
        const translationTextarea = document.createElement('textarea');
        translationTextarea.value = translation;
        translationTextarea.disabled = true;
        translationTextarea.style.width = '100%';
        translationTextarea.style.marginTop = '10px';

        // Clear language selection and add translated text
        langBoxUl.innerHTML = ''; // Remove language selection
        langBoxUl.appendChild(translationTextarea);

        // Change button to "Start Over"
        translateButton.textContent = 'Start Over';
        translateButton.disabled = false;
        translateButton.onclick = resetApp;
    } catch (error) {
        console.error('Translation Error:', error);
        alert('Error: Unable to fetch translation. Please try again later.');
        translateButton.textContent = 'Translate';
        translateButton.disabled = false;
    }
});

// Get selected language value
function getSelectedLanguage() {
    for (const radio of languageRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null;
}

// Reset the app to its original state
const supportedLanguages = [
    { value: 'fr', label: 'French', flag: 'fr-flag.png' },
    { value: 'es', label: 'Spanish', flag: 'sp-flag.png' },
    { value: 'ja', label: 'Japanese', flag: 'jpn-flag.png' }
];

function resetApp() {
    txtBox.textContent = 'Text to translate 👇';
    langBoxTitle.textContent = 'Select language 👇';

    inputText.value = '';
    inputText.disabled = false;

    // Clear out any dynamically added content
    langBoxUl.innerHTML = '';

    // Dynamically create language options 
    supportedLanguages.forEach(language => {
        const li = document.createElement('li');
        li.innerHTML = `
            <label>
                <input type="radio" class="language-checkbox" value="${language.value}">
                ${language.label} <img src="assets/${language.flag}" alt="${language.label} flag">
            </label>
        `;
        langBoxUl.appendChild(li);
    });

    // Reset the button to its initial state
    translateButton.textContent = 'Translate';
    translateButton.onclick = null;
}
