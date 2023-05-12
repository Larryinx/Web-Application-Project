/**
 * CSCI2720/ESTR2106 Assignment 3
 * Using Database via Node.js
 *
 * I declare that the assignment here submitted is original
 * except for source material explicitly acknowledged,
 * and that the same or closely related material has not been
 * previously submitted for another course.
 * I also acknowledge that I am aware of University policy and
 * regulations on honesty in academic work, and of the disciplinary
 * guidelines and procedures applicable to breaches of such
 * policy and regulations, as contained in the website.
 *
 * University Guideline on Academic Honesty:
 *   http://www.cuhk.edu.hk/policy/academichonesty
 * Faculty of Engineering Guidelines to Academic Honesty:
 *   https://www.erg.cuhk.edu.hk/erg/AcademicHonesty
 *
 * Student Name: LI Yinxi <fill in yourself>
 * Student ID  : 1155160255 <fill in yourself>
 * Date        : 2022.12.15 <fill in yourself>
 */

// run `node index.js` in the terminal

const express = require('express');
const app = express();

var query_no = 0;
var compare_no = 0;

var oldTime = new Date().getTime();
var newTime = new Date().getTime();
var resetTime = 5 * 60 * 1000;

var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://stu183:p759122W@cluster0.gbo7pn3.mongodb.net/stu183');

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));

const EventSchema = new mongoose.Schema({
  eventId: {
    type: Number, required: true,
    unique: true
  },
  name: { type: String, required: true },
  loc: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  quota: { type: Number }
});

const LocationSchema = new mongoose.Schema({
  locId: {
    type: Number, required: true,
    unique: true
  },
  name: { type: String, required: true },
  quota: { type: Number }
});

const Event = mongoose.model('Event', EventSchema);
const Location = mongoose.model('Location', LocationSchema);

var cors = require('cors')
const bodyParser = require('body-parser');
var methodOverride = require("method-override");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride("_method"));


// Upon opening the database successfully
db.once('open', function () {
  console.log("Connection is open...");

  // 1
  app.get('/ev/:eventId', (req, res) => {
    query_no++;
    var query = Event.findOne({ eventId: req.params['eventId'] });
    query.select('-_id eventId name loc quota').populate('loc', '-_id locId name');
    query.exec().then(results => {
      if (results == null) {
        res.contentType('text/plain');
        res.status(404).send("This event is not existed.\n404 Not Found\n");
      }
      else {
        res.contentType('text/plain');
        var event = JSON.stringify(results, null, " ");
        res.send(event);
      }
    }, error => {
      res.contentType('text/plain');
      res.send(error);
    })
  });

  // 2
  app.post('/ev', (req, res) => {
    Event.find().sort({ eventId: -1 }).select({ eventId: 1 }).exec().then(results => {
      var eid
      if (results.length < 1) {
        eid = 1;
      }
      else {
        eid = results[0].eventId + 1;
      }
      return eid;
    }, error => {
      res.contentType('text/plain');
      res.send(error);
    }).then((eid) => {
      Location.findOne({ locId: req.body['loc'] }).select('_id quota').exec().then(loca => {
        if (loca == null) {
          res.contentType('text/plain');
          res.status(404).send("This location is not existed.\n404 Not Found\n");
        } else {
          if (loca.quota < req.body['quota']) {
            res.status(406).send("Location's quota is smaller than event's quota. This event is not created.")
          } else {
            Event.create({
              eventId: eid,
              name: req.body['name'],
              loc: loca._id,
              quota: req.body['quota']
            }).then(function () {
              var query = Event.findOne({ eventId: eid });
              query.select('-_id eventId name loc quota').populate('loc', '-_id locId name');
              query.exec().then(item => {
                if (item == null) {
                  res.contentType('text/plain');
                  res.status(404).send("This event is not existed.\n404 Not Found\n");
                }
                else {
                  res.status(201).redirect("http://localhost:3000/ev/" + eid);
                }
              }, Error => {
                res.contentType('text/plain');
                res.send(Error);
              })
            }, e => {
              res.contentType('text/plain');
              res.send(e);
            })
          };
        }
      }, err => {
        res.contentType('text/plain');
        res.send(err);
      })
    })
  });

  app.post('/lo', (req, res) => {
    Location.create({
      locId: req.body['locId'],
      name: req.body['name'],
      quota: req.body['quota']
    }).then(results => {
      res.status(201).send("Ref: " + results);
    }, err => {
      res.contentType('text/plain');
      res.send(err);
    })
  });

  // 3
  app.delete('/ev/:eventId', (req, res) => {
    var query = Event.findOne({ eventId: req.params['eventId'] });
    query.populate('loc', '-_id locId name');
    query.exec().then(results => {
      if (results == null) {
        res.contentType('text/plain');
        res.status(404).send("This event is not existed.\n404 Not Found\n");
      } else {
        Event.deleteOne({ _id: results._id },).then(function () {
          res.status(204).send("204 No Content");
        }, error => {
          res.contentType('text/plain');
          res.send(error);
        })
      }
    }, err => {
      res.contentType('text/plain');
      res.send(err);
    })
  });

  // 4 & 7
  app.get('/ev', (req, res) => {
    query_no++;
    if (Object.keys(req.query).length === 0) {
      var query = Event.find();
    } else {
      var query = Event.find({ quota: { $gte: req.query['q'] } });
    }
    query.select('-_id eventId name loc quota').populate('loc', '-_id locId name');
    query.exec().then(results => {
      if (results == null) {
        res.send("There is no event.");
      } else {
        res.contentType('text/plain');
        var event = JSON.stringify(results, null, " ");
        res.send(event);
      }
    }, err => {
      res.contentType('text/plain');
      res.send(err);
    })
  });

  // 5
  app.get('/lo/:locId', (req, res) => {
    query_no++;
    var query = Location.findOne({ locId: req.params['locId'] });
    query.select('-_id locId name quota');
    query.exec().then(results => {
      if (results == null) {
        res.contentType('text/plain');
        res.status(404).send("This location is not existed.\n404 Not Found\n");
      }
      else {
        res.contentType('text/plain');
        var event = JSON.stringify(results, null, " ");
        res.send(event);
      }
    }, error => {
      res.contentType('text/plain');
      res.send(error);
    })
  });

  // 6
  app.get('/lo', (req, res) => {
    query_no++;
    var query = Location.find();
    query.select('-_id locId name quota');
    query.exec().then(results => {
      if (results == null) {
        res.send("There is no location available");
      }
      else {
        res.contentType('text/plain')
        var event = JSON.stringify(results, null, " ");
        res.send(event);
      }
    }, error => {
      res.contentType('text/plain');
      res.send(error);
    })
  });

  // 8
  app.put('/ev/:eventId', (req, res) => {
    var query = Location.findOne({ locId: req.body['loc'] }).select('_id quota locId name');
    query.exec().then(locat => {
      if (locat == null) {
        res.contentType('text/plain')
        res.status(404).send("This location is not existed.\n404 Not Found\n");
      }
      else {
        Event.findOneAndUpdate({ eventId: req.body['eid'] }, {
          name: req.body['name'],
          loc: locat._id,
          quota: req.body['quota']
        }).exec().then(re => {
          if (re == null) {
            res.contentType('text/plain');
            res.status(404).send("This event is not existed.\n404 Not Found\n");
          } else {
            res.contentType('text/plain')
            var results = {
              eventId: Number(req.body['eid']),
              name: req.body['name'],
              loc: { locId: locat.locId, name: locat.name },
              quota: Number(req.body['quota'])
            }
            var event = JSON.stringify(results, null, " ");
            res.send(event);
          }
        }, err => {
          res.contentType('text/plain');
          res.send(err);
        })
      }
    }, error => {
      res.contentType('text/plain');
      res.send(error);
    })
  })

  // handle ALL requests
  app.all('/*', (req, res) => {
    // send this to client
    res.send('Firstly, set five variables. The query_no variable represents the number of times occurs GET query. \
    The compare_no variable is used for compare whether query_no is updated. \
    The oldTime variable represents the time that the last GET query occurs. \
    The newTime variable represents the current time which would be compare to the oldTime. The resetTime is set to be 5 mins. \
    Then set a setInterval() function to circularly call the comparing function. \
    Every time we first compare whether query_no is updated with compare_no. If yes, it is going to reset the compare_no and the oldTime. \
    If no, it is going to compare the time interval between newTime and oldTime with resetTime, i.e. 5 mins. \
    Finally, it reaches the goal of the function. \
    For task 2, due to the heavy final exam workload, I have to apologize that it is hard for me to complete it on time.');
  });

})

// listen to port 3000
const server = app.listen(3000);

function updateevent(form) {
  var eid = document.querySelector("#eventid").value;
  var name = document.querySelector("#neweventname").value;
  var locat = document.querySelector("#neweventloc").value;
  var quota = document.querySelector("#neweventquota").value;
  if (eid.length < 1) {
    document.querySelector("#eventId").classList.add("is-invalid");
  }
  else if (name.length < 1 || locat.length < 1 || quota.length < 1) {
    alert("Please enter complete information.");
  }
  else {
    var link = "http://localhost:3000/ev/" + eid;
    form.action = link + "?_method=PUT";
  }
}

function loadevent() {
  var eid = document.querySelector("#eventid").value;
  if (eid.length < 1) {
    alert("Please enter Event ID.");
  }
  else {
    var link = 'http://localhost:3000/ev/' + eid;
    fetch(link)
      .then(response => response.text())
      .then(data => {
        var eventdetail = data.replace(/\n/g, "")
        var e = JSON.parse(eventdetail)
        document.querySelector("#neweventname").value = e.name;
        document.querySelector("#neweventloc").value = e.loc.locId;
        document.querySelector("#neweventquota").value = e.quota;
      }).catch(error => {
        alert("This event is not existed. Please enter the correct event ID", error);
      });
  }
}

// ESTR 1
setInterval(() => {
  newTime = new Date().getTime();
  if (compare_no != query_no) {
    compare_no = query_no;
    oldTime = new Date().getTime();
  }
  else {
    if (newTime - oldTime > resetTime) {
      query_no = 0;
      compare_no = 0;
      oldTime = new Date().getTime();
    }
  }
}, 100);