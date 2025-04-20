import "./style.css";

// Add global declaration for the appLoaded flag
declare global {
    interface Window {
        appLoaded: boolean;
    }
}

interface WordData {
    word: string;
    stressedIndex: number;
    stressedWord: string;
}

// Set flag to indicate the script has successfully loaded
window.appLoaded = true;

document.addEventListener("DOMContentLoaded", () => {
    const wordDisplay = document.getElementById(
        "word-display",
    ) as HTMLDivElement;
    const feedback = document.getElementById("feedback") as HTMLDivElement;
    const nextButton = document.getElementById(
        "next-button",
    ) as HTMLButtonElement;
    const scoreDisplay = document.getElementById("score") as HTMLSpanElement;
    const attemptsDisplay = document.getElementById(
        "attempts",
    ) as HTMLSpanElement;

    const VOWELS: string = "аеёиоуыэюя";
    let wordsData: WordData[] = [];
    let currentWordIndex: number = -1;
    let score: number = 0;
    let attempts: number = 0;
    let isAnswered: boolean = false;

    async function loadWords(): Promise<void> {
        try {
            // Use the base URL from Vite environment
            const basePath = (import.meta as any).env.BASE_URL || '/';
            const response: Response = await fetch(`${basePath}phonetics.txt`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text: string = await response.text();
            parseAndStoreWords(text);
            if (wordsData.length > 0) {
                shuffleArray(wordsData);
                displayNextWord();
            } else {
                wordDisplay.textContent = "No words found in file.";
                nextButton.disabled = true;
            }
        } catch (error) {
            console.error("Error loading or parsing words file:", error);
            wordDisplay.textContent = "Error loading words.";
            feedback.textContent =
                "Could not load phonetics.txt. Please check the file and console.";
            feedback.className = "feedback incorrect";
            nextButton.disabled = true;
        }
    }

    function parseAndStoreWords(text: string): void {
        // First split by lines, then process each line
        const lines = text
            .trim()
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        // Process each line, handling semicolon-separated forms
        const processedWords: WordData[] = [];

        for (const line of lines) {
            // Split by semicolon to handle multiple forms
            const wordForms = line.split(";").map((form) => form.trim());

            for (const stressedWord of wordForms) {
                // Skip empty forms
                if (stressedWord.length === 0) continue;

                // Process comma-separated forms (like "прИбыл, прибылА, прИбыли")
                const commaSeparatedForms = stressedWord
                    .split(",")
                    .map((form) => form.trim());

                for (const form of commaSeparatedForms) {
                    if (form.length === 0) continue;

                    const wordLower: string = form.toLowerCase();
                    let stressedIndex: number = -1;

                    for (let i: number = 0; i < form.length; i++) {
                        if (
                            form[i] !== wordLower[i] &&
                            VOWELS.includes(wordLower[i])
                        ) {
                            stressedIndex = i;
                            break;
                        }
                    }

                    if (stressedIndex === -1) {
                        console.warn(
                            `Could not find stressed vowel in: "${form}"`,
                        );
                        continue;
                    }

                    processedWords.push({
                        word: wordLower,
                        stressedIndex: stressedIndex,
                        stressedWord: form,
                    });
                }
            }
        }

        wordsData = processedWords;
    }

    function displayNextWord(): void {
        if (wordsData.length === 0) return;

        isAnswered = false;
        currentWordIndex = (currentWordIndex + 1) % wordsData.length;
        const currentWord: WordData = wordsData[currentWordIndex];

        wordDisplay.innerHTML = "";
        wordDisplay.classList.remove("answered");
        feedback.textContent = "";
        feedback.className = "feedback";
        nextButton.disabled = true;

        currentWord.word.split("").forEach((char: string, index: number) => {
            const span: HTMLSpanElement = document.createElement("span");
            span.textContent = char;
            if (VOWELS.includes(char.toLowerCase())) {
                span.classList.add("vowel");
                span.dataset.index = index.toString(); // Store as string
                span.addEventListener("click", handleVowelClick);
            }
            wordDisplay.appendChild(span);
        });
    }

    function handleVowelClick(event: Event): void {
        if (isAnswered) return;

        isAnswered = true;
        wordDisplay.classList.add("answered");
        const target = event.target as HTMLSpanElement; // Type assertion
        const clickedIndex: number = parseInt(target.dataset.index || "", 10); // Handle potential null
        const correctIndex: number = wordsData[currentWordIndex].stressedIndex;
        const correctWord: string = wordsData[currentWordIndex].stressedWord;

        attempts++;
        attemptsDisplay.textContent = attempts.toString();

        // Remove click listeners from all vowels after answering
        wordDisplay.querySelectorAll("span.vowel").forEach((vowelSpan) => {
            // Clone and replace to remove listeners cleanly
            const newSpan = vowelSpan.cloneNode(true) as HTMLSpanElement;
            vowelSpan.parentNode?.replaceChild(newSpan, vowelSpan);
        });

        // Find the span elements again after replacement
        const vowelSpans = Array.from(
            wordDisplay.querySelectorAll("span"),
        ) as HTMLSpanElement[];

        if (clickedIndex === correctIndex) {
            score++;
            scoreDisplay.textContent = score.toString();
            feedback.textContent = "Correct!";
            feedback.className = "feedback correct";

            const correctSpan = vowelSpans.find(
                (span) =>
                    parseInt(span.dataset.index || "", 10) === correctIndex,
            );
            if (correctSpan) {
                correctSpan.classList.add("correct-stress");
            }
        } else {
            feedback.textContent = `Incorrect. Correct: ${correctWord}`;
            feedback.className = "feedback incorrect";

            const correctSpan = vowelSpans.find(
                (span) =>
                    parseInt(span.dataset.index || "", 10) === correctIndex,
            );
            const incorrectSpan = vowelSpans.find(
                (span) =>
                    parseInt(span.dataset.index || "", 10) === clickedIndex,
            );

            if (correctSpan) {
                correctSpan.classList.add("correct-stress");
            }
            if (incorrectSpan) {
                incorrectSpan.classList.add("incorrect-guess");
            }
        }

        nextButton.disabled = false;
    }

    function shuffleArray<T>(array: T[]): void {
        for (let i: number = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    nextButton.addEventListener("click", displayNextWord);
    nextButton.disabled = true;
    loadWords();
});
