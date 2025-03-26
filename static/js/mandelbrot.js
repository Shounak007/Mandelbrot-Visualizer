document.addEventListener('DOMContentLoaded', function() {
    // Canvas setup
    const canvas = document.getElementById('mandelbrot-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set initial canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Mandelbrot view parameters
    let viewParams = {
        centerX: -0.5,
        centerY: 0,
        scale: 200,
        maxIterations: 100,
        colorScheme: 'rainbow'
    };
    
    // Mouse interaction variables
    let isDragging = false;
    let lastX, lastY;
    
    // UI elements
    const iterationsSlider = document.getElementById('iterations');
    const iterationsValue = document.getElementById('iterations-value');
    const colorSchemeSelect = document.getElementById('colorscheme');
    const resetButton = document.getElementById('reset');
    
    // Functions for color schemes
    const colorSchemes = {
        rainbow: (i, max) => {
            if (i === max) return [0, 0, 0]; // Black for points in the set
            const hue = (i / max * 360) % 360;
            return hslToRgb(hue / 360, 0.8, 0.5);
        },
        bluefire: (i, max) => {
            if (i === max) return [0, 0, 0]; // Black for points in the set
            const t = i / max;
            return [
                Math.floor(255 * Math.pow(t, 3)),
                Math.floor(255 * Math.pow(t, 1.5)),
                Math.floor(255 * t)
            ];
        },
        grayscale: (i, max) => {
            if (i === max) return [0, 0, 0]; // Black for points in the set
            const value = Math.floor((i / max) * 255);
            return [value, value, value];
        }
    };
    
    // Initialize UI
    iterationsSlider.value = viewParams.maxIterations;
    iterationsValue.textContent = viewParams.maxIterations;
    colorSchemeSelect.value = viewParams.colorScheme;
    
    // Event listeners
    iterationsSlider.addEventListener('input', function() {
        viewParams.maxIterations = parseInt(this.value);
        iterationsValue.textContent = this.value;
        drawMandelbrot();
    });
    
    colorSchemeSelect.addEventListener('change', function() {
        viewParams.colorScheme = this.value;
        drawMandelbrot();
    });
    
    resetButton.addEventListener('click', function() {
        viewParams = {
            centerX: -0.5,
            centerY: 0,
            scale: 200,
            maxIterations: parseInt(iterationsSlider.value),
            colorScheme: colorSchemeSelect.value
        };
        drawMandelbrot();
    });
    
    // Mouse events for panning
    canvas.addEventListener('mousedown', function(e) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            
            viewParams.centerX -= deltaX / viewParams.scale;
            viewParams.centerY -= deltaY / viewParams.scale;
            
            lastX = e.clientX;
            lastY = e.clientY;
            
            drawMandelbrot();
        }
    });
    
    canvas.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', function() {
        isDragging = false;
    });
    
    // Zoom with scroll wheel
    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        const mouseX = e.clientX - canvas.offsetLeft;
        const mouseY = e.clientY - canvas.offsetTop;
        
        // Convert mouse coordinates to complex plane before scaling
        const realBefore = (mouseX - canvas.width / 2) / viewParams.scale + viewParams.centerX;
        const imagBefore = (mouseY - canvas.height / 2) / viewParams.scale + viewParams.centerY;
        
        // Apply zoom factor
        const zoomFactor = e.deltaY > 0 ? 0.8 : 1.2; // Zoom out or in
        viewParams.scale *= zoomFactor;
        
        // Convert back to screen coordinates and adjust center to keep mouse position fixed
        const realAfter = (mouseX - canvas.width / 2) / viewParams.scale + viewParams.centerX;
        const imagAfter = (mouseY - canvas.height / 2) / viewParams.scale + viewParams.centerY;
        
        viewParams.centerX += realBefore - realAfter;
        viewParams.centerY += imagBefore - imagAfter;
        
        drawMandelbrot();
    });
    
    // Function to calculate Mandelbrot set membership
    function calculateMandelbrot(x0, y0, maxIterations) {
        let x = 0;
        let y = 0;
        let iteration = 0;
        
        while (x*x + y*y <= 4 && iteration < maxIterations) {
            const xTemp = x*x - y*y + x0;
            y = 2*x*y + y0;
            x = xTemp;
            iteration++;
        }
        
        return iteration;
    }
    
    // Draw the Mandelbrot set
    function drawMandelbrot() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        const xMin = viewParams.centerX - canvas.width / (2 * viewParams.scale);
        const yMin = viewParams.centerY - canvas.height / (2 * viewParams.scale);
        const pixelSize = 1 / viewParams.scale;
        
        for (let y = 0; y < canvas.height; y++) {
            const cY = yMin + y * pixelSize;
            
            for (let x = 0; x < canvas.width; x++) {
                const cX = xMin + x * pixelSize;
                
                const iterations = calculateMandelbrot(cX, cY, viewParams.maxIterations);
                const colorFn = colorSchemes[viewParams.colorScheme];
                const [r, g, b] = colorFn(iterations, viewParams.maxIterations);
                
                const pixelIndex = (y * canvas.width + x) * 4;
                data[pixelIndex] = r;     // Red
                data[pixelIndex + 1] = g; // Green
                data[pixelIndex + 2] = b; // Blue
                data[pixelIndex + 3] = 255; // Alpha (fully opaque)
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // HSL to RGB conversion function
    function hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [
            Math.floor(r * 255),
            Math.floor(g * 255),
            Math.floor(b * 255)
        ];
    }
    
    // Initial draw
    drawMandelbrot();
    
    // Resize handling
    window.addEventListener('resize', function() {
        // Optional: Adjust canvas size on window resize
        // For now we keep it fixed size
    });
}); 