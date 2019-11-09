const Request = require('request');

let suspend = false;

function createRequest(code) {
    Request.post({
        "headers": { "content-type": "application/json" },
        "url": "https://server.codeathon.ml/submit",
        "body": JSON.stringify({
            "challengeID": "PRIME-COUNT",
            "languageID": 0,
            "uid": "tYZS4bwQAnP4giOH0hGmDaV0BE23",
            "code": code
        })
    }, (err, res, body) => {
        if (err) {
            console.log(err);
            this.suspend = true;
        }
        else {
            count++;
            console.log(count);
            createRequest(code);
        }
    });
}

let count = 0;

let code = "m = int(input())\r\nn = int(input())\r\n\r\narr = []\r\nfor i in range(n + 1):\r\n    arr.append(True)\r\n\r\narr[0] = False\r\narr[1] = False\r\n\r\ncount = n - m + 1\r\n\r\nfor i in range(2, n + 1):\r\n    j = i\r\n    if arr[j] == True:\r\n        while j<=n:\r\n                if j != i and arr[j] == True:    \r\n                        arr[j] = False\r\n                        if j >= m:\r\n                                count -= 1\r\n                j +=i\r\n                \r\n\r\n\r\nprint(count)"

createRequest(code);

