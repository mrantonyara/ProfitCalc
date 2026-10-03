const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Update State to include deliveryDate
code = code.replace(/installmentBonus:\s*0,/, 'installmentBonus: 0,\n        deliveryDate: null,');

// 2. Add Delivery Date Event Listener
code = code.replace(/const kaspiPromoToggle = document.getElementById\('kaspi-promo-toggle'\);/, `const kaspiPromoToggle = document.getElementById('kaspi-promo-toggle');
    const deliveryDateInput = document.getElementById('delivery-date');
    if (deliveryDateInput) {
        deliveryDateInput.valueAsDate = new Date();
        state.deliveryDate = deliveryDateInput.valueAsDate;
        deliveryDateInput.addEventListener('change', (e) => {
            state.deliveryDate = e.target.valueAsDate;
            calculate();
        });
    }
`);

// 3. Link Promo Toggle to Kaspi Gold Bonus
code = code.replace(/kaspiPromoToggle\.addEventListener\('change',[\s\S]*?calculate\(\);\n    \}\);/, `kaspiPromoToggle.addEventListener('change', (e) => {
        state.installmentBonus = e.target.checked ? state.kaspiGoldBonusAmount : 0;
        calculate();
    });`);
    
// 4. Update Kaspi Gold Bonus listener to update installmentBonus if promo is checked
code = code.replace(/kaspiGoldBonusInput\.addEventListener\('input', \(e\) => \{ state\.kaspiGoldBonusAmount = parseNumber\(e\.target\.value\); calculate\(\); \}\);/, `kaspiGoldBonusInput.addEventListener('input', (e) => { 
        state.kaspiGoldBonusAmount = parseNumber(e.target.value); 
        if (kaspiPromoToggle.checked) state.installmentBonus = state.kaspiGoldBonusAmount;
        calculate(); 
    });`);

// 5. Remove installmentBonusInput listener entirely
code = code.replace(/installmentBonusInput\.addEventListener\('input', \(e\) => \{ state\.installmentBonus = parseNumber\(e\.target\.value\); calculate\(\); \}\);/, '');

fs.writeFileSync('app.js', code);
