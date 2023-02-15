//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "Welcome to our todolist!"
});
const Item2 = new Item({
  name: "Hit the + button to add a new task."
});
const Item3 = new Item({
  name: "<-- Hit this to delete an item."
}); 

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItem){
    if(foundItem.length === 0){
        Item.insertMany(defaultItems, function(err){
        if(err){
           console.log(err);
        }else{
        console.log("sucessfully saved default items to DB")
      }
    });
    res.redirect("/");  
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItem});
  }
    

});


// to store items into the list 
 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = Item({
    name: itemName
  });
  
  if(listName === "Today"){
  // to save the item into the js document
    item.save();
  //to redirect to the home page to show the item into the list 
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});
//to delete an item form the list
app.post("/delete", (req, res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Checked item is removed from the list.")
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
  
});
//to create dynamic pages like.. other pages of list etc..
app.get("/:customListName", (req, res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
        
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }else{
      console.log("error ho gaya bhaii thik betichod!!!!")
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
