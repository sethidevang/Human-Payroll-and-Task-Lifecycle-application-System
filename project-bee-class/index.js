const express = require("express");
const app = express();
const multer = require("multer");
const PORT = 8000;
app.set('view engine', 'ejs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Specify the folder to save the uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a unique name
    }
  });
  
  // Initialize Multer with the defined storage
  const upload = multer({ storage: storage });
app.use(express.urlencoded({ extended: true }));

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

app.get("/", (req, res)=>{
    res.send("Hello world");
});
app.get("/admin-login", (req, res)=>{
    // res.send("ADMIN PAGE GET");
    res.render("admin-login.ejs");
});
app.get("/employee-add", (req, res)=>{
    res.render("employee-add.ejs");
})
app.get("/admin-dashboard", (req, res)=>{
    // res.send("ADMIN DASHBOARD");
    res.render("admin-dashboard.ejs");
})
app.get("/employee-login", (req, res)=>{
    // res.send("EMPLOYEE-LOGIN PAGE");
    res.render("employee-login");
});
app.get("/employee-dashboard/:id/:name", (req, res)=>{
    res.send(`employee id: ${req.params.id} employee name: ${req.params.name}`);
});
app.post('/employee-add', upload.single('photo-upload'), (req, res) => {
    // Access form data
    const { firstName, lastName, email, age, salary, designation } = req.body;
  
    // Access uploaded file info
    const fileInfo = req.file;
  
    console.log('Form Data:', req.body);
    console.log('Uploaded File:', fileInfo);
  
    // Handle the form submission logic (e.g., save data to a database)
  
    res.send('Employee added successfully!');
  });
app.listen(8000, (req, res)=>{
    console.log(`server started at ${PORT}`);
});