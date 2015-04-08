// https://github.com/sandeepmistry/noble

// test BLEs
// ctfb01: uuid 11c746e6b8204553832af679a89c34c9
// ctfr01: uuid 941da9dbecf04020ab915ff37a3e28d1

var GAME_DURATION     = 300000; // 5 min
var SCAN_DURATION     = 5000;   // 5 sec
var SCAN_BREAK_DELAY  = 5000;   // 5 sec

var noble = require('noble');
var scanTimeout;
var serviceUUIDs = [];
var allowDuplicates = false;

var flagDominations = [];
var currentDomination = {};

function startScan() {
  console.log('startScan()');
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(stopScan, SCAN_DURATION);
  noble.startScanning([], false);
}

function stopScan() {
  console.log('stopScan()\n\n\n');
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(startScan, SCAN_BREAK_DELAY);
  noble.stopScanning();
}

function gameStart() {
  console.log('# GameStart()')
  startScan();

  setTimeout(gameOver, GAME_DURATION);
}

function gameOver() {
  console.log('# GameOver()');
  clearTimeout(scanTimeout);
  noble.stopScanning();
}

function checkPeripheral(peripheral) {
  // check team color
  //
  // check timestamp

  if (peripheral.rssi > -50) {
    console.log('Valid Range!!!!', peripheral.rssi)
    console.log(peripheral.advertisement.localName);
    console.log('----')
  } else {
    console.log('out of range', peripheral.rssi, peripheral.advertisement.localName);
  }

}


noble.on('stateChange', function (state) {
  console.log('noble on stateChange -', state);
  if (state === 'poweredOn') {
    gameStart();
  } else {
    clearTimeout(scanTimeout);
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  var peripheralName = peripheral.advertisement.localName;

  if (peripheralName !== undefined && peripheralName.indexOf('ctf') === 0) {
    checkPeripheral(peripheral);
    // var serviceData = peripheral.advertisement.serviceData;
    // console.log('\thello my local name is: ' + peripheral.advertisement.localName);
    // console.log('peripheral discovered (' + peripheral.uuid + '):');

    // if (peripheral.advertisement.manufacturerData) {
    //   console.log('\there is my manufacturer data:' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
    // }
    // if (peripheral.advertisement.txPowerLevel !== undefined) {
    //   console.log('\tmy TX power level is:' + peripheral.advertisement.txPowerLevel);
    // }
    // console.log('rssi ->', peripheral.rssi)
    console.log('---');
  }
});
