//Importing express 
const express=require('express');
const app=express();


//Importing BodyParser for Post protocol

const BodyParser=require('body-parser');

app.use(BodyParser.json());
//Import Zod
const zod=require('zod');

//Import mongoose

const mongoose=require('mongoose');


const user=mongoose.connect('mongodb://localhost:27017/');

const documentStructure={
    Name:String,
    Address:String,
    Age:Number,
    Password:String

}


const developer=mongoose.model('Dataset',documentStructure);


//Input Structure
const schema=zod.object({
    Name:zod.string().min(1),
    Address:zod.string().email().min(9),
    Age:zod.number().min(18),
    Password:zod.string().min(6)

})

app.get('/databaseconnection',(req,res)=>{
    setTimeout(()=>{
        user.then(()=>{
            res.send("DataBase connected");
        }).catch(()=>{
            res.send("DataBase connection failed");

        })
    },5000)
})

//
let Registration_Data;
let is_Registration=0;
app.post('/register',async(req,res)=>{
    const {Name,Address,Age,Password}=req.body;

    const response=schema.safeParse({Name,Address,Age,Password});


  
    if(response.success){
      const exists=await developer.findOne({Address:Address});
        if(exists){
            res.send("User Already Exists")

        }
        else if(!exists){ 
            const People=new developer({
                 Name:Name,
                 Address:Address,
                 Age:Age,
                 Password:Password
            });
            People.save().then(()=>{
                is_Registration=1;
                Registration_Data={
                    Name:Name,
                    Address:Address
                }
                 
                res.status(201).send("SucessFully Done......")
            }).catch(()=>{
                is_Registration=2;
                res.status(401).send("Failed ...........")
            })

        }
        
        
    }else{
        const errors = response.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
        }));
        
        if(errors[0].path==Address){
            res.send(errors);

        }
        else{
            res.send(errors);
        }
     
    }


})


app.get('/registationstatus',(req,res)=>{
    if(is_Registration==0){
        res.send('<h5>Loading.......<h5/>');
    }
    else if(is_Registration==1){
        
        res.json({
            
            Registration_Data

        })


    }
    else{
        res.send('<h2>User Registation Failed</h2>')

    }

})




app.listen(3001);