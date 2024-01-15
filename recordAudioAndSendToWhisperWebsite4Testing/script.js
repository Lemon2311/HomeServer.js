let mediaRecorder;
let audioChunks = [];
let isRecording = false;
const recordButton = document.getElementById('recordButton');

recordButton.addEventListener('click', () => {
    isRecording ? stopRecording() : startRecording();
    isRecording = !isRecording;
    recordButton.innerText = isRecording ? 'Stop Recording' : 'Start Recording';
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            mediaRecorder.start();
        }).catch(error => console.error('Error accessing media devices:', error));
}

function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioChunks = []; // Reset the chunks array for the next recording
        sendAudioToAPI(audioBlob);
    };
}

function sendAudioToAPI(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    fetch('http://localhost:5000/audio', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text(); // Use response.text() instead of response.json()
    })
    .then(data => console.log('Server response:', data))
    .catch(error => console.error('Error sending audio data:', error));
}
