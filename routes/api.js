'use strict';

require("dotenv").config()
const { MongoClient, ObjectId } = require('mongodb');
let myDataBase;
const client = new MongoClient(process.env.DB)

const connect = async () => {
  try {
    // console.log("connected success")
    await client.connect();
    myDataBase = client.db('library').collection('books');
  } catch (error) {
    // console.log(error)
    throw new Error('Unable to Connect to Database: ', error)
  }
}
connect()

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      // console.log("getting all done.")
      let books = await myDataBase.find({}).toArray()
      books = books.map(book => {
        let mybook = {
          comments: book.comments,
          _id: book._id,
          title: book.title,
          commentcount: book.commentcount,
          __v: book.__v
        }
        return mybook;
      })
      res.status(200).json(books)
    })

    .post(async function (req, res) {
      let title = req.body.title;
      if (!title || title == "") return res.status(200).send("missing required field title")
      // console.log('post 1:' + JSON.stringify(req.body))
      await myDataBase.insertOne({ title, commentcount: 0, comments: [], __v: 0 })
        .then(async () => {
          const data = await myDataBase.find({ title }).toArray()
          res.status(200).json({ _id: data[0]._id, title: data[0].title })
        })
    })

    .delete(async function (req, res) {
      await myDataBase.deleteMany({})
        .then(data => {
          // console.log("deleted all books")
          res.status(200).send("complete delete successful")
        })
      //if successful result will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(async function (req, res) {
      let bookid = req.params.id;
      // console.log("get 2: " + bookid)
      try {
        bookid = new ObjectId(bookid)
      } catch (error) {
        return res.status(200).send('no book exists');
      }
      await myDataBase.findOne({ _id: bookid })
        .then(book => {
          if (!book) return res.status(200).send('no book exists');
          return res.status(200).json({
            _id: book._id,
            title: book.title,
            comments: book.comments
          });
        })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(async function (req, res) {
      // console.log('post 2: ' + JSON.stringify(req.body))
      let bookid;
      let comment = req.body.comment;
      if (!comment || comment == "") return res.status(200).send("missing required field comment")
      try {
        bookid = new ObjectId(req.params.id);
      } catch (e) {
        return res.status(200).send("no book exists");
      }
      await myDataBase.findOne({ _id: bookid })
        .then(bk => {
          // console.log("book: " + JSON.stringify(bk))
          if (bk) {
            const commentcount = bk.commentcount + 1
            let comments = [...bk.comments, comment]
            myDataBase.findOneAndUpdate({ _id: bookid }, { $set: { commentcount, comments, __v: commentcount } }, { new: true },)
              .then(data => {
                // console.log(data)
                res.status(200).json({ comments, _id: bookid, title: data.title, commentcount, __v: commentcount })
              })
              .catch(e => {
                // console.log("error 1: " + e)
                res.status(200).send("no book exists")
              })
          } else {
            // console.log("error 2")
            res.status(200).send("no book exists")
          }
        })
        .catch(e => {
          // console.log("error 3 : " + e)
          res.status(200).send("no book exists")
        })

      //
      //json res format same as .get
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      try {
        bookid = new ObjectId(bookid)
      } catch (err) {
        res.status(200).send("no book exists")
      }
      myDataBase.findOneAndDelete({ _id: bookid })
        .then((data) => {
          //console.log("deleted book _id: " + bookid + ". deletion results: " + data)
          if (!data) return res.status(200).send("no book exists")
          res.status(200).send("delete successful")
        })
      //if successful result will be 'delete successful'
    });

};
