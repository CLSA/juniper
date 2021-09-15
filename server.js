const express = require( 'express' );

// used to run processes on the local machine
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );

const app = express();

// used to decode request body into json data
app.use( express.json() );

// An easy way to confirm that Juniper is running
app.get( '/', (req, res) => {
  res.send( '"Juniper is online"' );
} );

// Returns the remote address from the request object
function getAddress( req ) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// The execution function used to communicate with Cypress
async function sendToCypress( module, params ) {
  console.log( 'sending "' + module + '" command to cypress' );
  let result = null;
  let success = false;
  try {
    result = await exec( 'ping 127.0.0.1 -n 3' );
    success = true;
  } catch( err ) {
    result = err;
  }

  // note that result has stdout and stderr, either of which may be helpful
  console.log(
    'command "' + module + '" ' +
    ( success ? 'completed with result' : 'failed with error' ) +
    ':\n' + result.stdout
  );
}

// Start the spirometer
app.post( '/spirometer', ( req, res ) => {
  console.log( 'POST /spirometer request received from ' + getAddress( req ) );
  sendToCypress( 'spirometer', '-a ' + req.body.key1 + ' -b ' + req.body.key2 );
  console.log( 'POST /spirometer request processed' );
  res.sendStatus( 200 );
} );

// Start the cognitive
app.post( '/cognitive', ( req, res ) => {
  console.log( 'POST /cognitive request received from ' + getAddress( req ) );
  sendToCypress( 'cognitive', '-a ' + req.body.key1 + ' -b ' + req.body.key2 );
  console.log( 'POST /cognitive request processed' );
  res.sendStatus( 200 );
} );

// Start the server
const PORT = 8080;
const server = app.listen( PORT, () => {
  console.log( 'HTTP server listening to port ' + PORT );
} );

// Now for the socket.io stuff - NOTE THIS IS A RESTFUL HTTP SERVER
// We are only using socket.io here to respond to the npmStop signal
// To support IPC (Inter Process Communication) AKA RPC (Remote P.C.)
const io = require( 'socket.io' )( server );
io.on( 'connection', ( socketServer ) => {
  socketServer.on( 'npmStop', () => { process.exit( 0 ); } );
} );
