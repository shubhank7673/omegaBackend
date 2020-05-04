// this model is never used anywhere but is structure of how a file is stored in user model
const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    id:{
        type:mongoose.Types.ObjectId,
        require:true
    },
    fullName:{
        type:String,
        require:true
    },
    clientName:{
        type:String,
        require:true
    },
    serverName:{
        type:String,
        require:true
    },
    uploadDate:{
        type:Date,
        require:true
    },
    extension:{
        type:String,
        require:true
    },
    shared:{
        type:Boolean,
        require:true
    }
})
module.exports = mongoose.model("File",fileSchema);