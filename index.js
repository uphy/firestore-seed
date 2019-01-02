const fs = require('fs');
const path = require('path');
const uuid = require('node-uuid');

function fileExist(file) {
    try {
        fs.statSync(file);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Upload the specified file to the destination.
 *
 * @param {string} file the local path of the file
 * @param {string} destination the remote path of the file
 * @param {boolean} force if true, upload even if the file exists
 * @return {Promise.<string>} download url for the file
 */
function uploadFile(bucket, file, destination, force) {
    if (destination.startsWith("/")) {
        destination = destination.substring(1);
    }
    // check if the file exists locally.
    if (fileExist(file) == false) {
        return new Promise((resolve, reject) => {
            reject(new Error("file not found: " + file));
        });
    }
    return new Promise((resolve, reject) => {
        // check whether the file exists or not
        bucket.file(destination).exists().then(exist => {
            resolve(exist[0]);
        }).catch(e => {
            reject(e);
        });
    }).then(exist => {
        // upload file
        return new Promise((resolve, reject) => {
            if (exist == false || force) {
                bucket.upload(file, { destination: destination }).then(r => {
                    resolve(null);
                }).catch(e => {
                    reject(e);
                });
            } else {
                resolve(null);
            }
        })
    }).then(() => {
        // get metadata
        return new Promise((resolve, reject) => {
            bucket.file(destination).getMetadata().then(metadata => {
                resolve(metadata[0]);
            }).catch(e => {
                reject(e);
            })
        })
    }).then(metadata => {
        // update "firebaseStorageDownloadTokens" metadata
        return new Promise((resolve, reject) => {
            var token;
            if (metadata && metadata["firebaseStorageDownloadTokens"]) {
                token = metadata["firebaseStorageDownloadTokens"];
                resolve(token);
            } else {
                token = uuid.v4();
                metadata = metadata || {};
                metadata["firebaseStorageDownloadTokens"] = token;
                bucket.file(destination).setMetadata(metadata).then(() => {
                    resolve(token);
                }).catch(r => {
                    reject(r);
                });
            }
        });
    }).then(token => {
        // generate download url
        //var url = "https://firebasestorage.googleapis.com/v0/b/fuzoroinomori-4b4d1.appspot.com/o/public%2Fitems%2F59qsMV4SzaACDNT2Kx85.jpg?alt=media&token=7f4f487a-c24c-4d70-b5ab-f01ddf34cf75"
        var url = "https://firebasestorage.googleapis.com/v0/b/"
            + bucket.name
            + "/o/"
            + encodeURIComponent(destination)
            + "?alt=media&token="
            + token;
        return new Promise((resolve, reject) => {
            resolve(url);
        });
    });
}

class Image {
    constructor(localPath, remotePath, imageOptions) {
        this.localPath = localPath;
        this.remotePath = remotePath;
        this.downloadURL = null;
        if (imageOptions != null) {
            this.localPath = path.join(imageOptions.localDir, localPath);
            this.remotePath = path.join(imageOptions.remoteDir, remotePath);
        }
    }
    upload(bucket, docId) {
        return new Promise((resolve, reject) => {
            if (this.downloadURL != null) {
                resolve(this.downloadURL);
                return;
            }
            var fixedLocalPath = this.localPath.replace(/\{id\}/, docId);
            var fixedRemotePath = this.remotePath.replace(/\{id\}/, docId);
            if (fileExist(fixedLocalPath) == false) {
                reject(new Error("file not found: " + fixedLocalPath));
                return;
            }
            uploadFile(bucket, fixedLocalPath, fixedRemotePath).then(url => {
                this.downloadURL = url;
                resolve(this.downloadURL);
            }).catch(e => {
                reject(e);
            });
        });
    }
}

class ImageOptions {
    constructor(localDir, remoteDir) {
        this.localDir = localDir;
        this.remoteDir = remoteDir;
    }
}

class GeoPoint {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

class Document {
    constructor(id, data) {
        if (id == null) {
            throw new Error("id==null");
        }
        this.id = id;
        this.data = data;
    }
}

class DocumentRef {
    constructor(collection, document) {
        this.collection = collection;
        this.document = document;
    }
}

class Subcollection {
    constructor(docs) {
        this.docs = docs;
    }
}

const DELETE = "__delete__";

class Context {
    constructor(doc, docRef) {
        this.postDocActions = [];
        this.doc = doc;
        this.docRef = docRef;
    }
}

class Collection {
    constructor(name, docs, collection) {
        this.name = name;
        this.docs = docs;
        this.collection = collection;
    }
    getCollection(firestore) {
        if (this.collection == null) {
            // root
            return firestore.collection(this.name);
        } else {
            return this.collection;
        }
    }
    importDocuments(admin) {
        let self = this;
        let firestore = admin.firestore();
        function filterDocument(context) {
            function filterObject(context, key, o) {
                let parentDocID = context.doc.id;
                var p = [];
                var filteredObject = o;
                if (o instanceof Image) {
                    var bucket = admin.storage().bucket();
                    p.push(o.upload(bucket, parentDocID).then(url => {
                        filteredObject = url;
                    }));
                } else if (o instanceof DocumentRef) {
                    filteredObject = firestore.collection(o.collection).doc(o.document);
                } else if (o instanceof Subcollection) {
                    let subcollectionRef = self.getCollection(firestore).doc(context.doc.id).collection(key);
                    let subcollection = new Collection(o.name, o.docs, subcollectionRef);
                    filteredObject = DELETE;
                    context.postDocActions.push(() => subcollection.importDocuments(admin));
                } else if (o instanceof GeoPoint) {
                    filteredObject = new admin.firestore.GeoPoint(o.latitude, o.longitude);
                } else if (o instanceof Date) {
                    filteredObject = admin.firestore.Timestamp.fromDate(o);
                } else if (o instanceof admin.firestore.Timestamp) {
                    filteredObject = o;
                } else if (o instanceof Array || o instanceof Object) {
                    filteredObject = o instanceof Array ? Array(o.length) : {};
                    for (let i in o) {
                        p.push(filterObject(context, i, o[i]).then(filteredChild => {
                            if (filteredChild !== DELETE) {
                                filteredObject[i] = filteredChild;
                            }
                        }));
                    }
                }
                return Promise.all(p).then(() => {
                    return new Promise((resolve, reject) => {
                        resolve(filteredObject);
                    });
                });
            }
            return new Promise((resolve, reject) => {
                let doc = context.doc;
                let id = doc.id;
                return filterObject(context, null, doc.data).then(filteredData => {
                    resolve(new Document(id, filteredData));
                }).catch(e => {
                    reject(e);
                });
            });
        }
        let p = [];
        let collection = this.getCollection(firestore);
        this.docs.forEach(d => {
            let docRef = collection.doc(d.id);
            let context = new Context(d, docRef);
            p.push(filterDocument(context).then(filteredDoc => {
                return docRef.set(filteredDoc.data).then(() => {
                    let postDocResults = [];
                    context.postDocActions.forEach(postDocAction => {
                        postDocResults.push(postDocAction());
                    });
                    return Promise.all(postDocResults);
                });
            }));
        });
        return Promise.all(p);
    }
}

module.exports = {
    doc(id, data) {
        return new Document(id, data);
    },
    docRef(collection, document) {
        if (document == null) {
            let s = collection.split("/")
            if (s.length != 2) {
                throw new Error("unsupported format collection: " + collection);
            }
            collection = s[0];
            document = s[1];
        }
        return new DocumentRef(collection, document);
    },
    image(localPath, remotePath, imageOptions) {
        return new Image(localPath, remotePath, imageOptions);
    },
    imageOptions(localDir, remoteDir) {
        return new ImageOptions(localDir, remoteDir);
    },
    geoPoint(latitude, longitude) {
        return new GeoPoint(latitude, longitude);
    },
    collection(name, docs) {
        return new Collection(name, docs);
    },
    subcollection(docs) {
        return new Subcollection(docs);
    },
    importCollections(admin, collections) {
        return Promise.all(collections.map(collection => collection.importDocuments(admin)));
    }
};
