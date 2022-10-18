const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Notes');
const { body, validationResult } = require("express-validator");



// Route 1: Get All the Notes using: GET "/api/auth/getnotes". Login required
router.get('/fetchallnotes',fetchuser, async(req, res)=>{

    try {     
    const notes = await Note.find({user: req.user.id});
    res.json(notes);

} catch (error) {
    console.log(error.message);
    res.status(500).send("some error occured");
}
})

// Route 2:Add a new post using: POST "/api/auth/addnotes". Login required
router.post('/addnote',fetchuser, [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "description must be at least 5 characters").isLength({ min: 5,}),],
     async(req, res)=>{

      try {

        const {title, description, tag, date} = req.body;
    // if there are errors retrn bad request and teh errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note = new Note({
       title, description, tag, user: req.user.id
    })
    const savedNote = await note.save()
    
    res.json(savedNote);

} catch (error) {
    console.log(error.message);
    res.status(500).send("some error occuree");
}

})

// Route 3:Update an existing Note using: PUT "/api/auth/addnotes". Login required
router.post('/updatenote/:id',fetchuser, async(req, res)=>{
     const {title, description, tag} = req.body;
     try {
     //crate a new note object
     const newNote = {};
     if(title){newNote.title = title};
     if(description){newNote.description = description};
     if(tag){newNote.tag = tag};   
     
     
     //find the note to be updated and update it
    //  const note = Note.findByIdAndUpdate()
    let note =await Note.findById(req.params.id);
    if(!note){res.status(400).send("not found")}

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }
      
    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
     res.json({note})

    }
    catch (error) {
        console.log(error.message);
        res.status(500).send("some error occuree");
    }
    

     });



     // Route 4:Delete an existing Note using: DELETE "/api/notes/deletenotes". Login required
router.delete('/deletenote/:id',fetchuser, async(req, res)=>{
       //crate a new note object
    
    //find the note to be deleted and delete it
   //  const note = Note.findByIdAndUpdate()
   try {
    
   
   let note =await Note.findById(req.params.id);
   if(!note){res.status(400).send("not found")}

   // Allow deletion only if user owns this Note
   if(note.user.toString() !== req.user.id){
       return res.status(401).send("Not Allowed");
   }
     
   note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Success": "your Note has been deleted", note: note})
}
catch (error) {
    console.log(error.message);
    res.status(500).send("some error occuree");
}

    });


module.exports= router