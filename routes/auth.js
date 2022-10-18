const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET= "sajidisagood$boy";

//route:1   Create a user using: POST "/api/auth/createuser". Doesnt require Auth
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // if there are errors retrn bad request and teh errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // check whther the user exists with this email  already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "sorry a user with this email already exists" });
      }
      const salt =await bcrypt.genSalt(10);
      secPass =await bcrypt.hash(req.body.password, salt) 
        //create a new user
        user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: secPass,
        });
      

      //   .then(user => res.json(user)).catch(err=> {console.log(err)
      //     res.json({error: 'Please enter a valid email', message: err.message})})
      
          const data = {
            user:{
                id: user.id
            }
        }

       const authToken = jwt.sign(data, JWT_SECRET);
    //    console.log(authToken);
    


    //   res.json(user);
    res.json({authToken})
      //catch errors
    } catch (error) {
      console.log(error.message);
      res.status(500).send("some error occure");
    }
  }
);

//route:2  Authenticate a user using : POST "/api/auth/Login".No Login required
router.post(
    "/login",
    [
      body("email", "Enter a valid Email").isEmail(),
      body("password", "passwor cannot be blanck").exists(),
      
    ],
    async (req, res) => {
          
         // if there are errors retrn bad request and teh errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    try {
         let user =await User.findOne({email});
         if(!user){
            return res.status(400).json({error: "please try to login with correct information"});
              
         }

         const passwordCompare =await bcrypt.compare(password, user.password);
         if(!passwordCompare){
            return res.status(400).json({error: "please try to login with correct information"});
            
         }
         const data = {
            user:{
                id: user.id
            }
        }

       const authToken = jwt.sign(data, JWT_SECRET);
       res.json({authToken})

    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error");
      }


    }); 



    //route:3 Get loggedin user detail : POST "/api/auth/getuser".Login required
    router.post( "/getuser",fetchuser, async (req, res) => {

     try {
        userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user);
} catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
        });

module.exports = router;
