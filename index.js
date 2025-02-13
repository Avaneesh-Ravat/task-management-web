const express = require("express");
const app = express();
const Task = require("./models/taskSchema.js");
const User = require("./models/userSchema.js");
 
const bcrypt = require("bcrypt");
// const cors = require("cors"); 

const mongoose = require("mongoose");

// app.use(cors);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(express.static("public"));

async function main(){
    await mongoose.connect(`mongodb+srv://companywebsite:Avi123%40%40@taskmanagement.qnttd.mongodb.net/taskmanagement?retryWrites=true&w=majority&appName=TaskManagement`);
    console.log(mongoose.connection.host);
}

main().then((res)=>{
    console.log(res); 
}).catch((err)=>{
    console.log(err);
});

//to register the page
app.get("/", (req, res)=>{
    res.render("register.ejs");
});


app.post("/user", async(req, res)=>{
    let{name, email, password} = req.body;
    password = await bcrypt.hash(password, 10);
    let user = new User({name, email, password});

    await user.save().then((result)=>{
        console.log(result);
        res.redirect(`/tasks/${result._id}`);
    }).catch((err)=>{
        console.log(err);
    });
});

app.get("/login", (req, res)=>{
    let msg="";
    res.render("login.ejs", {msg});
})

app.post("/user-login", async(req, res)=>{
    let{email, password} = req.body;
    let user = await User.findOne({email: email});
    if(!user){
        let msg = "User not found!";
        return res.render("/login", {msg});
    }

    let pass_match = await bcrypt.compare(password, user.password);

    if(pass_match){
        res.redirect(`/tasks/${user.id}`);
    }else{
        let msg="Invalid credentials!";
        res.render("/login", {msg});
    }

});

//to show today's task
app.get("/tasks/:id", async(req, res)=>{
    let {id} = req.params;
    // console.log("inside backend");
    let current_date = new Date().toISOString().split('T')[0];
    let high_tasks = await Task.find({date: current_date, priority:"High", user_id: id});
    let medium_tasks = await Task.find({date: current_date, priority:"Medium", user_id: id});
    let low_tasks = await Task.find({date: current_date, priority:"Low", user_id: id});
    let user = await User.findOne({_id: id});
    let name = user.name;
    res.render("index.ejs", {high_tasks, medium_tasks, low_tasks, id, name});
});

//to render new task form
app.get("/tasks/new/:id", (req, res)=>{ 
    let {id} = req.params;
    res.render("addTask.ejs", {id});
});

//to add new task
app.post("/tasks/:id", async(req, res)=>{
    let {id} = req.params;
    console.log(req.body);
    console.log(id);
    let{date, task, priority, status} = req.body;
    let t = new Task({user_id: id, date: date, task: task, priority: priority, status: status});
    await t.save();
    res.redirect(`/tasks/${id}`);
});



// due this week
app.get("/week-due/:id", async(req, res)=>{
    let {id} = req.params;
    let user = await User.findOne({_id: id});
    let name = user.name;

    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(new Date().getDate() + (6 - new Date().getDay())); // End of the week (Saturday)

    const formattedToday = today.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
    const formattedEndOfWeek = endOfWeek.toISOString().split("T")[0];

    const tasks = await Task.find({
        date: { $gte: formattedToday, $lte: formattedEndOfWeek },
        user_id: id
    });

    console.log(tasks);
    res.render("weekDue.ejs", {tasks, name, id});

});



//over due tasks
app.get("/overdue/:id", async(req, res)=>{
    let {id} = req.params;
    let user = await User.findOne({_id: id});
    let name = user.name;
    
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // Convert to YYYY-MM-DD

    const tasks = await Task.find({
        date: { $lt: formattedToday},
        user_id: id,
        status: {$ne: "Completed"}
    });

    res.render("overDue.ejs", {tasks, name, id});

});

app.listen(8080, ()=>{
    console.log("listening on port 8080");
});