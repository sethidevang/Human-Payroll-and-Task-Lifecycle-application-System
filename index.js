const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 8000;
const bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
const bcrypt = require('bcrypt');

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// Set session
// app.use(session({
//   secret: 'acjsbjabdjkbc',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true }
// }));
app.use(session({
  secret: 'acjsbjabdjkbc',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookies only in production
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Authenticate all routes
app.use(passport.authenticate('session'));

// MARK: - Database Content
const employeeModel = require('./models/employeeSchema');
const leaveRequestModel = require('./models/leaveRequestSchema');
const taskModel = require('./models/taskSchema');
const SupportRequestModel = require('./models/supportRequest');
const attendanceModel = require('./models/attendanceSchema');
const payrollModel = require('./models/payrollSchema');
const performanceModel = require('./models/performanceSchema');

const employeeController = require('./controllers/employeeController');
const leaveRequestController = require('./controllers/leaveRequestController');
const taskController = require('./controllers/taskController');

// const dBConnect = require('./middlewares/dB');
// dBConnect();
const createAdminUser = async () => {
  try {
      // Check if admin already exists
      const adminExists = await employeeModel.findOne({ where: { email: 'admin@hrsuite.com' } });
      if (adminExists) {
          console.log('Admin user already exists.');
          return;
      }

      // Create new admin user
      const admin = new employeeModel({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@hrsuite.com',
          password: await bcrypt.hash('password@12', 10), // Hash the password
          designation: 'Admin',
          userId: 1, // Set a unique user ID for the admin
          address: 'Admin Address',
          age: 30,
          salary: 0,
          passportNumber: 'N/A',
          nominee: 'N/A'
      });
      await admin.save();
      console.log('Admin user created successfully.');
  } catch (error) {
      console.error('Error creating admin user:', error);
  }
};

// Call the function after connecting to the database
const dBConnect = require('./middlewares/dB');
dBConnect().then(() => {
  createAdminUser();
});

// Sequelize models don't need to be called as functions
// employeeModel();
// leaveRequestModel();
// taskModel();

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
      callback(null, path.join(__dirname, 'uploads')); // Uploads folder
  },
  filename: function(req, file, callback) {
      const userId = req.body.userId; // Get the user ID from the form data
      callback(null, userId + path.extname(file.originalname)); // Correct use of `callback`
  }
});
const upload = multer({ storage: storage });

// MARK: - Routes
app.get("/", (req, res) => {
  // res.send("Hello world");
  res.render("landing");
});
app.get('/dummy', (req, res)=>{
  res.render("dummy");
})

// MARK:- Admin Log In and Log Out

const ensureAdmin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect('/admin-login');
  }
  next();
};

// Apply middleware to all admin routes
app.use('/admin', ensureAdmin);

const isAdminSessionAvailable = (req, res, next) => {
  if (req.session.adminId) {
    return true;
  }
  return false;
}

const checkAdminLoggedIn = (req, res, next) => {
  if (req.session.adminId) {
    return res.redirect('/admin/admin-dashboard'); // Redirect to the dashboard if logged in
  }
  next(); // Otherwise, allow access to the login page
};

app.get("/admin/check-state", isAdminSessionAvailable, (req, res) => {});

app.get("/admin-login", checkAdminLoggedIn, (req, res) => {
  passport.authenticate('session'),
  res.render("admin-login");
});

app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await employeeModel.findOne({ where: { email: email, designation: 'Admin' } });

    if (!admin) {
      return res.status(401).render('admin-login', { error: 'Invalid email or password' });
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).render('admin-login', { error: 'Invalid email or password' });
    }

    console.log("Admin Logged In");

    // Set session
    req.session.adminId = admin.id; // Save admin ID to the session
    res.redirect('/admin/admin-dashboard');
  } catch (err) {
    console.error('Error during admin login:', err);
    return res.status(500).render('admin-login', { error: 'Internal server error. Please try again.' });
  }
});

app.get('/admin/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).send("Error logging out. Please try again.");
    }
    console.log("Admin Logged Out");
    // Redirect to the admin login page
    res.redirect('/admin-login');
  });
});

// MARK:- Employee Log In and Log Out

const isEmployeeSessionAvailable = (req, res, next) => {
  if (req.session.adminId) {
    return true;
  }
  return false;
}

const checkEmployeeLoggedIn = (req, res, next) => {
  if (!req.session.employeeId) {
    return res.redirect('/employee-login'); // Redirect to login if not signed in
  }
  next(); // Proceed to the next middleware or route handler
};

app.get("/employee/check-state", isEmployeeSessionAvailable, (req, res) => {});

// Employee login page
app.get("/employee-login", (req, res) => {
  if (req.session.employeeId) {
    return res.redirect('/employee-dashboard'); // Redirect to dashboard if already logged in
  }
  res.render("employee-login"); // Render login page
});

// Employee login authentication
app.post('/employee-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await employeeModel.findOne({ where: { email: email } });

    if (!employee) {
      return res.status(401).render('employee-login', { error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).render('employee-login', { error: 'Invalid email or password' });
    }

    console.log("Employee Logged In");

    req.session.employeeId = employee.userId; // Save employee ID to the session
    res.redirect('/employee-dashboard');
  } catch (err) {
    console.error('Error during employee login:', err);
    res.status(500).render('employee-login', { error: 'Internal server error. Please try again.' });
  }
});

// Employee logout
app.get('/employee-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Error logging out. Please try again.');
    }
    console.log("Employee Logged Out");
    res.redirect('/employee-login'); // Redirect to login page after logout
  });
});

// MARK: - Admin APIs
app.get("/admin/admin-dashboard", async (req, res) => {
  try {
    const employeeCount = await employeeModel.count();
    const leaveCount = await leaveRequestModel.count();
    const acceptedLeaveCount = await leaveRequestModel.count({ where: { status: 'Approved' } });
    const tasksPendingCount = await taskModel.count({ where: { status: false } });
    const tasksCompletedCount = await taskModel.count({ where: { status: true } });
    const pendingPayrollsCount = await payrollModel.count({ where: { status: 'Pending' } });

    res.render("admin-Dashboard", {
      employeeCount: employeeCount - 1,
      acceptedLeaveCount: acceptedLeaveCount,
      leaveCount: leaveCount - acceptedLeaveCount,
      tasksPendingCount: tasksPendingCount,
      tasksCompletedCount: tasksCompletedCount,
      pendingPayrollsCount: pendingPayrollsCount
    });
  } catch (err) {
    console.error("Error fetching data: ", err);
    res.status(500).send("Error retrieving information. Please try again later.");
  }
});

app.get("/admin/admin-attendance", async (req, res) => {
  try {
    const leaveRequests = await leaveRequestModel.findAll();
    const employees = await employeeModel.findAll({ attributes: ["userId", "firstName", "lastName"] });
    
    res.render("admin-dashboard/admin-attendance", {
      leaveRequests: leaveRequests,
      employees: employees
    });
  } catch(err) {
    console.error("Error fetching data: ", err);
    res.status(500).send("Error retrieving data. Please try again later.");
  }
});
app.post('/admin/update-leave-status', leaveRequestController.updateLeaveRequestStatus);

app.get("/admin/report", (req, res) => {
  res.render("admin-dashboard/report");
});
app.get("/admin/add-employee", ensureAdmin, (req, res) => {
  res.render("admin-dashboard/employee-add");
});
app.post('/admin/add-employee', ensureAdmin, upload.single('photo-upload'), employeeController.addEmployee);
app.get("/admin/IDCard", async (req, res) => {
  try {
      const employeeRequests = await employeeModel.findAll();
      res.render("admin-dashboard/IDCard", {
        employees: employeeRequests
      });
  } catch (err) {
      console.error("Error fetching employee data: ", err);
      res.status(500).send("Error retrieving employee information. Please try again later.");
  }
});
app.get("/admin/admin-payroll", async (req, res) => {
  try {
      const employeeRequests = await employeeModel.findAll({ attributes: ['userId', 'firstName', 'lastName', 'designation', 'salary'] });
      const taskRequests = await taskModel.findAll();
      res.render("admin-dashboard/admin-payroll", {
        employees: employeeRequests,
        tasks: taskRequests
      });
  } catch (err) {
      console.error("Error fetching task data:", err);
      res.status(500).send("Error retrieving task information. Please try again later.");
  }
});
app.get("/admin/admin-task", async (req, res) => {
  try {
      const employeeRequests = await employeeModel.findAll({ attributes: ['userId', 'firstName', 'lastName', 'designation'] });
      const taskRequests = await taskModel.findAll();
      res.render("admin-dashboard/admin-task", {
        employees: employeeRequests,
        tasks: taskRequests
      });
  } catch (err) {
      console.error("Error fetching task data:", err);
      res.status(500).send("Error retrieving task information. Please try again later.");
  }
});
app.get('/admin/tasks', async (req, res) => {
  try {
      const tasks = await taskModel.findAll();
      res.json(tasks);
  } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).send("Internal Server Error");
  }
});
app.post('/admin/toggle-task-status', taskController.taskToggleStatus);
app.post('/admin/add-task', taskController.taskAssignment);
app.delete('/admin/delete-task', taskController.taskDelete);

// MARK: - Employee APIs
app.use('/employee-dashboard', checkEmployeeLoggedIn);

app.get("/employee-dashboard", async (req, res) => {
  try {
    const id = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId: id } });
    const tasks = await taskModel.findAll({ where: { userId: id }, order: [['createdAt', 'DESC']] });
    const tasksPendingCount = (await taskModel.count({
      where: {
        userId: id,
        status: false
      }
    }));
    const tasksCompletedCount = (await taskModel.count({
      where: {
        userId: id,
        status: true
      }
    }));
    const leaveRequestsCount = await leaveRequestModel.count({
      where: {
        userId: id,
        status: 'Pending'
      }
    });

    // Fetch Attendance Data
    const presentDays = await attendanceModel.count({
      where: { userId: id, status: 'Present' }
    });
    const leaveDays = await attendanceModel.count({
      where: { userId: id, status: 'On Leave' }
    });

    // Fetch Payroll Data
    const lastPayroll = await payrollModel.findOne({
      where: { userId: id },
      order: [['paymentDate', 'DESC']]
    });

    // Fetch Performance Data
    const latestReview = await performanceModel.findOne({
      where: { userId: id },
      order: [['lastReviewDate', 'DESC']]
    });
    
    res.render("employee-dashboard", {
      tasksPendingCount: tasksPendingCount,
      tasksCompletedCount: tasksCompletedCount,
      leaveRequestsCount,
      presentDays,
      leaveDays,
      lastPayment: lastPayroll ? `$${lastPayroll.amount}` : 'N/A',
      nextPaymentDate: lastPayroll ? lastPayroll.nextPaymentDate : 'N/A',
      lastReviewDate: latestReview ? latestReview.lastReviewDate : 'N/A',
      nextReviewDate: latestReview ? latestReview.nextReviewDate : 'N/A',
      username: user.firstName + " " + user.lastName,
      userId: user.userId,
      tasks: tasks // Add tasks to the template
    });
  } catch (err) {
    console.error("Error Retreiving Data: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/employee-dashboard/:id/:name", (req, res) => {
  res.send(`employee id: ${req.params.id} employee name: ${req.params.name}`);
});

app.get("/employee-dashboard/task", async (req, res) => {
  try {
    const id = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId: id } });
    const tasks = await taskModel.findAll({ 
      where: { userId: id },
      order: [['createdAt', 'DESC']] 
    });
    res.render("employee-dashboard/task", {
      tasks: tasks,
      username: user.firstName + " " + user.lastName,
      userId: user.userId
    });
  } catch (err) {
    console.error("Error fetching tasks: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/employee-dashboard/attendance", async (req, res) => {
  try {
    const id = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId: id } });
    const attendanceRecords = await attendanceModel.findAll({
      where: { userId: id },
      order: [['date', 'DESC']]
    });
    res.render("employee-dashboard/attendance", {
      attendance: attendanceRecords,
      username: user.firstName + " " + user.lastName,
      userId: user.userId
    });
  } catch (err) {
    console.error("Error fetching attendance: ", err);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/employee-dashboard/payroll", async (req, res) => {
  try {
    const id = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId: id } });
    const payrollRecords = await payrollModel.findAll({
      where: { userId: id },
      order: [['paymentDate', 'DESC']]
    });
    res.render("employee-dashboard/payroll", {
      payroll: payrollRecords,
      username: user.firstName + " " + user.lastName,
      userId: user.userId,
      basicSalary: user.salary
    });
  } catch (err) {
    console.error("Error fetching payroll: ", err);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/employee-dashboard/performance", async (req, res) => {
  try {
    const id = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId: id } });
    const performanceReviews = await performanceModel.findAll({
      where: { userId: id },
      order: [['lastReviewDate', 'DESC']]
    });
    res.render("employee-dashboard/performance", {
      performance: performanceReviews,
      username: user.firstName + " " + user.lastName,
      userId: user.userId
    });
  } catch (err) {
    console.error("Error fetching performance: ", err);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/employee-dashboard/trainingSession", async (req, res) => {
  try {
    const id = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId: id } });
    res.render("employee-dashboard/trainingSession", {
      username: user.firstName + " " + user.lastName,
      userId: user.userId
    });
  } catch (err) {
    console.error("Error Retreiving Data: ", err);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/employee-dashboard/leaveRequest", async (req, res) => {
  try {
      const id = req.session.employeeId;
      const user = await employeeModel.findOne({ where: { userId: id } });
      const leaveRequests = await leaveRequestModel.findAll();
      res.render("employee-dashboard/leaveRequest", {
          leaves: leaveRequests,
          username: user.firstName + " " + user.lastName,
          userId: user.userId
      });
  } catch (err) {
      console.error("Error fetching leave requests: ", err);
      res.status(500).send("Internal Server Error");
  }
});
app.post('/leave-request', leaveRequestController.leaveRequest);
app.get("/employee-dashboard/settings", async (req, res) => {
  try {
    const id = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId: id } });
    res.render("employee-dashboard/settings", {
      username: user.firstName + " " + user.lastName,
      userId: user.userId,
      employee: user
    });
  } catch (err) {
    console.error("Error Retreiving Data: ", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/employee-dashboard/settings/update-password", async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.employeeId;

    // Find the employee by userId
    const employee = await employeeModel.findOne({ where: { userId: userId } });

    if (!employee) {
      return res.status(404).send("Employee not found");
    }

    // Check if old password matches the current password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, employee.password);
    if (!isOldPasswordValid) {
      return res.status(400).send("Old password is incorrect");
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match");
    }

    // Hash the new password before saving
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    employee.password = hashedNewPassword;
    await employee.save();

    // Redirect or send a response
    res.redirect("/employee-dashboard/settings"); // Redirect back to settings page or dashboard

  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/employee-dashboard/settings/set-notifications-sms", async (req, res) => {
  try {
    const { emailNotifications, smsNotifications } = req.body;
    const userId = req.session.employeeId;

    // Find the user by ID and update the notification preferences
    const updatedUser = await employeeModel.findOneAndUpdate(
      { userId: userId },
      { emailNotifications: emailNotifications === 'on', smsNotifications: smsNotifications === 'on' },
      { new: true }
    );

    res.redirect("/employee-dashboard/settings"); // Redirect to the settings page after updating preferences
  } catch (err) {
    console.error("Error updating notification preferences:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Support request route
app.post("/support/request", async (req, res) => {
  try {
    const { issue } = req.body;
    const userId = req.session.employeeId;

    // Assuming you have a SupportRequest model to store support requests
    const newRequest = new SupportRequestModel({
      userId: userId,
      issue: issue,
      createdAt: new Date(),
    });

    // Save the support request
    await newRequest.save();

    // Redirect to a confirmation page or back to the dashboard
    res.redirect("/employee-dashboard"); // Or render a confirmation message
  } catch (err) {
    console.error("Error submitting support request:", err);
    res.status(500).send("Internal Server Error");
  }
});


// MARK: - Task API for Employee Dashboard
app.post('/api/tasks', checkEmployeeLoggedIn, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.session.employeeId;
    const user = await employeeModel.findOne({ where: { userId } });

    const lastTask = await taskModel.findOne({ order: [['taskId', 'DESC']] });
    const newTaskId = lastTask ? lastTask.taskId + 1 : 1;

    const newTask = await taskModel.create({
      userId,
      taskId: newTaskId,
      name: user.firstName + " " + user.lastName,
      designation: user.designation,
      title,
      description: 'Self-assigned task',
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
      status: false
    });

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/tasks/:taskId', checkEmployeeLoggedIn, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await taskModel.findOne({ where: { taskId, userId: req.session.employeeId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = !task.status;
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/tasks/:taskId', checkEmployeeLoggedIn, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await taskModel.findOne({ where: { taskId, userId: req.session.employeeId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// MARK: - Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
