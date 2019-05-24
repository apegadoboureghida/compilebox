var admin = require('firebase-admin');

var FirebaseApp = function () {
    var serviceAccount = require("./codeathon-itss-firebase-adminsdk-0r8ms-c4e5de9ddb.json");

    let app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://codeathon-itss.firebaseio.com"
    });

    let db = app.database();

    db.ref("challenges/").on("value", (snapshot) => {
        this.challenges = snapshot.val();
        console.log("Reloaded challenges");
    });

    this.instance = app;
    this.db = db;

}

FirebaseApp.prototype.getUserName = function (uid) {
    let name = "";
    this.instance.auth().getUser(uid).then(value => {
        name = value.displayName;
    });
    return name;
}

FirebaseApp.prototype.writeHistory = function (obj) {
    if (obj.uid != undefined && obj.displayedName != undefined) {
        this.db.ref("challenges/" + obj.challengeID + "/history/" + obj.uid).set(obj);
        this.db.ref("users/" + obj.uid + "/history/" + obj.challengeID).set(obj);
    }
}

module.exports = FirebaseApp;