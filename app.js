//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
require("dotenv").config();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(process.env.MONGODB_URI,{ useUnifiedTopology: true });

const ltemsSchema={

   name:String
};


const Item=mongoose.model("Item",ltemsSchema);

const item1= new Item ({

  name: "Welcome to your todolist"
}
);

const item2= new Item({
    name: "Hit the + button to add a new item."
});


const item3= new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];
const listsSchema={
     name: String,
     item:[ltemsSchema] 
}
 
const List=mongoose.model("List",listsSchema);


app.get("/", function(req, res) {
Item.find({})
.then(function(items){
if(items.length===0){
Item.insertMany(defaultItems);
res.redirect("/");
}else{
 res.render("list", {listTitle: "Today", newListItems: items}); }
})
.catch(function(err){
   console.log(err);
});

  });

app.get('/:extendedName', function(req, res) {
    const extendedName = _.capitalize(req.params.extendedName);
    
    List.findOne({ name: extendedName })
        .then(function(foundItem) {
            if (!foundItem) {
                const list1 = new List({
                    name: extendedName,
                    item: defaultItems
                });
                list1.save(); 
                res.redirect("/" + extendedName);
            } else {
                res.render("list", { listTitle: foundItem.name, newListItems: foundItem.item });
            }
        })
        .catch(function(err) {
            console.log(err);
        });
});




     
app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const addedItem = new Item(
{
   name: req.body.newItem
}
);
   if (listName==="Today"){
 addedItem.save();
  res.redirect("/");
}else{
     List.findOne({name:listName})
      .then(function(foundItem){
         foundItem.item.push(addedItem);
          foundItem.save();
          res.redirect("/" + listName);
})
}
 
});

app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  
  const listName= req.body.listName;
  if(listName==="Today"){
     Item.findByIdAndDelete(checkedItemId)
.then(function(){
   console.log("Successfully Deleted");
    res.redirect("/");

})
.catch(function(err) {
        console.log(err);
        
      });

}else{
   List.findOneAndUpdate(
      { name: listName },
      { $pull: { item: { _id: checkedItemId } } }
    )
    .then(function(foundList) {
      res.redirect("/" + listName);
    })
    .catch(function(err) {
      console.log(err);
      
    });
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
