from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from whisperSpeechToText import transcribe_audio
import tempfile

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/audio', methods=['POST'])
def handle_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    filename = secure_filename(audio_file.filename)

    # Save the file to a temporary file
    with tempfile.NamedTemporaryFile(suffix=filename, delete=False) as temp_audio:
        audio_file.save(temp_audio.name)
        transcript = transcribe_audio(temp_audio.name)

    # The file will be automatically deleted when it's closed

    if transcript is None:
        return jsonify({'error': 'Failed to transcribe audio'}), 500

    return transcript

if __name__ == '__main__':
    app.run(debug=True)
