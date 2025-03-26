from flask import Flask, render_template
import sys

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    port = 5050
    
    # Parse command line arguments for port
    if len(sys.argv) > 1:
        for i, arg in enumerate(sys.argv):
            if arg == '--port' and i + 1 < len(sys.argv):
                try:
                    port = int(sys.argv[i + 1])
                except ValueError:
                    print(f"Invalid port number: {sys.argv[i + 1]}")
            elif arg.startswith('--port='):
                try:
                    port = int(arg.split('=')[1])
                except (ValueError, IndexError):
                    print(f"Invalid port format: {arg}")
    
    print(f"Starting Flask app on port {port}")
    app.run(debug=True, port=port) 