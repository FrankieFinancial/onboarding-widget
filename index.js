require('dotenv').config();
const express = require('express');
const axios = require("axios");
const app = express();
const port = 3000;

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.static('static'))

app.get('/', (req, res) => {

  // Have your Frankie credentials in hand
  const apiKey = process.env.FRANKIE_API_KEY,
        customerId = process.env.FRANKIE_CUSTOMER_ID,
        customerChildId = process.env.FRANKIE_CUSTOMER_CHILD_ID;
  // Set widget configurations as defined in "Configuration"
  const widgetConfiguration = {
    documentTypes: ['PASSPORT', 'DRIVERS_LICENCE', 'MEDICARE'],
    welcomeScreen: {
      // htmlContent: `
      //   <h1 class='title'>The title</h1>
      //   <p class='bold'>We need to collect some personal information to verify your identity before we can open your account.</p>
      //   <p class='bold'>You’ll need</p>
      //   <ul style=''>
      //     <li>5 mins of your time to complete this application</li>
      //     <li>You must be over 16 years of age</li>
      //   </ul>
      //   <style>
      //     ul {
      //       list-style-image: url(/bullet.png);
      //     }
      //   </style>
      // `,
      // ctaLabel: 'Start now',
    },
    maxAttemptCount: 5,
  };
  // Serialize your credentials, by joining them with a ":" separator symbol
  //  customerId:customerChildId:apiKey OR customerId:apiKey
  //  where if you don't posses a customerChildId, you should omit it and the separator symbol ":" all together
  const decodedCredentials = [customerId, customerChildId, apiKey].filter(Boolean).join(":");
  // Base64 encode the result string
  const encodedCredentials = Buffer.from(decodedCredentials).toString('base64');
  // POST the endpoint "/machine-session" of the api service provided to you by Frankie
  // Include the encoded credentials in the "authorization" header, as follows
  // "authorization": `machine ${encodedCreentials}`
  // and extract the header "token" from the response
  const frankieUrl = process.env.FRANKIE_API_URL;
  axios.post(`${frankieUrl}/auth/v1/machine-session`, {}, {
    headers: { authorization: "machine " + encodedCredentials }
  }).then(data => {
    const headers = data.headers;
    const ffToken = headers.token;
    // pass the extracted token to the widget as an html attribute called 'ff-token' (see demo.ejs)
    res.render('the-web-page.ejs', {
      title: "Frankie Financial Widget Demo",
      ffToken: ffToken,
      widgetConfiguration
    });
  })
});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))