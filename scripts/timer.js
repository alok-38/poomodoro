// -------------------- DOM ELEMENTS --------------------
const buttons = document.querySelectorAll('section:nth-of-type(3) button');
const addButton = document.getElementById('add-task');

const workInput = document.getElementById('work-time');
const breakInput = document.getElementById('break-time');
const taskInput = document.getElementById('new-task');
const timer = document.getElementById('timer');
const taskList = document.getElementById('task-list');

// -------------------- TIMER STATE --------------------
let workDuration = parseInt(workInput.value) * 60 || 25 * 60; // seconds
let breakDuration = parseInt(breakInput.value) * 60 || 5 * 60; // seconds
let timeRemaining = workDuration;
let isRunning = false;
let isWorkPeriod = true;
let pomodoroCount = 0;
let timerInterval;

// -------------------- DEFAULTS --------------------
const DEFAULT_WORK = 25 * 60; // 25 min
const DEFAULT_BREAK = 5 * 60; // 5 min


// -------------------- TASK ADDING --------------------
addButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        const li = document.createElement('li');
        li.textContent = taskText;
        taskList.appendChild(li);
        taskInput.value = '';
    }
});

// -------------------- BUTTON EVENTS --------------------
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        switch (btn.id) {
            case 'startBtn':
                updateDurations(); // ensure latest durations
                if (!isRunning) {
                    isRunning = true;
                    timerInterval = setInterval(runTimer, 1000);
                }
                break;

            case 'pauseBtn':
                clearInterval(timerInterval);
                isRunning = false;
                break;

            case 'resetBtn':
                clearInterval(timerInterval);
                isRunning = false;
                isWorkPeriod = true;
                pomodoroCount = 0; // reset count

                // Reset durations to defaults
                workDuration = DEFAULT_WORK;
                breakDuration = DEFAULT_BREAK;

                // Reset input fields to original values
                workInput.value = 25;
                breakInput.value = 5;
                taskInput.value = ''; // clear new task input

                // Clear the task list
                taskList.innerHTML = '';

                // Reset timer display
                timeRemaining = workDuration;
                timer.textContent = formatTime(timeRemaining);
                break;


            case 'saveBtn':
                alert('Pomodoro count: ' + pomodoroCount);
                break;
        }
    });
});

// -------------------- TIMER LOGIC --------------------
function runTimer() {
    if (timeRemaining > 0) {
        timeRemaining--;
        timer.textContent = formatTime(timeRemaining);
    } else {
        clearInterval(timerInterval);
        isRunning = false;

        if (isWorkPeriod) {
            pomodoroCount++;
            alert('Work period finished! Time for a break.');
            isWorkPeriod = false;
            timeRemaining = breakDuration;
        } else {
            alert('Break finished! Back to work.');
            isWorkPeriod = true;
            timeRemaining = workDuration;
        }

        // Automatically restart timer if desired
        isRunning = true;
        timerInterval = setInterval(runTimer, 1000);
    }
}

// -------------------- HELPER FUNCTIONS --------------------
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function updateDurations() {
    const newWork = parseInt(workInput.value);
    const newBreak = parseInt(breakInput.value);

    if (!isNaN(newWork) && newWork > 0) workDuration = newWork * 60;
    if (!isNaN(newBreak) && newBreak > 0) breakDuration = newBreak * 60;

    if (!isRunning) {
        timeRemaining = isWorkPeriod ? workDuration : breakDuration;
        timer.textContent = formatTime(timeRemaining);
    }
}

// Initialize timer display
timer.textContent = formatTime(timeRemaining);
