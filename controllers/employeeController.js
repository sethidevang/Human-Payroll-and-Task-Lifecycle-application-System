const employee = require('../models/employeeSchema');
const bcrypt = require('bcrypt');

const addEmployee = async (req, res) => {
    try {
        const { firstName, lastName, address, email, age, salary, designation, passportNumber, nominee, userId, password } = req.body;
        
        // Basic Validation
        if (!firstName || !lastName || !email || !userId || !password || !req.file) {
            return res.status(400).json({ error: "Please fill in all required fields and upload a profile photo." });
        }

        const parsedAge = parseInt(age);
        const parsedSalary = parseInt(salary);
        const parsedUserId = parseInt(userId);

        if (isNaN(parsedAge) || isNaN(parsedSalary) || isNaN(parsedUserId)) {
            return res.status(400).json({ error: "Age, Salary, and User ID must be valid numbers." });
        }

        // Check for existing employee by userId or email
        const checkId = await employee.findOne({ where: { userId: parsedUserId } });
        if (checkId) {
            return res.status(409).json({ error: "An employee with this User ID already exists." });
        }

        const checkEmail = await employee.findOne({ where: { email: email } });
        if (checkEmail) {
            return res.status(409).json({ error: "An employee with this email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new employee record
        const data = await employee.create({
            firstName,
            lastName,
            address,
            email,
            age: parsedAge,
            salary: parsedSalary,
            designation,
            passportNumber,
            nominee,
            userId: parsedUserId,
            password: hashedPassword,
            photo: req.file.filename
        });

        res.status(201).json({
            message: 'Employee account created successfully!',
            data: data
        });
    } catch (err) {
        console.error("Error adding employee:", err);
        res.status(500).json({ error: "An internal server error occurred while creating the account." });
    }
}

module.exports = { addEmployee };