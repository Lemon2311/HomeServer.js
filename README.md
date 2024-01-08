
# HomeServer.js

## Overview
HomeServer.js is a home automation system for controlling your home lighting. Built with IoTFleet.js, it is currently in active development and focuses on simplicity and effectiveness.

## Features
- **Light Control**: Manage your home lighting through digital outputs that control relays.
- **Versatile Operation**: Operate your lights using either an HTML button interface or a physical two-way switch.
- **Easy Integration**: Designed to integrate seamlessly into your existing home setup.

## Getting Started
1. **Installation**: To set up the app follow the [IoTFleet.js](https://github.com/Lemon2311/IoTFleet.js) README.md, to configure the esp32 device/devices and modify the esp32 ip`s from the homeServer.js file to fit the ones from your esp32s
2. **Configuration**: Adding digital outputs to switch on or off devices via a relay switch is easy, as to add a new digital output you just need to write in the input field the details of controlling the output following the structure ex:d13/lamp/d4, d13 being the digital output, d4 being the digital input from the two way switch and lamp being the name of the device, then press the add digital button from the html webpage
3. **Control**: Use the HTML interface or physical switches to control your lights.

## Support and Development
- **Active Development**: The system is being actively developed, with regular updates and new features.

## Contributing
Contributions are welcome!
