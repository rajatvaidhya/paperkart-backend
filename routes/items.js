const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Item = require("../models/Item");
require('dotenv').config();
const JWT_SEC = process.env.JWT_SEC;

router.get("/getitems", async (req, res) => {
  try {
    const products = await Item.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/addItem", async (req, res) => {
  try {
    const token = req.header("auth-token");

    if (!token) {
      return res.status(401).json({ error: "Authentication token not found" });
    }

    console.log(token);

    const decoded = jwt.verify(token, JWT_SEC);
    console.log(decoded);
    const userId = decoded._id;
    console.log(userId);

    const user = await User.findById(userId);

    var flag = 1;

    for(var i=0; i<user.cart.length; i++)
    {
      if(user.cart[i]._id.toString() === req.body.Itemkey)
      {
        flag = 0;
        break;
      }
    }

    if(flag)
    {
      user.cart.push(req.body.Itemkey);
      await user.save();
      res.status(200).json({ 
        msg: "Successfully saved item",
        success:true 
      });
    }
    else
    {
      res.json({
        msg:'Already present in cart.',
        success:false
      })
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/allCartItems", async (req, res) => {
  try {
    const token = req.header("auth-token");

    if (!token) {
      return res.status(401).json({ error: "Authentication token not found" });
    }

    console.log(token);

    const decoded = jwt.verify(token, JWT_SEC);
    console.log(decoded);
    const userId = decoded._id;
    console.log(userId);

    const user = await User.findById(userId);

    const promises = user.cart.map(itemId => Item.findById(itemId));
    const cartProducts = await Promise.all(promises);

    res.json(cartProducts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/removeItem/:itemId", async(req,res)=>{

  const token = req.header('auth-token');
    if (!token) {
      return res.status(401).json({ error: 'Authentication token not found' });
    }

    const decoded = jwt.verify(token, JWT_SEC);
    console.log(decoded);
    const userId = decoded._id;
    const user = await User.findById(userId);
    console.log(user);
    user.cart = user.cart.filter((itemId) => itemId.toString() !== req.params.itemId);
    await user.save();
    res.json({ message: 'Item removed from cart successfully' });
})

router.post("/searchItem", async(req,res)=>{

  const part = req.body.title;
  const searchedItem = await Item.find({title:part});
  res.json(searchedItem);
})


router.get("/fetchAllCategories", async(req, res)=>{

  const searchedItem = await Item.find({});
  let categories = [];

  for(var i=0; i<searchedItem.length; i++) {
    categories.push(searchedItem[i].category);
  }

  const uniqueArray = Array.from(new Set(categories));
  res.json(uniqueArray);
})

router.post("/fetchAllSubCategories", async(req, res)=>{

  const cate = req.body.category;
  const searchedItem = await Item.find({});
  let subCategories = [];

  for(var i=0; i<searchedItem.length; i++) {
    if(searchedItem[i].category === cate) {
      subCategories.push(searchedItem[i].subCategory);
    }
  }

  const uniqueArray = Array.from(new Set(subCategories));
  res.json(uniqueArray);
})


router.post("/addAdminItems", async (req, res) => {
  try {
    const newItem = await Item.create({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
      subCategory: req.body.subCategory,
      price: req.body.price,
      quantity: req.body.quantity,
      categoryImage: 'https://picsum.photos/300/300',
      subCategoryImage: 'https://picsum.photos/300/300',
    });

    res.status(200).json({
      msg: 'Item added successfully',
      newItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: 'Internal Server Error',
    });
  }
});


module.exports = router;