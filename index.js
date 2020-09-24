require('dotenv-flow').config();
const fs = require("fs");
const express = require('express');
const https = require("https");
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
    // Set the applicant reference to any string you can use to identify this applicant
    const applicantReference = Math.floor(Math.random() * 9999) + "-new-applicant";
    // Set widget configurations as defined in "Configuration"
    const widgetConfiguration = {
        mode: process.env.NODE_ENV,
        documentTypes: ['PASSPORT', 'DRIVERS_LICENCE', 'NATIONAL_HEALTH_ID'],
        maxAttemptCount: 5,
        googleAPIKey: process.env.GOOGLE_API || false,
        frankieBackendUrl: process.env.FRANKIE_API_URL,
        checkProfile: process.env.CHECK_PROFILE,
        acceptedCountries: ["AUS", "NZL"],
        requestAddress: true,
        consentText: "I agree with the terms described in the Consent section of the Company's webpage",
        successScreen: {
            ctaUrl: "javascript:ffSuccess('Success: " + applicantReference + "')"
        },
        failureScreen: {
            ctaUrl: "javascript:ffSuccess('Failure: " + applicantReference + "')"
        }
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
    const render = (ffToken) => {
        res.render('the-web-page.ejs', {
            title: "Frankie Financial Widget Demo",
            ffToken: ffToken || "",
            widgetConfiguration,
            applicantReference
        });
    }
    if (process.env.NODE_ENV === 'demo') {
        render();
    } else {
        axios.post(`${frankieUrl}/auth/v1/machine-session`, {}, {
            headers: { authorization: "machine " + encodedCredentials }
        }).then(data => {
            const headers = data.headers;
            const ffToken = headers.token;
            // pass the extracted token to the widget as an html attribute called 'ff-token' (see demo.ejs)
            render(ffToken);
        }).catch(console.error);
    }
});

let server, protocol;
if (process.env.NODE_ENV === 'demo') {
    protocol = "http";
    server = app;
} else {
    protocol = "https";
    server = https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app)
}

server.listen(port, () => console.log(`Example app listening on port ${port}! Go to ${protocol}://127.0.0.1:${port}/`));