const fs = require( 'fs' );
const tools = require( '../tools.js' );
const deviceName = 'weight_scale';

/**
 * Start the audiometer device
 * 
 * @param Request req The request to send to the device
 * @param Response res The response returned from the device
 */
exports.start = async ( req, res ) => {
  let data = false;

  const dataDir = tools.getDataDir( deviceName, req.body.barcode );
  let error = null;
  try {
    // wrtie the input file for Cypress, run it, then read the resulting output file
    fs.writeFileSync( dataDir + '/input.json', JSON.stringify( req.body ) );
    var response = await tools.runCypress( deviceName, req.body.barcode );
    if( true === response ) {
      data = await fs.readFileSync( dataDir + '/output.json', 'utf8' );
    } else {
      error = { status: 400, message: response };
    }
  } catch( err ) {
    console.error( err );
    error = { status: 500, message: 'Internal server error' };
  };

  if( null == error ) {
    res.json( JSON.parse( data ) );
  } else {
    res.status( error.status ).send( error.message );
  }
};
