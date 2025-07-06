// ExamEase JavaScript - Simple and Clean Implementation

// Global variables
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedColor = '#6366f1';
let exams = [];
let timer = null;
let timerDuration = 25 * 60; // 25 minutes in seconds
let timerRemaining = timerDuration;
let isTimerRunning = false;
let studySessions = 0;
let totalStudyHours = 0;

// Language translations
const translations = {
    en: {
        title: "ExamEase",
        tagline: "Your exams, your time, your plan",
        addExam: "Add New Exam",
        subjectName: "Subject Name",
        examDate: "Exam Date",
        examTime: "Exam Time",
        duration: "Duration (hours)",
        color: "Color",
        studyHours: "Study Hours Needed",
        reminder: "Reminder",
        export: "Export Schedule",
        share: "Share Schedule",
        studyMode: "Study Mode",
        focusTimer: "Focus Timer"
    },
    ar: {
        title: "إيزام إيز",
        tagline: "امتحاناتك، وقتك، خطتك",
        addExam: "إضافة امتحان جديد",
        subjectName: "اسم المادة",
        examDate: "تاريخ الامتحان",
        examTime: "وقت الامتحان",
        duration: "المدة (ساعات)",
        color: "اللون",
        studyHours: "ساعات الدراسة المطلوبة",
        reminder: "التذكير",
        export: "تصدير الجدول",
        share: "مشاركة الجدول",
        studyMode: "وضع الدراسة",
        focusTimer: "مؤقت التركيز"
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadExams();
    generateCalendar();
    setupEventListeners();
    loadSettings();
    checkReminders();
});

// Load exams from memory (since localStorage is not available)
function loadExams() {
    // Start with empty array since we can't use localStorage
    exams = [];
}

// Save exams to memory
function saveExams() {
    // In a real application, this would save to localStorage
    // For now, we'll just keep in memory during the session
    console.log('Exams saved to memory:', exams);
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('examForm').addEventListener('submit', handleExamSubmission);
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
        });
    });
    
    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
    });
    
    // Theme selector
    document.getElementById('themeSelect').addEventListener('change', function() {
        document.body.setAttribute('data-theme', this.value);
    });
    
    // Language selector
    document.getElementById('languageSelect').addEventListener('change', function() {
        changeLanguage(this.value);
    });
    
    // Study mode
    document.getElementById('studyModeBtn').addEventListener('click', openStudyMode);
    
    // Timer controls
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    
    // Timer modes
    document.querySelectorAll('.timer-mode').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.timer-mode').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setTimerMode(parseInt(this.dataset.minutes));
        });
    });
    
    // Modal controls
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Export and share
    document.getElementById('exportBtn').addEventListener('click', exportSchedule);
    document.getElementById('shareBtn').addEventListener('click', shareSchedule);
    document.getElementById('copyLink').addEventListener('click', copyShareLink);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Handle exam form submission
function handleExamSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const exam = {
        id: Date.now(),
        subject: document.getElementById('subjectName').value,
        date: document.getElementById('examDate').value,
        time: document.getElementById('examTime').value,
        duration: parseInt(document.getElementById('examDuration').value),
        color: selectedColor,
        studyHours: parseInt(document.getElementById('studyHours').value),
        reminderTime: parseInt(document.getElementById('reminderTime').value),
        completed: false
    };
    
    exams.push(exam);
    saveExams();
    generateCalendar();
    e.target.reset();
    
    // Reset color selection
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('.color-option[data-color="#6366f1"]').classList.add('active');
    selectedColor = '#6366f1';
    
    showNotification('Exam added successfully!', 'success');
    scheduleReminder(exam);
}

// Generate calendar
function generateCalendar() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    const calendarGrid = document.querySelector('.calendar-grid');
    
    // Clear existing days (keep headers)
    const existingDays = calendarGrid.querySelectorAll('.calendar-day');
    existingDays.forEach(day => day.remove());
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = createDayElement(daysInPrevMonth - i, true);
        calendarGrid.appendChild(dayElement);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false);
        calendarGrid.appendChild(dayElement);
    }
    
    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true);
        calendarGrid.appendChild(dayElement);
    }
}

// Create day element
function createDayElement(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    if (isOtherMonth) dayElement.classList.add('other-month');
    
    // Check if today
    const today = new Date();
    if (!isOtherMonth && 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear()) {
        dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Add exams for this day
    const currentDate = new Date(currentYear, currentMonth, day);
    const dayExams = exams.filter(exam => {
        const examDate = new Date(exam.date);
        return examDate.toDateString() === currentDate.toDateString();
    });
    
    dayExams.forEach(exam => {
        const examElement = document.createElement('div');
        examElement.className = 'exam-item';
        examElement.style.backgroundColor = exam.color;
        examElement.textContent = exam.subject;
        examElement.addEventListener('click', () => showExamDetails(exam));
        dayElement.appendChild(examElement);
    });
    
    return dayElement;
}

// Show exam details
function showExamDetails(exam) {
    const modal = document.getElementById('examModal');
    const detailsContainer = document.getElementById('examDetails');
    
    detailsContainer.innerHTML = `
        <div class="exam-detail-item">
            <strong>Subject:</strong> ${exam.subject}
        </div>
        <div class="exam-detail-item">
            <strong>Date:</strong> ${new Date(exam.date).toLocaleDateString()}
        </div>
        <div class="exam-detail-item">
            <strong>Time:</strong> ${exam.time}
        </div>
        <div class="exam-detail-item">
            <strong>Duration:</strong> ${exam.duration} hours
        </div>
        <div class="exam-detail-item">
            <strong>Study Hours Needed:</strong> ${exam.studyHours}
        </div>
        <div class="exam-detail-item">
            <strong>Days Remaining:</strong> ${getDaysUntilExam(exam.date)}
        </div>
        <div class="exam-actions">
            <button class="btn btn-primary" onclick="startStudySession('${exam.subject}')">
                <i class="fas fa-play"></i> Start Study Session
            </button>
            <button class="btn btn-secondary" onclick="deleteExam(${exam.id})">
                <i class="fas fa-trash"></i> Delete Exam
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Get days until exam
function getDaysUntilExam(examDate) {
    const today = new Date();
    const exam = new Date(examDate);
    const timeDiff = exam.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 ? daysDiff : 'Past due';
}

// Delete exam
function deleteExam(examId) {
    if (confirm('Are you sure you want to delete this exam?')) {
        exams = exams.filter(exam => exam.id !== examId);
        saveExams();
        generateCalendar();
        document.getElementById('examModal').classList.remove('active');
        showNotification('Exam deleted successfully!', 'success');
    }
}

// Start study session
function startStudySession(subject) {
    document.getElementById('examModal').classList.remove('active');
    openStudyMode();
    showNotification(`Study session started for ${subject}!`, 'success');
}

// Timer functions
function openStudyMode() {
    document.getElementById('studyModal').classList.add('active');
    updateTimerDisplay();
    updateBadges();
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timer = setInterval(() => {
            timerRemaining--;
            updateTimerDisplay();
            updateProgressBar();
            
            if (timerRemaining <= 0) {
                completeSession();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timer);
    }
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(timer);
    timerRemaining = timerDuration;
    updateTimerDisplay();
    updateProgressBar();
}

function setTimerMode(minutes) {
    timerDuration = minutes * 60;
    resetTimer();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerRemaining / 60);
    const seconds = timerRemaining % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressBar() {
    const progress = ((timerDuration - timerRemaining) / timerDuration) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

function completeSession() {
    isTimerRunning = false;
    clearInterval(timer);
    studySessions++;
    totalStudyHours += timerDuration / 3600;
    
    showNotification('Study session completed! Great job!', 'success');
    playNotificationSound();
    
    // Reset timer
    timerRemaining = timerDuration;
    updateTimerDisplay();
    updateProgressBar();
    updateBadges();
}

function updateBadges() {
    document.getElementById('sessionsCompleted').innerHTML = `
        <i class="fas fa-medal"></i>
        <span>Sessions: ${studySessions}</span>
    `;
    document.getElementById('hoursStudied').innerHTML = `
        <i class="fas fa-clock"></i>
        <span>Hours: ${totalStudyHours.toFixed(1)}</span>
    `;
}

// Notification functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Reminder functions
function scheduleReminder(exam) {
    const examDate = new Date(exam.date + 'T' + exam.time);
    const reminderTime = new Date(examDate.getTime() - (exam.reminderTime * 60 * 60 * 1000));
    const now = new Date();
    
    if (reminderTime > now) {
        const timeout = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
            showNotification(`Reminder: ${exam.subject} exam in ${exam.reminderTime} hours!`, 'warning');
            if (Notification.permission === 'granted') {
                new Notification('ExamEase Reminder', {
                    body: `${exam.subject} exam in ${exam.reminderTime} hours!`,
                    icon: '/favicon.ico'
                });
            }
        }, timeout);
    }
}

function checkReminders() {
    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Check for upcoming exams
    const now = new Date();
    exams.forEach(exam => {
        const examDate = new Date(exam.date + 'T' + exam.time);
        const hoursUntilExam = (examDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilExam <= 24 && hoursUntilExam > 0) {
            showNotification(`Upcoming exam: ${exam.subject} in ${Math.ceil(hoursUntilExam)} hours!`, 'warning');
        }
    });
}

// Export and share functions
function exportSchedule() {
    const scheduleData = {
        exams: exams,
        exportDate: new Date().toISOString(),
        studyStats: {
            sessions: studySessions,
            hours: totalStudyHours
        }
    };
    
    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `examease-schedule-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Schedule exported successfully!', 'success');
}

function shareSchedule() {
    const shareData = btoa(JSON.stringify({
        exams: exams.map(exam => ({
            subject: exam.subject,
            date: exam.date,
            time: exam.time,
            duration: exam.duration
        }))
    }));
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${shareData}`;
    document.getElementById('shareLink').value = shareUrl;
    document.getElementById('shareModal').classList.add('active');
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    showNotification('Link copied to clipboard!', 'success');
}

// Language functions
function changeLanguage(lang) {
    document.documentElement.lang = lang;
    if (lang === 'ar') {
        document.body.style.direction = 'rtl';
    } else {
        document.body.style.direction = 'ltr';
    }
    
    // Update text content based on translations
    // This would be expanded for a full multilingual implementation
    showNotification('Language changed successfully!', 'success');
}

// Load settings
function loadSettings() {
    // Load theme preference
    const savedTheme = 'light'; // Default since we can't use localStorage
    document.getElementById('themeSelect').value = savedTheme;
    document.body.setAttribute('data-theme', savedTheme);
    
    // Load shared schedule if present
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('shared');
    if (sharedData) {
        try {
            const decoded = JSON.parse(atob(sharedData));
            if (decoded.exams) {
                exams = decoded.exams.map(exam => ({
                    ...exam,
                    id: Date.now() + Math.random(),
                    color: '#6366f1'
                }));
                generateCalendar();
                showNotification('Shared schedule loaded!', 'success');
            }
        } catch (e) {
            showNotification('Invalid shared schedule!', 'error');
        }
    }
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatTime(time) {
    return new Date('2000-01-01T' + time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize reminders check every hour
setInterval(checkReminders, 60 * 60 * 1000);