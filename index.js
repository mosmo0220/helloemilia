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

const getVerify = (token, level = "user") => {
	return true;
};

const getAppCookies = (req) => {
	const rawCookies = req.headers.cookie.split("; ");

	const parsedCookies = {};
	rawCookies.forEach((rawCookie) => {
		const parsedCookie = rawCookie.split("=");
		parsedCookies[parsedCookie[0]] = parsedCookie[1];
	});
	return parsedCookies;
};

// Returning pages
// Add verification
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/pages/index.html"));
	return;

	let cookies = getAppCookies(req);

	if (cookies["loginToken"]) {
		if (getVerify(cookies["loginToken"])) {
			return res.sendFile(path.join(__dirname, "/pages/index.html"));
		}
	}
	res.redirect("/login");
});

// Add verification
app.get("/panel", (req, res) => {
	res.sendStatus(400);
	return;

	let cookies = getAppCookies(req);

	if (cookies["loginToken"]) {
		if (getVerify(cookies["loginToken"], "admin")) {
			return res.sendFile(path.join(__dirname, "/pages/panel.html"));
		}
	}
	res.redirect("/");
});

// Add login system
app.get("/login", (req, res) => {
	res.sendStatus(400);
	return;

	let cookies = getAppCookies(req);

	if (cookies["loginToken"]) {
		if (getVerify(cookies["loginToken"])) {
			return res.redirect("/");
		}
	}
	res.sendFile(path.join(__dirname, "/pages/login.html"));
});

// Hosting application
app.listen(process.env.PORT || 3000, () => {
	app.get("/ping", (req, res) => {
		res.sendStatus(200);
	});
	console.log(`Hosting on port: ${process.env.PORT || 3000}`);
});
