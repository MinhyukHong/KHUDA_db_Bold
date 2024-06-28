from flask import Flask, request, jsonify
from flask_cors import CORS
from model import extract_key_sentences_and_words

app = Flask(__name__)
CORS(app)  # CORS 설정 추가

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    sentences, words = extract_key_sentences_and_words(text)
    return jsonify({'sentences': sentences, 'words': words})

if __name__ == '__main__':
    app.run(debug=True)