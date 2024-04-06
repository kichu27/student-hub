
//packages used in our project
import mysql from "mysql";
import express from 'express';
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from "cookie-parser";
import fs from "fs"



//paths to the files are accessed by the below variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// complete backend functionality in express .. get , set , post all functions  
const app = express();

// below are configurations/rules for nodejs 
app.use(bodyParser.urlencoded({ extended: true }) );
app.use(express.static('public'));
app.set('view engine', 'ejs');
// Use cookie-parser middleware
app.use(cookieParser());
app.use(bodyParser.json());



//database connectivity code 
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sg" // database name
});
// it is used to connect to the database 
con.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// jevha user website ver yeil first page sathi below code will work
app.get("/" , function(req,res) // user requests for the  page 
{
res.sendFile( __dirname + "/index.html" ) ; // server response madhe file detoy ... 
});

// post means that we are storing our values into the database 
app.post('/', (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate username
        if (!username || username.length !== 5) {
            return res.status(400).send("Username must be 5 characters long.");
        }

        // Validate password
        if (!password || password.length !== 8) {
            return res.status(400).send("Password must be 8 characters long and contain special characters.");
        }

        // Assuming you have a MySQL connection named `con`
        var sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        con.query(sql, [username, email, password], function(error, result) {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Failed to register user');
            }
            res.redirect("/login");
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to register user');
    }
});

// loginnn page // 

app.get("/login", function(req,res){

    res.sendFile("D:/projects/nodejs/login.html");

})

app.get("/logout", function(req, res){
   
    res.clearCookie("username");
    
    res.sendFile("D:/projects/nodejs/login.html");
});
  


app.post("/login", function(req, res) {
    try {
        const { username, password } = req.body;
        
        var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        
        con.query(sql, [username, password], function(error, result) {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).send('Internal Server Error');
            } else {
             
                if (result.length > 0) {
                    res.cookie('username', username);
                    // Check if the user is an admin
                    if (result[0].isadmin) {
                        res.redirect("/user");
                    } else {
                        // Check if the user should be redirected to skpage
                        if (result[0].issk) {
                            res.sendFile(__dirname+"/skpage.html");
                        } else {
                            res.redirect("/landingpage");
                        }
                    }
                } else {
                    // Username and password do not match any record in the database
                    res.redirect("/login?error=1");
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});





// landing page bhavano // 


app.get("/landingpage", function(req, res) {
    
    const username = req.cookies.username;

    if (!username) {
       
        return res.redirect("/login");
    }

    fs.readFile("D:/projects/nodejs/landingpage.html", "utf-8", function(err, data) {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Internal Server Error');
        }

    
        const modifiedHTML = data.replace('{{username}}', username);

        res.send(modifiedHTML);
    });
});





// admin panel sathi 

app.get("/user" , function(req,res)
{
  var sql = "select * from users" ;
  con.query(sql , function(error , result)
{
  if (error) throw error ;
  res.render(__dirname + "/user" , {user :result})

})

});


app.post("/remove-user", function(req, res) {
    try {
      const userId = req.body.userId;
  
      var sql = "DELETE FROM users WHERE id = ?";
      
      con.query(sql, [userId], function(error, result) {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal Server Error');
        } else {
          res.redirect("/user");
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.post("/make-sk", function(req, res) {
    try {
      const userId = req.body.userId;
  
      var sql = "UPDATE users SET issk = 1 WHERE id = ?";
      
      con.query(sql, [userId], function(error, result) {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal Server Error');
        } else {
          res.redirect("/user");
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
});


app.post("/make-ad", function(req, res) {
    try {
      const userId = req.body.userId;
  
      var sql = "UPDATE users SET isadmin = 1 WHERE id = ?";
      
      con.query(sql, [userId], function(error, result) {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal Server Error');
        } else {
          res.redirect("/user");
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
});


app.post('/delete-business', (req, res) => {
    try {
        const businessId = req.body.BuisnessId;

        var sql = "DELETE FROM buisnesses WHERE id = ?";
        
        con.query(sql, [businessId], function(error, result) {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).send('Failed to delete business');
            } else {
                res.redirect('/bl'); // Redirect to landing page after successful deletion
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/bl', (req, res) => {
    const sql = 'SELECT * FROM buisnesses';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/bl.ejs', { businesses: results });
    });
});


// feedbacks
app.get("/feedback" , function(req,res)
{
  var sql = "select * from feedbacks" ;
  con.query(sql , function(error , result)
{
  if (error) throw error ;
  res.render(__dirname + "/feedback" , {feedback :result})

})

});

app.post("/remove-feedback", function(req, res) {
    const feedbackId = req.body.id;
    
 
    var sql = "DELETE FROM feedbacks WHERE id = ?";
    con.query(sql, [feedbackId], function(error, result) {
        if (error) {
            console.error('Error removing feedback:', error);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Feedback removed successfully');
            res.redirect("/feedback");
        }
    });
});



//landing page

app.post("/landingpage", function(req, res) {
    
    
    try {
        const sender = req.cookies.username;
        const { email, message } = req.body;
            var sql = "INSERT INTO feedbacks (name , email , message) VALUES ('"+sender+"' ,'"+email+"' ,'"+message+"')" ;


 con.query(sql , function(error , result)
 {
    
    res.redirect("/landingpage")

});

    } catch (error) {

        console.error('Error:', error);
        res.status(500).send('Failed to register user');

    }
   
});
  

// skpage 

app.post('/skpage', (req, res) => {
    try {
        const { shopName, ownerName, email, phone, address, category, description, openingHours, website, logo } = req.body;
        
        var sql = "INSERT INTO buisnesses (ShopName, OwnerName, Email, Phone, Address, Category, Description, OpeningHours, Website, LogoURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        var values = [shopName, ownerName, email, phone, address, category, description, openingHours, website, logo];

        con.query(sql, values, function(error, result) {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).send('Failed to register business');
            } else {
               
                res.status(200).send('Business registered successfully');
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to register business');
    }
});

// buisnesslist

app.get('/businesses', (req, res) => {
    const sql = 'SELECT * FROM buisnesses';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/buisnesslist.ejs', { businesses: results });
    });
});



//search

app.get("/search" , function(req,res)
{
res.sendFile( __dirname + "/search.html" ) ;
});



app.get('/food', (req, res) => {
    const sql = 'SELECT * FROM buisnesses WHERE Category = "Food"';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/food.ejs', { businesses: results });
    });
});

// Route for Leisure category
app.get('/leisure', (req, res) => {
    const sql = 'SELECT * FROM buisnesses WHERE Category = "Leisure"';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/leisure.ejs', { businesses: results });
    });
});

// Route for Transportation category
app.get('/transportation', (req, res) => {
    const sql = 'SELECT * FROM buisnesses WHERE Category = "Transportation"';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/transportation.ejs', { businesses: results });
    });
});

// Route for Stationary category
app.get('/stationary', (req, res) => {
    const sql = 'SELECT * FROM buisnesses WHERE Category = "Stationary"';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/stationary.ejs', { businesses: results });
    });
});

// Route for Living Accommodation category
app.get('/living-accommodation', (req, res) => {
    const sql = 'SELECT * FROM buisnesses WHERE Category = "Living_Accommodation"';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/living-accommodation.ejs', { businesses: results });
    });
});

// Route for Health category
app.get('/health', (req, res) => {
    const sql = 'SELECT * FROM buisnesses WHERE Category = "Health"';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve businesses');
            return;
        }
        res.render(__dirname + '/health.ejs', { businesses: results });
    });
});

// blogs 

app.get('/writeblog', (req, res) => {
        res.sendFile(__dirname + '/writeblog.html' );
});




app.post('/submitblog', (req, res) => {


    try {
        const title = req.body.title;
        const content = req.body.content;
       
            var sql = "INSERT INTO blogs (title , content) VALUES ('"+title+"' ,'"+content+"')" ;


 con.query(sql , function(error , result)
 {
  res.redirect("/writeblog")
});

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to register user');
    }
  
});


app.get('/blog', (req, res) => {
    const sql = 'SELECT * FROM blogs';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Failed to retrieve blogs');
            return;
        }
        res.render(__dirname + '/b.ejs', { blog: results });
    });
});


// navbar 

app.get("/style1mona", (req, res) => {
    res.sendFile(__dirname + '/style1mona.html' );
})

app.get("/hostel", (req, res) => {
    res.sendFile(__dirname + '/hostel.html' );
})

app.get("/psg", (req, res) => {
    res.sendFile(__dirname + '/psg.html' );
})

app.get("/sln", (req, res) => {
    res.sendFile(__dirname + '/salon.html' );
})

app.get("/mcc", (req, res) => {
    res.sendFile(__dirname + '/matecafe.html' );
})


app.get("/px", (req, res) => {
    res.sendFile(__dirname + '/patilxerox.html' );
})

app.get("/uni", (req, res) => {
    res.sendFile(__dirname + '/unicorn.html' );
})

app.get("/rsc", (req, res) => {
    res.sendFile(__dirname + '/rsc.html' );
})

app.get("/mc", (req, res) => {
    res.sendFile(__dirname + '/mc.html' );
})




















// chat


app.get("/chat", (req, res) => {
    // Fetch messages from the database
    con.query('SELECT * FROM messages ORDER BY timestamp DESC', (err, result) => {
        if (err) {
            console.error('Error fetching messages: ', err);
            res.status(500).send('An error occurred while fetching messages.');
            return;
        }

        // Modify the timestamp format
        result.forEach(message => {
            message.timestamp = new Date(message.timestamp).toLocaleString();
        });

        // Send the HTML file along with messages data
        res.render(__dirname + '/index1.ejs', { messages: result });
    });
});




app.post('/submit-message', (req, res) => {
    // Retrieve the username from the cookie
    const sender = req.cookies.username;

    // Check if the sender (username) is available
    if (!sender) {
        res.status(401).json({ error: 'Unauthorized. Please login first.' });
        return;
    }

    const { message } = req.body;
    const timestamp = new Date().toISOString(); // Assuming MySQL server will handle the timestamp

    const sql = 'INSERT INTO messages (sender, message, timestamp) VALUES (?, ?, ?)';
    con.query(sql, [sender, message, timestamp], (err, result) => {
        if (err) {
            console.error('Error inserting message: ', err);
            res.status(500).json({ error: 'An error occurred while submitting the message.' });
            return;
        }
        console.log('Message inserted successfully');
        res.redirect("/chat");
    });
});


// admin 

app.get("/chatu", (req, res) => {
    // Fetch messages from the database
    con.query('SELECT * FROM messages ORDER BY timestamp DESC', (err, result) => {
        if (err) {
            console.error('Error fetching messages: ', err);
            res.status(500).send('An error occurred while fetching messages.');
            return;
        }

        // Modify the timestamp format
        result.forEach(message => {
            message.timestamp = new Date(message.timestamp).toLocaleString();
        });

        // Send the HTML file along with messages data
        res.render(__dirname + '/index2.ejs', { messages: result });
    });
});



app.post('/submit-messageu', (req, res) => {
    // Retrieve the username from the cookie
    const sender = req.cookies.username;

    // Check if the sender (username) is available
    if (!sender) {
        res.status(401).json({ error: 'Unauthorized. Please login first.' });
        return;
    }

    const { message } = req.body;
    const timestamp = new Date().toISOString(); // Assuming MySQL server will handle the timestamp

    const sql = 'INSERT INTO messages (sender, message, timestamp) VALUES (?, ?, ?)';
    con.query(sql, [sender, message, timestamp], (err, result) => {
        if (err) {
            console.error('Error inserting message: ', err);
            res.status(500).json({ error: 'An error occurred while submitting the message.' });
            return;
        }
        console.log('Message inserted successfully');
        res.redirect("/chatu");
    });
});


app.post('/clear-chat', (req, res) => {
    // Clear messages from the database
    con.query('DELETE FROM messages', (err, result) => {
        if (err) {
            console.error('Error clearing chat: ', err);
            res.status(500).json({ error: 'An error occurred while clearing chat.' });
            return;
        }
        console.log('Chat cleared successfully');
        res.redirect('/chatu'); // Redirect to chat page after clearing chat
    });
});





// login pages


app.get("/al" , function(req,res) // user requests for the  page 
{
res.sendFile( __dirname + "/adminlogin.html" ) ; // server response madhe file detoy ... 
});

app.get("/sl" , function(req,res) // user requests for the  page 
{
res.sendFile( __dirname + "/shopkeeper.html" ) ; // server response madhe file detoy ... 
});



app.get("/profile", (req, res) => {
    // Retrieve username from the cookie
    const username = req.cookies.username;
    
    // Check if the user is logged in
    if (!username) {
        return res.redirect("/login"); // Redirect to login if not logged in
    }



    // Query the database to retrieve user details
    const sql = "SELECT * FROM users WHERE username = ?";
    con.query(sql, [username], (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).send('Internal Server Error');
        }
        if (result.length === 0) {
            return res.status(404).send('User not found');
        }

        // Render profile page with user details
        res.render("profile", { user: result[0] });
    });
  
});




// Route to handle updating username
app.post('/update-username', (req, res) => {
    const newUsername = req.body['new-username'];
    console.log(newUsername);
    const userId = req.cookies.username; 
    console.log(userId)
    // Assuming you have a userId stored in cookies
    // Assuming you have a function to update the username in the database
    con.query('UPDATE users SET username = ? WHERE username = ?', [newUsername, userId], (err, result) => {
        if (err) {
            console.error('Error updating username:', err);
            return res.status(500).send('Failed to update username');
        }
        res.redirect('/profile'); // Redirect to profile page after updating

    });
    res.cookie('username', newUsername);

});

// Route to handle updating email
app.post('/update-email', (req, res) => {
    const newEmail = req.body['new-email'];
    const userId = req.cookies.username; // Assuming you have a userId stored in cookies
    // Assuming you have a function to update the email in the database
    con.query('UPDATE users SET email = ? WHERE username = ?', [newEmail, userId], (err, result) => {
        if (err) {
            console.error('Error updating email:', err);
            return res.status(500).send('Failed to update email');
        }
        res.redirect('/profile'); // Redirect to profile page after updating
    });
});

app.post('/update-password', (req, res) => {
    const newPassword = req.body['new-password'];
    const userId = req.cookies.username; // Assuming you have a userId stored in cookies
    // Assuming you have a function to update the password in the database
    con.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, userId], (err, result) => {
        if (err) {
            console.error('Error updating password:', err);
            return res.status(500).send('Failed to update password');
        }
        res.redirect('/profile'); // Redirect to profile page after updating
    });
});




app.post('/notification', (req, res) => {
    const { notification, promotion, specialOffer, event } = req.body;
  
    const sql = 'INSERT INTO shop_notifications (notification, promotion, special_offer, event) VALUES (?, ?, ?, ?)';
    con.query(sql, [notification, promotion, specialOffer, event], (error, results) => {
      if (error) {
        console.error('Error inserting data into database:', error);
        res.status(500).send('Error inserting data into database');
        return;
      }
      console.log('Data inserted into database successfully');
      res.status(200).send('Data inserted into database successfully');
    });
  });
  

  function deleteOldRecords() {
    con.query(
      'DELETE FROM shop_notifications WHERE TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 2',
      (error, results) => {
        if (error) {
          console.error('Error deleting old records:', error);
          return;
        }
        console.log('Old records deleted successfully');
      }
    );
  }
  

  setInterval(deleteOldRecords, 2 * 60 * 1000);
  


  app.get('/notifications', (req, res) => {
    con.query(
      'SELECT * FROM shop_notifications',
      (error, results) => {
        if (error) {
          console.error('Error fetching notifications:', error);
          res.status(500).json({ error: 'Error fetching notifications' });
          return;
        }
        res.json(results);
      }
    );
  });
  app.get('/noti', (req, res) => {
    res.sendFile(__dirname + '/displayNotifications.html');
  });








// server created using app.listen()
const PORT =3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



