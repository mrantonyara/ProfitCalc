import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. First, remove "Снятие без ограничений" from index.html
with open('index.html', 'r', encoding='utf-8') as html_file:
    html = html_file.read()
html = html.replace('<span class="list-desc">Снятие без ограничений</span>', '')
with open('index.html', 'w', encoding='utf-8') as html_file:
    html_file.write(html)

# 2. Add simulateKaspiDeposit to app.js
sim_func = """// Точная симуляция депозита Kaspi "Моя Цель" (капитализация 1-го числа)
function simulateKaspiDeposit(startBalance, startDate, events, annualRate) {
    events.sort((a, b) => a.date - b.date);
    
    let balance = startBalance;
    let uncapitalized = 0;
    
    let currentDate = new Date(startDate);
    currentDate.setHours(0,0,0,0);
    
    let lastEventDate = events[events.length - 1].date;
    
    // Создаем события капитализации на каждое 1-е число
    let capEvents = [];
    let d = new Date(currentDate);
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    while (d <= lastEventDate) {
        capEvents.push({ date: new Date(d), type: 'cap' });
        d.setMonth(d.getMonth() + 1);
    }
    
    let allEvents = [...events, ...capEvents].sort((a, b) => a.date - b.date);
    
    let scheduleRows = [];
    let periodInterest = 0;
    let totalInterest = 0;
    
    let lastDate = new Date(currentDate);
    
    for (let ev of allEvents) {
        let days = Math.round((ev.date - lastDate) / 86400000);
        if (days > 0) {
            // Точный расчет за прошедшие дни
            let dailyRate = (annualRate / 100) / 365;
            let int = balance * dailyRate * days;
            uncapitalized += int;
            periodInterest += int;
            totalInterest += int;
            lastDate = new Date(ev.date);
        }
        
        if (ev.type === 'cap') {
            balance += uncapitalized;
            uncapitalized = 0;
        } else if (ev.type === 'payment') {
            balance -= ev.amount;
            scheduleRows.push({
                date: ev.label,
                balance: balance + uncapitalized,
                rawInterest: periodInterest,
                rawPayment: ev.amount
            });
            periodInterest = 0;
        } else if (ev.type === 'milestone') {
            scheduleRows.push({
                date: ev.label,
                balance: balance + uncapitalized,
                rawInterest: periodInterest,
                rawPayment: ev.amount
            });
            periodInterest = 0;
        }
    }
    
    return { 
        finalBalance: balance + uncapitalized, 
        totalInterest, 
        scheduleRows 
    };
}
"""

js = js.replace("let state = {", sim_func + "\n    let state = {")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
