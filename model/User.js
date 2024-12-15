
// const mongoose = require('mongoose');
// const {Schema,model} = mongoose;

// const UserSchema = new Schema({
//     name:{type:String ,required:true, min:4},
//     dob:{type:Date ,required:true},
//     location:{type:String ,required:true},
//     subject:{type:String ,required:true},
// });

// const UserModel = model('User', UserSchema);

// module.exports = UserModel;

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true, min: 4 },
    dob: { type: Date, required: true },
    location: { type: String, required: true },
    subject: { type: String, required: true },
    // New field to store image path
    imagePath: { type: String, required: true },  // Path to the uploaded image
});

const UserModel = model('User', UserSchema);

module.exports = UserModel;
