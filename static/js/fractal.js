// Fractal Explorer Configuration
const config = {
    width: 500,
    height: 500,
    maxIterations: 100,
    colorScheme: 'rainbow',
    juliaLock: false,
    juliaC: { x: -0.4, y: 0.6 },
    smoothRendering: true,
    renderQuality: 1  // 1 = every pixel, 2 = every other pixel (for faster initial rendering)
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
let centerX = 0, centerY = 0; // Center point in fractal coordinates
let scale = 1;
let isRendering = false;
let iterationDisplay = document.getElementById('iterationValue');

// Display elements
const mandelbrotPanel = document.getElementById('mandelbrot-panel');
const juliaPanel = document.getElementById('julia-panel');

// Color schemes
const colorSchemes = {
    rainbow: (t) => {
        const hue = t * 360;
        return `hsl(${hue}, 100%, 50%)`;
    },
    blueFire: (t) => {
        return `rgb(${Math.floor(t * 255)}, ${Math.floor(t * 100)}, ${Math.floor(t * 255)})`;
    },
    grayscale: (t) => {
        const value = Math.floor(t * 255);
        return `rgb(${value}, ${value}, ${value})`;
    },
    plasma: (t) => {
        const r = Math.sin(t * Math.PI * 2) * 127 + 128;
        const g = Math.sin(t * Math.PI * 2 + 2) * 127 + 128;
        const b = Math.sin(t * Math.PI * 2 + 4) * 127 + 128;
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    },
    electric: (t) => {
        const r = Math.floor(255 * Math.pow(Math.sin(t * Math.PI), 2));
        const g = Math.floor(255 * Math.pow(Math.cos(t * Math.PI * 3), 2));
        const b = Math.floor(255 * Math.pow(Math.sin(t * Math.PI * 5), 2));
        return `rgb(${r}, ${g}, ${b})`;
    },
    cosmic: (t) => {
        const r = Math.floor(255 * Math.pow(Math.sin(t * Math.PI * 3), 2));
        const g = Math.floor(255 * Math.pow(Math.sin(t * Math.PI * 4), 2));
        const b = Math.floor(255 * Math.pow(Math.sin(t * Math.PI * 2), 2));
        return `rgb(${r}, ${g}, ${b})`;
    },
    sunset: (t) => {
        const r = Math.floor(255 * (1 - Math.pow(1 - t, 2)));
        const g = Math.floor(128 * Math.pow(t, 0.5));
        const b = Math.floor(80 * Math.pow(t, 3));
        return `rgb(${r}, ${g}, ${b})`;
    },
    ocean: (t) => {
        const r = Math.floor(t * 120);
        const g = Math.floor(t * 150 + 50);
        const b = Math.floor(150 + t * 105);
        return `rgb(${r}, ${g}, ${b})`;
    }
};

// Event Listeners
document.getElementById('mandelbrotOnly').addEventListener('click', () => setView('mandelbrot'));
document.getElementById('juliaOnly').addEventListener('click', () => setView('julia'));
document.getElementById('maxIterations').addEventListener('input', (e) => {
    config.maxIterations = parseInt(e.target.value);
    iterationDisplay.textContent = config.maxIterations;
    render();
});
document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
    render();
});
document.getElementById('juliaLock').addEventListener('change', (e) => {
    config.juliaLock = e.target.checked;
});
document.getElementById('smoothRendering').addEventListener('change', (e) => {
    config.smoothRendering = e.target.checked;
    render();
});
document.getElementById('resetView').addEventListener('click', resetView);

// Canvas event listeners
mandelbrotCanvas.addEventListener('mousedown', startDrag);
mandelbrotCanvas.addEventListener('mousemove', (e) => {
    drag(e);
    if (currentView === 'mandelbrot') {
        updateJuliaFromMandelbrot(e);
    }
});
mandelbrotCanvas.addEventListener('mouseup', stopDrag);
mandelbrotCanvas.addEventListener('mouseleave', stopDrag);
mandelbrotCanvas.addEventListener('wheel', handleZoom);

juliaCanvas.addEventListener('mousedown', startDrag);
juliaCanvas.addEventListener('mousemove', drag);
juliaCanvas.addEventListener('mouseup', stopDrag);
juliaCanvas.addEventListener('mouseleave', stopDrag);
juliaCanvas.addEventListener('wheel', handleZoom);

// View management
function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${view}Only`).classList.add('active');
    
    if (view === 'mandelbrot') {
        mandelbrotPanel.style.display = 'block';
        juliaPanel.style.display = 'none';
    } else if (view === 'julia') {
        mandelbrotPanel.style.display = 'none';
        juliaPanel.style.display = 'block';
    }
    
    render();
}

// Convert screen coordinates to fractal coordinates
function screenToFractal(canvas, screenX, screenY) {
    const width = canvas.width;
    const height = canvas.height;
    
    // Normalize to [0,1]
    const normalizedX = screenX / width;
    const normalizedY = screenY / height;
    
    // Convert to fractal coordinates
    const fractalX = centerX + (normalizedX - 0.5) * 4 / scale;
    const fractalY = centerY + (normalizedY - 0.5) * 4 / scale;
    
    return { x: fractalX, y: fractalY };
}

// Convert fractal coordinates to screen coordinates
function fractalToScreen(canvas, fractalX, fractalY) {
    const width = canvas.width;
    const height = canvas.height;
    
    // Convert to normalized [0,1]
    const normalizedX = ((fractalX - centerX) * scale / 4) + 0.5;
    const normalizedY = ((fractalY - centerY) * scale / 4) + 0.5;
    
    // Convert to screen coordinates
    const screenX = normalizedX * width;
    const screenY = normalizedY * height;
    
    return { x: screenX, y: screenY };
}

// Drag and zoom handlers
function startDrag(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const canvas = currentView === 'mandelbrot' ? mandelbrotCanvas : juliaCanvas;
    
    // Store the starting fractal coordinates
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Remember start coordinates for the current drag operation
    startDragCoordinates = screenToFractal(canvas, mouseX, mouseY);
}

function drag(e) {
    if (!isDragging) return;
    
    const canvas = currentView === 'mandelbrot' ? mandelbrotCanvas : juliaCanvas;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate current fractal coordinates under the mouse
    const currentCoords = screenToFractal(canvas, mouseX, mouseY);
    
    // Calculate the difference in fractal coordinates
    const deltaX = currentCoords.x - startDragCoordinates.x;
    const deltaY = currentCoords.y - startDragCoordinates.y;
    
    // Move the center in the opposite direction
    centerX -= deltaX;
    centerY -= deltaY;
    
    render();
}

function stopDrag() {
    isDragging = false;
}

function handleZoom(e) {
    e.preventDefault();
    
    const canvas = currentView === 'mandelbrot' ? mandelbrotCanvas : juliaCanvas;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get the coordinates before zooming
    const beforeZoom = screenToFractal(canvas, mouseX, mouseY);
    
    // Adjust scale by zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.8 : 1.25;
    scale *= zoomFactor;
    
    // Get the coordinates after zooming
    const afterZoom = screenToFractal(canvas, mouseX, mouseY);
    
    // Adjust center to keep mouse position fixed
    centerX += (beforeZoom.x - afterZoom.x);
    centerY += (beforeZoom.y - afterZoom.y);
    
    render();
}

function updateJuliaFromMandelbrot(e) {
    if (config.juliaLock) return;
    
    const rect = mandelbrotCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to fractal coordinates
    const coords = screenToFractal(mandelbrotCanvas, mouseX, mouseY);
    config.juliaC = { x: coords.x, y: coords.y };
    
    // Update the Julia set if it's not currently being viewed
    if (currentView !== 'julia') {
        renderSpecificCanvas(juliaCtx, julia);
    }
}

// Fractal calculation
function mandelbrot(x, y) {
    let zx = 0, zy = 0;
    let iter = 0;
    const maxIter = config.maxIterations;
    
    while (zx * zx + zy * zy < 4 && iter < maxIter) {
        const xtemp = zx * zx - zy * zy + x;
        zy = 2 * zx * zy + y;
        zx = xtemp;
        iter++;
    }
    
    // Smooth coloring algorithm
    if (config.smoothRendering && iter < maxIter) {
        const log_zn = Math.log(zx * zx + zy * zy) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        iter = iter + 1 - nu;
    }
    
    return iter;
}

function julia(x, y) {
    let zx = x, zy = y;
    let iter = 0;
    const maxIter = config.maxIterations;
    const cx = config.juliaC.x;
    const cy = config.juliaC.y;
    
    while (zx * zx + zy * zy < 4 && iter < maxIter) {
        const xtemp = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = xtemp;
        iter++;
    }
    
    // Smooth coloring algorithm
    if (config.smoothRendering && iter < maxIter) {
        const log_zn = Math.log(zx * zx + zy * zy) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        iter = iter + 1 - nu;
    }
    
    return iter;
}

// Rendering
function render() {
    if (isRendering) return;
    isRendering = true;
    
    // Low quality first pass for smoother interaction
    config.renderQuality = 2;
    if (currentView === 'mandelbrot') {
        renderSpecificCanvas(mandelbrotCtx, mandelbrot);
    } else if (currentView === 'julia') {
        renderSpecificCanvas(juliaCtx, julia);
    }
    
    // High quality second pass
    setTimeout(() => {
        config.renderQuality = 1;
        if (currentView === 'mandelbrot') {
            renderSpecificCanvas(mandelbrotCtx, mandelbrot);
        } else if (currentView === 'julia') {
            renderSpecificCanvas(juliaCtx, julia);
        }
        isRendering = false;
    }, 10);
}

function renderSpecificCanvas(ctx, fractalFunc) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const quality = config.renderQuality;
    
    ctx.clearRect(0, 0, width, height);
    
    // Create image data for faster rendering
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let px = 0; px < width; px += quality) {
        for (let py = 0; py < height; py += quality) {
            // Convert pixel coordinates to fractal coordinates
            const coords = screenToFractal(ctx.canvas, px, py);
            const x = coords.x;
            const y = coords.y;
            
            const iter = fractalFunc(x, y);
            
            // Calculate color
            const t = iter / config.maxIterations;
            const colorFn = colorSchemes[config.colorScheme];
            const colorStr = colorFn(t);
            
            // Parse the rgb color
            const rgb = colorStr.match(/\d+/g).map(Number);
            const r = rgb[0], g = rgb[1], b = rgb[2];
            
            // Set pixels
            for (let qx = 0; qx < quality && px + qx < width; qx++) {
                for (let qy = 0; qy < quality && py + qy < height; qy++) {
                    const pos = ((py + qy) * width + (px + qx)) * 4;
                    data[pos] = r;
                    data[pos + 1] = g;
                    data[pos + 2] = b;
                    data[pos + 3] = 255; // alpha
                }
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Update coordinates display
    updateCoordinatesDisplay(ctx);
}

function updateCoordinatesDisplay(ctx) {
    const coordsDisplayId = ctx === mandelbrotCtx ? 'mandelbrot-coords' : 'julia-coords';
    const coordsDisplay = document.getElementById(coordsDisplayId);
    
    if (coordsDisplay) {
        const centerCoords = { x: centerX, y: centerY };
        coordsDisplay.textContent = `Center: (${centerCoords.x.toFixed(6)}, ${centerCoords.y.toFixed(6)}) - Scale: ${scale.toFixed(2)}x`;
    }
}

function resetView() {
    centerX = 0;
    centerY = 0;
    scale = 1;
    render();
}

// Initialize the UI
function init() {
    // Set initial iteration display
    iterationDisplay.textContent = config.maxIterations;
    
    // Initial view setup
    setView('mandelbrot');
}

// Start the application
init(); 