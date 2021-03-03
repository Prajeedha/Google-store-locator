const express = require('express');
const mongoose=require('mongoose');
const { db } = require('./api/store');
const app = express();
const axios=require('axios');
const port=3000;
const Store=require('./api/store');
const GoogleMapsService=require('./api/googleMapsService');
const googleMapsService=new GoogleMapsService();
require('dotenv').config({path:'.env'});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

//connecting mongoose to the mongo db cluster
var mongourl=process.env.MONGO_URI;
mongoose.connect(mongourl,{
    useNewUrlParser:true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

app.use(express.json({limit:'50mb'}));

app.post('/api/stores',(req,res)=>{
    let dbStores=[];
   let stores=req.body;  
    stores.forEach((store)=>{
        dbStores.push({
        storeName:store.name,
        phoneNumber:store.phoneNumber,
        address:store.address,
        openStatusText:store.openStatusText,
        addressLines:store.addressLines,
        location:{
            type:'Point',
            coordinates:[
                store.coordinates.longitude,
                store.coordinates.latitude
            ]
        }
    })
 })
    
//     let dbStores=req.body;
//    var store=new Store({
//        storeName:"Test",
//        phoneNumber:"3298765987",
//        location:{
//            type:'Point',
//            coordinates:[
//                -118.376354,
//                34.063584
//            ]
//        }
//    })
//    store.save();
       res.send('Hello you have posted');
    Store.create(dbStores,(err,stores)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(stores);
        }
    })
});

app.get('/api/stores', (req, res) =>{
    const zipCode=req.query.zip_code;
    googleMapsService.getCoordinates(zipCode)
    .then((coordinates)=>{

    //code prior to adding googleMapsService
    // const googleMapsURL="https://maps.googleapis.com/maps/api/geocode/json";
    // axios.get(googleMapsURL,{
    //     params:{
    //         address:zipCode,
    //     key:"AIzaSyBWXFrugWX7_13LNu9QxG2XIALY_YztWhc"
    //     }
       
    // }).then((response)=>{
    //  const data=response.data;
    //  const coordinates=[
    //      data.results[0].geometry.location.lng,
    //      data.results[0].geometry.location.lat,
    //  ]
     Store.find({
         location:{
             $near:{
                 $maxDistance:3218,
                 $geometry:{
                     type:"Point",
                     coordinates:coordinates
                 }
             }
         }

     },(err,stores)=>{
         if(err){
             res.status(500).send(err);
         }else{
             res.status(200).send(stores);
         }
     })
    // console.log(coordinates);
    }).catch((error)=>{
        console.log(error);
    })
    // Store.find({},(err,stores)=>{
    //     if(err){
    //         res.status(500).send(err);
    //     }else{
    //         res.status(200).send(stores);
    //     }
    // })
})

app.delete('/api/stores',(req,res)=>{
Store.deleteMany({},(err)=>{
    res.status(200).send(err);
});
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));



