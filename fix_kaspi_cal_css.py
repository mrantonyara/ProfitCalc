with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

cal_css = """
/* Kaspi Custom Calendar */
.kaspi-calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.cal-btn {
    background: #f5f6f8;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 14px;
    cursor: pointer;
    color: #1c1c1e;
    transition: background 0.2s;
}
.cal-btn:hover { background: #e5e5ea; }
.kaspi-calendar-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 13px;
    color: #8e8e93;
    margin-bottom: 8px;
    font-weight: 500;
}
.kaspi-calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}
.cal-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: #1c1c1e;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
}
.cal-day:hover:not(.empty) { background: #f5f6f8; }
.cal-day.empty { cursor: default; }
.cal-day.selected {
    background: #0079C2 !important;
    color: #fff !important;
    font-weight: 700;
}
.cal-day.today {
    border: 1px solid #0079C2;
}
.quick-date-btn {
    background: #f0f4fa;
    color: #0079C2;
    border: none;
    padding: 8px 12px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}
.quick-date-btn:active {
    background: #0079C2;
    color: #fff;
}
"""

css += cal_css

# Also ensure date input looks good
css = css.replace('.date-picker-wrapper input {', '.date-picker-wrapper input {\n    caret-color: transparent;')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
