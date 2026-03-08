const API_BASE = "https://url-shortner-po28.onrender.com"; 
const API_URL = `${API_BASE}/api/v1/url/shorten`;

const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const shortenBtn = document.getElementById("shorten-btn");
const errorMsg = document.getElementById("error-msg");
const resultBox = document.getElementById("result");
const shortUrlLink = document.getElementById("short-url");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");
const historySection = document.getElementById("history-section");
const historyBody = document.getElementById("history-body");

const HISTORY_KEY = "url_shortener_history";

document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    hideResult();

    const originalUrl = urlInput.value.trim();

    if (!originalUrl) {
        showError("Please enter a URL");
        return;
    }

    // Disable button while loading
    shortenBtn.disabled = true;
    shortenBtn.textContent = "Shortening...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ originalUrl })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        // Build short URL using our backend base
        const shortUrl = `${API_BASE}/${data.data.shortId}`;

        // Show result
        shortUrlLink.href = shortUrl;
        shortUrlLink.textContent = shortUrl;
        resultBox.classList.remove("hidden");

        // Save to history
        saveToHistory({
            shortId: data.data.shortId,
            shortUrl: shortUrl,
            originalUrl: data.data.originalUrl,
            createdAt: new Date().toISOString()
        });

        // Clear input
        urlInput.value = "";

    } catch (err) {
        showError(err.message);
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.textContent = "Shorten";
    }
});

// Copy Button
copyBtn.addEventListener("click", async () => {
    const url = shortUrlLink.textContent;

    try {
        await navigator.clipboard.writeText(url);
        copyFeedback.classList.remove("hidden");
        copyBtn.textContent = "Copied!";

        setTimeout(() => {
            copyFeedback.classList.add("hidden");
            copyBtn.textContent = "Copy";
        }, 2000);
    } catch {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
    }
});

// History Functions
function saveToHistory(entry) {
    let history = getHistory();

    // Add to beginning (most recent first)
    history.unshift(entry);

    // Keep only last 10 entries
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    loadHistory();
}

function getHistory() {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

function loadHistory() {
    const history = getHistory();

    if (history.length === 0) {
        historySection.classList.add("hidden");
        return;
    }

    historySection.classList.remove("hidden");
    historyBody.innerHTML = "";

    history.forEach((entry) => {
        const row = document.createElement("tr");

        // Short URL cell
        const shortCell = document.createElement("td");
        const shortLink = document.createElement("a");
        shortLink.href = entry.shortUrl;
        shortLink.target = "_blank";
        shortLink.rel = "noopener noreferrer";
        shortLink.textContent = entry.shortId;
        shortCell.appendChild(shortLink);

        // Original URL cell
        const originalCell = document.createElement("td");
        originalCell.classList.add("original-url-cell");
        originalCell.title = entry.originalUrl; // Full URL on hover
        originalCell.textContent = entry.originalUrl;

        // Date cell
        const dateCell = document.createElement("td");
        const date = new Date(entry.createdAt);
        dateCell.textContent = date.toLocaleDateString();

        row.appendChild(shortCell);
        row.appendChild(originalCell);
        row.appendChild(dateCell);
        historyBody.appendChild(row);
    });
}

// UI Helpers 
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
}

function hideError() {
    errorMsg.textContent = "";
    errorMsg.classList.add("hidden");
}

function hideResult() {
    resultBox.classList.add("hidden");
    copyFeedback.classList.add("hidden");
    copyBtn.textContent = "Copy";
}