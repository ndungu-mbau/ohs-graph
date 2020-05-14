/*
    Version 1.0.1
    Before running this example, install necessary dependencies by running:
    npm install http-signature jssha
*/
var fs = require('fs');
var https = require('https');
var os = require('os');
var httpSignature = require('http-signature');
var jsSHA = require("jssha");
// TODO: update these values to your own
var tenancyId = "ocid1.tenancy.oc1..aaaaaaaamxlld7eepdf7lc225qayjajzh37l2fu3lyge4vx3uds5bhhzf3ua";
var authUserId = "ocid1.user.oc1..aaaaaaaa2c33ggfi7wi3xjydoowx23glcxyzjablbd4pa3fka4lawuait5ya";
var keyFingerprint = "aa:47:97:79:12:3a:65:bc:4c:6f:20:d4:1e:57:e1:81";
var privateKeyPath = "~/.oci/ocidevhost_api_key.pem";
let objectstorageDomain = 'objectstorage.eu-frankfurt-1.oraclecloud.com'
if(privateKeyPath.indexOf("~/") === 0) {
    privateKeyPath = privateKeyPath.replace("~", os.homedir())
}
var privateKey = fs.readFileSync(privateKeyPath, 'ascii');
// signing function as described at https://docs.cloud.oracle.com/Content/API/Concepts/signingrequests.htm
function sign(request, options) {
    var apiKeyId = options.tenancyId + "/" + options.userId + "/" + options.keyFingerprint;
    var headersToSign = [
        "host",
        "date",
        "(request-target)"
    ];
    var methodsThatRequireExtraHeaders = ["POST", "PUT"];
    if(methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {
        options.body = options.body || "";
        var shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
        shaObj.update(options.body);
        request.setHeader("Content-Length", options.body.length);
        request.setHeader("x-content-sha256", shaObj.getHash('B64'));
        headersToSign = headersToSign.concat([
            "content-type",
            "content-length",
            "x-content-sha256"
        ]);
    }
    httpSignature.sign(request, {
        key: options.privateKey,
        keyId: apiKeyId,
        headers: headersToSign
    });
    var newAuthHeaderValue = request.getHeader("Authorization").replace("Signature ", "Signature version=\"1\",");
    request.setHeader("Authorization", newAuthHeaderValue);
    request.setHeader("date", new Date().toGMTString())
}
// generates a function to handle the https.request response object
function handleRequest(callback) {
    return function(response) {
        var responseBody = "";
        response.on('data', function(chunk) {
            responseBody += chunk;
        });
        response.on('end', function() {
            callback(responseBody);
        });
    }
}
// upload to object storage
function UploadFile(file, filename, callback) {
  var options = {
      host: objectstorageDomain,
      path: `/n/frnzo93w13oq/b/erp_staging/o/${filename}`,
      method: 'PUT',
      encoding: null,
        headers: {
            "Content-Type": "application/octet-stream",
        }
  };
  let body = file
  var request = https.request(options, handleRequest(callback));
  sign(request, {
      body: body,
      privateKey: privateKey,
      keyFingerprint: keyFingerprint,
      tenancyId: tenancyId,
      userId: authUserId
  });
  request.end(body);
};
let file = fs.readFileSync('./testfile.pdf')
UploadFile(file, 'testfile', function(data){
  console.log(data)
})