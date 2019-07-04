var admin = require('firebase-admin');

var FirebaseApp = function () {
    var serviceAccount = require("./codeathon-itss-firebase-adminsdk-1u6qj-681741e792.json");

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
    if (obj.uid != undefined || obj.uid != "") {
        this.instance.auth().getUser(obj.uid).then(value => {
            obj.email = value.email;
            obj.displayName = value.displayName;
            obj.date = Date.now();
            this.db.ref("challenges/" + obj.challengeID + "/history/" + obj.uid).set(obj);
            this.db.ref("users/" + obj.uid + "/history/" + obj.challengeID).set(obj);
        })

    }
}

FirebaseApp.prototype.getUserList = async function (onFinish) {
    this.db.ref("users/").on('value', async (snapshot) => {
        let data = snapshot.val();
        let emailList = [];
        for (let i = 0; i < data.length; i++) {
            let usr = await this.instance.auth().getUser(data[i])
            emailList.push(usr.email)
        }
        console.log(emailList);
        onFinish(emailList);
    })
}

FirebaseApp.prototype.invite = function (obj) {

}

module.exports = FirebaseApp;