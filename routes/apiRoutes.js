var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("../models");

module.exports = function (app) {

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function (dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.get("/api/fetch", function (req, res) {
    // First, we grab the body of the html with axios
    console.log("route hit")
    axios.get("http://www.washingtonpost.com/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      var package = []
      // Now, we grab every h2 within an article tag, and do the following:
      $(".headline").each(function (i, element) {
        // Save an empty result object

        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.headLine = $(this)
          .children("a")
          .text();

        result.summary = $(this).next('.blurb').text();

        result.link = $(this)
          .children("a")
          .attr("href");

        result.saved = false;

        db.Article.findOne({ headLine: result.headLine }).then(function (data) {
            // console.log(data)
            if (data) {
              // console.log("Article already in DB")
            } else {
              // Create a new Article using the `result` object built from scraping
              db.Article.create(result)
                .then(
                  result.push(package)
                  // console.log("added:" + JSON.stringify(result))
                )
                .catch(function (err) {
                  // If an error occurred, log it
                  // console.log(err);
                });
            }
          })
      })
      res.json(package)
    });

  });

app.get("/api/headlines/notsaved", function (req, res) {
  db.Article.find({ saved: false })
    .then(function (notSaved) {
      
      res.json(notSaved);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/api/clear", function (req, res){
  db.Article.deleteMany({}).then(res.send())
});

//route for delete article
app.delete("/api/headlines/:id", function(req, res){
  db.Article.updateOne({"_id": req.params.id}, {$set: {"saved": "false"}}).then(
res.send()).catch(function (err){
  console.log(err)
});
})

// route for saved

app.put(("/api/headlines/:id", function(req, res){
  db.Article.updateOne({"_id": req.params.id}, {$set: {"saved": "true"}}).then(
    res.send("saved")).catch(function (err){
      console.log(err)
    });

})
)
// note save
app.post("/api/notes", function(req, res) {
console.log(req.noteData.noteText)
  // Create a new note and pass the req.body to the entry
  // db.Note.create(req.body)
  //   .then(function(dbNote) {
  //     // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
  //     // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
  //     // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
  //     return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
  //   })
  //   .then(function(dbArticle) {
  //     // If we were able to successfully update an Article, send it back to the client
  //     res.json(dbArticle);
  //   })
  //   .catch(function(err) {
  //     // If an error occurred, send it to the client
  //     res.json(err);
  //   });
});
// note delete
}