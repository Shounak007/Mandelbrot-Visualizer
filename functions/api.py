from http.server import BaseHTTPRequestHandler
from flask import Flask, render_template

app = Flask(__name__)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        with open('templates/index.html', 'r') as f:
            content = f.read()
            
        self.wfile.write(content.encode())
        return 