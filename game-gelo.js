// https://github.com/sandeepmistry/noble

// test GeLo BLEs
// http://www.getgelo.com/beacons/



var GAME_DURATION     = 150000; // 2.5 min
var SCAN_DURATION     = 5000;   // 5 sec
var SCAN_BREAK_DELAY  = 5000;   // 5 sec
var BLE_RSSI_MIN      = -60;



var minorBlueList = [6077,6078, 6079];
var minorRedList = [6070,6073, 6074];


var noble = require('noble');
var scanTimeout;
var serviceUUIDs = [];
var allowDuplicates = false;

var flagDominations = [];
var currentDomination;

var  nearBles = [];

var teamsScore = {
  red: 0,
  blue: 0
};

function startScan() {
  console.log('startScan()');
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(stopScan, SCAN_DURATION);

  // reset nearBles
  nearBles = [];
  noble.startScanning([], false);
}

function stopScan() {

  // validate nearBles!

  console.log('nearBles:', nearBles.length);
  var ble;
  var blueCounter =0;
  var redCounter = 0;

  for (var i = 0; i < nearBles.length; i++) {
    ble = nearBles[i];
    console.log('nearBles index:', i, 'name:', ble.name, 'team:', ble.team, 'date:', Date(ble.timestamp));

    if (ble.team === 'red') {
      redCounter++;
    }
    if (ble.team === 'blue') {
      blueCounter++;
    }
  }
  console.log('current round counters -> red:', redCounter, ' blue:', blueCounter);
  if (blueCounter > redCounter) {
    console.log('Blue Team captured the flag');
    teamsScore.blue++;
  } else if (blueCounter < redCounter) {
    console.log('Red Team captured the flag');
    teamsScore.red++;
  } else {
    console.log('No team scores, we got even players from both teams or none.');
  }

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
  console.log('------');
  console.log('Score');

  console.log('\t BLUE -> ', teamsScore.blue);
  console.log('\t RED -> ', teamsScore.red);

  clearTimeout(scanTimeout);
  noble.stopScanning();
}

function checkPeripheral(peripheral, beanId, team) {
  // check team color
  //
  // check timestamp

  if (peripheral.rssi > BLE_RSSI_MIN) {
    console.log(team, 'Valid Range!!!!', peripheral.rssi);
    // console.log(peripheral.advertisement.localName);
    console.log('----');

    // current ble
    nearBles.push({
      name: beanId,
      team: team,
      timestamp: Date.now()
    });


  } else {
    console.log('out of range', peripheral.rssi, peripheral.advertisement.localName);
  }

  // return null;
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

  // if (peripheralName !== undefined && peripheralName.indexOf('ctf') === 0) {
  if (peripheral.advertisement.manufacturerData) {

    var d = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'));
    // var tx = d.substr(d.length-2, d.);
    var major = d.substr(d.length - 11, 4);
    var minor = d.substr(d.length - 7, 4);

    minor = parseInt(minor, 16);

    // console.log(minor);
    // console.log('check minorRedList');
    // console.log(minorRedList.indexOf(minor));
    // console.log('check minorBlueList');
    // console.log(minorBlueList.indexOf(minor));
    // console.log('----')

    if (minorBlueList.indexOf(minor) > -1) {
      checkPeripheral(peripheral, minor, 'blue');
    }
    if (minorRedList.indexOf(minor) > -1) {
      checkPeripheral(peripheral, minor, 'red');
    }


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
    // console.log('---');
  }
});
