var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// });

app.get('/', function(req, res){
  res.sendfile('index.html');
});



io.on('connection', function(socket){
  console.log('a user connected');

  // https://github.com/sandeepmistry/noble

  // test GeLo BLEs
  // http://www.getgelo.com/beacons/

  var GAME_DURATION     = 150000; // 2.5 min
  var SCAN_DURATION     = 5000;   // 5 sec
  var SCAN_BREAK_DELAY  = 5000;   // 5 sec
  var BLE_RSSI_MIN      = -60;



  var minorBlueList = [6077,6078, 6079];
  var minorRedList = [6070,6073, 6072];


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
    // socket.emit('currentround', { blue: blueCounter, red: redCounter });
    // socket.on('current round', function (data) {
    //   console.log('data', data);
    // });
    console.log('current round counters -> red:', redCounter, ' blue:', blueCounter);
    if (blueCounter > redCounter) {
        socket.emit('bluewinner', { blue: 'Blue Team Captured' });
        socket.on('blue team captured', function (data) {
          console.log('data', data);
        });
      // console.log('Blue Team captured the flag');
      teamsScore.blue++;
    } else if (blueCounter < redCounter) {
        socket.emit('redwinner', { red: 'Red Team Captured' });
        socket.on('red team captured', function (data) {
          console.log('data', data);
        });
      // console.log('Red Team captured the flag');
      teamsScore.red++;
    } else {
        socket.emit('nowinner', { no: 'No team scores' });
        socket.on('no team', function (data) {
          console.log('data', data);
        });
      // console.log('No team scores, we got even players from both teams or none.');
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

    socket.emit('gameend', {
        end: 'Game Finished',
        blue: teamsScore.blue,
        red: teamsScore.red
     });
    socket.on('game end', function (data) {
      console.log('data', data);
    });
    // console.log('# GameOver()');
    // console.log('------');
    // console.log('Score');

    // console.log('\t BLUE -> ', teamsScore.blue);
    // console.log('\t RED -> ', teamsScore.red);

    clearTimeout(scanTimeout);
    noble.stopScanning();
  }

  function checkPeripheral(peripheral, beanId, team) {
    // check team color
    //
    // check timestamp

    if (peripheral.rssi > BLE_RSSI_MIN) {
      console.log('[' + team + '] beanId:', beanId, ' -- Valid Range!!!!', peripheral.rssi);
      console.log('----');

      // current ble
      nearBles.push({
        name: beanId,
        team: team,
        timestamp: Date.now()
      });


    } else {
      console.log('beanId:', beanId,'out of range', peripheral.rssi, peripheral.advertisement.localName);
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

    if (peripheral.advertisement.manufacturerData) {

      var d = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'));
      var major = d.substr(d.length - 11, 4);
      var minor = d.substr(d.length - 7, 4);

      minor = parseInt(minor, 16);

      if (minorBlueList.indexOf(minor) > -1) {
        checkPeripheral(peripheral, minor, 'blue');
      }
      if (minorRedList.indexOf(minor) > -1) {
        checkPeripheral(peripheral, minor, 'red');
      }
    }
  });


  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

















http.listen(3000, function(){
  console.log('listening on *:3000');
});