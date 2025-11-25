document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const numElements = 20;
    const baseElement = document.getElementById('star');
    baseElement.classList.add('repeated-element');

    for (let i = 0; i < numElements; i++) {
        const newElement = baseElement.cloneNode(true);
        container.appendChild(newElement);
    }

    const elements = container.querySelectorAll('.repeated-element');
    const radius = 100;

    let centerX = container.offsetWidth / 2;
    let centerY = container.offsetHeight / 2;

    const angleOffsets = [];
    for (let i = 0; i < numElements; i++) {
        angleOffsets.push((i / numElements) * 2 * Math.PI);
    }

    function updatePositions(mouseX, mouseY) {
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const mouseAngle = Math.atan2(dy, dx);
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);

        elements.forEach((element, index) => {

            const angle = mouseAngle + angleOffsets[index];

            const distance = Math.min(mouseDistance, radius);

            const x = centerX + distance * Math.cos(angle) - (element.offsetWidth / 2);
            const y = centerY + distance * Math.sin(angle) - (element.offsetHeight / 2);

            element.style.position = 'absolute';
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.transform = `rotate(${angle}rad) scale(${mouseDistance / radius})`;
        });
    }

    updatePositions(centerX + radius, centerY);

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        updatePositions(mouseX, mouseY);
    });

    window.addEventListener('resize', () => {
        centerX = container.offsetWidth / 2;
        centerY = container.offsetHeight / 2;
    });
});