const admin = require("firebase-admin");
const config = require("../firebase-admin-config.js");
const seed = require('firestore-seed');

// Initialize firebase-admin with the imported configuration.
admin.initializeApp(config);

// Import seeds.
const imageOptions = seed.imageOptions("images/{id}", "public/profiles/{id}")
const messagesCollection = seed.collection("profiles", [
    seed.doc("uphy", {
        name: "foo",
        introduction: "Hello, I'm foo.",
        created: new Date(),
        // Upload 'images/uphy/image.png' to 'public/profiles/uphy/image.png' and set its' download URL to this field.
        icon: seed.image("image.png", "image.png", imageOptions)
    }),
    seed.doc("yhpu", {
        name: "bar",
        introduction: "Hello, I'm bar.",
        content: "Good bye firestore-seed.",
        created: new Date(),
        // Upload 'images/yhpu/image.png' to 'public/profiles/yhpu/image.png' and set its' download URL to this field.
        icon: seed.image("image.png", "image.png", imageOptions)
    })
]);

messagesCollection.importDocuments(admin).then(() => {
    console.log("Successfully imported documents.");
}).catch(e => {
    console.log("Failed to import documents: " + e);
});
