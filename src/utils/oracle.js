/*
   Version 1.0.1
   Before running this example, install necessary dependencies by running:
   npm install http-signature jssha
*/
const fs = require('fs');
const https = require('https');
const os = require('os');
const httpSignature = require('http-signature');
const jsSHA = require("jssha");
// TODO: update these values to your own
const {
    TENACY_ID: tenancyId,
    AUTH_USER_ID: authUserId,
    KEY_FINGERPRINT: keyFingerprint,
    OBJECT_STORAGE_DOMAIN: objectstorageDomain,
    NAMESPACE,
    BUCKET_NAME
} = process.env

let { PK_PATH: privateKeyPath } = process.env

if(privateKeyPath.indexOf("~/") === 0) {
   privateKeyPath = privateKeyPath.replace("~", os.homedir())
}
const privateKey = fs.readFileSync(privateKeyPath, 'ascii');
// signing function as described at https://docs.cloud.oracle.com/Content/API/Concepts/signingrequests.htm
function sign(request, options) {
   const apiKeyId = options.tenancyId + "/" + options.userId + "/" + options.keyFingerprint;
   let headersToSign = [
       "host",
       "date",
       "(request-target)"
   ];
   const methodsThatRequireExtraHeaders = ["POST", "PUT"];
   if(methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {
       options.body = options.body || "";
       const shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
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
   const newAuthHeaderValue = request.getHeader("Authorization").replace("Signature ", "Signature version=\"1\",");
   request.setHeader("Authorization", newAuthHeaderValue);
   request.setHeader("date", new Date().toGMTString())
}

// generates a function to handle the https.request response object
function handleRequest(callback){
    return function(response) {
        let responseBody = "";
        response.on('data', function(chunk){
            responseBody += chunk;
        });
        response.on('end', function(){
            callback(responseBody, response.statusCode);
        });
    }
}
// upload to object storage
const UploadFile = (file, filename, callback) => {
    const options = {
        host: objectstorageDomain,
        path: `/n/${NAMESPACE}/b/${BUCKET_NAME}/o/${filename}`,
        method: 'PUT',
        encoding: null,
        headers: {
            "Content-Type": "application/octet-stream",
        }
    };
    let body = file
    const request = https.request(options, handleRequest(callback));
    sign(request, {
        body: body,
        privateKey: privateKey,
        keyFingerprint: keyFingerprint,
        tenancyId: tenancyId,
        userId: authUserId
    });
    request.end(body);
};

// let file = fs.readFileSync('./testfile.pdf')
// let filename = 'testfile'
// UploadFile(file, filename, function(data, status){
//  console.log(data)
//  console.log(status)
//  if (status===200){
//      //save url to db
//      let path = `/n/frnzo93w13oq/b/erp_staging/o/${filename}`
//      let url = `https://${objectstorageDomain}${path}`
//      console.log(url)
//  }
//  else{
//      //return error
//  }
// })

const upload = (req, res, next) => {
    const file = fs.readFileSync(req.file.path)
    const filename = req.file.filename

    UploadFile(file, filename, function(data, status){
        console.log(data)
        console.log(status)
        if (status === 200){
           //save url to db
           let path = `/n/${NAMESPACE}/b/${BUCKET_NAME}/o/${filename}`
           let url = `https://${objectstorageDomain}${path}`
           console.log(url)
           res.json({ url })
        }
        else{
           next(new Error('File could not be uploaded'))
        }
    })
}

export {
    upload,
    UploadFile
}
