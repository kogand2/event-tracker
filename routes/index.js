var express = require('express');
var application = express();
var mongo = require('mongodb').MongoClient;
var obj = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/eventplanner';

application.get('/', (rq, rs) => {
    var result = [];
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    mongo.connect(url, (err, db) => {
        var cur = db.collection('events').find();
        cur.forEach((doc, err) => {
            result.push(doc);
        }, () => {
            db.close();
            result.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            rs.render('index', { items: result });
        });
    });
});

application.post('/insert', (rq, rs) => {
    if (isValid(rq.body)) {
        var event = {
            title: rq.body.title,
            description: rq.body.description,
            date: rq.body.date,
        };

        mongo.connect(url, (err, db) => {
            db.collection('events').insertOne(event, (err, value) => {
                db.close();
                rs.redirect('/');
            });
        });
    } else {
        rs.status(422)
        rs.json({
            message: 'Please complete all of the fields.'
        })
    }
});

application.post('/delete', (rq, rs) => {
    var id = rq.body.id;
    mongo.connect(url, (err, db) => {
        db.collection('events').deleteOne({ "_id": obj(id) }, (err, value) => {
            db.close();
            rs.redirect('/');
        });
    });
});

function isValid(event) {
    var result = event.title && event.title.toString().trim() !== '' && event.description && event.description.toString().trim() !== '' && event.date && event.date.toString().trim() !== '';
    return result;
}

module.exports = application;