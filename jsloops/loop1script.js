document.addEventListener('DOMContentLoaded', () => {
    let wrapper = document.querySelector('#wrapper');

    function generateRandomHexColor() {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor.padStart(6, '0')}`;
    }
    let firstRect = document.createElement('div');
    firstRect.className = 'rect';
    firstRect.style.width = '50vw';
    firstRect.style.height = '100%';
    firstRect.style.background = generateRandomHexColor();
    wrapper.appendChild(firstRect);

    wrapper.style.background = generateRandomHexColor();

    let rectWidth = parseFloat(firstRect.style.width);
    let rectHeight = firstRect.offsetHeight;

    let rects = [];

    for (let i = 0; i < 20; i++) {
        rectWidth = rectWidth / 2;
        let rect = document.createElement('div');

        rect.className = 'rect';
        rect.style.width = rectWidth + '%';
        rect.style.height = '100%';
        rect.style.background = generateRandomHexColor();
        wrapper.appendChild(rect);
        rects.push(rect);
    }

    rects.forEach(rect => {
        rect.currentWidth = parseFloat(rect.style.width);
    });

    function updateWidths() {
        let firstWidth = parseFloat(getComputedStyle(firstRect).width);
        let wrapperWidth = wrapper.offsetWidth;
        let firstPercent = (firstWidth / wrapperWidth) * 100;

        let targetWidth = firstPercent;
        rects.forEach(rect => {
            targetWidth = targetWidth / 2;


            rect.currentWidth += (targetWidth - rect.currentWidth) * 0.05;
            rect.style.width = rect.currentWidth + '%';
        });

        requestAnimationFrame(updateWidths);
    }

    updateWidths();


});