// https://github.com/sandeepmistry/noble
// http://www.warski.org/blog/2014/01/how-ibeacons-work/

// test BLEs
// ctfb01: uuid 11c746e6b8204553832af679a89c34c9
// ctfr01: uuid 941da9dbecf04020ab915ff37a3e28d1

var noble = require('noble');
var scanTimeout;
var serviceUUIDs = ['0x180A'];
var allowDuplicates = false;

function startScan() {
  console.log('startScan()');
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(stopScan, 10000);
  noble.startScanning(serviceUUIDs, allowDuplicates);
}

function stopScan() {
  console.log('stopScan()');
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(startScan, 10000);
  noble.stopScanning();
}

noble.on('stateChange', function (state) {
  console.log('noble on stateChange -', state);
  if (state === 'poweredOn') {
    startScan();
  } else {
    clearTimeout(scanTimeout);
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  var peripheralName = peripheral.advertisement.localName;
  var serviceData = peripheral.advertisement.serviceData;
  console.log('### peripheral name', peripheralName, 'UUID', peripheral.uuid, 'rssi:', peripheral.rssi);

  // for(var p in peripheral.advertisement) {
  //   console.log('\t\t advertisement ->', p, peripheral.advertisement[p]);
  //   // console.log('\t\t serviceData ->', p, serviceData[p]);
  // }

  // if (peripheralName !== undefined && peripheralName.indexOf('ctf') === 0) {
    console.log('\thello my local name is: ' + peripheral.advertisement.localName);
    console.log('peripheral discovered (' + peripheral.uuid + '):');

    if (peripheral.advertisement.manufacturerData) {
      console.log('\t', peripheral.advertisement.manufacturerData);

      var d = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'));

      var major = d.substr(d.length - 11, 4);
      var minor = d.substr(d.length - 7, 4);

      minor = parseInt(minor, 16);
      console.log('minor:', minor, 'major:', major)
      console.log('\there is my manufacturer data:' + JSON.stringify(peripheral.advertisement.manufacturerData));
      console.log('\there is my manufacturer data:' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
    }
    if (peripheral.advertisement.txPowerLevel !== undefined) {
      console.log('\tmy TX power level is:' + peripheral.advertisement.txPowerLevel);
    }
    console.log('rssi ->', peripheral.rssi)
    console.log('---');
  // }
});
