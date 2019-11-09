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
        let uids = Object.keys(data);
        let emailList = [];
        for (let i = 0; i < uids.length; i++) {
            let usr = await this.instance.auth().getUser(uids[i])
            emailList.push(usr.email)
        }
        console.log(emailList);
        onFinish(emailList);
    })
}

FirebaseApp.prototype.createTeam = function (ownerID, obj, onFinish) {
    this.db.ref('team/').push({ ownerID: ownerID, ...obj, invitation: 0 }, (error) => {
        if (error) {
            onFinish({ status: 'error', error: error });
        }
        else {
            onFinish({ status: 'success' });
        }
    })
}

FirebaseApp.prototype.getYourTeam = function (ownerID, onFinish) {
    this.db.ref('team/').on('value', (snapshot) => {
        let data = snapshot.val();
        let keys = Object.keys(data);
        let result = [];

        for (let i = 0; i < keys.length; i++) {
            if (data[keys[i]]['ownerID'] == ownerID) {
                result.push(keys[i]);
            }
        }

        onFinish(result);
    })
}

FirebaseApp.prototype.getJoinedTeam = function (uid, onFinish) {
    this.db.ref('team/').on('value', (snapshot) => {
        let data = snapshot.val();
        let keys = Object.keys(data);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            if (data[keys[i]]['members'] != undefined) {
                let listOfMember = Object.keys(data[keys[i]]['members']);
                if (listOfMember.indexOf(uid) != -1) {
                    result.push(keys[i]);
                }
            }
        }
        onFinish(result);
    })
}

FirebaseApp.prototype.invite = async function (teamID, teamName, ownerName, email) {
    let uid = (await this.instance.auth().getUserByEmail(email));
    if (uid != undefined) {
        uid = uid.uid;
        this.db.ref('users/' + uid + '/invitation/' + teamID).set({ teamName: teamName, ownerName: ownerName });
        this.db.ref('team/' + teamID + '/invitation/' + uid).set({ status: 0 });
    }
}

FirebaseApp.prototype.replyInvitation = function (isAccepted, uid, teamID) {
    if (isAccepted) {
        this.db.ref('team/' + teamID + '/members/' + uid).set({ status: 1 });
    }
    this.db.ref('team/' + teamID + '/invitation/' + uid).remove();
    this.db.ref('users/' + uid + '/invitation/' + teamID).remove();
}


module.exports = FirebaseApp;