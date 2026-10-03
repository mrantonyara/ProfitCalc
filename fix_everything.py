import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Hide disabled method completely (or pointer-events: none)
# Let's add pointer-events: none to disabled-method in CSS
with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

if 'pointer-events: none;' not in css:
    css = css.replace('.disabled-method > .card-img {\n    opacity: 0.4;\n    filter: grayscale(100%);\n}', '.disabled-method > .card-img {\n    opacity: 0.4;\n    filter: grayscale(100%);\n}\n.disabled-method {\n    pointer-events: none;\n}')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Fix the Calendar that failed to inject
cal_js = """
// --- CUSTOM KASPI CALENDAR LOGIC ---
let calCurrentDate = new Date();
let calSelectedDate = new Date();
const monthNamesTitle = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function renderCalendar() {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    const el = document.getElementById('cal-month-year');
    if(el) el.textContent = `${monthNamesTitle[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const totalDays = lastDay.getDate();
    
    const grid = document.getElementById('kaspi-calendar-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 0; i < startDayOfWeek; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day empty';
        grid.appendChild(div);
    }
    
    for (let d = 1; d <= totalDays; d++) {
        const cellDate = new Date(year, month, d);
        const div = document.createElement('div');
        div.className = 'cal-day';
        div.textContent = d;
        
        if (cellDate.getTime() === calSelectedDate.getTime()) div.classList.add('selected');
        if (cellDate.getTime() === today.getTime()) div.classList.add('today');
        
        div.onclick = () => {
            calSelectedDate = new Date(year, month, d);
            renderCalendar();
        };
        
        grid.appendChild(div);
    }
}

window.prevMonth = function() { calCurrentDate.setMonth(calCurrentDate.getMonth() - 1); renderCalendar(); };
window.nextMonth = function() { calCurrentDate.setMonth(calCurrentDate.getMonth() + 1); renderCalendar(); };

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
    const overlay = document.getElementById('kaspi-date-overlay');
    if(overlay) overlay.classList.add('show');
};

window.closeDateModal = function() {
    const overlay = document.getElementById('kaspi-date-overlay');
    if(overlay) overlay.classList.remove('show');
};

window.confirmDateModal = function() {
    state.deliveryDate = new Date(calSelectedDate);
    const input = document.getElementById('delivery-date');
    if(input) {
        input.value = `${String(state.deliveryDate.getDate()).padStart(2, '0')}.${String(state.deliveryDate.getMonth() + 1).padStart(2, '0')}.${state.deliveryDate.getFullYear()}`;
    }
    closeDateModal();
    if(typeof calculate === 'function') calculate();
};
"""

# Insert it globally
js = js.replace('document.addEventListener(\'DOMContentLoaded\', () => {', 'document.addEventListener(\'DOMContentLoaded\', () => {\n' + cal_js + '\n' + """
    calSelectedDate.setHours(0,0,0,0);
    state.deliveryDate = new Date(calSelectedDate);
    const dateInput = document.getElementById('delivery-date');
    if(dateInput) {
        dateInput.value = `${String(state.deliveryDate.getDate()).padStart(2, '0')}.${String(state.deliveryDate.getMonth() + 1).padStart(2, '0')}.${state.deliveryDate.getFullYear()}`;
        dateInput.onclick = window.openDateModal;
    }
""")

# 3. Fix exact math logic for inst, iron, karta
# I'll just regex replace the entire for loops inside calculate!
import re

# We will apply exact math where necessary. Actually, the easiest fix for Karta visibility is to hide the entire block if it's disabled.
js = js.replace('resKarta.classList.add(\'disabled-method\');', 'resKarta.classList.add(\'disabled-method\'); resKarta.style.display = "none";')
js = js.replace('resKarta.classList.remove(\'disabled-method\');', 'resKarta.classList.remove(\'disabled-method\'); resKarta.style.display = "flex";')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
