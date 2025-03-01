let interval;
let timers = [];

document.addEventListener("DOMContentLoaded", () => {
    loadBirthdate();
    loadTimers();
    startLiveUpdate();
});

// Start real-time life percentage update
function startLiveUpdate() {
    clearInterval(interval);

    function updateLifePercentage() {
        const birthdateStr = localStorage.getItem("birthdate");
        if (!birthdateStr) return;
        
        const birthdate = new Date(birthdateStr);
        const now = new Date();

        const livedMilliseconds = now - birthdate;
        const livedSeconds = livedMilliseconds / 1000;

        const maxDays = 4000 * 7;
        const maxSeconds = maxDays * 24 * 60 * 60;

        const lifePercent = (livedSeconds / maxSeconds) * 100;

        document.getElementById('daysLived').innerText = Math.floor(livedSeconds / 86400);
        document.getElementById('lifePercent').innerText = lifePercent.toFixed(8);
        document.getElementById('progress').style.width = lifePercent.toFixed(2) + "%";
    }

    updateLifePercentage();
    interval = setInterval(updateLifePercentage, 10);
}

// Save birthdate and recalculate
function saveBirthdate() {
    const birthdateInput = document.getElementById("birthdateInput").value;
    if (!birthdateInput) return alert("Please enter a valid birthdate.");

    localStorage.setItem("birthdate", birthdateInput);
    startLiveUpdate();
}

// Load birthdate from storage
function loadBirthdate() {
    const savedDate = localStorage.getItem("birthdate");
    if (savedDate) {
        document.getElementById("birthdateInput").value = savedDate;
    }
}

// Add new timer
function addTimer() {
    const taskName = document.getElementById('taskName').value.trim();
    if (taskName === "") return alert("Please enter a task name.");

    const now = Date.now();

    const timer = {
        id: now,
        name: taskName,
        seconds: 0,
        isRunning: true,
        lastUpdated: now
    };

    timers.push(timer);
    saveTimers();
    startTimer(timer.id);
    renderTimers();
}

// Start a timer
function startTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer || timer.isRunning) return;

    timer.isRunning = true;
    timer.lastUpdated = Date.now();

    timer.interval = setInterval(() => {
        const now = Date.now();
        timer.seconds += Math.floor((now - timer.lastUpdated) / 1000);
        timer.lastUpdated = now;
        saveTimers();
        renderTimers();
    }, 1000);
}

// Stop a timer
function stopTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (timer && timer.isRunning) {
        clearInterval(timer.interval);
        timer.isRunning = false;
        saveTimers();
        renderTimers();
    }
}

// Delete a timer
function deleteTimer(timerId) {
    stopTimer(timerId);
    timers = timers.filter(t => t.id !== timerId);
    saveTimers();
    renderTimers();
}

// Edit timer manually
function editTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    const newTime = prompt("Enter new time (HH:MM:SS):", formatTime(timer.seconds));
    if (!newTime) return;

    const timeParts = newTime.split(":").map(Number);
    if (timeParts.length !== 3 || timeParts.some(isNaN)) {
        return alert("Invalid format. Use HH:MM:SS.");
    }

    const newSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    timer.seconds = newSeconds;
    saveTimers();
    renderTimers();
}

// Calculate time percentage of life
function getTimePercentage(seconds) {
    const maxSeconds = 4000 * 7 * 24 * 60 * 60;
    return ((seconds / maxSeconds) * 100).toFixed(8);
}

// Format time as HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Render timers on the page
function renderTimers() {
    const timersList = document.getElementById("timersList");
    timersList.innerHTML = "";

    timers.forEach(timer => {
        const li = document.createElement("li");
        li.className = "timer-item";
        li.innerHTML = `
            <span>${timer.name}</span>
            <span class="timer-time" onclick="editTimer(${timer.id})" title="Click to edit">${formatTime(timer.seconds)}</span>
            <span>(${getTimePercentage(timer.seconds)}%)</span>
            <button onclick="${timer.isRunning ? `stopTimer(${timer.id})` : `startTimer(${timer.id})`}">
                ${timer.isRunning ? "Pause" : "Resume"}
            </button>
            <button onclick="deleteTimer(${timer.id})">Delete</button>
        `;
        timersList.appendChild(li);
    });
}

// Save timers to localStorage
function saveTimers() {
    localStorage.setItem("timers", JSON.stringify(timers));
}

// Load timers from localStorage
function loadTimers() {
    const savedTimers = localStorage.getItem("timers");
    if (savedTimers) {
        timers = JSON.parse(savedTimers);

        timers.forEach(timer => {
            if (timer.isRunning) {
                const now = Date.now();
                const elapsedTime = Math.floor((now - timer.lastUpdated) / 1000);
                timer.seconds += elapsedTime;
                timer.lastUpdated = now;
                startTimer(timer.id);
            }
        });

        renderTimers();
    }
}