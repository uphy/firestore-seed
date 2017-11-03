const admin = require("firebase-admin");
const config = require("../firebase-admin-config.js");
const seed = require('firestore-seed');

// Initialize firebase-admin with the imported configuration.
admin.initializeApp(config);

// Import seeds.
let messagesCollection = seed.collection("messages", [
    seed.doc("message1", {
        content: "Hello firestore-seed.",
        created: new Date(),
    }),
    seed.doc("message2", {
        content: "Good bye firestore-seed.",
        created: new Date(),
    })
]);

messagesCollection.importDocuments(admin).then(() => {
    console.log("Successfully imported documents.");
}).catch(e => {
    console.log("Failed to import documents: " + e);
});
