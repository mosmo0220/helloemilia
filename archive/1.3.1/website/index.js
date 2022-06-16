const express = require("express");

// Handling reqests
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const path = require("path");

const corsOptions = {
	origin: "*",
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static("static"));

// Returning pages
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/pages/index.html"));
});

// Hosting application
app.listen(process.env.PORT || 3000, () => {
	app.get("/ping", (req, res) => {
		res.sendStatus(200);
	});
	console.log(`Hosting on port: ${process.env.PORT || 3000}`);
});
