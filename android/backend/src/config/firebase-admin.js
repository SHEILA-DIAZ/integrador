const { initializeApp, cert, getApps } = require("firebase-admin/app");
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(
    path.join(__dirname, "../../credentials/firebase-admin.json")
);

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

module.exports = admin;