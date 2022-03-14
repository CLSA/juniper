const tools = require( '../tools.js' );

/**
 * Start the audiometer device
 * 
 * @param Request req The request to send to the device
 * @param Response res The response returned from the device
 */
const deviceName = 'audiometer';

exports.start = async ( req, res ) => {
  console.log( 'POST /' + deviceName + ' request received from ' + tools.getAddress( req ) );
  let response = await tools.sendToCypress( deviceName, '-a ' + req.body.key1 + ' -b ' + req.body.key2 );
  console.log( 'POST /' + deviceName + ' request processed' );
  res.send( response ? 'true' : 'false' );
};
