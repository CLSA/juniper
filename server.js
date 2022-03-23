const express = require( 'express' );
const tools = require( './src/tools' );
const devices = require( './src/devices' );
const app = express();

// used to decode request body into json data
app.use( express.json() );

global.TESTMODE = 2 < process.argv.length && 'test' == process.argv[2];
global.DATADIR = process.cwd() + '/data';

// Define all endpoints
app.get( '/', ( req, res ) => res.send( '"Juniper is online"' ) );

for( const name in devices ) {
  console.log( 'Creating ' + name + ' endpoint' );
  app.post( '/'+name, async ( req, res ) => {
    console.log( 'POST /' + name + ' request received from ' + tools.getAddress( req ) );
    await devices[name].start( req, res )
  } );
}

// Start the server
const PORT = 8080;
const server = app.listen( PORT, () => console.log( 'HTTP server listening to port ' + PORT ) );
const io = require( 'socket.io' )( server );
io.on( 'connection', ( socketServer ) => socketServer.on( 'npmStop', () => { process.exit( 0 ); } ) );
