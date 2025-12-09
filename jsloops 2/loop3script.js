document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mousemove', function (event) {
        let mouseX = event.clientX;
        let mouseY = event.clientY;
        console.log(`Mouse position: X=${mouseX}, Y=${mouseY}`);
    });
    const elementToMove = document.getElementById('boo');
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const speed = 0.01;

    let isHovered = false;

    elementToMove.addEventListener('mouseenter', function () {
        isHovered = true;
    });

    elementToMove.addEventListener('mouseleave', function () {
        isHovered = false;
    });
    document.addEventListener('mousemove', function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function animate() {
        if (!isHovered) {
            currentX += (targetX - currentX) * speed;
            currentY += (targetY - currentY) * speed;

            elementToMove.style.left = currentX + 'px';
            elementToMove.style.top = currentY + 'px';

            if (currentX < targetX) {
                elementToMove.style.transform = 'scaleX(-1)';
            } else {
                elementToMove.style.transform = 'scaleX(1)';
            }
        }
        requestAnimationFrame(animate);

    }

    animate();


});