# chat seed example

## How to run

1. Locate a file `/examples/serviceAccountKey.json` which can be generated in the Firebase console.
2. Create a file `/examples/firebase-admin-config.js` like below.

```javascript
const serviceAccount = require("./serviceAccountKey.json");
const admin = require("firebase-admin");

module.exports = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://xxxxxx.firebaseio.com",
    storageBucket: "xxxxxx.appspot.com",
};
```

3. Install the dependencies with `yarn install` or `npm install`.
4. Run with `yarn run exec`.
