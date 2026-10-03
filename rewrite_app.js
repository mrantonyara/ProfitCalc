const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

// 1. Remove kaspiPromoToggle listener for installmentBonusInput and replace
code = code.replace(/kaspiPromoToggle\.addEventListener[\s\S]*?\}\);/, `kaspiPromoToggle.addEventListener('change', (e) => {
    state.installmentBonus = e.target.checked ? state.kaspiGoldBonusAmount : 0;
    calculate();
});`);

// 2. Remove installmentBonusInput listener
code = code.replace(/installmentBonusInput\.addEventListener[\s\S]*?calculate\(\);\s*\};\s*\n?/, '');
code = code.replace(/installmentBonusInput\.addEventListener\('input'.*?calculate\(\);\s*\}\);/, '');

// 3. Add delivery date handling
code = code.replace(/const kaspiPromoToggle = document.getElementById\('kaspi-promo-toggle'\);/, `const kaspiPromoToggle = document.getElementById('kaspi-promo-toggle');
    const deliveryDateInput = document.getElementById('delivery-date');
    if(deliveryDateInput) {
        deliveryDateInput.valueAsDate = new Date();
        deliveryDateInput.addEventListener('change', (e) => {
            state.deliveryDate = e.target.valueAsDate;
            calculate();
        });
    }
`);

// 4. Update initial state with deliveryDate
code = code.replace(/installmentBonus: 0,/, `installmentBonus: 0,
        deliveryDate: new Date(),`);

// Write back to a temp file and test
fs.writeFileSync('temp_app.js', code);
