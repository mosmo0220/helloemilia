const express = require("express");

// Handling reqests
const cors = require("cors");
const bodyParser = require("body-parser");
const webpush = require("web-push");

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

// Sending notifications
const vapidKeys = {
	publicKey:
		"BCrSX98CXv5an1_eanEnfKwezkfEgvlylKlffYOKsv0wIJ5_cZ230SGy8YZsXgkzdlkGXgtf95R1BkOSR2aOTLA",
	privateKey: "soDyjJccDpMNta8OqEDsnn7NfsfcxsY09rHN-Ru9hgA",
};
//setting our previously generated VAPID keys
webpush.setVapidDetails(
	"mailto:mosmo2k@gmail.com",
	vapidKeys.publicKey,
	vapidKeys.privateKey,
);

//function to send the notification to the subscribed device
const sendNotification = (dataToSend, sub) => {
	if (sub.subscription.length != 0) {
		sub.subscription.forEach((subscription) => {
			webpush.sendNotification(subscription, dataToSend);
		});
	}
};

app.post("/sendNotification", async (req, res) => {
	let dataToSend = req.body.content;
	let subList = req.body.sublist;

	try {
		await sendNotification(dataToSend, subList);
	} catch (error) {
		res.send(error);
	} finally {
		res.sendStatus(204);
	}
});

// Hosting application
app.listen(process.env.PORT || 3000, () => {
	app.get("/ping", (req, res) => {
		res.sendStatus(200);
	});
	console.log(`I'm saying right now`);
});
