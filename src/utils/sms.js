const request = require("request")
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat
// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

const { AT_API_KEY } = process.env

const func = ({ data: { phone, message } }, reply = console.log) => {
  const number = phoneUtil.parseAndKeepRawInput(phone, 'KE');
  const coolNumber = phoneUtil.format(number, PNF.E164)
  const Body = `${message}`

  const options = {
    method: 'POST',
    url: 'http://api.africastalking.com/version1/messaging',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
      apikey: '5e28571344b3b4abc7e1ef8193cc3a7a4f732f99504e353535910428872e7b3a',
    },
    form: {
      to: coolNumber,
      message: Body,
      username: 'Munyingi',
      from: "LKNVS_GIRLS"
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