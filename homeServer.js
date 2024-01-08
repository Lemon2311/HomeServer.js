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

let buttonState = false;

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

  const out = output("192.168.1.138", beginningText)[beginningText];

  // Add the output to the outputs array
  outputs.push(out);

  names.push(name);

  localStorage.setItem("outputs", JSON.stringify(outputs));

  localStorage.setItem("names", JSON.stringify(names));

  // Add a click event listener to the new button, to toggle the output
  newItem.addEventListener("click", function () {
    if (buttonState === false) {
      console.log(outputs[newItem.id], newItem.id);
      console.log(outputs);
      buttonState = true;
    } else {
      buttonState = false;
    }
    outputs[newItem.id].set(buttonState ? "high" : "low");
  });

  if (mechanicalInput) {
    console.log(mechanicalInput);
    getMechanicalSwitchStateChange(mechanicalInput, out);
    mechanicalInputs[newItem.id] = mechanicalInput;
    localStorage.setItem("mechanicalInputs", JSON.stringify(mechanicalInputs));
  }
}

// Load the outputs from local storage when the page loads
window.onload = function () {
  const savedOutputs = JSON.parse(localStorage.getItem("outputs"));
  const savedNames = JSON.parse(localStorage.getItem("names"));
  const savedMechanicalInputs = JSON.parse(
    localStorage.getItem("mechanicalInputs")
  );

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
        if (buttonState === false) {
          console.log(savedOutputs[newItem.id], newItem.id);
          console.log(outputs);
          buttonState = true;
        } else {
          buttonState = false;
        }
        outputs[i].set(buttonState ? "high" : "low");
      });

    if (savedMechanicalInputs[i]) {
      getMechanicalSwitchStateChange(savedMechanicalInputs[i], outp);
    }
  }
}
};

const getMechanicalSwitchStateChange = async (mechanicalInput, output) => {
  const inp = input("192.168.1.138", mechanicalInput);

  let previousValue = await inp[mechanicalInput].get();

  setInterval(async () => {
    inp[mechanicalInput].get().then((currentValue) => {
      console.log(currentValue, previousValue);
      console.log("sdadsa");

      if (currentValue !== previousValue) {
        if (buttonState === false) buttonState = true;
        else buttonState = false;

        if (buttonState === true) output.set("high");
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
