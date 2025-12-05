require("dotenv").config();
const express = require("express");
const { createClient } = require("redis");
const cors = require("cors");

const app = express();
const port = 3001;
const API_KEY = "123456";

app.use(cors());
app.use(express.json());
app.use((req,res,next)=>{
    const key = req.headers['x-api-key'];
    if(!key || key!==API_KEY) return res.status(401).json({error:"Unauthorized"});
    next();
});

const client = createClient({ url: process.env.REDIS_URL });
client.on("error", err => console.error("Redis error:", err));

async function start(){
    await client.connect();
    console.log("Connected to Redis");
    app.listen(port,()=>console.log(`Redis API running on port ${port}`));
}

// READ
app.get("/api/redis/todos", async (req,res)=>{
    const ids = await client.lRange("todo:ids",0,-1);
    const todos=[];
    for(const id of ids){
        const data = await client.get(`todo:${id}`);
        if(data) {
            const t=JSON.parse(data);
            todos.push({id:t.id, text:t.title, done:t.completed});
        }
    }
    res.json({data:todos});
});

// CREATE
app.post("/api/redis/todos", async (req,res)=>{
    const {text} = req.body;
    if(!text) return res.status(400).json({error:"Title required"});
    const id = await client.incr("todo:id");
    const todo={id, title:text, completed:false, createdAt:new Date().toISOString()};
    await client.set(`todo:${id}`, JSON.stringify(todo));
    await client.rPush("todo:ids", id.toString());
    res.json({id, text, done:false});
});

// UPDATE
app.put("/api/redis/todos/:id", async (req,res)=>{
    const {text, done} = req.body;
    const id=req.params.id;
    const oldTodo = await client.get(`todo:${id}`);
    if(!oldTodo) return res.status(404).json({error:"Todo not found"});
    const updated = {...JSON.parse(oldTodo)};
    if(text!==undefined) updated.title=text;
    if(done!==undefined) updated.completed=done;
    await client.set(`todo:${id}`, JSON.stringify(updated));
    res.json({id:updated.id, text:updated.title, done:updated.completed});
});

// DELETE
app.delete("/api/redis/todos/:id", async (req,res)=>{
    const id=req.params.id;
    const deleted=await client.del(`todo:${id}`);
    if(deleted===0) return res.status(404).json({error:"Todo not found"});
    await client.lRem("todo:ids",1,id);
    res.json({message:"Todo deleted"});
});

start();
