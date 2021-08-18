if (process.env.NODE_ENV !== "production") {
  require('dotenv').config({
    path: __dirname + '/.env'
  });
}

require('dotenv').config()
const express = require('express'),
  router = express.Router(),
  qr = require("qrcode"),
  fs = require('fs'),
  User = require('../models/users'),
  Degree = require('../models/degree'),
  Visitor = require('../models/visitor'),
  {
    isLoggedIn
  } = require('../middleware'),
  nodeMailer = require('nodemailer'),
  excel = require('exceljs');

// canvas setup
const {
  createCanvas,
  loadImage
} = require('canvas')
const key = process.env.GOOGLE_MAPS_API;
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'k3ki', key});
});


// POST request listener to convert the user id to qr code and mail it to the user
router.post("/registerVisitor", async (req, res) => {
  const key = process.env.GOOGLE_MAPS_API;
  const pass = process.env.MAIL_PASSWORD;
  const newVisitor = new Visitor(req.body);
  await newVisitor.save();

  const url = "http://localhost:5000/visitor/" + newVisitor._id.toString();

  // If the input is null return "Empty Data" error
  if (newVisitor.length === 0){
    req.flash('error', "please check information and submit again!");
    res.redirect('/');
  } else {
  //checking if there is an email
  if (req.body.email == '') {
    qr.toDataURL(url, (err, src) => {
      if (err) res.send("Error occured")
      res.set('src', src);
    })
    // make the QR code and send the mail after render index with flash message that you have been registered.
  } else {
    qr.toDataURL(url, (err, src) => {
      if (err) res.send("Error occured")
      const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, //use ssl
        auth: {
          user: 'maatouq.45@gmail.com',
          pass: pass
        }
      });
      const mailOptions = {
        from: 'maatouq.45@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Welcome to Event Camp', // Subject line
        text: 'Event Camp', // plain text body
        html: '<h1> Thank you for registering </h1> <p> your ticket was reserved for our Event please Keep this email.</p> <br> <img src="' + src + '"> <br> <a href="' + url + '">press here to review your Ticket.</a> ', // html body
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      });
    });
    req.flash('success', "an email with your registeration ticket was sent to you, please check the spam inbox as well");
    console.log('success');
    res.redirect('/');
  }
}
});

// ============
// this route handles the event when the URL of a Visitor was hit
// ============

router.get('/visitor/:id', async (req, res) => {
  if (String(req.params.id).match(/^[0-9a-fA-F]{24}$/)) {
    // Yes, it's a valid ObjectId, proceed with `findById` call.
    if (!req.isAuthenticated()) {
      //if you are not logged in as a university show the qr code and simple message
      const {
        id
      } = req.params;
      const foundVisitor = await Visitor.findById(id);
      // const time = moment(foundVisitor.dateOfBirth);
      // const dob = time.format("DD/MM/YYYY");
      const qrurl = "http://localhost:5000/visitor/" + id.toString();
      qr.toDataURL(qrurl, (err, src) => {
        if (err) res.send("Error occured")
        res.render('visitor', {
          foundVisitor,
          src
        });
      })
    } else {
      //check if he is admin send him to admin info page where he can add the info for a student and print the image
      if (req.user.isAdmin == true) {
        const {
          id
        } = req.params;
        const foundVisitor = await Visitor.findById(id);
        // const time = moment(foundVisitor.dateOfBirth);
        // const dob = time.format("DD/MM/YYYY");
        const qrurl = "http://localhost:5000/visitor/" + id.toString();
        qr.toDataURL(qrurl, (err, src) => {
          if (err) res.send("Error occured")
          res.render('adminInfo', {
            foundVisitor,
            src
          });
        })
      } else {
        //check which university saw this student and record that to the database and render the info so the uni can register the degree
        const {
          id
        } = req.params;
        const foundVisitor = await Visitor.findById(id);
        // const time = moment(foundVisitor.dateOfBirth);
        // const dob = time.format("DD/MM/YYYY");
        console.log(req.user.username, foundVisitor.seenBy);
        if (foundVisitor.seenBy == req.user.username){
          const qrurl = "http://localhost:5000/visitor/" + id.toString();
        qr.toDataURL(qrurl, (err, src) => {
          if (err) res.send("Error occured")
          res.render('info', {
            foundVisitor,
            src
          });
        })
       } else {
          const newVisitor = new Visitor();
          newVisitor.Name = foundVisitor.Name;
          newVisitor.telephonNumber = foundVisitor.telephonNumber;
          newVisitor.email = foundVisitor.email;
          newVisitor.seenBy = req.user.username;
          newVisitor.attended = true;
          newVisitor.save();
          foundVisitor.seenBy = req.user.username;
          const qrurl = "http://localhost:5000/visitor/" + id.toString();
          qr.toDataURL(qrurl, (err, src) => {
            if (err) res.send("Error occured")
            res.redirect('/visitor/' + newVisitor._id);
          })
        }
      }
    }
  } else {
    req.flash('error', "the Studen Id isnt a valid ID");
    res.redirect('/');
  }
})


//===============
// update degree routes
//===============

router.post("/user/:id", isLoggedIn, async (req, res) => {
  if (String(req.params.id).match(/^[0-9a-fA-F]{24}$/)) {
  // is it admin?
  if (req.user.isAdmin == true) {
    const newVisitor = new Visitor(req.body);
    newVisitor.seenBy = req.user.username;
    newVisitor.degree = req.body.degree;
    newVisitor.attended = true;
    newVisitor.save();
    req.flash('success', 'The User record has been updated');
    res.redirect('/visitor/' + newVisitor._id);
  } else {
    const {id} = req.params.id;
    const foundVisitor = Visitor.findById(req.params.id, (err, visitor) => {
      if (err) {
        req.flash('error', err.message);
        res.redirect('/');
      } else {
        console.log(visitor);
      const newVisitor = new Visitor();
      newVisitor.Name = visitor.Name;
      newVisitor.telephonNumber = visitor.telephonNumber;
      newVisitor.email = visitor.email;
      newVisitor.seenBy = req.user.username;
      newVisitor.degree = req.body.degree;
      newVisitor.attended = true;
      newVisitor.save();
      req.flash('success', 'The Degree desired has been registered');
      res.redirect('/visitor/' + newVisitor._id);
      }
    })
  }
    }else {
      req.flash('error', "the Studen Id isnt a valid ID");
      res.redirect('/');
    }
})

// ==============
// printing functionality
// ==============

router.get("/user/:id/print", async (req, res) => {
  const {
    id
  } = req.params;
  await Visitor.findById(req.params.id, (err, visitor) => {
    const text = visitor.Name;
    const canvas = createCanvas(700, 400);
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '40px serif';
    context.textAlign = 'center';
    context.fillStyle = '#000000';
    context.fillText(text, 380, 180)
    const qrurl = "http://localhost:5000/visitor/" + id.toString();
    qr.toDataURL(qrurl, (err, src) => {
      if (err) {
        res.send("Error occured")
      } else {
        loadImage(src).then(image => {
          context.drawImage(image, 280, 200);
          const buffer = canvas.toBuffer('image/jpeg');
          fs.writeFileSync('image.jpeg', buffer);
          res.download('image.jpeg');
        })
      }
    })
  })
})

// ==========
// Download Data
// ==========
router.get("/user/download", async (req, res) => {
  const visitors = await Visitor.find({});
  const workbook = new excel.Workbook(); //creating workbook
  const visitorsWorksheet = workbook.addWorksheet('Visitors'); //creating worksheet
  visitorsWorksheet.columns = [{
      header: 'Record Id',
      key: '_id',
      width: 30
    },
    {
      header: 'name',
      key: 'Name',
      width: 30
    },
    {
      header: 'telephonNumber',
      key: 'telephonNumber',
      width: 30
    },
    {
      header: 'attended',
      key: 'attended',
      width: 30
    },
    {
      header: 'degree',
      key: 'degree',
      width: 30
    },
    {
      header: 'Seen By',
      key: 'seenBy',
      width: 30
    },
  ];
  // adding rows
  visitorsWorksheet.addRows(visitors);
  // Write to File
  workbook.xlsx.writeFile("visitors.xlsx")
    .then(function () {
      console.log("file saved!");
      res.download('visitors.xlsx');
    });
});

module.exports = router;