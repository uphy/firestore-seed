import * as admin from "firebase-admin";
import * as path from 'path';
import * as fs from 'fs';

import seed = require('./index');

/*
 * Read configs
 */
interface Config {
    databaseURL: string
    credentialPath?: string
    seedDataPath?: string
    storageBucketPath?: string
}

const cwd = process.cwd();
const readJSONFile = (name: string): any => {
    return JSON.parse(fs.readFileSync(path.join(cwd, name), "utf-8"));
}

// read "firestore-seed" property in package.json
const config: Config = readJSONFile("package.json")['firestore-seed'] as Config;
if (config === undefined) {
    console.log(`"firestore-seed" property must be contains in 'package.json'.`);
    process.exit(1);
}
// read configs from package.json.
if (config.credentialPath === undefined) {
    config.credentialPath = path.join(cwd, "firebase-credential.json");
}
if (config.seedDataPath === undefined) {
    config.seedDataPath = "firestore-seed.js";
}
if (config.databaseURL === undefined) {
    console.log(`"databaseURL" is required parameter.`);
    process.exit(1);
}

/*
 * Import seed data.
 */
(async function () {
    const serviceAccount = readJSONFile(config.credentialPath!) as admin.ServiceAccount;
    const seedDataPath = path.join(cwd, config.seedDataPath!);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: config.databaseURL,
        storageBucket: config.storageBucketPath,
    });

    const seedDataRaw = (await import(seedDataPath)).default;
    let seedData: any;
    if (seedDataRaw instanceof Array) {
        seedData = seedDataRaw;
    } else {
        seedData = [seedDataRaw];
    }
    try {
        await seed.importCollections(admin, seedData);
        console.log("Successfully imported documents.");
    } catch (e) {
        console.log("Failed to import documents: " + e);
    }
}())
