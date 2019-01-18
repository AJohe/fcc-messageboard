/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');



module.exports = function (app) {
  mongoose.connect(process.env.DB);
  
  // set up models
  var Schema = mongoose.Schema;

  // Thread schema and model
  var threadSchema = new Schema({
    board: String,
    text: String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    delete_password: String,
    replies: Array
  });

  var Thread = mongoose.model('Thread', threadSchema);

  // Reply schema and model
  var replySchema = new Schema({
    text: String,
    thread_id: String,
    created_on: Date,
    delete_password: String,
    reported: Boolean
  });

  var Reply = mongoose.model('Reply', replySchema);
  

  app.route('/api/threads/:board')
  .get((req, res) => {
    Thread.find({board: req.params.board}).select('-reported -delete_password').sort({bumped_on: -1}).limit(10).exec((err, docs) => {
      if(err) {
        res.send('Error, please try again');
      }else {
        //console.log(docs);

        const threads = docs.map(e => {
        return {
          _id: e._id,
          board: e.board,
          text: e.text,
          created_on: e.created_on,
          bumped_on: e.bumped_on,
          replies: e.replies.slice(e.replies.length - 3)
      }
        });
        //console.log(threads);
        res.json(threads);
      }
    });
  })
  .post((req, res) => {
    Thread.create({
      board: req.body.board,
      text: req.body.text,
      created_on: Date(),
      bumped_on: Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    }, (err, doc) => {
      if(err) {
        res.send('Error, please try again');
      }else {
        res.redirect('/b/' + req.params.board);
      }
    });    
  })
  .put((req, res) => {
    Thread.findByIdAndUpdate(req.body.thread_id, {reported: true}, (err, doc) => {
      if(err) {
        res.send('Error, please try again');
      }else {
        res.send('success');
      }
    });
  })
  .delete((req, res) => {
    Thread.find({_id: req.body.thread_id, delete_password: req.body.delete_password}).deleteOne().exec((err, doc) => {
      //console.log(doc);
      if(err) {return res.send('Error, please try again')};
      if(doc.n === 0) {
        //console.log(doc);
        res.send('Incorrect password')
    }else {
        res.send('success');
    }
    });
  });
    
  app.route('/api/replies/:board')
  .get((req, res) => {
    Reply.find({thread_id: req.query.thread_id}).select('-reported -delete_password').sort({created_on: -1}).exec((err, replies) => {
      if(err) {
        console.log('fired')
        res.send('Error, please try again');
      }else {
        console.log(req.query.thread_id);
        res.json(replies);
      }
    });
  })
  .post((req, res) => {
    Reply.create({
      text: req.body.text,
      thread_id: req.body.thread_id,
      created_on: Date(),
      delete_password: req.body.delete_password,
      reported: false
    }, (err, reply) => {
      if(err) { return console.log(err); }
      Thread.findById(reply.thread_id, (err2, thread) => {
        if(err2) { return console.log(reply) }
        thread.replies.push(reply);
        thread.bumped_on = reply.created_on;
        thread.save((err3, doc) => {
          //console.log(doc);
          if(err3) { return res.send('Error, please try again') };
          res.redirect('/b/' + req.params.board + '/' + req.body.thread_id);
        });
      });
    });
  })
  .put((req, res) => {
    Reply.findByIdAndUpdate(req.body.reply_id, {reported: true}, (err, reply) => {
      if(err) {return res.send('Error, please try again')};
      res.send('success');
    });
  })
  .delete((req, res) => {
    Reply.find({
      thread_id: req.body.thread_id,
      _id: req.body.reply_id,
      delete_password: req.body.delete_password
    }, (err, reply) => {
      if(err) { return console.log(err) }
      if(reply === undefined || reply.length == 0) { return res.send('incorrect password') }
      reply[0].text = 'deleted';
      reply[0].save((error, doc) => {
        if(error) { return res.send('Error, please try again') };
        res.send('success');
      });
    });
  });

};
