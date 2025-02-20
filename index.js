const apiKey = 'OPENAI_API_KEY';

// DOM Elements
const inputText = document.getElementById('input');
const translateButton = document.getElementById('translate-btn');
const languageRadios = document.querySelectorAll('.language-checkbox');
const txtContainer = document.querySelector('.txt-container');
const txtBox = document.querySelector('.txt-box h1');
const langBox = document.querySelector('.lang-box');
const langBoxTitle = document.querySelector('.lang-box h1');
const langBoxUl = document.querySelector('.lang-box ul');

//Translate Button
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
        const translation = await getTranslation(text, selectedLanguage);

        // Update UI to show original and translated text
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
        langBoxUl.innerHTML = ''; 
        langBoxUl.appendChild(translationTextarea);

        // Change button to "Start Over"
        translateButton.textContent = 'Start Over';
        translateButton.disabled = false;
        translateButton.onclick = resetApp;
    } catch (error) {
        console.error('Translation Error:', error);

        // Clear out any dynamic content even if there's an error
        langBoxUl.innerHTML = ''; 
        langBoxUl.innerHTML = `
            <li><label><input type="radio" class="language-checkbox" value="fr"> French <img src="assets/fr-flag.png" alt="french-flag"></label></li>
            <li><label><input type="radio" class="language-checkbox" value="es"> Spanish <img src="assets/sp-flag.png" alt="spanish-flag"></label></li>
            <li><label><input type="radio" class="language-checkbox" value="de"> Japanese <img src="assets/jpn-flag.png" alt="japanese-flag"></label></li>
        `;  // Restore original language selection

        // Reset UI components to prevent the broken state
        txtBox.textContent = 'Text to translate 👇';
        langBoxTitle.textContent = 'Select language 👇';

        inputText.disabled = false;  // Re-enable the text input field

        // Reset button
        translateButton.textContent = 'Translate';
        translateButton.disabled = false;
        translateButton.onclick = null;

        alert('Error: Unable to fetch translation. Please try again later.');
    }
});


// OpenAI API Call Function
async function getTranslation(text, targetLanguage) {
    const prompt = `Translate the following text to ${targetLanguage}: "${text}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o', 
            messages: [
                { role: 'system', content: 'You are a helpful translation assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 100,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}


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

