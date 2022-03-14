const express = require( 'express' );
const devices = require( './libs/devices' );

// used to run processes on the local machine
const util = require( 'util' );
const exec = util.promisify( require( 'child_process' ).exec );
const app = express();

// used to decode request body into json data
app.use( express.json() );

// An easy way to confirm that Juniper is running
app.get( '/', ( req, res ) => res.send( '"Juniper is online"' ) );

for( const name in devices ) {
  console.log( 'Creating ' + name + ' endpoint' );
  app.post( '/'+name, async ( req, res ) => devices[name].start( req, res ) );
}

// Start the server
const PORT = 8080;
const server = app.listen( PORT, () => console.log( 'HTTP server listening to port ' + PORT ) );
const io = require( 'socket.io' )( server );
io.on( 'connection', ( socketServer ) => socketServer.on( 'npmStop', () => { process.exit( 0 ); } ) );
