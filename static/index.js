const input = document.querySelector(".input-text");
const xconsole = document.querySelector(".console");
const content = document.querySelector(".content");

const body = document.body;

const saveSubscription = async (subscription) => {
	const SERVER_URL = host + "save-subscription";
	console.log(SERVER_URL);
	const response = await fetch(SERVER_URL, {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(subscription),
	});
	return response.json();
};

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = (base64String) => {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

let theme;
let notification;

let sw;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function logBasicData() {
	console.log("Notification: ", notification);
	console.log("Theme: ", theme);
	console.log("Host: ", host);
}

const setTheme = () => {
	if (theme == "firstload") {
		if (getCookie("theme")) {
			theme = getCookie("theme");
			body.classList.add(theme);
		} else {
			theme = "dark";
			setCookie("theme", "dark", 365);
			body.classList.add("dark");
		}
	} else {
		if (getCookie("theme") == "dark") {
			setCookie("theme", "light", 365);
			body.classList.add("light");
			body.classList.remove("dark");
			return "light";
		} else {
			setCookie("theme", "dark", 365);
			body.classList.add("dark");
			body.classList.remove("light");
			return "dark";
		}
	}
};

function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == " ") c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}
function eraseCookie(name) {
	document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

const makeProcess = async () => {
	let result;
	let v = input.value;

	v = v.toLowerCase();
	v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

	x = v.split(" ");
	let command = x[0];
	let cvalue = x[1] || "NaV";

	await fetch(host + "query/" + command + "/" + cvalue)
		.then(function (res) {
			return res.json();
		})
		.then(function (data) {
			result = JSON.parse(JSON.stringify(data));
		});

	// fn notification

	input.value = "";
	if (result[0][1] == "fn") {
		let ltx = true;
		let xresult = document.querySelector(".result");
		let resultc;
		if (xresult == null) {
			xresult = document.querySelector(".content");
			xresult.innerHTML = "";
			ltx = false;
		} else {
			resultc = xresult.innerHTML;
		}

		if (result[0][0] == "google") {
			document.location.href = "https://www.google.com/";
		} else if (result[0][0] == "notification") {
			await Notification.requestPermission().then(async (permission) => {
				if (permission == "granted") {
					xresult.innerHTML +=
						"<br> <p>Uzyskano pozwolenie na powiadomienia</p>";
					notification = "granted";

					try {
						const applicationServerKey = urlB64ToUint8Array(
							"BCrSX98CXv5an1_eanEnfKwezkfEgvlylKlffYOKsv0wIJ5_cZ230SGy8YZsXgkzdlkGXgtf95R1BkOSR2aOTLA",
						);
						const options = { applicationServerKey, userVisibleOnly: true };

						const subscription = await sw.pushManager.subscribe(options);
						const response = await saveSubscription(subscription);
						console.log(response);
					} catch (err) {
						console.log("Error", err);
					}
				} else {
					xresult.innerHTML +=
						"<br> <p>Nie uzyskano pozwolenia na powiadomienia</p>";
					notification = "denied";
				}
			});
		} else if (result[0][0] == "theme") {
			theme = await setTheme();
			xresult.innerHTML += "<br> <p>Zmieniono motyw strony</p>";
		}
		content.style.opacity = "1";
		await delay(3500);
		content.style.opacity = "0";
		await delay(1200);
		if (ltx) {
			xresult.innerHTML = resultc;
			content.style.opacity = "1";
		} else {
			xresult.innerHTML = "";
		}
		resultc = "";
	} else {
		if (xconsole.style.paddingTop == "7.5vh") {
			content.style.opacity = "0";
			await delay(1200);
		} else {
			xconsole.style.paddingTop = "7.5vh";
			await delay(1200);
		}

		content.innerHTML = "";

		if (command == "exit") {
			xconsole.style.paddingTop = "25vh";
			content.style.opacity = "0";
		} else {
			let xresult = document.createElement("div");
			xresult.classList.add("result");

			result.forEach((e) => {
				if (e[1] == "link") {
					let x = document.createElement("a");
					x.href = e[0];
					x.innerText = e[2];
					x.classList.add(e[1]);
					xresult.appendChild(x);
				} else if (e[1] == "break") {
					let x = document.createElement("br");
					x.classList.add(e[1]);
					xresult.appendChild(x);
				} else {
					let x = document.createElement("p");
					x.innerHTML = e[0];
					x.classList.add(e[1]);
					xresult.appendChild(x);
				}
			});

			content.appendChild(xresult);
			content.style.opacity = "1";
		}
	}
};

start = async () => {
	// Set vars
	theme = "firstload";
	notification = Notification.permission;

	// Load service worker
	if (!("serviceWorker" in navigator)) {
		console.error("No Service Worker support");
	} else {
		sw = await navigator.serviceWorker.register("sw.js");
	}
	if (!("PushManager" in window)) {
		console.log("No Push API Support");
	}

	// Manage aplication
	setTheme();
};

start();

input.addEventListener("keyup", function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		makeProcess();
	}
});
