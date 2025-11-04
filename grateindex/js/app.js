document.addEventListener("DOMContentLoaded", async () => {
    //populating site with data from json
    const response = await fetch('data/dataset.json');
    const data = await response.json();

    const gridContainer = document.querySelector('.grid');
    const listContainer = document.querySelector('.gratelist');
    data.forEach(item => {
        const grateDiv = document.createElement('div');
        const listDiv = document.createElement('div');
        grateDiv.classList.add('grid-item');
        listDiv.classList.add('list-item');

        grateDiv.dataset.shape = item.shape;
        grateDiv.dataset.purpose = item.purpose;
        grateDiv.dataset.intext = item.intext;
        grateDiv.dataset.date = item.date;
        grateDiv.dataset.number = item.number;
        grateDiv.dataset.intext = item.intext;
        grateDiv.dataset.orientation = item.orientation;
        grateDiv.dataset.holeshape = item.holeshape;
        grateDiv.dataset.holequant = item.holequant;
        grateDiv.dataset.size = item.size;
        grateDiv.dataset.hastype = item.hastype;
        grateDiv.dataset.type = item.type;
        grateDiv.dataset.debris = item.debris;
        grateDiv.dataset.location = item.location;
        grateDiv.dataset.headline = item.headline;
        grateDiv.dataset.description = item.description;

        listDiv.dataset.headline = item.headline;
        listDiv.dataset.number = item.number;

        grateDiv.innerHTML = `
      <p>${item.number}</p>
      <img src="images/${item.image}" alt="${item.headline}">
      
    `;
        listDiv.innerHTML = `
      <p>${item.number}. ${item.headline}</p>
      
    `;
        gridContainer.appendChild(grateDiv);
        listContainer.appendChild(listDiv);
    });


    // initializing focus mode variables
    let focusActive = false;
    let focusNumber = null;

    //setting up isotope layout
    imagesLoaded(gridContainer, function () {
        iso.layout();
    });

    const iso = new Isotope('.grid', {
        itemSelector: '.grid-item',
        layoutMode: 'masonry',
        percentPosition: true,
        height: '100vh',

        masonry: {
            columnWidth: 10,
            horizontalOrder: true,
            fitWidth: true,
        },

        getSortData: {
            number: '[data-number] parseInt',
            holequant: '[data-holequant] parseInt',
            size: '[data-size] parseInt',
        }

    });



    iso.arrange({
        sortBy: 'number',
        sortAscending: true
    });


    //filtering
    const filterButtons = document.querySelectorAll('.filters p');
    let activeFilter = '*';
    filterButtons.forEach(p => {

        p.addEventListener('click', () => {
            const filterValue = p.getAttribute('data-filter');
            gridContainer.classList.remove('dimmed');
            listContainer.classList.remove('dimmed');
            document.querySelectorAll('.grid-item.highlighted')
                .forEach(item => item.classList.remove('highlighted'));
            document.querySelectorAll('.list-item.highlighted')
                .forEach(item => item.classList.remove('highlighted'));
            if (activeFilter === filterValue) {
                // Reset to no filter
                iso.arrange({ filter: '*' });
                activeFilter = '*';
                filterButtons.forEach(btn => btn.classList.remove('active'));
            } else {
                // Apply new filter
                iso.arrange({ filter: filterValue });
                activeFilter = filterValue;

                // Update button states
                filterButtons.forEach(btn => btn.classList.remove('active'));
                p.classList.add('active');
            }
            if (focusActive = true) { exitFocusMode(); } else { }
        });
    });

    //these event listeners control the highlight when hovering the list
    listContainer.addEventListener('mouseover', event => {
        const hoverList = event.target.closest('.list-item');
        if (!hoverList) return;
        if (focusActive) return;
        const linkedNumber = hoverList.dataset.number;
        const matchingGridItem = document.querySelector(`.grid-item[data-number="${linkedNumber}"]`);
        const matchingListItem = document.querySelector(`.list-item[data-number="${linkedNumber}"]`);
        document.querySelectorAll('.grid-item.highlighted')
            .forEach(item => {
                item.classList.remove('highlighted');
            });
        gridContainer.classList.add('dimmed');
        matchingGridItem.classList.add('highlighted');

        document.querySelectorAll('.list-item.highlighted')
            .forEach(item => {
                item.classList.remove('highlighted');
            });
        listContainer.classList.add('dimmed');
        matchingListItem.classList.add('highlighted');
        matchingGridItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });



    });

    listContainer.addEventListener('mouseout', event => {
        const hoverList = event.target.closest('.list-item');
        if (!hoverList) return;
        if (focusActive) return;
        const linkedNumber = hoverList.dataset.number;
        const matchingGridItem = document.querySelector(`.grid-item[data-number="${linkedNumber}"]`);
        document.querySelectorAll('.grid-item.highlighted');

        matchingListItem.classList.remove('highlighted');
        document.querySelectorAll('.list-item.highlighted');

        matchingListItem.classList.remove('highlighted');


    });

    const listArea = document.querySelector('.sidebarOne')

    listArea.addEventListener('mouseout', event => {
        if (focusActive) return;
        if (listArea.contains(event.relatedTarget)) {
            return;
        } else {
            gridContainer.classList.remove('dimmed');
            listContainer.classList.remove('dimmed');
        }


    });

    //these event listeners control the highlight when hovering the GRID
    gridContainer.addEventListener('mouseover', event => {
        const hoverGrid = event.target.closest('.grid-item');
        if (!hoverGrid) return;
        if (focusActive) return;
        const linkedNumber = hoverGrid.dataset.number;
        const matchingGridItem = document.querySelector(`.grid-item[data-number="${linkedNumber}"]`);
        const matchingListItem = document.querySelector(`.list-item[data-number="${linkedNumber}"]`);
        document.querySelectorAll('.grid-item.highlighted')
            .forEach(item => {
                item.classList.remove('highlighted');
            });


        document.querySelectorAll('.list-item.highlighted')
            .forEach(item => {
                item.classList.remove('highlighted');
            });
        listContainer.classList.add('dimmed');
        matchingListItem.classList.add('highlighted');
        matchingListItem.scrollIntoView({ behavior: 'smooth', block: 'center' });



    });

    gridContainer.addEventListener('mouseout', event => {
        const hoverGrid = event.target.closest('.grid-item');
        if (!hoverGrid) return;
        const linkedNumber = hoverGrid.dataset.number;
        const matchingListItem = document.querySelector(`.list-item[data-number="${linkedNumber}"]`);
        document.querySelectorAll('.grid-item.highlighted');

        matchingListItem.classList.remove('highlighted');
        document.querySelectorAll('.list-item.highlighted');

        matchingListItem.classList.remove('highlighted');

        if (gridArea.contains(event.relatedTarget)) {
            // still inside the sidebar → do nothing
            return;
        } else {
            // mouse truly left the sidebar
            gridContainer.classList.remove('dimmed');
            listContainer.classList.remove('dimmed');
        }


    });


    // event listeners for clicking into focus mode

    //first one writes number when clicked
    gridContainer.addEventListener('click', event => {
        const clicked = event.target.closest('.grid-item');
        if (!clicked) return;
        toggleFocus(clicked.dataset.number);

    });

    listContainer.addEventListener('click', event => {
        const clicked = event.target.closest('.list-item');
        if (!clicked) return;
        toggleFocus(clicked.dataset.number);

    });
    //toggling focus mode
    function toggleFocus(number) {
        if (!focusActive) {
            enterFocusMode(number);
        } else {
            exitFocusMode();
        }
    }

    //more specific, entering, exiting
    function enterFocusMode(number) {
        focusActive = true;
        focusedNumber = number;
        document.querySelectorAll('.grid-item.highlighted')
            .forEach(item => {
                item.classList.remove('highlighted');
            });

        document.querySelectorAll('.list-item.highlighted')
            .forEach(item => {
                item.classList.remove('highlighted');
            });
        listContainer.classList.add('dimmed');

        const gridItem = document.querySelector(`.grid-item[data-number="${number}"]`);

        const clone = createClone(gridItem);

        const rect = gridItem.getBoundingClientRect();
        clone.dataset.originTop = rect.top;
        clone.dataset.originLeft = rect.left;
        clone.dataset.originWidth = rect.width;
        clone.dataset.originHeight = rect.height;


        gridItem.style.display = 'none';
        const cloneNumber = clone.querySelector('p');

        // trigger the layout so browser registers the initial position
        requestAnimationFrame(() => {
            clone.style.top = '40%';
            clone.style.left = '35%';
            clone.style.width = '70%';
            clone.style.height = '70%';
            clone.style.transform = 'translate(-50%, -50%)';
            cloneNumber.style.opacity = '0';

        });
        document.querySelector('.focus-close').classList.add('visible');

        gridContainer.classList.add('focus-mode');
        const sideThree = document.querySelector('.sidebarThree');
        sideThree.classList.add('visible');
        const itemData = data.find(obj => obj.number == number);

        const sidebar = document.querySelector('.details-content');
        sidebar.querySelector('.sideTitle').textContent = itemData.headline;
        sidebar.querySelector('.sideDesc').textContent = itemData.description;

        //this makes clickable cateogries that bring you to filters
        function createSidebarSorter(categoryKey, itemData) {
            const container = document.querySelector(`.sidebarThree .side${categoryKey}`);
            if (!container) return;
            container.innerHTML = '';
            const value = itemData[categoryKey.toLowerCase()];
            if (!value) return;
            const span = document.createElement('span');
            span.classList.add('sorter');
            span.textContent = value;
            span.dataset.filter = `[data-${categoryKey.toLowerCase()}="${value}"]`;
            container.appendChild(span);
        }

        createSidebarSorter('Shape', itemData);
        createSidebarSorter('Purpose', itemData);
        createSidebarSorter('Orientation', itemData);
        createSidebarSorter('HoleShape', itemData);
        sidebar.querySelector('.sideQuant').textContent = `Hole Quantity: ${itemData.holequant}`;
        sidebar.querySelector('.sideLoc').textContent = `Location: ${itemData.location}`;
        sidebar.querySelector('.sideSize').textContent = `${itemData.size}`;



        if (itemData.hastype === "Yes") {
            sidebar.querySelector('.sideType').textContent = `Type: ${itemData.type}`;
        } else {
            sidebar.querySelector('.sideType').textContent = ``;
        }

        if (itemData.debris === "") {
            sidebar.querySelector('.sideDebris').textContent = ``;
        } else {
            sidebar.querySelector('.sideDebris').textContent = `Debris: ${itemData.debris}`;
        }

    }

    //this controls when you click on a filter in sidebar3 and it exits focus mode, turns that filter active
    document.addEventListener('click', (e) => {
        const shapeBtn = e.target.closest('.sorter');
        if (!shapeBtn) return; // Ignore unrelated clicks

        const filterValue = shapeBtn.dataset.filter;

        const maybePromise = exitFocusMode?.();
        if (maybePromise && typeof maybePromise.then === 'function') {

            maybePromise.then(() => iso.arrange({ filter: filterValue }));
        } else {

            iso.arrange({ filter: filterValue });
        }

        document.querySelectorAll('.sorter, .filt').forEach(el =>
            el.classList.toggle('active', el.dataset.filter === filterValue)
        );

    });


    function exitFocusMode() {
        focusActive = false;
        focusedNumber = null;
        const clone = document.querySelector('.clone-focus');
        if (!clone) return;
        listContainer.classList.remove('dimmed');

        // Animate back to original position
        const original = document.querySelector(`.grid-item[data-number="${clone.dataset.number}"]`);
        original.style.display = 'block';
        if (original) {
            // Capture the current rect and target origin values first


            const cloneRect = clone.getBoundingClientRect(); // force reflow
            requestAnimationFrame(() => {
                Object.assign(clone.style, {
                    top: `${clone.dataset.originTop}px`,
                    left: `${clone.dataset.originLeft}px`,
                    width: `${clone.dataset.originWidth}px`,
                    height: `${clone.dataset.originHeight}px`,
                    transform: 'none',
                    opacity: 0,
                });
            });



            const sideThree = document.querySelector('.sidebarThree');
            sideThree.classList.remove('visible');
            document.querySelector('.focus-close').classList.remove('visible');


        }

        clone.addEventListener('transitionend', () => {
            setTimeout(() => clone.remove(), 100); // wait 100ms extra
        }, { once: true });

        gridContainer.classList.remove('focus-mode');
    }

    function createClone(gridItem) {
        const rect = gridItem.getBoundingClientRect();
        const clone = gridItem.cloneNode(true);
        clone.classList.add('clone-focus');

        Object.assign(clone.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            zIndex: 1000,
            transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
        });

        document.body.appendChild(clone);
        return clone;
    }

    // exit by pressing escape
    document.addEventListener('keydown', event => {
        if (focusActive && event.key === 'Escape') {
            exitFocusMode();
        }
    });

    // exit by clicking the item
    document.body.addEventListener('click', event => {
        const clone = document.querySelector('.clone-focus');
        if (!clone) return;
        if (event.target.closest('.clone-focus')) {
            exitFocusMode();
        }
    });
    // exit with x button
    document.querySelector('.focus-close').addEventListener('click', exitFocusMode);


});
