const decodedToken = await admin.auth().verifyIdToken(idToken);

const email = decodedToken.email;
const nombre = decodedToken.name;
const photo = decodedToken.picture;