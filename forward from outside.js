async function doPost(e) {
    'use strict';

    const accountId = e.parameter.accountId;
    const userId = e.parameter.userId;

    const authToken = await getAuthToken();
    const userData = await getUserData();

    switch (e.parameter.action) {
        case 'toggleForward':
            toggleForward();
            break;
        case 'updateForwardNumber':
            updateForwardNumber();
            break;
        case 'bypassDeskphone':
            bypassDeskphone();
            break;
        case 'keyPressOrCellVM':
            keyPressOrCellVM();
            break;
        case 'numberToShow':
            numberToShow();
            break;
        case 'directCalls':
            directCalls();
            break;
    }

    async function getAuthToken() {
        try {
            const payload = `{"data":{"api_key":"6bda00ca600be34525893cbb2d68625507d9d30e328b5e12c622e6854120d32a"}}`;
            const options = { method: "PUT", headers: { 'content-type': "application/json" }, body: payload };
            const response = await fetch("http://portal.theteklink.com:8000/v2/api_auth", options);
            const responseObject = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            return responseObject.auth_token;
        } catch (e) {
            return "ERROR! " + e;
        }
    }

    async function getUserData() {
        try {
            const url = `http://portal.theteklink.com:8000/v2/accounts/${accountId}/users/${userId}?auth_token=${authToken}`;
            const options = { method: "GET", headers: { 'content-type': "application/json" } };
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            return response.json();
        } catch (e) {
            return "ERROR! " + e;
        }
    }

    function currentStatus(){
        //return forwarding is currntly userData.data.call_forward.enabled
    }

    function toggleForward() {
        let payloadDataObj = {};
        if (userData.data.call_forward.enabled) {
            userData.data.call_forward.enabled = false;
        } else {
            userData.data.call_forward.enabled = true;
        }
        payloadDataObj.data = userData.data;
        return updateUser(payloadDataObj);
    }

    function directCalls() {
        let payloadDataObj = {};
        if (userData.data.call_forward.direct_calls_only) {
            userData.data.call_forward.direct_calls_only = false;
        } else {
            userData.data.call_forward.direct_calls_only = true;
        }
        payloadDataObj.data = userData.data;
        return updateUser(payloadDataObj);
    }

    function numberToShow() {
        let payloadDataObj = {};
        if (userData.data.call_forward.keep_caller_id) {
            userData.data.call_forward.keep_caller_id = false;
        } else {
            userData.data.call_forward.keep_caller_id = true;
        }
        payloadDataObj.data = userData.data;
        return updateUser(payloadDataObj);
    }

    function keyPressOrCellVM() {
        let payloadDataObj = {};
        if (userData.data.call_forward.require_keypress) {
            userData.data.call_forward.require_keypress = false;
        } else {
            userData.data.call_forward.require_keypress = true;
        }
        payloadDataObj.data = userData.data;
        return updateUser(payloadDataObj);
    }

    function bypassDeskphone() {
        let payloadDataObj = {};
        if (userData.data.call_forward.substitute) {
            userData.data.call_forward.substitute = false;
        } else {
            userData.data.call_forward.substitute = true;
        }
        payloadDataObj.data = userData.data;
        return updateUser(payloadDataObj);
    }

    function updateForwardNumber() {
        let number;
        if (e.parameter.Digits) {
            number = e.parameter.Digits.dtmf;
        } else {
            number = e.parameter["Caller-ID-Number"];
        }
        let payloadDataObj = {};
        userData.data.call_forward.number = number;
        payloadDataObj.data = userData.data;
        return updateUser(payloadDataObj);
    }


    async function updateUser(payloadDataObj) {
        try {
            const url = `http://portal.theteklink.com:8000/v2/accounts/${accountId}/users/${userId}?auth_token=${authToken}`;
            const options = { method: "POST", body: JSON.stringify(payloadDataObj), headers: { 'content-type': "application/json" } };
            const response = await fetch(url, options);
            const updatedUserData = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            if (updatedUserData.status !== 'success') {
                throw new Error(`Error: ${updatedUserData.error}, Status: ${updatedUserData.status}, Message: ${updatedUserData.message}`);
            }
            console.log(updatedUserData);

            //return json to kazoo

        } catch (e) {
            console.log("ERROR! " + e);

            //return json to kazoo

        }
    }
}

function testing() {
    'use strict';

    doPost(
        {
            parameter: {
                accountId: "1f4a2a84188e187369c568a171c92ea1",
                userId: "24ed6ec3518334d6b55159712e675a9f",
                Digits: {
                    dtmf: "18457381100"
                },
                'Caller-ID-Number': "18458458455",
                action: 'toggleForward'
            }
        });
}