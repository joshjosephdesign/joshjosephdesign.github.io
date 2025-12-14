document.addEventListener("DOMContentLoaded", async () => {

    let currentNameThree = "";


    let userResponses = {
        messageLength: 0,        // Character count from screen2 input
        message: "",             // Actual message text
        screwboxChoice: 0,       // 1-4 from screwbox selection
        moodCoordinates: { x: 0, y: 0 }, // Coordinates from moodbox click
        ipHash: 0                // Hash from IP address
    };

    // Audio context for sound synthesis
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Get IP address and create hash
    async function getIPHash() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const ip = data.ip;

            // Simple hash function for IP
            let hash = 0;
            for (let i = 0; i < ip.length; i++) {
                const char = ip.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash);
        } catch (error) {
            console.log('Could not fetch IP, using fallback');
            return Math.floor(Math.random() * 1000000);
        }
    }

    // Typewriter voice sound - like old video game dialog
    function playTypeSound() {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Random pitch variation for voice-like quality
        const baseFreq = 150 + Math.random() * 100; // 150-250 Hz range
        osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);

        // Quick envelope for short blip
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

        osc.type = 'square'; // Old-school square wave
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.05);
    }

    // Screen transition chime - polyphonic chord
    function playTransitionChime() {
        // Big polyphonic chord (C major 9th with extensions)
        const chordNotes = [
            261.63, // C4
            329.63, // E4
            392.00, // G4
            493.88, // B4
            587.33, // D5
            659.25, // E5
            783.99, // G5
            880.00  // A5
        ];

        // Pick 3 random notes from the chord
        const shuffled = [...chordNotes].sort(() => Math.random() - 0.5);
        const selectedNotes = shuffled.slice(0, 3);

        const duration = 2.5; // Longer duration to prevent cutoff

        selectedNotes.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            osc.type = 'sine'; // Smooth sine wave for chime

            // Sustaining envelope with gentle attack and long release
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            osc.start(audioContext.currentTime + index * 0.05); // Slight delay between notes
            osc.stop(audioContext.currentTime + duration);
        });
    }

    function getCurrentSecondOfDay() {
        const now = new Date();          // current date & time right now

        const hours = now.getHours();    // 0–23
        const minutes = now.getMinutes();// 0–59
        const seconds = now.getSeconds();// 0–59

        const secondsOfDay = hours * 3600 + minutes * 60 + seconds;

        return secondsOfDay;
    }

    async function loadPartsData() {
        const response = await fetch('./data/parts.json');
        if (!response.ok) {
            throw new Error('Failed to load parts.json');
        }

        const parts = await response.json();
        return parts;
    }

    function findClosestPart(parts, targetSecond, moodOffset) {
        // Adjust target second based on mood coordinates with subtle influence
        // X and Y range from -1 to 1, offset now only ±10 seconds for subtle variation
        const adjustedSecond = targetSecond + Math.floor(moodOffset.x * 5) + Math.floor(moodOffset.y * 5);

        let closestPart = null;
        let smallestDifference = Infinity;

        for (const part of parts) {
            const difference = Math.abs(part.seconds - adjustedSecond);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestPart = part;
            }
        }

        return closestPart;
    }

    async function init() {
        try {
            const parts = await loadPartsData();
            const currentSecond = getCurrentSecondOfDay();

            // Wait for user responses to be collected, then find part
            // This will be called after moodbox click
            window.finalizePartSelection = async () => {
                const closestPart = findClosestPart(parts, currentSecond, userResponses.moodCoordinates);

                const partNumberDiv = document.querySelector('#part-number');
                const partImage = document.querySelector('#part-image');

                if (!closestPart || !partNumberDiv || !partImage) {
                    console.error('Missing data or DOM elements');
                    return;
                }

                partNumberDiv.textContent = closestPart.part_number;
                partImage.src = closestPart.image_url;
                partImage.alt = `Part ${closestPart.part_number}`;

                // Update name and tags based on user responses
                const nameData = await loadNameScheme();
                updateArtifactName(nameData, userResponses.ipHash);
                updateDescription(nameData);
                generateTags(nameData, userResponses.messageLength, userResponses.screwboxChoice);
                updateCommemorateText(userResponses.message);
            };

        } catch (error) {
            console.error('Error initializing page:', error);
        }
    }

    async function loadNameScheme() {
        const response = await fetch('./data/namescheme.json');
        if (!response.ok) {
            throw new Error('Failed to load namescheme.json');
        }
        return await response.json();
    }

    function seededRandomFromArray(arr, seed) {
        // Use seed to deterministically pick from array
        const index = seed % arr.length;
        return arr[index];
    }

    function randomFromArray(arr) {
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    function generateArtifactName(names, ipHash) {
        // Mostly random with subtle IP influence
        // Use IP hash to slightly bias the random selection
        const ipInfluence = ipHash % 3; // 0, 1, or 2

        let one, two, three;

        if (ipInfluence === 0) {
            // Use IP-seeded selection for one word only
            one = seededRandomFromArray(names.nameone, ipHash);
            two = randomFromArray(names.nametwo);
            three = randomFromArray(names.namethree);
        } else {
            // Fully random
            one = randomFromArray(names.nameone);
            two = randomFromArray(names.nametwo);
            three = randomFromArray(names.namethree);
        }

        currentNameThree = three;
        return `The ${one} of ${two} ${three}`;
    }

    function updateArtifactName(names, ipHash) {
        const div = document.querySelector('#artifact-name');
        if (!div) return;

        div.textContent = generateArtifactName(names, ipHash);
    }

    function generateDescription(desc) {
        const oneD = randomFromArray(desc.desc1);
        const twoD = randomFromArray(desc.desc2);
        const threeD = randomFromArray(desc.desc3).toLowerCase();
        const three = currentNameThree.toLowerCase();

        return `${oneD} ${three}. ${twoD} and ${threeD}.`;
    }

    function updateDescription(desc) {
        const div = document.querySelector('#desc');
        if (!div) return;

        div.textContent = generateDescription(desc);
    }
    function capitalizeFirstLetter(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    function toTitleCase(str) {
        return str.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    function updateCommemorateText(message) {
        const commemorateElement = document.querySelector('#commemorate-text');
        if (!commemorateElement) return;

        const titleCasedMessage = toTitleCase(message);
        commemorateElement.textContent = `Commemorating ${titleCasedMessage}`;
    }

    function generateTags(desc, messageLength, screwboxChoice) {
        const aurField = document.querySelector('#aura');
        const elemField = document.querySelector('#element');
        const indexField = document.querySelector('#index');


        const aur = capitalizeFirstLetter(randomFromArray(desc.aura));
        aurField.textContent = `Aura: ${aur}`;


        let elem;
        if (messageLength > 0 && messageLength % 5 === 0) {
            elem = seededRandomFromArray(desc.element, messageLength);
        } else {
            elem = randomFromArray(desc.element);
        }
        elemField.textContent = `Element: ${elem}`;


        let index;
        if (screwboxChoice > 0) {
            const randomIndex = Math.floor(Math.random() * desc.index.length);
            const offsetIndex = (randomIndex + screwboxChoice - 1) % desc.index.length;
            index = desc.index[offsetIndex];
        } else {
            index = randomFromArray(desc.index);
        }
        indexField.textContent = `Index: ${index}`;
    }


    function typewriter(element, text, speed = 50) {
        return new Promise((resolve) => {
            let i = 0;
            element.textContent = '';


            const bubContainer = element.closest('#bubContainer');
            if (bubContainer) {
                bubContainer.classList.add('visible');
            }


            const ike = document.querySelector('#ikeimg');
            if (ike) {
                ike.classList.add('talk');
            }

            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);


                    if (i % 2 === 0 && text.charAt(i) !== ' ') {
                        playTypeSound();
                    }

                    i++;
                    setTimeout(type, speed);
                } else {

                    setTimeout(() => {
                        if (ike) {
                            ike.classList.remove('talk');
                        }
                        resolve();
                    }, 600);
                }
            }

            type();
        });
    }


    function showScreen(screenNumber) {
        return new Promise((resolve) => {

            playTransitionChime();


            const currentScreen = document.querySelector('#screen0.active, #screen1.active, #screen2.active, #screen3.active');

            if (currentScreen) {
                currentScreen.classList.remove('active');
            }


            if (screenNumber !== 0) {
                currentHue = (currentHue + 20) % 360;
                if (huebox) {
                    huebox.style.filter = `hue-rotate(${currentHue}deg)`;
                }
            }


            setTimeout(() => {

                document.querySelector('#screen0').style.display = 'none';
                document.querySelector('#screen1').style.display = 'none';
                document.querySelector('#screen2').style.display = 'none';
                document.querySelector('#screen3').style.display = 'none';
                document.querySelector('#screen20').style.display = 'none';
                document.querySelector('#screen21').style.display = 'none';
                document.querySelector('#screen29').style.display = 'none';
                document.querySelector('#screen30').style.display = 'none';

                const newScreen = document.querySelector(`#screen${screenNumber}`);
                newScreen.style.display = 'block';


                setTimeout(() => {
                    newScreen.classList.add('active');


                    setTimeout(() => {
                        resolve();
                    }, 800);

                }, 10);

            }, 1500);


            const ike = document.querySelector('#ike');
            ike.className = '';

            const ikeimg = document.querySelector('#ikeimg');

            if (screenNumber === 1) {

            } else if (screenNumber === 2) {
                ike.classList.add('screen2-position');
                ikeimg.classList.add('screen2-position');
            } else if (screenNumber === 3) {
                ike.classList.add('screen3-position');
                ikeimg.classList.add('screen3-position');
            }
            else if (screenNumber === 20) {
                ike.classList.add('screen20-position');
                ikeimg.classList.add('screen20-position');
            }
            else if (screenNumber === 21) {
                ike.classList.add('screen21-position');
                ikeimg.classList.add('screen20-position');
            }
            else if (screenNumber === 29) {
                // Switch circle1 and circle2 to pulse2 animation
                const circle1 = document.querySelector('#circle1');
                const circle2 = document.querySelector('#circle2');
                if (circle1) circle1.classList.add('pulse2');
                if (circle2) circle2.classList.add('pulse2');

                setTimeout(async () => {
                    await showScreen(3);
                    const dialog3 = document.querySelector('#screen3 .dialog');
                    if (dialog3) {
                        await typewriter(dialog3, "What do you wish to do?", 100);
                        const buttons = document.querySelector('#screen3-buttons');
                        if (buttons) {
                            // Function to update button position
                            const updateButtonPosition = () => {
                                const bubContainer = dialog3.closest('#bubContainer');
                                if (bubContainer) {
                                    const containerRect = bubContainer.getBoundingClientRect();
                                    buttons.style.left = `${containerRect.left}px`;
                                }
                            };

                            // Set initial position
                            updateButtonPosition();
                            buttons.classList.add('visible');

                            // Update position on window resize
                            window.addEventListener('resize', updateButtonPosition);
                        }
                    }
                }, 6000);
            }
            else if (screenNumber === 0) {

                setTimeout(async () => {
                    await showScreen(1);
                }, 4000);
            }
        });
    }



    init();
    userResponses.ipHash = await getIPHash();

    // Initialize hue based on time of day
    // Map seconds of day (0-86400) to hue degrees (0-360)
    const currentSecond = getCurrentSecondOfDay();
    let currentHue = Math.floor((currentSecond / 86400) * 360);
    const huebox = document.querySelector('#huebox');
    if (huebox) {
        huebox.style.filter = `hue-rotate(${currentHue}deg)`;
    }


    await showScreen(0);


    const screen1NextBtn = document.querySelector('#screen1-next');
    if (screen1NextBtn) {
        screen1NextBtn.addEventListener('click', async () => {
            await showScreen(2);
            const dialog2 = document.querySelector('#screen2 .dialog');
            if (dialog2) {
                await typewriter(dialog2, "What brings you here?", 100);
            }
        });
    }

    const form = document.querySelector('form');
    const messageInput = document.querySelector('#message');

    if (form && messageInput) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userMsg = messageInput.value.trim();

            if (userMsg) {

                userResponses.message = userMsg;
                userResponses.messageLength = userMsg.length;
                console.log('User message:', userResponses.message);
                console.log('User message length:', userResponses.messageLength);


                await showScreen(20);
                const dialog20 = document.querySelector('#screen20 .dialog');
                if (dialog20) {
                    await typewriter(dialog20, "Choose an aura.", 100);
                }

                messageInput.value = '';
            }
        });


        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.requestSubmit();
            }
        });
    }


    let selectedScrewbox = null;


    const screwboxDivs = document.querySelectorAll('#screwbox div');
    screwboxDivs.forEach((div, index) => {
        div.addEventListener('click', async () => {
            selectedScrewbox = div;

            userResponses.screwboxChoice = index + 1;
            console.log('Screwbox choice:', userResponses.screwboxChoice);

            await showScreen(21);
            const dialog21 = document.querySelector('#screen21 .dialog');
            if (dialog21) {
                await typewriter(dialog21, "Locate your current mood along the axes.", 100);
            }
        });
    });


    const quadrants = document.querySelectorAll('.quadrant');
    quadrants.forEach(quadrant => {
        for (let i = 0; i < 25; i++) {
            const circle = document.createElement('div');
            circle.className = 'circle';
            quadrant.appendChild(circle);
        }
    });


    const moodbox = document.querySelector('#moodbox');
    let screwboxOverlay = null;
    let lastNearestCircle = null;
    let isLocked = false;

    if (moodbox) {
        moodbox.addEventListener('mousemove', (e) => {
            if (!selectedScrewbox || isLocked) return;
            const circles = document.querySelectorAll('.circle');
            let nearestCircle = null;
            let minDistance = Infinity;

            circles.forEach(circle => {
                const rect = circle.getBoundingClientRect();
                const circleCenterX = rect.left + rect.width / 2;
                const circleCenterY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(e.clientX - circleCenterX, 2) +
                    Math.pow(e.clientY - circleCenterY, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCircle = circle;
                }
            });


            if (nearestCircle !== lastNearestCircle) {

                if (lastNearestCircle) {
                    lastNearestCircle.style.border = '1px solid white';
                    lastNearestCircle.style.borderRadius = '50%';
                }


                if (screwboxOverlay) {
                    screwboxOverlay.remove();
                    screwboxOverlay = null;
                }


                if (nearestCircle) {
                    const imgElement = selectedScrewbox.querySelector('img');
                    if (imgElement) {
                        screwboxOverlay = document.createElement('img');
                        screwboxOverlay.src = imgElement.src;
                        screwboxOverlay.style.position = 'absolute';
                        screwboxOverlay.style.width = '400%';
                        screwboxOverlay.style.height = '400%';
                        screwboxOverlay.style.top = '50%';
                        screwboxOverlay.style.left = '50%';
                        screwboxOverlay.style.transform = 'translate(-50%, -50%)';
                        screwboxOverlay.style.pointerEvents = 'none';
                        nearestCircle.style.position = 'relative';
                        nearestCircle.style.border = 'none';
                        nearestCircle.style.borderRadius = '0';
                        nearestCircle.appendChild(screwboxOverlay);
                    }
                }

                lastNearestCircle = nearestCircle;
            }
        });

        moodbox.addEventListener('mouseleave', () => {
            if (!selectedScrewbox || isLocked) return;
            if (screwboxOverlay) {
                screwboxOverlay.remove();
                screwboxOverlay = null;
            }
            if (lastNearestCircle) {
                lastNearestCircle.style.border = '1px solid white';
                lastNearestCircle.style.borderRadius = '50%';
                lastNearestCircle = null;
            }
        });


        moodbox.addEventListener('click', (e) => {
            if (screwboxOverlay && lastNearestCircle) {

                const moodboxRect = moodbox.getBoundingClientRect();
                const relativeX = (e.clientX - moodboxRect.left) / moodboxRect.width;
                const relativeY = (e.clientY - moodboxRect.top) / moodboxRect.height;


                userResponses.moodCoordinates.x = (relativeX - 0.5) * 2;
                userResponses.moodCoordinates.y = (relativeY - 0.5) * 2;

                console.log('Mood coordinates:', userResponses.moodCoordinates);


                isLocked = true;


                screwboxOverlay.classList.add('screw-animation');


                setTimeout(async () => {

                    await window.finalizePartSelection();

                    await showScreen(29);

                    isLocked = false;
                }, 1100);
            }
        });
    }


    const printCertButton = document.querySelector('#print-cert');
    const deliverTokenButton = document.querySelector('#deliver-token');
    const honorMomentButton = document.querySelector('#honor-moment');

    if (printCertButton) {
        printCertButton.addEventListener('click', () => {
            window.print();
        });
    }

    if (deliverTokenButton) {
        deliverTokenButton.addEventListener('click', async () => {
            // Get the part number text
            const partNumberElement = document.querySelector('#part-number');
            if (partNumberElement) {
                const partNumber = partNumberElement.textContent;

                // Copy to clipboard
                try {
                    await navigator.clipboard.writeText(partNumber);
                    console.log('Part number copied to clipboard:', partNumber);
                } catch (err) {
                    console.error('Failed to copy to clipboard:', err);
                }
            }

            // Show screen30 with message
            await showScreen(30);


            setTimeout(async () => {
                window.open('https://www.ikea.com/us/en/customer-service/returns-claims/spareparts/', '_blank');


                setTimeout(async () => {
                    await showScreen(3);
                }, 1000);
            }, 2000);
        });
    }

    if (honorMomentButton) {
        honorMomentButton.addEventListener('click', () => {

            window.location.reload();
        });
    }





});