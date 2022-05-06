const input = document.querySelector(".input-text");
const xconsole = document.querySelector(".console");
const content = document.querySelector(".content");
const news = document.querySelector(".news");
const version = document.querySelector(".version");
const notificationStatus = document.querySelector(".notification");
const themeStatus = document.querySelector(".theme");

const body = document.body;

const host = window.location.href;
const restapi = "https://helloemilia-api.herokuapp.com/";

let isConsoleOpened = false;
const closedConsolePadding = "7vh";
const openedConsolePadding = "2vh";
function changeConsolePadding() {
	if (isConsoleOpened) xconsole.style.paddingTop = closedConsolePadding;
	else xconsole.style.paddingTop = openedConsolePadding;
	isConsoleOpened = !isConsoleOpened;
}

let isDaypic = false;
let isUnsecured = false;

let theme;

let sw;
async function loadSW() {
	if (!("serviceWorker" in navigator)) {
		console.error("No Service Worker support");
	} else {
		sw = await navigator.serviceWorker.register("sw.js");
		return "Poprawnie załadowano Service workera";
	}
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function logBasicData() {
	console.log("Notification: ", notification);
	console.log("Theme: ", theme);
	console.log("Host: ", host);
}

async function hideDOMElements(domElements) {
	domElements.forEach((e) => {
		e.style.opacity = "0";
	});
	input.disabled = true;

	await delay(1001);
}

async function showDOMElements(domElements) {
	domElements.forEach((e) => {
		e.style.opacity = "1";
	});

	input.disabled = false;
}

function setThemeCallback(call, operation) {
	if (call == "non-set" || call == "dark") {
		theme = "dark";
	} else {
		theme = "light";
	}

	oposite = theme == "dark" ? "light" : "dark";
	if (operation == "reverse") {
		let temp = theme;
		theme = oposite;
		oposite = temp;
	}

	body.classList.add(theme);
	body.classList.remove(oposite);
	setCookie("theme", theme, 365);

	let tolang = theme == "dark" ? "ciemny" : "jasny";
	return "Zmieniono motyw na " + tolang;
}

async function setTheme() {
	cookieTheme = await getCookie("theme");
	theme = cookieTheme == null ? "non-set" : cookieTheme;
	if (theme == "non-set") {
		return setThemeCallback(theme, "set");
	}
	return setThemeCallback(cookieTheme, "set");
}

async function reverseTheme() {
	return setThemeCallback(theme, "reverse");
}

async function saveConsole(hide = false) {
	if (isConsoleOpened) {
		await hideDOMElements([content]);
		changeConsolePadding();

		if (!hide) {
			localStorage.setItem("console", content.innerHTML);
			content.innerHTML = "";
		}

		await showDOMElements([news, version]);
	}
	input.value = "";
}

async function openConsole() {
	await hideDOMElements([news, version, content]);
	if (!isConsoleOpened) {
		changeConsolePadding();
	}

	let save = localStorage.getItem("console");
	content.innerHTML = save ? save : "Nie znaleziono zapisu konsoli";

	await showDOMElements([content]);
	input.value = "";
}

async function logout() {
	return "Nie zaimplementowane";

	await eraseCookie("loginToken");
	await sw.unregister();
	document.location.href = host + "login";
}

async function makeQuery(x) {
	let command = x[0];
	let argv = [];

	x.forEach((element) => {
		if (element != command) {
			argv.push(element);
		}
	});

	if (argv.length == 0) {
		argv = "empty";
	}

	if (isDaypic && argv[0] == "max") {
		isDaypic = false;
	}

	let formData = new FormData();
	formData.append("command", command);
	formData.append("argv", argv);

	let res;
	await fetch(restapi + "query", {
		// mode: "no-cors",
		body: formData,
		method: "post",
		headers: {
			Accept: "application/json",
		},
	})
		.then(function (res) {
			if (res.ok) return res.json();
			else
				return (res = {
					respond: "Serwer nie zwrócił żadnych danych",
				});
		})
		.then(function (data) {
			res = JSON.parse(JSON.stringify(data));
		});

	return res.respond;
}

async function executeQuery(result) {
	if (!isConsoleOpened) {
		changeConsolePadding();
	}

	await hideDOMElements([news, version, content]);

	if (typeof result == "string") {
		if (isUnsecured) {
			content.innerHTML = `<p class="txt"> ` + result + "</p>" || "";
		} else {
			content.innerHTML = `<p class="txt">> ` + result + "</p>" || "";
		}
	} else {
		let r = "";
		if (isDaypic) {
			x = result[0];
			y = result[1];
			z = result[2];
			g = result[3] || undefined;

			r += `<p class="title"> `;
			r += x;
			r += "</p>";

			r += `<p class="txt">> `;
			r += y;
			r += "</p>";

			if (g != undefined) {
				r += "<br/>";
				r += `<p class="title">`;
				r += z;
				r += `</p>`;
				r += `<p class="txt"> `;
				r += g;
				r += "</p>";
			} else {
				r += `<p class="desc">Type: `;
				r += z;
				r += "</p>";
			}

			isDaypic = false;
		} else {
			await result.forEach((e) => {
				if (e.includes("[link]")) {
					x = e.split("[link]");
					r += `<p class="txt">> <a class="link" href="` + x[1] + `">`;
					r += x[0];
					r += `</a></p>`;
				} else {
					if (e == "") {
						r += "<br/>";
					} else {
						r += `<p class="txt">> `;
						r += e;
						r += "</p>";
					}
				}
			});
		}

		content.innerHTML = r;
	}

	await showDOMElements([content]);
	input.value = "";
}

const makeProcess = async () => {
	let result;
	let v = input.value;

	v = v.toLowerCase();
	v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

	x = v.split(" ");

	if (x[0] == "close") {
		if (isConsoleOpened) {
			saveConsole();
		}

		return;
	}

	if (x[0] == "open") {
		openConsole();
		return;
	}

	if (x[0] == "logout") {
		result = (await logout()).toString();
		executeQuery(result);
		saveConsole(true);
		return;
	}

	let online;
	await fetch(host + "ping", { cache: "no-store" })
		.then((response) => {
			if (!response.ok) online = false;
			else online = true;
		})
		.catch((error) => {
			online = false;
		});

	if (!online) {
		content.innerHTML = `<p class="txt">Brak połączenia z serwerem/internetem</p>`;
		await showDOMElements([content]);
		await hideDOMElements([news, version]);
		input.value = "";
		return;
	}

	switch (x[0]) {
		case "google":
			document.location.href = "https://www.google.com/";
			break;
		case "admin":
			document.location.href = host + "panel";
			break;

		case "theme":
			result = (await reverseTheme()).toString();

			await executeQuery(result);
			await delay(2500);
			saveConsole(true);
			break;

		default:
			check = () => {
				if (x[0] == "daypic") {
					isDaypic = true;
				} else if (x[0] == "declassified") {
					isUnsecured = true;
				}
			};

			await check();
			result = await makeQuery(x);

			await executeQuery(result);
			break;
	}

	reloadinfo();
};

input.addEventListener("keyup", function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		makeProcess();
	}
});

// Set vars
let initLoad = true;
async function reloadinfo() {
	if (initLoad) {
		console.info(await setTheme());
		console.info(await loadSW());
		xconsole.style.paddingTop = closedConsolePadding;
		initLoad = false;
	}

	th = theme == "dark" ? "ciemny" : "jasny";
	themeStatus.innerHTML = "Motyw: " + th;
}

reloadinfo();
