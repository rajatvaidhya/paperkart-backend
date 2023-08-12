const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description : {type: String, require:true},
  image: { type: String, required: true },
  price: {type: String, required:true},
  category: {type: String, required:true},
  quantity: {type: Number, required:true},
  categoryImage: {type: String, required: true},
  subCategory: {type: String, required:true},
  subCategoryImage: {type: String, required:true}
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;