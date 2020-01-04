import * as admin from "firebase-admin";
import config from "../firebase-admin-config.js";
import * as seed from 'firestore-seed';

// Initialize firebase-admin with the imported configuration.
admin.initializeApp(config);

// Import seeds.
const messagesCollection = seed.collection("messages", [
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
}).catch((e: any) => {
    console.log("Failed to import documents: " + e);
});
