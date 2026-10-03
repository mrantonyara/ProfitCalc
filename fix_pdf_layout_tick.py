with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# We need to insert a setTimeout wrapper around html2pdf().set()...
old_code = """    const opt = {
      margin:       10,
      filename:     `schedule_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, scrollY: 0, windowWidth: 800 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(container).save().then(() => {
        document.body.removeChild(container);
        document.body.removeChild(loadingOverlay);
        window.scrollTo(0, originalScroll);
    }).catch(err => {
        console.error('PDF generation error:', err);
        document.body.removeChild(container);
        document.body.removeChild(loadingOverlay);
        window.scrollTo(0, originalScroll);
    });"""

new_code = """    const opt = {
      margin:       10,
      filename:     `schedule_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, scrollY: 0, windowWidth: 800 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Wait for the browser to perform a layout pass so the container has actual dimensions!
    setTimeout(() => {
        html2pdf().set(opt).from(container).save().then(() => {
            document.body.removeChild(container);
            document.body.removeChild(loadingOverlay);
            window.scrollTo(0, originalScroll);
        }).catch(err => {
            console.error('PDF generation error:', err);
            document.body.removeChild(container);
            document.body.removeChild(loadingOverlay);
            window.scrollTo(0, originalScroll);
        });
    }, 150);"""

js = js.replace(old_code, new_code)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
