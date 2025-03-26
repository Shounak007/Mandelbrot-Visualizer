// Fractal Explorer Configuration
const config = {
    width: 500,
    height: 500,
    maxIterations: 100,
    colorScheme: 'rainbow',
    juliaLock: false,
    juliaC: { x: -0.4, y: 0.6 }
};

// Canvas setup
const mandelbrotCanvas = document.getElementById('mandelbrot-canvas');
const juliaCanvas = document.getElementById('julia-canvas');
const mandelbrotCtx = mandelbrotCanvas.getContext('2d');
const juliaCtx = juliaCanvas.getContext('2d');

// View state
let currentView = 'mandelbrot';
let isDragging = false;
let startX, startY;
let offsetX = 0, offsetY = 0;
let scale = 1;

// Color schemes
const colorSchemes = {
    rainbow: (iter) => {
        const hue = (iter / config.maxIterations) * 360;
        return `hsl(${hue}, 100%, 50%)`;
    },
    blueFire: (iter) => {
        const t = iter / config.maxIterations;
        return `rgb(${Math.floor(t * 255)}, ${Math.floor(t * 100)}, ${Math.floor(t * 255)})`;
    },
    grayscale: (iter) => {
        const t = iter / config.maxIterations;
        return `rgb(${Math.floor(t * 255)}, ${Math.floor(t * 255)}, ${Math.floor(t * 255)})`;
    }
};

// Event Listeners
document.getElementById('mandelbrotOnly').addEventListener('click', () => setView('mandelbrot'));
document.getElementById('juliaOnly').addEventListener('click', () => setView('julia'));
document.getElementById('dualView').addEventListener('click', () => setView('dual'));
document.getElementById('maxIterations').addEventListener('input', (e) => {
    config.maxIterations = parseInt(e.target.value);
    render();
});
document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
    render();
});
document.getElementById('juliaLock').addEventListener('change', (e) => {
    config.juliaLock = e.target.checked;
});
document.getElementById('resetView').addEventListener('click', resetView);

// Canvas event listeners
mandelbrotCanvas.addEventListener('mousedown', startDrag);
mandelbrotCanvas.addEventListener('mousemove', drag);
mandelbrotCanvas.addEventListener('mouseup', stopDrag);
mandelbrotCanvas.addEventListener('wheel', handleZoom);
juliaCanvas.addEventListener('mousemove', updateJuliaC);

// View management
function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${view}Only`).classList.add('active');
    render();
}

// Drag and zoom handlers
function startDrag(e) {
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
}

function drag(e) {
    if (!isDragging) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    render();
}

function stopDrag() {
    isDragging = false;
}

function handleZoom(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale *= delta;
    render();
}

function updateJuliaC(e) {
    if (config.juliaLock) return;
    const rect = juliaCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 4 - 2;
    const y = (e.clientY - rect.top) / rect.height * 4 - 2;
    config.juliaC = { x, y };
    render();
}

// Fractal calculation
function mandelbrot(x, y) {
    let zx = 0, zy = 0;
    let iter = 0;
    while (zx * zx + zy * zy < 4 && iter < config.maxIterations) {
        const temp = zx * zx - zy * zy + x;
        zy = 2 * zx * zy + y;
        zx = temp;
        iter++;
    }
    return iter;
}

function julia(x, y) {
    let zx = x, zy = y;
    let iter = 0;
    while (zx * zx + zy * zy < 4 && iter < config.maxIterations) {
        const temp = zx * zx - zy * zy + config.juliaC.x;
        zy = 2 * zx * zy + config.juliaC.y;
        zx = temp;
        iter++;
    }
    return iter;
}

// Rendering
function render() {
    const ctx = currentView === 'mandelbrot' ? mandelbrotCtx : juliaCtx;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
            const x = (px - width/2) / (width/4) / scale + offsetX / width;
            const y = (py - height/2) / (height/4) / scale + offsetY / height;
            
            const iter = currentView === 'mandelbrot' ? 
                mandelbrot(x, y) : julia(x, y);
            
            const color = colorSchemes[config.colorScheme](iter);
            ctx.fillStyle = color;
            ctx.fillRect(px, py, 1, 1);
        }
    }
    
    if (currentView === 'dual') {
        render();
    }
}

function resetView() {
    offsetX = 0;
    offsetY = 0;
    scale = 1;
    render();
}

// Initial render
render(); 