const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public')); // Serve static files like CSS

// Set the view engine to EJS for rendering HTML
app.set('view engine', 'ejs');

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1040', // Replace with your password
    database: 'vendor_database', // Replace with your database name
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Route to render the form.ejs page
app.get('/', (req, res) => {
    res.render('index'); // Render the form.ejs file
});

app.get('/user', (req, res) => {
    res.render('user'); // Renders login.ejs
});

app.get('/vendor', (req, res) => {
    res.render('vendor'); // Renders register.ejs
});

app.get('/vendor_home', (req, res) => {
    res.render('vendor_home'); // Renders register.ejs
});

app.get('/user_home', (req, res) => {
    res.render('user_home'); // Renders register.ejs
});

var vendor_login_email;

// Adding User
app.post('/add-user', (req, res) => {
    const { userID, name, email, phoneNumber, password, role, DepartmentID } = req.body;

    // Insert data into the Users table
    const query = `
        call registerUser(?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [userID, name, email, phoneNumber, password, role, DepartmentID], (err, result) => {
        if (err) throw err;
    });
    console.log('New user registered:', req.body);

    // After successful registration, redirect to the login page
    res.redirect('/user');
});

// Adding Vendor
app.post('/add-vendor', (req, res) => {
    const { vendorID, email, phoneNumber, password, serviceCategory } = req.body;

    // Insert data into the Users table
    const query = `
        CALL registerVendor(?, ?, ?, ?, ?)
    `;
    db.query(query, [vendorID, email, phoneNumber, password, serviceCategory], (err, result) => {
        if (err) throw err;
    });
    console.log('New vendor registered:', req.body);

    // After successful registration, redirect to the login page
    res.redirect('/vendor');
});

// Vendor Login
app.post('/vendor-login', (req, res) => {
    const { email, password } = req.body;

    vendor_login_email = email;

    // Query to check if the email and password match an existing vendor
    const query = `
        SELECT * FROM Vendor WHERE email = ? AND password = ?
    `;
    
    db.query(query, [email, password], (err, result) => {
        if (err) throw err;
        
        if (result.length > 0) {
            // If a matching vendor is found, login successful
            console.log('Vendor login successful:', result[0]);
            res.redirect('/vendor_home'); // Redirect to the vendor's home page after successful login
        } else {
            // If no matching vendor found, login failed
            console.log('Vendor login failed: Invalid credentials');
            res.redirect('/vendor'); // Redirect back to the login page for retry
        }
    });
});

// User Login
app.post('/user-login', (req, res) => {
    const { email, password } = req.body;

    // Query to check if the email and password match an existing vendor
    const query = `
        SELECT * FROM User WHERE email = ? AND password = ?
    `;
    
    db.query(query, [email, password], (err, result) => {
        if (err) throw err;
        
        if (result.length > 0) {
            // If a matching user is found, login successful
            console.log('User login successful:', result[0]);
            res.redirect('/user_home'); // Redirect to the user's home page after successful login
        } else {
            // If no matching user found, login failed
            console.log('User login failed: Invalid credentials');
            res.redirect('/user'); // Redirect back to the login page for retry
        }
    });
});

// Showing All Vendors
app.get('/vendors', (req, res) => {
    // Fetching vendor data from the database
    db.query('SELECT * FROM Vendor', (err, results) => {
        if (err) {
            console.error('Error fetching vendors:', err);
            return res.status(500).send('Database error');
        }

        // Respond with vendor data as JSON
        res.json(results);
    });
});

// Add a new vendor
app.post('/add-vendor-byuser', (req, res) => {
    const { vendorID, email, phoneNumber, password, serviceCategory } = req.body;

    const query = `
        CALL registerVendor(?, ?, ?, ?, ?)
    `;

    db.query(query, [vendorID, email, phoneNumber, password, serviceCategory], (err, result) => {
        if (err) {
            console.error('Error adding vendor:', err);
            return res.status(500).json({ success: false, message: 'Error adding vendor' });
        }

    });
});

// Generating Contract
app.post('/generate-contract', (req, res) => {
    const { ContractID, TermsAndConditions, ExpirationDate, SpecialClauses, VendorID, DepartmentID } = req.body;

    const contractQuery = `
        INSERT INTO Contract (ContractID, TermsAndConditions, ExpirationDate, SpecialClauses, VendorID) 
        VALUES (?, ?, ?, ?, ?)
    `;

    const departmentContractQuery = `
        INSERT INTO departmentcontract (DepartmentID, ContractID) 
        VALUES (?, ?)
    `;

    // Insert into Contract table first
    db.query(contractQuery, [ContractID, TermsAndConditions, ExpirationDate, SpecialClauses, VendorID], (err, result) => {
        if (err) {
            console.error('Error generating contract:', err);
            return res.status(500).json({ success: false, message: 'Error generating contract' });
        }

        // Insert into DepartmentContract table after Contract table is successful
        db.query(departmentContractQuery, [DepartmentID, ContractID], (err, result) => {
            if (err) {
                console.error('Error adding department to contract:', err);
                return res.status(500).json({ success: false, message: 'Error linking department to contract' });
            }
        });
    });
});

// Deleting vendor
app.post('/del-vendor', (req, res) => {
    const { vendorID } = req.body;

    const query = `
        DELETE FROM Vendor
        WHERE VendorID = ?;  
    `;

    db.query(query, [vendorID], (err, result) => {
        if (err) {
            console.error('Error deleting vendor:', err);
            return res.status(500).json({ success: false, message: 'Error deleting vendor' });
        }

    });
});

// Creating Purchase Order
app.post('/create-po', (req, res) => {
    const { PurchaseOrderID, Date, ItemID, Quantity, TotalAmount,
        Description, Status, DepartmentID, VendorID } = req.body;

    const query1 = `
        INSERT INTO purchaseorder (PurchaseOrderID, Date, Quantity, TotalAmount,
        Description, Status, DepartmentID, VendorID ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const query2 = `
        INSERT INTO purchaseorderitem (PurchaseOrderID, ItemID) 
        VALUES (?, ?)
    `;

    db.query(query1, [PurchaseOrderID, Date, Quantity, TotalAmount,
        Description, Status, DepartmentID, VendorID], (err, result) => {
        if (err) {
            console.error('Error creating purchase order:', err);
            return res.status(500).json({ success: false, message: err.sqlMessage || 'Error creating purchase order' });
        }
        db.query(query2, [PurchaseOrderID, ItemID], (err, result) => {
            if (err) {
                console.error('Error adding item to purchase order:', err);
                return res.status(500).json({ success: false, message: 'Error linking item to purchase order' });
            }
            res.json({ success: true, message: 'Purchase order created successfully!' });
        });
    });
});

// Showing Contracts
app.get('/contract', (req, res) => {

    const query = `
        SELECT * FROM contract
        WHERE VendorID = (SELECT VendorID FROM Vendor WHERE Email = ?)
    `;

    db.query(query, [vendor_login_email], (err, results) => {
        if (err) {
            console.error('Error fetching contracts:', err);
            return res.status(500).send('Database error');
        }

        // Respond with contracts as JSON
        res.json(results);
    });
});

// Showing Budget
app.get('/budget', (req, res) => {
    
    db.query('SELECT * FROM budget', (err, results) => {
        if (err) {
            console.error('Error fetching budget:', err);
            return res.status(500).send('Database error');
        }

        // Respond with vendor data as JSON
        res.json(results);
    });
});

// Performance Rating
app.post('/performance', (req, res) => {
    const { VendorID, PerformanceRating, FeedbackText } = req.body;

    const query = `
        INSERT INTO vendormanagement (VendorID, PerformanceRating, FeedbackText) 
        VALUES (?, ?, ?)
    `;

    db.query(query, [VendorID, PerformanceRating, FeedbackText], (err, result) => {
        if (err) {
            console.error('Error adding vendor:', err);
            return res.status(500).json({ success: false, message: 'Error adding vendor' });
        }

    });
});

// Showing Performance
app.get('/show-performance', (req, res) => {
    const query = `
        SELECT *
        FROM vendormanagement
        JOIN Vendor ON vendormanagement.VendorID = Vendor.VendorID
        WHERE Vendor.Email = ?;
    `;

    db.query(query, [vendor_login_email], (err, results) => {
        if (err) {
            console.error('Error fetching performance:', err);
            return res.status(500).send('Database error');
        }

        // Respond with performance as JSON
        res.json(results);
    });
});

// Showing Login details to Vendor
app.get('/vendor-loginInfo', (req, res) => {
    
    const query = `
        SELECT * FROM vendor
        WHERE Email = ?
    `;

    db.query(query, [vendor_login_email], (err, results) => {
        if (err) {
            console.error('Error fetching contracts:', err);
            return res.status(500).send('Database error');
        }

        // Respond with contracts as JSON
        res.json(results);
    });
});

// Contract Exp Date
app.get('/contract-date', (req, res) => {
    
    const query = `
        SELECT * FROM contract
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching contracts:', err);
            return res.status(500).send('Database error');
        }
        // Respond with contracts as JSON
        res.json(results);
    });
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
