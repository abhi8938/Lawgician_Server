const { User } = require('./models/user');
const { Notification } = require('./models/notification');
const axios = require('axios');

async function sendNotification(customerId, data, Title, body, Type) {
    let notification
    try {
        notification = new Notification({
            Title: Title,
            body: body,
            data: data,
            Type: Type,
            SentTo:customerId
        })
        await notification.save();
    } catch (error) {
        return error;
    }
    let token;
    let payload;
    if (customerId == 'MULTIPLE') {
        const users = await User.find({});
        token = new Array;
        users.map(element => {
            token.push(element.Token)
        });
        payload = {
            notification: {
                title: Title,
                body: body,
                sound: 'default',
                badge: '1',
            },
            'data': notification,
            'registration_ids': token
        }
    } else {
        const user = await User.findOne({ customerId: customerId });
        if (!user) return 'User Not Found';
        token = user.Token;
        payload = {
            notification: {
                title: Title,
                body: body,
                sound: 'default',
                badge: '1',
            },
            'data': data,
            'to': token
        }
    }
    const config = {
        headers: {
            Authorization: 'key=AIzaSyAq0v3n24DMwo9kMup9tP6kY9XhMVH2QEM',
            'Content-Type': 'application/json'
        }
    }
    return axios.post('https://fcm.googleapis.com/fcm/send', payload, config)
        .then(async (result) => {
            return result
        }).catch((err) => {
            console.log(`error`, err);
            return err
        });

}

exports.sendNotification = sendNotification;