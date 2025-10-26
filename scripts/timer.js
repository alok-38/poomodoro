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

// -------------------- RESTORE SAVED DATA --------------------
function loadSavedData() {
    const saved = JSON.parse(localStorage.getItem('pomodoroData'));
    if (saved) {
        // restore pomodoro count
        pomodoroCount = saved.pomodoroCount || 0;

        // restore tasks
        if (saved.tasks && Array.isArray(saved.tasks)) {
            saved.tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task;
                taskList.appendChild(li);
            });
        }

        // restore input values
        if (saved.workMinutes) {
            workInput.value = saved.workMinutes;
            workDuration = saved.workMinutes * 60;
        }
        if (saved.breakMinutes) {
            breakInput.value = saved.breakMinutes;
            breakDuration = saved.breakMinutes * 60;
        }

        // update timer
        timeRemaining = workDuration;
        timer.textContent = formatTime(timeRemaining);
    }
}

// Call it immediately when the page loads

loadSavedData();

// -------------------- TASK ADDING --------------------
addButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        //  Create a new <li> element in the DOM
        const li = document.createElement('li');
        li.textContent = taskText;
        taskList.appendChild(li);

        //  Clear input field
        taskInput.value = '';

        //  Save updated task list to localStorage
        saveData();
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
                pomodoroCount = 0;

                // Reset durations to defaults
                workDuration = DEFAULT_WORK;
                breakDuration = DEFAULT_BREAK;

                // Reset input fields
                workInput.value = 25;
                breakInput.value = 5;
                taskInput.value = '';

                // Clear the task list
                taskList.innerHTML = '';

                // Reset timer display
                timeRemaining = workDuration;
                timer.textContent = formatTime(timeRemaining);

                // Clear saved data
                localStorage.removeItem('pomodoroData');
                break;

            case 'saveBtn':
                saveData();
                alert('Progress saved!');
                break;
        }
    });
});

// -------------------- SAVE FUNCTION --------------------
function saveData() {
    const tasks = Array.from(taskList.children).map(li => li.textContent);
    const workMinutes = parseInt(workInput.value);
    const breakMinutes = parseInt(breakInput.value);

    const data = {
        pomodoroCount,
        tasks,
        workMinutes: !isNaN(workMinutes) ? workMinutes : 25,
        breakMinutes: !isNaN(breakMinutes) ? breakMinutes : 5
    };

    localStorage.setItem('pomodoroData', JSON.stringify(data));
}


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

        // Automatically restart timer
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
