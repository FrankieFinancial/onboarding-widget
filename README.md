# Frankie Onboarding Widget

## Table of contents

- [Overview](#overview)
- [Demo](#demo)
- [Getting started](#getting-started)
- [Configuration](#configuration)

## Overview

Our self onboarding widget allowes you to connect your final customers directly with Frankie Financial's Service.
They will provide their minimum basic information, we will run all the checks you choose and then signal back to you that the Applicant is ready to be onboarded, right there in the platform it's embeded.

- The first step is to make sure you have credentials previously provided to your organisation by frankie: the Customer id and the api key. Some organisations will also have a Customer child id.
- With those in hand you'll be able to authenticate to our backend service and generate a secure temporary token that will allow the widget to connect to Frankie Services with limited permissions.
- Now you only need to provide the widget with that token and optional configuration to customise the widget's behaviour to your own goals

Simply put, the widget is just a reusable Web Component.

![Sequence](screenshots/sequence.png)

## Demo

To see the widget in action, just run the demo script in this repository, as follows.

**IF you don't have Frankie credentials** or wasn't provided a Frankie backend URL

```shell
npm install
npm run start:demo
```

The Web Component in "demo" mode is configured to not expect authentication and will always show you a successful screen in the end of the process.

**IF you have Frankie Credentials** and the Frankie backend URL

Some organisations use a specific Frankie backend and will be required to include its url in the [configuration object](#configuration) \
If your backend url doesn't include your organisation's name as a subdomain, there's no extra step.


First create a .env file with the following variables

```shell
FRANKIE_API_KEY=...
FRANKIE_CUSTOMER_ID=...
FRANKIE_CUSTOMER_CHILD_ID=... <only required if you have one>
FRANKIE_API_URL=...
```

Generate ssl keys, server.cert and server.key, in the root of this project to allow running a secure server locally

**ON MACOS** you can simply run the following helper and answer all the questions to generate the ssl keys

```shell
npm run mk-ssl
```

**Other OS**
[https://github.com/FiloSottile/mkcert](https://github.com/FiloSottile/mkcert)

and then, to run the demo script

```shell
npm install
npm run start
```

![Screenshots](screenshots/screenshots.png)

## Getting started

1. Serialise and base64 encode your Frankie Api Credentials using ":" as a separator and POST it to Frankie Financial Client Api (details in the code snippet below)
    1. "CUSTOMER_ID:API_KEY", if you don't have a CUSTOMER_CHILD_ID
    2. "CUSTOMER_ID:CUSTOMER_CHILD_ID:API_KEY, otherwise
2. The response header will contain a temporary api token
3. Define your optional configuration object, according to the section [Configuration](#configuration)
4. Add both the link to the Roboto font and the widget .js file to the head of the webpage
5. Add the web component to the page, passing the following attributes
    1. **ff**, the token
    2. **applicant-reference**, the string reference that will be injected into this applicant's data and can be used to request  their details aftwerwards, both via Frankie API and Frankie Portal
    3. *optional* **width**, the width exactly as would be defined in css (defaults to 375px)
    4. *optional* **height**, the height exactly as would be defined in css (defaults to 812px)
    5. *optional* **config**, the configuration object first stringified and then URI encoded. The algorithm needs to be compatible with Node's encodeURI. [Read more](#configuration)

## 1. Obtaining an API token

Example in Node + Express + Axios

```javascript
  // Have your Frankie credentials in hand
  const apiKey = process.env.FRANKIE_API_KEY,
        customerId = process.env.FRANKIE_CUSTOMER_ID,
        customerChildId = process.env.FRANKIE_CUSTOMER_CHILD_ID;
  // Serialize your credentials, by joining them with a ":" separator symbol
  //  customerId:customerChildId:apiKey OR customerId:apiKey
  //  where if you don't posses a customerChildId, you should omit it and the separator symbol ":" all together
  const decodedCredentials = [customerId, customerChildId, apiKey].filter(Boolean).join(":");
  // Base64 encode the resulting string
  const encodedCredentials = Buffer.from(decodedCredentials).toString('base64');
  // POST the endpoint "auth/v1/machine-session" of Frankie Client Api service, whose URL will be provided to you by Frankie
  // Include the encoded credentials in the "authorization" header, as follows
  // "authorization": `machine ${encodedCreentials}`
  // and extract the header "token" from the response
  const frankieUrl = process.env.FRANKIE_API_URL;
  axios.post(`${frankieUrl}/auth/v1/machine-session`, {}, {
    headers: { authorization: "machine " + encodedCredentials }
  }).then(response => {
    const headers = response.headers;
    const ffToken = headers.token;
    // pass the extracted token to the widget as an html attribute called 'ff' (see demo.ejs)
    res.render('the-web-page.ejs', {
      title: "Frankie Financial Widget Demo",
      ffToken: ffToken
    });
  })

```

## 2. Embeding widget

Head of the html page (link to font and the js file)

```html
  <head>
    <!-- viewport meta is recommended for responsive pages -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- initially only the Roboto font family is supported and therefore the following line is required to be included. This will be configurable in next iterations -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap" rel="stylesheet">
    <!-- Include the Web component script -->
    <script src="./ff-onboarding-widget.min.js"></script>
  </head>
```

Body of the html page, wherever desired

```html
<body style="margin: 0">
  <ff-onboarding-widget
    width="500px" height="900px"
    ff="<%= ffToken %>"></ff-onboarding-widget>
</body>
```

## Configuration

More configurations and customisations will be available soon. Right now our goals are the following.

- [x] Customize/Disable Welcome Screen
- [x] Customize accepted document types
- [x] Customize maximum attempt count
- [x] Hide the progress bar
- [x] Customize accepted country of residence
- [x] Customize success page redirect url
- [ ] Customize text throughout the widget
- [ ] Customize font
- [ ] Customize all styles freely
- [ ] Customize success page content
- [ ] Customize progress bar range, start value and end value
- [ ] Dispatch events on every step of the progress of the user to allow greater interaction between the host platform and the widget
- [ ] Create public credentials that can be used directly by the frontend, with no backend required

## All current options and their defaults

```typescript
// not necessary to change this options. It's simply a switch between "demo" and "production"
mode: 'demo' | 'production' = "production",
// if your organisation has a special Frankie Backend URL, provide it here. If that's not your case, skip this configuration.
frankieBackendUrl: string = "https://defaults-to-valid-frankie-url",
// array of accepted document types
// where DocType = 'PASSPORT' | 'DRIVERS_LICENCE' | 'NATIONAL_HEALTH_ID'
documentTypes: DocType[] = ["PASSPORT", "DRIVERS_LICENCE", "NATIONAL_HEALTH_ID"]
welcomeScreen: boolean | {
  // html string to be displayed in the welcome screen. It accepts style tags, but script tags will be stripped out.
  // the default welcome screen is available in the screenshot at the end of section "Demo" above
  htmlContent: string | boolean = false,
  ctaText: boolean | string = "Start Identity Verification"
}
// the number of times the applicant will be allowed to review personal details and try new documents before failing their application
maxAttemptCount: number = 5
// By default only a
successScreen: {
  // url to redirect after applicant clicks button in the successful page
  // by default the widget only displays a successful message
  // you can always include the applicant-reference as a query parameter to continue any remaining onboarding steps that might come after the identity verification
  ctaUrl: string | false = false
}
// If the progress bar should be rendered
progressBar: boolean = true
// A "profile" is a collection or recipe of rules and checks that you wish to perform on all of your customers.
// As part of the onboarding process with Frankie, we'll work with you to define these.
// However, the service also makes it easy to automate this and you can just use "auto" to have our rules engine work this out for you.
// Unless told otherwise by Frankie, use "auto".
checkProfile: string = "auto"
// Google api key for the address auto complete. For the demo we provide our own api automatically.
// Otherwise if this field is missing the widget will skip the address autocomplete screen.
// More information right after this code block
googleAPIKey: string | false =  false
// List of up to 5 char3 country codes to include in the country dropdown and in the address autocomplete
acceptedCountries: char3[] = ["AUS"]

```

## To obtain a Google API key

please visit the [Google Developer Console](https://console.developers.google.com/). \
The API's that you have to enable in your Google API Manager Dashboard are **Google Maps Geocoding API, Google Places API Web Service and Google Maps Javascript API**.

## Passing the configuration object to the widget

Since HTML attributes can only be strings, the configuration object needs to be serialised and URI encoded before it's included in the widget's attribute **config**

```javascript
encodeURI(JSON.stringify(widgetConfiguration));
```

Example configuration object

```javascript
  const widgetConfiguration = {
    frankieBackendUrl: "https://backend.frankiefinancial.com" // not real. don't use this value.
    documentTypes: ['PASSPORT'],
    maxAttemptCount: 2,
    welcomeScreen: {
      htmlContent: `
        <h1 class='title'>The title</h1>
        <p class='bold'>We need to collect some personal information to verify your identity before we can open your account.</p>
        <ul style=''>
          <li>We need 5 mins of your time to complete this application</li>
          <li>You must be over 16 years of age</li>
        </ul>
        <style>
          ul {
            list-style-image: url(/bullet.png);
          }
        </style>
      `,
      ctaLabel: 'Identify me!',
    }
    successScreen: {
      ctaLabel: "Create Account :)",
      ctaUrl: "https://my-organisation.com/create-account?applicant=99-custom-applicant-id&secret-tokent=hash_to_validate_99-custom-applicant-id"
    }
    progressBar: true,
    checkProfile: "customer",
    googleAPIKey: false
    acceptedCountries: ["AUS", "NZL"]
  };

```

The **config** attribute

```html
<body style="margin: 0">
  <ff-onboarding-widget
    width="500px" height="900px"
    ff="<%= ffToken %>"
    config="<%- encodeURI(JSON.stringify(widgetConfiguration)) %>"></ff-onboarding-widget>
</body>
```
