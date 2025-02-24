// Raw Key Reader for Raspberry Pi Sense HAT Joystick
// Dan Jackson, 2017-2025

const fs = require('fs');

class HatKeys {
	
	static get DEVICE_NAME() { return "Raspberry Pi Sense HAT Joystick"; }
  	
	constructor(deviceName, keyEventHandler) {
		if (typeof deviceName !== 'undefined') {
			deviceName = HatKeys.DEVICE_NAME;
		}
		if (typeof keyEventHandler !== 'undefined') {
			this.setKeyEventHandler(keyEventHandler);
		}
		
		this.handler = null;
		
		// Buffer
		this.bufferSize = 24;
		this.buffer = new Buffer(this.bufferSize);
		
		// Device
		this.device = HatKeys.findInputDevice(HatKeys.DEVICE_NAME);
		//console.log("HATKEYS: Device=" + this.device);
		
		// Key status
		HatKeys.KEY_STATUS = {
			RELEASED: 0,
			PRESSED: 1,
			REPEATED: 2,
		};

		// Key mapping
		HatKeys.KEYS = {
			SELECT: 28,
			UP: 103,
			DOWN: 108,
			LEFT: 105,
			RIGHT: 106,
		};

		// Construct reverse mapping
		HatKeys.KEY_NAMES = {};
		for(let keyName in HatKeys.KEYS) {
			let keyValue = HatKeys.KEYS[keyName];
			HatKeys.KEY_NAMES[keyValue] = keyName;
		}
		
		// Open device and start reading
		this.fd = fs.openSync(this.device, 'r');
		this.doRead();
	}
	
	setKeyEventHandler(keyEventHandler) {
		this.handler = keyEventHandler;
	}
	
	doRead() {
		let self = this;
		fs.read(this.fd, this.buffer, 0, this.bufferSize, null, function(count) {
			let event = HatKeys.parseEvent(self.buffer);
			if (event) {
				if (self.handler != null) {
					//console.log(event);
					self.handler(event);
				}
			}
			self.doRead();
		});
	}
	
	static findInputDevice(deviceName) {
		let inputPath = null;
		const inputDeviceBase = "/sys/class/input/";
		const inputPathBase = "/dev/input/";
		for (let inputDevice of fs.readdirSync(inputDeviceBase)) {
			if (!inputDevice.startsWith("event")) continue;
			let inputName = fs.readFileSync(inputDeviceBase + inputDevice + "/device/name", "utf8").trim();
			if (inputName != deviceName) continue;
			inputPath = inputPathBase + inputDevice;
		}
		return inputPath;
	}


	static parseEvent(buffer) {
		//console.log(buffer.toString('hex'), " ", buffer.length);
		
		let rawEvent;
		// HACK: Not certain this is robust (32-bit times in a 32 byte packet, and 64-bit times in a 48 byte packet) 
		if (buffer.byteLength > 32) {
			// Read 64-bit times
			rawEvent = {
				timeS: buffer.readUInt32LE(0),
				timeS_high: buffer.readUInt32LE(0),
				timeUS: buffer.readUInt32LE(4),
				timeUS_high: buffer.readUInt32LE(4),
				type: buffer.readUInt16LE(8),
				code: buffer.readUInt16LE(10),
				value: buffer.readInt32LE(12),
			};
		} else {
			// Read 32-bit times
			rawEvent = {
				timeS: buffer.readUInt32LE(0),
				timeS_high: 0,
				timeUS: buffer.readUInt32LE(4),
				timeUS_high: 0,
				type: buffer.readUInt16LE(8),
				code: buffer.readUInt16LE(10),
				value: buffer.readInt32LE(12),
			};
		}
		
		// Ignore unknown types
		if (rawEvent.type != 1) { return null; }
		// Ignore zero events
		if (rawEvent.type == 0 && rawEvent.code == 0) { return null; }
		// Ignore repeats
		//if (rawEvent.value == HatKeys.KEY_STATUS.REPEATED) { return null; }
		
		let keyName = "" + rawEvent.code;
		if (HatKeys.KEY_NAMES.hasOwnProperty(rawEvent.code)) {
			keyName = HatKeys.KEY_NAMES[rawEvent.code];
		}
		
		let event = {
			// TODO: Use _high 32 bits of time for timestamps from 2038
			time: rawEvent.timeS + (rawEvent.timeUS / 1000000),
			key: rawEvent.code,
			name: keyName,
			status: rawEvent.value,
			pressed: rawEvent.value == HatKeys.KEY_STATUS.PRESSED,
			released: rawEvent.value == HatKeys.KEY_STATUS.RELEASED,
			isPressed: rawEvent.value != HatKeys.KEY_STATUS.RELEASED,
			repeated: rawEvent.value == HatKeys.KEY_STATUS.REPEATED,
		}
		
		return event;
	}

}

module.exports = HatKeys;
