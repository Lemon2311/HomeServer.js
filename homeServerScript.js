import { output, input } from "./IoTFleet.js/script.js";

// Get the add-item button element
const addItemButton = document.getElementById("add");

// Get the list element
const itemList = document.getElementById("item-list");

// Get the input element
const inputField = document.getElementById("new-item");

// Create an array to store the digital outputs
let outputs = [];

let names = [];

let mechanicalInputs = [];

let buttonState = [];

let esp32ip = "192.168.1.160";

// Function to handle the add-item button click event
async function handleAddItemClick() {
  // Get the value of the input field
  const newItemText = inputField.value;

  // Get the index of the first '/' character
  const slashIndex = newItemText.indexOf("/");

  // Get the text before the '/'
  const beginningText = newItemText.substring(0, slashIndex);

  // Clear the input field
  inputField.value = "";

  // Create a new button element
  const newItem = document.createElement("button");

  let name = newItemText.substring(slashIndex + 1, newItemText.length);

  const mechanicalInput = name.substring(name.indexOf("/") + 1, name.length);

  name = name.substring(0, name.indexOf("/"));

  // Set the text of the button
  newItem.textContent = name;

  newItem.id = outputs.length;

  // Add the button to the list
  itemList.appendChild(newItem);

  const out = output(esp32ip, beginningText)[beginningText];

  // Add the output to the outputs array
  outputs.push(out);

  names.push(name);

  localStorage.setItem("outputs", JSON.stringify(outputs));

  localStorage.setItem("names", JSON.stringify(names));

  buttonState[newItem.id] = false;

  localStorage.setItem("buttonState", JSON.stringify(buttonState));

  if (mechanicalInput) {
    console.log(mechanicalInput);
    getMechanicalSwitchStateChange(mechanicalInput, out);
    mechanicalInputs[newItem.id] = mechanicalInput;
    localStorage.setItem("mechanicalInputs", JSON.stringify(mechanicalInputs));
  }

  location.reload();
}

// Load the outputs from local storage when the page loads
window.onload = function () {
  const savedOutputs = JSON.parse(localStorage.getItem("outputs"));
  const savedNames = JSON.parse(localStorage.getItem("names"));
  const savedMechanicalInputs = JSON.parse(
    localStorage.getItem("mechanicalInputs")
  );

  const buttonState = JSON.parse(localStorage.getItem("buttonState"));

  console.log(savedOutputs);
  console.log("dasda");
  console.log(savedNames);
  console.log("dasda");

  let nameIndex = 0;

  if (savedOutputs) {
    for (let i = 0; i < savedOutputs.length; i++) {
      const newItem = document.createElement("button");
      const out = savedOutputs[i];
      console.log(out);
      newItem.textContent = savedNames[nameIndex];
      newItem.id = i;
      itemList.appendChild(newItem);
      const outp = output(
        savedOutputs[i].ip,
        savedOutputs[i].type + savedOutputs[i].pin
      )[savedOutputs[i].type + savedOutputs[i].pin];
      outputs.push(outp);

      // Add a click event listener to the new button, to toggle the output
      newItem.addEventListener("click", function () {
        console.log(buttonState[0]);
        if (buttonState[newItem.id] === false) {
          console.log(savedOutputs[newItem.id], newItem.id);
          console.log(outputs);
          buttonState[newItem.id] = true;
        } else {
          buttonState[newItem.id] = false;
        }
        outputs[i].set(buttonState[newItem.id] ? "high" : "low");
        localStorage.setItem("buttonState", JSON.stringify(buttonState));
      });

      if (savedMechanicalInputs[i]) {
        getMechanicalSwitchStateChange(savedMechanicalInputs[i], outp, i);
      }
    }
  }

  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;
  const recordButton = document.getElementById("recordButton");

  recordButton.addEventListener("click", () => {
    isRecording ? stopRecording() : startRecording();
    isRecording = !isRecording;
    recordButton.innerText = isRecording ? "Stop Recording" : "Start Recording";
  });

  function startRecording() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
        mediaRecorder.start();
      })
      .catch((error) => console.error("Error accessing media devices:", error));
  }

  function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioChunks = []; // Reset the chunks array for the next recording
      sendAudioToAPI(audioBlob);
    };
  }

  function sendAudioToAPI(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    fetch("http://localhost:5000/audio", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text(); // response.text() instead of response.json()
      })
      .then((data) => {
        console.log("Server response:", data);

        if (data.toLowerCase().includes("turn")) {
          const textAfterTurn = data
            .substring(data.toLowerCase().indexOf("turn") + 4)
            .replace(/[.,]/g, "");
          const words = textAfterTurn
            .split(" ")
            .map((word) => word.trim())
            .filter((word) => word !== "");
          let outputIndex = savedNames.indexOf(words[0]);
          console.log(outputIndex);
          console.log("Split words:", words);
          const outp = output(
            savedOutputs[outputIndex].ip,
            savedOutputs[outputIndex].type + savedOutputs[outputIndex].pin
          )[savedOutputs[outputIndex].type + savedOutputs[outputIndex].pin];
          if (words[1] === "on") {
            outp.set("high");
          } else if (words[1] === "off") {
            outp.set("low");
          }
        }
      })
      .catch((error) => console.error("Error sending audio data:", error));
  }
};

const getMechanicalSwitchStateChange = async (mechanicalInput, output, i) => {
  const inp = input(esp32ip, mechanicalInput);

  let previousValue = await inp[mechanicalInput].get();

  setInterval(async () => {
    inp[mechanicalInput].get().then((currentValue) => {
      console.log(currentValue, previousValue);
      console.log("sdadsa");

      if (currentValue !== previousValue) {
        if (buttonState[i] === false) buttonState[i] = true;
        else buttonState[i] = false;

        if (buttonState[i] === true) output.set("high");
        else output.set("low");

        previousValue = currentValue;
        console.log(currentValue, previousValue);
      }
    });
  }, 1000); // Change the interval time as needed
};

//clear  local storage  for testing
//localStorage.clear();

// Add a click event listener to the add-item button
addItemButton.addEventListener("click", handleAddItemClick);
