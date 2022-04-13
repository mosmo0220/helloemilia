const input = document.querySelector(".input-text");
const xconsole = document.querySelector(".console");
const content = document.querySelector(".content");

const body = document.body;

let host;
let theme;
let notification;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function logBasicData() {
	console.log("Notification: ", notification);
	console.log("Theme: ", theme);
	console.log("Host: ", host);
}

const manageNotification = () => {
	notification = Notification.permission;
};

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
			await Notification.requestPermission().then((permission) => {
				if (permission == "granted") {
					xresult.innerHTML +=
						"<br> <p>Uzyskano pozwolenie na powiadomienia</p>";
					notification = "granted";
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

start = () => {
	host = window.location.href;
	theme = "firstload";
	setTheme();
	manageNotification();
};

start();

input.addEventListener("keyup", function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		makeProcess();
	}
});
