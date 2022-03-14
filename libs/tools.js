/**
 * Returns the remote address from the request object
 * 
 * @param Request req The request to get the address from
 */
exports.getAddress = ( req ) => req.headers['x-forwarded-for'] || req.connection.remoteAddress;

/**
 * The execution function used to communicate with Cypress
 * 
 * @param string module The name fo the module to communicate with
 */
exports.sendToCypress = async ( module ) => {
  console.log( 'Sending "' + module + '" command to cypress' );
  let result = null;
  let success = false;
  try {
    result = await exec( 'sleep 3' );
    success = true;
  } catch( err ) {
    result = err;
  }

  // note that result has stdout and stderr, either of which may be helpful
  console.log(
    'Command "' + module + '" ' +
    ( success ? 'completed with result' : 'failed with error' ) +
    ':\n' + result.stdout
  );

  return success;
};
