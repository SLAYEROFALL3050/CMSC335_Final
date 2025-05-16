"use strict";

//#region ======================================== SETUP
// Express
const path = require("path");
const express = require("express");
const app = express();

app.use(express.static("./public"));

// COMMENTED OUT FOR RENDER
// require("dotenv").config({
//     path: path.resolve(__dirname, ".env")
// });

// MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');

const databaseName = "CMSC335DB";
const collectionName = "customers";

const user = process.env.MONGO_DB_USERNAME;
const pass = process.env.MONGO_DB_PASSWORD;

const uri = `mongodb+srv://${user}:${pass}@project6.4fdi75a.mongodb.net/?retryWrites=true&w=majority&appName=Project6`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let portNumber = 5001; // Default port number

// Get Port Number
if (process.argv.length > 3 || process.argv.length < 2) {
    console.log("Usage portfolio.js <PortNumber>");
} else {
    portNumber = parseInt(process.argv[2]);

    if (isNaN(portNumber) == true) {
        console.log("Invalid port number provided using 5001 as port");
        portNumber = 5001; // Default to port 5001 since invalid port was given
    }
}

console.log(`Web server is running at http://localhost:${portNumber}`);
process.stdout.write('Type stop to shutdown the server: ');
process.stdin.setEncoding("utf8");

// Routing
const projects = require("./routes/projects");
const products = require("./routes/products");


//#endregion

//#region ======================================== COMMAND LINE

const shutdownString = "stop";

process.stdin.on('readable', () => {
    const dataInput = process.stdin.read();

	if (dataInput !== null) {
		const command = dataInput.trim();

        if (command.toLowerCase() === shutdownString.toLowerCase()) {   // Exit process
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        }else {                                                 // Invalid command
            process.stdout.write(`Invalid command: ${command}\n`);
        }

        // Resume
        process.stdout.write('Type stop to shutdown the server: ');
		process.stdin.resume();
    }
});

//#endregion

//#region ======================================== APP
const bodyParser = require("body-parser");

// Use templates
app.set("view engine", "ejs");

app.set("views", path.resolve(__dirname, "templates"));

//#region ========== PAGES

// Products
app.use("/products", function (request, response, next) {
    request.portNum = {
        port: portNumber
    };
    next();
}, products);

// Projects
app.use("/projects", function (request, response, next) {
    request.portNum = {
        port: portNumber
    };
    next();
}, projects);

// Home/Index Page
app.get("/", (request, response) => {
    response.render("index");
});

// About Page
app.get("/about", async (request, response) => {
    let movieIDs = [
        "tt0371746",
        "tt1663662",
        "tt1216475",
        "tt4154796"
    ];

    let moviesList = await getMovies(movieIDs);

    const vars = {
        movies: moviesList,
        formLinkAdd: `http://localhost:${portNumber}/aboutadd`,
        formLinkGet: `http://localhost:${portNumber}/aboutget`
    };

    response.render("about", vars);
});

app.use(bodyParser.urlencoded({extended: false}));
app.post("/aboutadd", async (request, response) => {
    let { firstName, lastName } = request.body;
    let { number, inEmail } = request.body;
    let { inComments } = request.body;

    addComment(firstName, lastName, number, inEmail, inComments);

    response.send("Comment Saved");
});

app.use(bodyParser.urlencoded({extended: false}));
app.post("/aboutget", async (request, response) => {
    let { getEmail } = request.body;

    let user = await getComment(getEmail);

    let { comment } = user || {};

    let answer = '';

    if (comment == undefined) {
        answer = "Email does not exist.";
    } else {
        answer = comment;
    }

    response.send(answer);
});

//#endregion

// App Listen
app.listen(portNumber);

//#endregion

//#region ======================================== FUNCTIONS

async function getMovies(ids) {
    let moviesList = "<ul>\n";

    const moviePromises = ids.map(async (id) => {
        try {
            const response = await fetch(`http://www.omdbapi.com/?apikey=a15ba599&i=${id}`);
            const movie = await response.json();

            const { Title, Year, Poster } = movie || {};

            if (Title != undefined && Year != undefined && Poster != undefined) {
                return `<li>\n
                            <h3>${Title} (${Year})</h3>\n
                            <img src="${Poster}" alt="${Title} poster">\n
                        </li>\n`;
            }

        } catch (error) {
            console.log(error);
            return '';
        }
    });

    moviesList += await Promise.all(moviePromises);

    return moviesList + "</ul>\n";
}

async function addComment(_fname, _lname, _tel, _email, _comment) {
    let completion = false;

    try {
        // Connect
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        // Insert + Result
        const userComment = {   fname: _fname, lname: _lname,
                                tel: _tel, email: _email,
                                comment: _comment
                            };

        let result = await collection.insertOne(userComment);

        completion = (result.acknowledged == true) ? true : false;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    return completion;
}

async function getComment(_email) {
    let result = null;

    try {
        // Connect
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        // Query + Result
        let filter = { email: _email };

        result = await collection.findOne(filter);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    return result;
}

//#endregion