const request = require("request")
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat
// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

const { SENDER_ID: SenderId, API_KEY: ApiKey, CLIENT_ID: ClientId } = process.env

const func = ({ data: { phone, message } }, reply = console.log) => {
  const number = phoneUtil.parseAndKeepRawInput(phone, 'KE');
  const coolNumber = phoneUtil.format(number, PNF.E164)
  const Body = `${message}`
  
  const options = {
    method: 'POST',
    url: 'http://api.uwaziimobile.com:6005/api/v2/SendSMS',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    json: {
      MobileNumbers: coolNumber.slice(1),
      Message: Body,
      SenderId,
      ApiKey,
      ClientId
    }
  }

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body)
    reply(body);
  });
}

// func({ data: { message: "Hello, and welcome", phone: "0719420491" } }, console.log)

module.exports = func