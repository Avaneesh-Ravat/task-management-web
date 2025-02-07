
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Task = require("./models/taskSchema.js");

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/taskmanagement");
}

main().then((res)=>{
    console.log(res);
}).catch((err)=>{
    console.log(err);
});

const tasks = Array.from({ length: 10 }, (_, i) => ({
    date: new Date().toISOString().split('T')[0], // Today's date
    task: `Task ${i + 1}`,
    priority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)], // Random priority
    status: ["Pending", "In Progress", "Completed"][Math.floor(Math.random() * 3)] // Random status
}));
const t = [{date: new Date().toISOString().split('T')[0], task: "Hey, you are assigned with a task management project which was given by 23 villa company for last year recruitment process you have to complete it till 7th of feb and submit it to your assigned faculty", 
    priority: "High",
    status: "Pending"
}];


Task.insertMany(t);
Task.insertMany(tasks);

app.get("/", (req, res)=>{
    res.send("working root");
});

app.listen(8080, ()=>{
    console.log("App is listening on 8080");
});
  
