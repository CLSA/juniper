const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 * Determines if a variable is an object (null is not considered an object by this function)
 *
 * @param mixed value
 */
exports.isObject = (value) => value !== null && "object" === typeof value;

/**
 * Returns the remote address from the request object
 *
 * @param Request req The request to get the address from
 */
exports.getAddress = (req) =>
  req.headers["x-forwarded-for"] || req.connection.remoteAddress;

/**
 * Determines the data directory to write files given the device name and barcode
 *
 * Note that this will create the directory if it doesn't already exist.
 * @param string deviceName The name of the device
 * @param string barcode The barcode identifying the participant
 */
exports.getDataDir = (deviceName, barcode) => {
  // first make sure the device's directory exists
  const deviceDir = process.env.DATADIR + "/" + deviceName;
  if (!fs.existsSync(deviceDir)) fs.mkdirSync(deviceDir);

  // next make sure the participant's directory exists
  const dataDir = deviceDir + "/" + barcode;
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  return dataDir;
};

/**
 * Executes the cypress command
 *
 * @param string deviceName The name fo the device to communicate with
 * @param string barcode The barcode identifying the participant
 * @param object args Additional arguments to use when running Cypress
 * @return mixed True if successful, a string describing the error if not.
 */
exports.runCypress = async (deviceName, barcode, args) => {
  console.log('Sending "' + deviceName + '" command to cypress');

  // build the command line argument string
  let argString = util.format('-m "%s"', deviceName);
  if (exports.isObject(args))
    for (const key in args) {
      argString += " " + key + ' "' + args[key] + '"';
    }

  let result = true;

  if (global.TESTMODE) {
    // write the sample file to the output var
    const data = fs.readFileSync(
      ["doc", "sample_device_files", deviceName, "output.json"].join("/"),
      "utf8"
    );
    fs.writeFileSync(
      exports.getDataDir(deviceName, barcode) + "/output.json",
      data
    );
    await exec("sleep 2");
  } else {
    var response = await exec(`Cypress -m simulate -t ${deviceName}`);
    console.log(response);
  }

  return result;
};
