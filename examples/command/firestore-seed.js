const seed = require('firestore-seed');

module.exports = seed.collection("messages", [
    seed.doc("message1", {
        content: "Hello firestore-seed.",
        created: new Date(),
    }),
    seed.doc("message2", {
        content: "Good bye firestore-seed.",
        created: new Date(),
    })
]);