# Interactive Fractal Explorer

An interactive web application that allows you to explore the fascinating Mandelbrot Set and Julia Set fractals in both 2D and 3D.

## Features

- Real-time rendering of both Mandelbrot and Julia sets
- Dynamic relationship between the sets - hover over Mandelbrot to see corresponding Julia set
- Ability to lock Julia set parameters at interesting points
- Three view modes: Mandelbrot only, Julia only, or dual view
- 3D visualization with height maps based on iteration values
- Interactive 3D camera controls (rotate, pan, zoom)
- Adjustable 3D rendering options (wireframe/solid, height scale, resolution)
- Pan and zoom navigation with mouse controls
- Adjustable iteration count for varying detail levels
- Multiple color schemes to visualize the fractals
- Coordinate display to track positions in the complex plane
- Reset button to return to the initial view

## Mathematical Relationship

The Mandelbrot and Julia sets are closely related:
- The Mandelbrot set displays which parameters 'c' in the function z² + c produce bounded results
- Each Julia set shows the behavior of a specific 'c' parameter, displaying which initial points 'z' produce bounded results

As you move your mouse over the Mandelbrot set, the corresponding Julia set for that specific 'c' value is rendered in real-time.

## Requirements

- Python 3.x
- Flask
- A modern web browser with WebGL support for 3D visualization

## Installation

1. Clone this repository
2. Activate the virtual environment:
   ```
   source mandlebrotproject/bin/activate
   ```
3. Install the required packages:
   ```
   pip install flask numpy matplotlib
   ```

## Running the Application

1. Make sure the virtual environment is activated
2. Run the Flask application:
   ```
   python app.py
   ```
3. Open your web browser and navigate to `http://127.0.0.1:5050`

## Navigation

- Click and drag to pan across either fractal in 2D view
- Use the scroll wheel to zoom in and out
- Hover over any point in the Mandelbrot set to see the corresponding Julia set
- Click on a point in the Mandelbrot set to lock the Julia set to that parameter
- Toggle between Mandelbrot only, Julia only, dual view, or 3D view
- Adjust the max iterations slider to increase detail (higher values provide more detail but slower rendering)
- Select different color schemes from the dropdown menu
- Click the reset button to return to the default view

## 3D Visualization

The 3D view transforms the fractal into a three-dimensional landscape:
- Height values correspond to the number of iterations at each point
- Use mouse to rotate the 3D view (click and drag)
- Right-click and drag to pan the 3D view
- Scroll to zoom in and out
- Choose between solid or wireframe rendering modes
- Adjust the height scale to emphasize elevation differences
- Select different resolution settings (higher is more detailed but slower)
- Enable auto-rotation for a dynamic view

## About the Fractals

- **Mandelbrot Set**: One of the most famous fractals in mathematics, defined as the set of complex numbers c for which the function f(z) = z² + c does not diverge when iterated from z = 0.

- **Julia Set**: A family of fractals related to the Mandelbrot set. For each point c in the complex plane, there is a corresponding Julia set. The appearance of the Julia set changes dramatically based on the chosen parameter.

## License

MIT 