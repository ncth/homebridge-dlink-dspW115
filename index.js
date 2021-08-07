const WebSocketClient = require('dlink_websocketclient');

module.exports = (api) => {
	api.registerAccessory('DlinkSmartPlug', DlinkSmartPlug);
}
  
class DlinkSmartPlug {

	constructor(log, config, api) {
		this.log = log;
		this.config = config;
		this.api = api;
		this.value;
		this.name = config.name;

		this.log.debug('DlinkSmartPlug Plugin Loaded');

		// your accessory must have an AccessoryInformation service
		this.informationService = new this.api.hap.Service.AccessoryInformation()
			.setCharacteristic(this.api.hap.Characteristic.Manufacturer, "ncth")
			.setCharacteristic(this.api.hap.Characteristic.Model, "Dlink DSP-W115")
			.setCharacteristic(this.api.hap.Characteristic.SerialNumber, "123-456-789");

		// create a new "Outlet" service
		this.outletService = new this.api.hap.Service.Outlet(config.name);

		// link methods used when getting or setting the state of the service 
		this.outletService.getCharacteristic(this.api.hap.Characteristic.On)
			.onGet(this.getOnHandler.bind(this))   // bind to getOnHandler method below
			.onSet(this.setOnHandler.bind(this));  // bind to setOnHandler method below

		this.client = new WebSocketClient({
			ip: this.config.ip, //ip or hostname of the device
			pin: this.config.pin,  //PIN of the device or device token
			model: "w115",
			keepAlive: 0
		});

		this.client.login().then(async () => {
			console.info("[Dlink DSP-W115] Connected to Smart Plug")
		});

	}


	getServices() {
		return [
			this.informationService,
			this.outletService,
		];
	}

	async getOnHandler() {
		this.log.debug('Getting outlet state');
		if(this.client.isDeviceReady()){
			return await this.client.state();
		} else{
			this.client.login().then(async () => {
				return await this.client.state();
			});
		}
	}

	async setOnHandler(value) {
		if(this.client.isDeviceReady()){
			await this.client.switch(value);
		} else{
			this.client.login().then(async () => {
				await this.client.switch(value);
			});
		}
	}
}
