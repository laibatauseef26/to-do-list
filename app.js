const express= require("express");
const bodyParser=require("body-parser");
const mongoose= require("mongoose");
const { name } = require("ejs");
const _ =require("lodash");

const app= express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_laiba:test123@cluster0.sedwygx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/todolistdb");

const itemsSchema={
    name:String
};

const Item = mongoose.model("item", itemsSchema);

const item1= new Item({
    name: "Welcome!"
});

const item2= new Item({
    name: "Hit the + button to add a new item!"
});

const item3= new Item({
    name: "Hit the checkbox delete an item!"
});

const defaultItems= [item1, item2, item3];

const listSchema = {
    name:String,
    items : [itemsSchema]
};

const List=mongoose.model("List", listSchema);

app.get("/", function(req,res){

Item.find({})  //to find all the items and display them
  .then(foundItems => {
    
//we are using if else statement to avoid storing the same data in dtaabase again and again
    if (foundItems.length === 0 ){   //if itmes ki length 0 hogi to it'll insert items
        Item.insertMany(defaultItems)
        .then(docs =>{
            console.log("Documents entered", docs);
        })
        res.redirect("/");  //items add krne k baad redirect krde ga home route pe and then jab dubara chle ga to obv items ki length 0 nai hogi jiski wja se else statment execute hojaye gi
      }
      else{
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
  })
});

app.get("/:customListName" , function(req,res){
    const customListName= _.capitalize(req.params.customListName); // to capitalize the first letter 

    List.findOne({name: customListName})
    .then(foundList => {
        if (!foundList) {
          //create  a new list
          const list= new List({
            name: customListName,
            items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
         
        } else {
          //show an existing list
          res.render("list", { listTitle: foundList.name, newListItems: foundList.items});
        }
      });

   
});


app.post("/" , function(req,res){

//  When we add new item through the /work page it will check if the new item from the list is
// from work page then it will push the item into workItems and will redirect it to work page (means it will stay at the same page).
//else it will simply pus the item into items array and will redirect to the home page.

    // let item=req.body.newItem;  
    // if(req.body.list === "Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }
    

//to do it with mongoose 
let itemName= req.body.newItem;
const listName= req.body.list;  

    const item= new Item ({
        name: itemName
    });

    //if the listname is simple date and day it'll simply jave save the items and redirect to home route
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    //if it's custom list, then itll find the list
    else{
        List.findOne({name: listName})
        .then(foundList => {
            foundList.items.push(item); //and then it'll add the new added item into existing items
            foundList.save();
            res.redirect("/"+ listName);
        })
    }
});


app.post("/delete", function(req,res){
     const checkedItemId= req.body.checkbox;
     const listName= req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(checkedItemId)
        .then(deletedItem => {
           if (deletedItem) {
             console.log('Item deleted:', deletedItem);
           } else {
             console.log('Item not found');
           }
         })
         res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items : {_id: checkedItemId}}} )
        .then(foundList => {
            res.redirect("/"+ listName);
        })
    }
});



app.post("/work", function(req,res){
    let item= req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
}); 