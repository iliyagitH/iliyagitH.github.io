// Функция для работы с редактируемыми элементами
function setupEditableElements() {
    const editables = document.querySelectorAll('.editable');
    editables.forEach(element => {
        const key = element.dataset.key;
        const savedContent = localStorage.getItem(key);
        if (savedContent) {
            element.innerHTML = savedContent;
        }

        element.addEventListener('click', () => {
            element.setAttribute('contenteditable', 'true');
            element.focus();
        });

        element.addEventListener('blur', () => {
            element.setAttribute('contenteditable', 'false');
            element.classList.add('animation-update');
            localStorage.setItem(key, element.innerHTML);
            setTimeout(() => {
                element.classList.remove('animation-update');
            }, 300);
        });

        element.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                element.blur();
            }
        });
    });
}

// Функция для ripple-эффекта
function setupRippleEffect() {
    document.querySelectorAll('.editable, .download-btn').forEach(element => {
        element.addEventListener('click', function(e) {
            if (this.id === 'download-pdf') return;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Функция для генерации PDF
function setupPDFGeneration() {
    const downloadBtn = document.getElementById('download-pdf');
    const loader = document.getElementById('loader');

    downloadBtn.addEventListener('click', async function() {
        loader.classList.add('active');
        
        try {
            document.querySelectorAll('.ripple').forEach(ripple => {
                ripple.remove();
            });

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

            // Создаем PDF
            const element = document.getElementById('resume');
            const canvas = await html2canvas(element, { 
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('резюме.pdf');
        } catch (error) {
            console.error('Ошибка при генерации PDF:', error);
            alert('Произошла ошибка при генерации PDF');
        } finally {
            loader.classList.remove('active');
        }
    });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function setupSaveChanges() {
    document.getElementById('save-changes').addEventListener('click', () => {
        alert('Изменения сохранены в локальном хранилище!');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupEditableElements();
    setupRippleEffect();
    setupPDFGeneration();
    setupSaveChanges();
});