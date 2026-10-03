import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Remove flatpickr initialization
flatpickr_regex = r'if \(deliveryDateInput\)\s*\{\s*flatpickr\(.*?\}\);\s*\}'
js = re.sub(flatpickr_regex, '', js, flags=re.DOTALL)

# Add custom calendar logic
cal_js = """
// --- CUSTOM KASPI CALENDAR LOGIC ---
let calCurrentDate = new Date();
let calSelectedDate = new Date();

const monthNamesTitle = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function renderCalendar() {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    
    document.getElementById('cal-month-year').textContent = `${monthNamesTitle[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 0=Mon, 6=Sun
    const totalDays = lastDay.getDate();
    
    const grid = document.getElementById('kaspi-calendar-grid');
    grid.innerHTML = '';
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Empty slots
    for (let i = 0; i < startDayOfWeek; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day empty';
        grid.appendChild(div);
    }
    
    // Days
    for (let d = 1; d <= totalDays; d++) {
        const cellDate = new Date(year, month, d);
        const div = document.createElement('div');
        div.className = 'cal-day';
        div.textContent = d;
        
        if (cellDate.getTime() === calSelectedDate.getTime()) {
            div.classList.add('selected');
        }
        if (cellDate.getTime() === today.getTime()) {
            div.classList.add('today');
        }
        
        div.onclick = () => {
            calSelectedDate = new Date(year, month, d);
            renderCalendar(); // re-render to update selection
        };
        
        grid.appendChild(div);
    }
}

window.prevMonth = function() {
    calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
    renderCalendar();
};

window.nextMonth = function() {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
    renderCalendar();
};

window.selectQuickDate = function(addDays) {
    let d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + addDays);
    calSelectedDate = new Date(d);
    calCurrentDate = new Date(d);
    renderCalendar();
};

window.openDateModal = function() {
    calCurrentDate = new Date(calSelectedDate);
    renderCalendar();
    document.getElementById('kaspi-date-overlay').classList.add('show');
};

window.closeDateModal = function() {
    document.getElementById('kaspi-date-overlay').classList.remove('show');
};

window.confirmDateModal = function() {
    state.deliveryDate = new Date(calSelectedDate);
    const input = document.getElementById('delivery-date');
    if(input) {
        input.value = `${String(state.deliveryDate.getDate()).padStart(2, '0')}.${String(state.deliveryDate.getMonth() + 1).padStart(2, '0')}.${state.deliveryDate.getFullYear()}`;
    }
    closeDateModal();
    calculate();
};

// Initialize date input
document.addEventListener('DOMContentLoaded', () => {
    calSelectedDate.setHours(0,0,0,0);
    state.deliveryDate = new Date(calSelectedDate);
    const input = document.getElementById('delivery-date');
    if(input) {
        input.value = `${String(state.deliveryDate.getDate()).padStart(2, '0')}.${String(state.deliveryDate.getMonth() + 1).padStart(2, '0')}.${state.deliveryDate.getFullYear()}`;
        input.onclick = window.openDateModal;
    }
});
"""

# Insert right after variable declarations
js = js.replace("let activeTooltip = null;", "let activeTooltip = null;\n" + cal_js)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
