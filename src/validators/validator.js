const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;


  const isValidId = function (id) {
    return ObjectId.isValid(id);
  };
  const isValid = (value) => {
    if (typeof value === "undefined" || typeof value === "null") return true;
    if (typeof value === "string" && value.trim().length != 0) return true;
    if (typeof value === "object" && Object.keys(value).length == 0) return true;
  
    return false;
  };
  

  module.exports ={isValidId, isValid}