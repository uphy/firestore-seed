const admin = require("firebase-admin");
const config = require("../firebase-admin-config.js");
const seed = require('firestore-seed');

// Initialize firebase-admin with the imported configuration.
admin.initializeApp(config);

// Import seeds.
seed.importCollections(admin,
    [
        seed.collection("users", [
            seed.doc("uphy", {
                name: 'Yuhi Ishikura',
                rooms: seed.subcollection([
                    seed.doc("room1", {
                        "ref": seed.docRef("rooms", "room1")
                    }),
                    seed.doc("room2", {
                        "ref": seed.docRef("rooms", "room2")
                    })
                ])
            }),
            seed.doc("suzuki", {
                name: 'Taro Suzuki',
                rooms: seed.subcollection([
                    seed.doc("room1", {
                        "ref": seed.docRef("rooms", "room1")
                    }),
                    seed.doc("room2", {
                        "ref": seed.docRef("rooms", "room2")
                    })
                ]),
            }),
            seed.doc("tanaka", {
                name: 'Tanaka Jiro',
                rooms: seed.subcollection([
                    seed.doc("room2", {
                        "ref": seed.docRef("rooms", "room2")
                    })
                ]),
            })
        ]),
        seed.collection("rooms", [
            seed.doc("room1", {
                name: "Room 1",
                messages: seed.subcollection([
                    seed.doc("message1", {
                        time: Date.now(),
                        content: "Message 1 of room1",
                        user: seed.docRef("users", "uphy")
                    }),
                    seed.doc("message2", {
                        time: Date.now(),
                        content: "Message 2 of room1",
                        user: seed.docRef("users", "suzuki")
                    })
                ])
            }),
            seed.doc("room2", {
                name: "Room 2",
                messages: seed.subcollection([
                    seed.doc("message1", {
                        time: Date.now(),
                        content: "Message 1 of room2",
                        user: seed.docRef("users", "uphy")
                    }),
                    seed.doc("message2", {
                        time: Date.now(),
                        content: "Message 2 of room2",
                        user: seed.docRef("users", "suzuki")
                    }),
                    seed.doc("message3", {
                        time: Date.now(),
                        content: "Message 3 of room2",
                        user: seed.docRef("users", "tanaka")
                    })
                ])
            })
        ])
    ]
).then(() => {
    console.log("Successfully imported documents.");
}).catch(e => {
    console.log("Failed to import documents: " + e);
});
