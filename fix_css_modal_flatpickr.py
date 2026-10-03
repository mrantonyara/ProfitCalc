with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_css = """
/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}
.modal-overlay.show {
    opacity: 1;
    pointer-events: auto;
}
.modal-card {
    background: #fff;
    width: 90%;
    max-width: 320px;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transform: translateY(20px);
    transition: transform 0.2s ease;
}
.modal-overlay.show .modal-card {
    transform: translateY(0);
}
.modal-btn {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background 0.2s;
}
.modal-btn-cancel {
    background: #f5f6f8;
    color: #1c1c1e;
}
.modal-btn-cancel:active { background: #e5e5ea; }
.modal-btn-primary {
    background: #0079C2;
    color: #fff;
}
.modal-btn-primary:active { background: #00609b; }

/* Flatpickr Premium Kaspi Theme */
.flatpickr-calendar {
    border-radius: 16px !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
    border: none !important;
    padding: 10px !important;
    background: #fff !important;
    font-family: 'Roboto', sans-serif !important;
}
.flatpickr-months .flatpickr-month {
    background: transparent !important;
    color: #1c1c1e !important;
    height: 40px !important;
}
.flatpickr-current-month .flatpickr-monthDropdown-months {
    font-weight: 700 !important;
    font-size: 16px !important;
}
.flatpickr-current-month input.cur-year {
    font-weight: 700 !important;
    font-size: 16px !important;
}
span.flatpickr-weekday {
    color: #8e8e93 !important;
    font-weight: 600 !important;
}
.flatpickr-day {
    border-radius: 50% !important;
    color: #1c1c1e !important;
    border: none !important;
}
.flatpickr-day:hover {
    background: #f5f6f8 !important;
}
.flatpickr-day.selected, .flatpickr-day.selected:hover {
    background: #0079C2 !important;
    color: #fff !important;
    font-weight: 700 !important;
}
.flatpickr-day.today {
    border: 1px solid #0079C2 !important;
}
"""

css += new_css

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
