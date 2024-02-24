
//packages used in our project
import mysql from "mysql";
import express from 'express';
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//paths to the files are accessed by the below variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// complete backend functionality in express .. get , set , post all functions  
const app = express();

// below are configurations/rules for nodejs 
app.use(bodyParser.urlencoded({ extended: true }) );
app.use(express.static('public'));
app.set('view engine', 'ejs');


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
            var sql = "INSERT INTO users (username , email , password) VALUES ('"+username+"' ,'"+email+"' ,'"+password+"')" ;


 con.query(sql , function(error , result)
 {
  res.redirect("/login")
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


app.post("/login", function(req, res) {
    try {
        const { username, password } = req.body;
        
        var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        
        con.query(sql, [username, password], function(error, result) {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).send('Internal Server Error');
            } else {
                // Check if any result found
                if (result.length > 0) {
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

app.get("/landingpage", function(req,res){

    res.sendFile("D:/projects/nodejs/landingpage.html");

})

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
        const { name, email, message } = req.body;
            var sql = "INSERT INTO feedbacks (name , email , message) VALUES ('"+name+"' ,'"+email+"' ,'"+message+"')" ;


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
    const { sender, message } = req.body;
    const timestamp = new Date().toISOString(); // Assuming MySQL server will handle the timestamp

    const sql = 'INSERT INTO messages (sender, message, timestamp) VALUES (?, ?, ?)';
    con.query(sql, [sender, message, timestamp], (err, result) => {
        if (err) {
            console.error('Error inserting message: ', err);
            res.status(500).json({ error: 'An error occurred while submitting the message.' });
            return;
        }
        console.log('Message inserted successfully');
        res.redirect("/chat")
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
    const { sender, message } = req.body;
    const timestamp = new Date().toISOString(); // Assuming MySQL server will handle the timestamp

    const sql = 'INSERT INTO messages (sender, message, timestamp) VALUES (?, ?, ?)';
    con.query(sql, [sender, message, timestamp], (err, result) => {
        if (err) {
            console.error('Error inserting message: ', err);
            res.status(500).json({ error: 'An error occurred while submitting the message.' });
            return;
        }
        console.log('Message inserted successfully');
        res.redirect("/chat")
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


// server created using app.listen()
const PORT =3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



