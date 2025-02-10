import os
import sqlite3
import requests
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

API_KEY = "AIzaSyB94m_6-hFALEHJz8U4csITg2RlFNprTjQ"
SAFE_BROWSING_URL = (
    f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}"
)

DB_NAME = "phishing_urls.db"


def init_db():
    if not os.path.exists(DB_NAME):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE phishing_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE NOT NULL,
                date_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
        conn.close()


def save_phishing_url(url):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO phishing_urls (url) VALUES (?)", (url,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()


def check_url_safety(url):
    payload = {
        "client": {"clientId": "phishingDetector", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntries": [{"url": url}],
        },
    }
    try:
        response = requests.post(SAFE_BROWSING_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return "matches" in data and len(data["matches"]) > 0
    except requests.exceptions.HTTPError as err:
        print(f"HTTP Error: {err}")
        return False
    except Exception as err:
        print(f"General Error: {err}")
        return False


@app.route("/check-url", methods=["POST"])
def check_url():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    is_phishing = check_url_safety(url)
    if is_phishing:
        save_phishing_url(url)
        return jsonify({"isPhishing": True, "message": "Blocked!"}), 403

    return jsonify({"isPhishing": False})


@app.route("/phishing-urls", methods=["GET"])
def get_phishing_urls():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT url, date_detected FROM phishing_urls")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([{"url": row[0], "date_detected": row[1]} for row in rows])


@app.route("/blocked-sites", methods=["GET"])
def blocked_sites():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT url, date_detected FROM phishing_urls")
    rows = cursor.fetchall()
    conn.close()

    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Blocked Sites</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .container { width: 80%; margin: auto; }
            .scrollview { max-height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; }
            .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007BFF; color: white; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>List of Blocked Sites</h1>
        <div class="container">
            <div class="scrollview">
                <ul>
                    {% for url, date in urls %}
                        <li>{{ url }} - Blocked on {{ date }}</li>
                    {% endfor %}
                </ul>
            </div>
            <a href="/" class="btn">Go Back</a>
        </div>
    </body>
    </html>
    """

    return render_template_string(html_template, urls=rows)


@app.route("/add-blocked-site", methods=["POST"])
def add_blocked_site():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        save_phishing_url(url)
        return jsonify({"success": True, "message": "Site added to block list"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/remove-blocked-site", methods=["POST"])
def remove_blocked_site():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM phishing_urls WHERE url = ?", (url,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Site removed from block list"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
