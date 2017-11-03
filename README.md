# firestore-seed

`firestore-seed` insert initial seed data to [Cloud Firestore](https://firebase.google.com/docs/firestore/).

Not tested at all.  Use this at your own lisk.

## Getting started

Add firestore-seed to your project.

```sh
$ yarn add firestore-seed
```

Create a simple seed program.

```javascript
const admin = require("firebase-admin");
// serviceAccountKey.json can be generated in Firebase Console.
const serviceAccountKey = require("./serviceAccountKey.json");
const seed = require('firestore-seed');

// Initialize firebase-admin.
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://xxxxxx.firebaseio.com",
    storageBucket: "xxxxxx.appspot.com",
});

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
```

## Uploading files

You can also upload files to the Firebase Cloud Storage and add the download URL to the Firestore documents.

```javascript
const admin = require("firebase-admin");
// serviceAccountKey.json can be generated in Firebase Console.
const serviceAccountKey = require("./serviceAccountKey.json");
const seed = require('firestore-seed');

// Initialize firebase-admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://xxxxxx.firebaseio.com",
    storageBucket: "xxxxxx.appspot.com",
});

// Import seeds.
let imageOptions = seed.imageOptions("images/{id}", "public/profiles/{id}")
let profilesCollection = seed.collection("profiles", [
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

profilesCollection.importDocuments(admin).then(() => {
    console.log("Successfully imported documents.");
}).catch(e => {
    console.log("Failed to import documents: " + e);
});
```

## Subcollections

For inserting subcollections, use `seed.subcollection(docs)`.

```javascript
const admin = require("firebase-admin");
// serviceAccountKey.json can be generated in Firebase Console.
const serviceAccountKey = require("./serviceAccountKey.json");
const seed = require('firestore-seed');

// Initialize firebase-admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://xxxxxx.firebaseio.com",
    storageBucket: "xxxxxx.appspot.com",
});

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
```