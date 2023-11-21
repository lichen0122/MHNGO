var countdown; // �ΨӫO�s�p�ɾ�ID�������ܶq

function startCountdown(value) {
	// �p�G�w�g���p�ɾ��b�B��A���M����
	if (countdown) {
		clearInterval(countdown);
		countdown = null; // �M���p�ɾ���N�ܶq���m�� null
	}

	// �p��ǤJ�Ȱ��H 30 �����G
	var seconds = Math.ceil(value / 28);

	function updateCountdown() {
		if (seconds > 0) {
			seconds--;
			document.getElementById('countdownLabel').innerText = '���� ' + value + ' ����, �N�o��: ' + seconds + ' ��';
		} else {
			clearInterval(countdown);
			document.getElementById('countdownLabel').innerText = '����N�o����';
			countdown = null;
		}
	}

	updateCountdown();

	countdown = setInterval(updateCountdown, 1000);
}



var huntLocation = null;
var huntTimestamp;
var countdown_hunt; // �ΨӫO�s�p�ɾ�ID�������ܶq

function startCountdown_hunt() {
	const now = new Date();
	const secondsPassed = Math.round((now - huntTimestamp) / 1000);
	var distance = 0;

	if (huntLocation != null)
		distance = huntLocation.distanceTo(mov_marker.getLatLng()).toFixed(2);

	const requiredSeconds = Math.ceil(distance / 28);
	var seconds = requiredSeconds - secondsPassed;

	// �p�G�w�g���p�ɾ��b�B��A���M����
	if (countdown_hunt) {
		clearInterval(countdown_hunt);
		countdown_hunt = null; // �M���p�ɾ���N�ܶq���m�� null
	}
	function updateCountdownHunt() {
		if (seconds > 0) {
			seconds--;
			document.getElementById('countdownHuntLabel').innerText = '���y ' + distance + ' ����, �N�o��: ' + seconds + ' ��';
		} else {
			clearInterval(countdown_hunt);
			document.getElementById('countdownHuntLabel').innerText = '���y�N�o����';
			countdown_hunt = null;
		}
	}

	updateCountdownHunt();

	countdown_hunt = setInterval(updateCountdownHunt, 1000);
}

function recordHunt() {
	// Record the current time
	huntTimestamp = new Date();
	huntLocation = mov_marker.getLatLng();

	console.log("recordHunt ", huntLocation)
}



// ����Ʒ|�b���U"��������"���s�ɳQ�ե�
function extractCoordinates() {
	var inputTextElement = document.getElementById('inputText');
	var inputText = inputTextElement.value;
	// ���h��F���Ω�ǰt GPS ���Ю榡
	//var regex = /-?\d+\.\d+\s*,\s*-?\d+\.\d+.*/g;
	//var regex = /(\d{2}:\d{2})\s+(.+?)\s+(-?\d+\.\d+),\s*(-?\d+\.\d+)(\s+|\n)/
	//var matches = inputText.match(regex);

	// �N�Ҧ�����Ÿ��������Ů�
	inputText = inputText.replace(/\n/g, ' ');

	// ���h��F���H�ǰt24�p�ɨ�ɶ��榡 HH:mm
	const timeRegex = /(\b[0-2]?[0-9]:[0-5][0-9]\b)/g;
	const gpsRegex = /-?\d+\.\d+\s*,\s*-?\d+\.\d+/;

	// ���Τ奻
	let parts = inputText.split(timeRegex);
	let result = '';

	for (let i = 0; i < parts.length; i++) {
		if (i % 2 === 0) {
			const gpsMatch = parts[i].match(gpsRegex);
			if (gpsMatch) {
				let startIndex = parts[i].indexOf(gpsMatch[0]);
				result += parts[i].substring(0, startIndex).replace(/[^\n]+/g, ' ') + gpsMatch[0];
				result += parts[i].substring(startIndex + gpsMatch[0].length);
			} else {
				result += parts[i];
			}
		} else {
			result += '\n' + parts[i];
		}
	}

	result = result.trim();

	// �N�奻���Φ���
	const lines = result.split('\n');

	// �L�o�X�ŦX���󪺦�
	const filteredLines = lines.filter(line => {
		const timeMatch = line.match(timeRegex);
		const gpsMatch = line.match(gpsRegex);

		// �T�O�ɶ��b�歺�AGPS�y���H��
		return timeMatch && gpsMatch && line.startsWith(timeMatch[0]);
	});

	// �N�L�o�᪺��X�֬��@�Ӧr�Ŧ�ê�^
	inputTextElement.value = filteredLines.join('\n');


	//inputTextElement.value = matches ? matches.join('\n') : ''; // �N�Ҧ��ǰt�����G������s���J��줤
}

// ����Ʒ|�b���U"��ܲĤ@�槤�Шò���"���s�ɳQ�ե�
function showFirstCoordinateAndRemove() {
	var inputTextElement = document.getElementById('inputText');
	var coordinates = inputTextElement.value.split('\n');
	if (coordinates.length > 0) {
		var firstCoordinate = coordinates.shift(); // ���o�Ĥ@�槤��

		inputTextElement.value = coordinates.join('\n'); // ��s��J���A�����Ĥ@�槤��

		const regex = /-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+/;
		const match = firstCoordinate.match(regex);

		if (match) {
			firstCoordinate = match[0];
		}
		else {
			firstCoordinate = "";
		}
		document.getElementById('query').value = firstCoordinate; // �N��]�w����Ҥ�

		var parts = firstCoordinate.split(',');

		marker.setLatLng([parts[0].trim(), parts[1].trim()]);
		map.setView([marker.getLatLng().lat, marker.getLatLng().lng], map.getZoom());
		if (devices && devices.length) {
			enableButtons();
		}

	}
}


function getClosetBiome() {
	var selectedBiome = document.getElementById('biome-select').value;

	var lat = mov_marker.getLatLng().lat;
	var lng = mov_marker.getLatLng().lng;

	// Fetch the KML data from the backend
	fetch(`http://localhost:5000/get_closet_biome?biome=${selectedBiome}&latitude=${lat}&longitude=${lng}`)
		.then(response => response.text())
		.then(coordinate => {
			document.getElementById('query').value = coordinate; // �N��]�w����Ҥ�

			var parts = coordinate.split(',');

			marker.setLatLng([parts[0].trim(), parts[1].trim()]);
			map.setView([marker.getLatLng().lat, marker.getLatLng().lng], map.getZoom());

		});

}


// Set progress on progress modal
function setDownloadProgress(fileName, progress) {
	$('#downloadModal').find('p').text('Downloading: ' + fileName + ' (' + progress.toFixed(2) + '%)');
	$('#downloadModal').find('.progress-bar').attr('aria-valuenow', progress).width(Math.round(progress, 2) + '%');
}

// Display specified message as modal
function showMessageModal(message) {
	$('#messageModal').find('p').text(message);
	$('#messageModal').modal();
}


var devices = [];

// Obtain version information and populate on the about button
fetch('/version').then(function (e) {
	return e.text()
}).then(function (v) {
	$('#about').html('Author: MHNGO');
});

$('#about-btn').click(function () {
	$('#aboutModal').modal();
});

$('#enable-developer-mode').click(function () {
	var dev = devices[$('#device')[0].selectedIndex];

	fetch('/enable_developer_mode', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ udid: dev.udid })
	}).then(function (e) {
		return e.json();
	}).then(function (r) {
		if (r.downloadRequired) {
			fetch('/has_dependencies', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ udid: dev.udid })
			}).then(function (e) {
				return e.json()
			}).then(function (r) {
				if (r.error) {
					showMessageModal(r.error);
				} else {
					getDownloadProgress(r.version, function () { });
					$('#downloadModal').modal({
						backdrop: 'static',
						keyboard: false
					});
				}
			});
		}
		else if (r.error) {
			showMessageModal(r.error);
		} else {
			showMessageModal(r.success)
		}
	});

});

// Close and kill app
$('#exit-btn').click(function () {
	fetch('/exit').then(function (e) {
		close();
	});
});

function disableButtons() {
	document.querySelectorAll('.movebutton').forEach(function (button) {
		button.disabled = true;
	});
}

function enableButtons() {
	document.querySelectorAll('.movebutton').forEach(function (button) {
		button.disabled = false;
	});
}

function show_location() {
	map.setView([mov_marker.getLatLng().lat, mov_marker.getLatLng().lng], map.getZoom());
}

// Close and kill app
$('#show-location').click(function () {
	show_location();
});

// Populate device list upon clicking refresh
$('#refresh').click(function () {
	var b = $(this).attr('disabled', true);

	var checkbox = document.getElementById('enable-wifi-search');
	var option_str = "disable_wifi";

	if (checkbox.checked)
		option_str = "enable_wifi";

	fetch('/get_devices', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ option: option_str })
	}).then(function (e) {
		return e.json()
	}).then(function (r) {
		b.removeAttr('disabled');
		if (r.error) {
			showMessageModal(r.error);
		} else {
			devices = r;
			$('#device').empty();
			for (var i = 0; i < devices.length; i++)
				$('#device').append($('<option></option>').text(devices[i].display_name).attr('data-udid', devices[i].udid));
			if (devices.length) {
				$('#stop-location').removeAttr('disabled');
				var alert_message = "\n\n";
				alert_message += "!!! �Ъ`�N: �Х���ܳ]�ƫ���U �}�o�̼Ҧ� ���s, �ýT�{�}�ҫ�A�~�� !!!\n";
				alert_message += "!!! �Ъ`�N: �}�l�C���e�Х��N�аO�I���ʦܱz�{�b������w���m !!!\n";
				alert_message += "!!! �Ъ`�N: �����i���w����аO�I��m, �Ω즲���]�i�H !!!";
				alert(alert_message);
			}
			else
				$('#stop-location').attr('disabled', true);
			if (marker) {
				enableButtons();
			}
		}
	});
});


// Update current download progress
function getDownloadProgress(version, callback) {
	fetch('/get_progress', {
		method: 'POST',
		body: version
	}).then(function (e) {
		return e.json()
	}).then(function (r) {
		if (r.error) {
			$('#downloadModal').modal('hide');
			showMessageModal(r.error);
		} else if (r.done) {
			$('#downloadModal').modal('hide');
			callback();
		} else {
			setDownloadProgress(r.filename, r.progress);
			setTimeout(function () {
				getDownloadProgress(version, callback);
			}, 250);
		}
	});
}

function getIntermediateCoordinates(lat1, lon1, lat2, lon2, step_range) {
	function toRad(degree) {
		return degree * Math.PI / 180;
	}

	function toDeg(rad) {
		return rad * 180 / Math.PI;
	}

	// Calculate the distance between the two points using the Haversine formula
	const R = 6371000;  // Earth radius in meters
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;

	// If the distance is less than step_range meters, return the second coordinate point directly
	if (d < step_range) {
		return [[lat2, lon2]];
	}

	// Calculate the number of intermediate points
	const numPoints = Math.floor(d / step_range);

	// Generate intermediate coordinates
	const coordinates = [];
	for (let i = 0; i <= numPoints; i++) {
		const f = i / numPoints;
		const A = Math.sin((1 - f) * d / R) / Math.sin(d / R);
		const B = Math.sin(f * d / R) / Math.sin(d / R);
		const x = A * Math.cos(toRad(lat1)) * Math.cos(toRad(lon1)) + B * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2));
		const y = A * Math.cos(toRad(lat1)) * Math.sin(toRad(lon1)) + B * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2));
		const z = A * Math.sin(toRad(lat1)) + B * Math.sin(toRad(lat2));
		const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
		const lon = toDeg(Math.atan2(y, x));
		coordinates.push([lat, lon]);
	}

	return coordinates;
}

// Sets the selected marker positon
var lt = null;
var last_lat = -1.0;
var last_lng = -1.0;
let shouldStop = false;
function setLocation(dev, callback) {
	shouldStop = false
	function processCoordinate(coords, index) {
		if (index >= coords.length || shouldStop) {
			return;  // �p�G�Ҧ����Фw�B�z�A�h�X
		}

		const coordinate = coords[index];

		fetch('/set_location', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ udid: dev.udid, lat: coordinate[0], lng: coordinate[1] })
		}).then(function (e) {
			return e.json();
		}).then(function (r) {
			if (r.error) {
				showMessageModal(r.error);
				callback();
			} else {
				$('#set-location').popover({
					html: true,
					content: 'Location has been succesfully set. Confirm using Maps or other apps.',
					trigger: 'manual',
					placement: 'bottom'
				});
				if (lt) clearTimeout(lt);
				$('#set-location').popover('show');
				lt = setTimeout(function () {
					$('#set-location').popover('hide');
				}, 7000);
				callback();
			}
		});
		mov_marker.setLatLng([coordinate[0], coordinate[1]]);
		show_location();
		console.log(`Coordinate ${index + 1}: Lat = ${coordinate[0]}, Lon = ${coordinate[1]}`);

		setTimeout(() => processCoordinate(coords, index + 1), 1000);  // 1 ���B�z�U�@�ӧ���
	}

	if (last_lat == -1 && last_lng == -1) {
		let index = 0;
		const coords = getIntermediateCoordinates(marker.getLatLng().lat, marker.getLatLng().lng, marker.getLatLng().lat, marker.getLatLng().lng, 30);
		processCoordinate(coords, index);
	}
	else {
		let index = 0;
		const coords = getIntermediateCoordinates(last_lat, last_lng, marker.getLatLng().lat, marker.getLatLng().lng, 30);
		processCoordinate(coords, index);
	}

	last_lat = marker.getLatLng().lat;
	last_lng = marker.getLatLng().lng;
}

function start_moving() {
	disableButtons();
}

function stop_moving() {
	enableButtons();
}

function walk_to_location(dev, callback) {
	shouldStop = false
	function processCoordinate(coords, index) {
		if (index >= coords.length || shouldStop) {
			last_lat = coords[index - 1][0];
			last_lng = coords[index - 1][1];
			stop_moving()
			return;  // �p�G�Ҧ����Фw�B�z�A�h�X
		}

		const coordinate = coords[index];

		fetch('/set_location', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ udid: dev.udid, lat: coordinate[0], lng: coordinate[1] })
		}).then(function (e) {
			return e.json();
		}).then(function (r) {
			if (r.error) {
				showMessageModal(r.error);
				callback();
			} else {
				$('#set-location').popover({
					html: true,
					content: 'Location has been succesfully set. Confirm using Maps or other apps.',
					trigger: 'manual',
					placement: 'bottom'
				});
				if (lt) clearTimeout(lt);
				$('#set-location').popover('show');
				lt = setTimeout(function () {
					$('#set-location').popover('hide');
				}, 7000);
				callback();
			}
		});
		mov_marker.setLatLng([coordinate[0], coordinate[1]]);
		show_location();
		console.log(`Coordinate ${index + 1}: Lat = ${coordinate[0]}, Lon = ${coordinate[1]}`);

		setTimeout(() => processCoordinate(coords, index + 1), 1000);  // 1 ���B�z�U�@�ӧ���
	}

	if (last_lat == -1 && last_lng == -1) {
		let index = 0;
		const coords = getIntermediateCoordinates(marker.getLatLng().lat, marker.getLatLng().lng, marker.getLatLng().lat, marker.getLatLng().lng, 5);
		start_moving()
		processCoordinate(coords, index);
	}
	else {
		let index = 0;
		const coords = getIntermediateCoordinates(last_lat, last_lng, marker.getLatLng().lat, marker.getLatLng().lng, 5);
		start_moving()
		processCoordinate(coords, index);
	}

}

function drive_to_location(dev, callback) {
	shouldStop = false
	function processCoordinate(coords, index) {
		if (index >= coords.length || shouldStop) {
			last_lat = coords[index - 1][0];
			last_lng = coords[index - 1][1];
			stop_moving()
			return;  // �p�G�Ҧ����Фw�B�z�A�h�X
		}

		const coordinate = coords[index];

		fetch('/set_location', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ udid: dev.udid, lat: coordinate[0], lng: coordinate[1] })
		}).then(function (e) {
			return e.json();
		}).then(function (r) {
			if (r.error) {
				showMessageModal(r.error);
				callback();
			} else {
				$('#set-location').popover({
					html: true,
					content: 'Location has been succesfully set. Confirm using Maps or other apps.',
					trigger: 'manual',
					placement: 'bottom'
				});
				if (lt) clearTimeout(lt);
				$('#set-location').popover('show');
				lt = setTimeout(function () {
					$('#set-location').popover('hide');
				}, 7000);
				callback();
			}
		});
		mov_marker.setLatLng([coordinate[0], coordinate[1]]);
		show_location();
		console.log(`Coordinate ${index + 1}: Lat = ${coordinate[0]}, Lon = ${coordinate[1]}`);

		setTimeout(() => processCoordinate(coords, index + 1), 1000);  // 1 ���B�z�U�@�ӧ���
	}

	if (last_lat == -1 && last_lng == -1) {
		let index = 0;
		const coords = getIntermediateCoordinates(marker.getLatLng().lat, marker.getLatLng().lng, marker.getLatLng().lat, marker.getLatLng().lng, 30);
		start_moving()
		processCoordinate(coords, index);
	}
	else {
		let index = 0;
		const coords = getIntermediateCoordinates(last_lat, last_lng, marker.getLatLng().lat, marker.getLatLng().lng, 30);
		start_moving()
		processCoordinate(coords, index);
	}

}

function fly_to_location(dev, callback) {
	shouldStop = false
	function processCoordinate(coords, index) {
		if (index >= coords.length || shouldStop) {
			last_lat = coords[index - 1][0];
			last_lng = coords[index - 1][1];
			stop_moving()
			return;  // �p�G�Ҧ����Фw�B�z�A�h�X
		}

		const coordinate = coords[index];

		fetch('/set_location', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ udid: dev.udid, lat: coordinate[0], lng: coordinate[1] })
		}).then(function (e) {
			return e.json();
		}).then(function (r) {
			if (r.error) {
				showMessageModal(r.error);
				callback();
			} else {
				$('#set-location').popover({
					html: true,
					content: 'Location has been succesfully set. Confirm using Maps or other apps.',
					trigger: 'manual',
					placement: 'bottom'
				});
				if (lt) clearTimeout(lt);
				$('#set-location').popover('show');
				lt = setTimeout(function () {
					$('#set-location').popover('hide');
				}, 7000);
				callback();
			}
		});
		mov_marker.setLatLng([coordinate[0], coordinate[1]]);
		show_location();
		console.log(`Coordinate ${index + 1}: Lat = ${coordinate[0]}, Lon = ${coordinate[1]}`);


		setTimeout(() => processCoordinate(coords, index + 1), 1000);  // 1 ���B�z�U�@�ӧ���
	}

	var labelValue = parseInt(document.getElementById('distance').innerText, 10);


	if (last_lat == -1 && last_lng == -1) {
		let index = 0;
		const coords = getIntermediateCoordinates(marker.getLatLng().lat, marker.getLatLng().lng, marker.getLatLng().lat, marker.getLatLng().lng, 10000000);
		start_moving()
		processCoordinate(coords, index);
	}
	else {
		let index = 0;
		const coords = getIntermediateCoordinates(last_lat, last_lng, marker.getLatLng().lat, marker.getLatLng().lng, 10000000);
		start_moving()
		processCoordinate(coords, index);
	}

	startCountdown(labelValue);
	startCountdown_hunt();

}

var ltt = null;
function stopLocation(dev, callback) {
	fetch('/stop_location', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ udid: dev.udid })
	}).then(function (e) {
		return e.json()
	}).then(function (r) {
		if (r.error) {
			showMessageModal(r.error);
			callback();
		} else {
			$('#stop-location').popover({
				html: true,
				content: 'Fake location has been stopped. If your location is still stuck, try turning Location Services off and back on.',
				trigger: 'manual',
				placement: 'bottom'
			});
			if (ltt) clearTimeout(ltt);
			$('#stop-location').popover('show');
			ltt = setTimeout(function () {
				$('#stop-location').popover('hide');
			}, 7000);
			callback();
		}
	});
}

function locationPerform(b, locationMethod) {
	var dev = devices[$('#device')[0].selectedIndex];
	fetch('/has_dependencies', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ udid: dev.udid })
	}).then(function (e) {
		return e.json()
	}).then(function (r) {
		if (r.error) {
			b.removeAttr('disabled');
			showMessageModal(r.error);
		} else if (r.result) {
			locationMethod(dev, function () {
				//b.removeAttr('disabled');
			});
		} else {
			getDownloadProgress(r.version, function () {
				locationMethod(dev, function () {
					b.removeAttr('disabled');
				});
			});
			$('#downloadModal').modal({
				backdrop: 'static',
				keyboard: false
			});
		}
	});
}

function getAbsLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(setAbsPosition);
	} else {
		document.getElementById("coordinates").innerHTML = "Geolocation is not supported by this browser.";
	}
}

function setAbsPosition(position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude

	map.setView([lat, lng], 18);
	if (marker)
		marker.setLatLng([lat, lng]);

	if (mov_marker)
		mov_marker.setLatLng([lat, lng]);
}

function addItem(itemText) {
	const select = document.getElementById("last-coordinate");

	// �ˬd�O�_�w�� 30 �ӿﶵ�A�Y���h�������ª��ﶵ�]�̤U�����ﶵ�^
	if (select.options.length >= 30) {
		select.removeChild(select.options[select.options.length - 1]);
	}

	// �Ыطs�ﶵ����
	const option = document.createElement("option");
	option.value = itemText;
	option.text = itemText;

	// �N�s�ﶵ�K�[���檺�̳���
	select.insertBefore(option, select.firstChild);

	// �w�]�襤�̷s�K�[���ﶵ
	select.selectedIndex = 1;
}


function pure_fly() {
	var dev = devices[$('#device')[0].selectedIndex];
	shouldStop = false
	function processCoordinate(coords, index) {
		if (index >= coords.length || shouldStop) {
			last_lat = coords[index - 1][0];
			last_lng = coords[index - 1][1];
			stop_moving()
			return;  // �p�G�Ҧ����Фw�B�z�A�h�X
		}

		const coordinate = coords[index];

		fetch('/set_location', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ udid: dev.udid, lat: coordinate[0], lng: coordinate[1] })
		}).then(function (e) {
			return e.json();
		}).then(function (r) {
			if (r.error) {
				showMessageModal(r.error);
			} else {
				$('#set-location').popover({
					html: true,
					content: 'Location has been succesfully set. Confirm using Maps or other apps.',
					trigger: 'manual',
					placement: 'bottom'
				});
				if (lt) clearTimeout(lt);
				$('#set-location').popover('show');
				lt = setTimeout(function () {
					$('#set-location').popover('hide');
				}, 7000);
			}
		});
		mov_marker.setLatLng([coordinate[0], coordinate[1]]);
		show_location();
		console.log(`Coordinate ${index + 1}: Lat = ${coordinate[0]}, Lon = ${coordinate[1]}`);


		setTimeout(() => processCoordinate(coords, index + 1), 1000);  // 1 ���B�z�U�@�ӧ���
	}

	var labelValue = parseInt(document.getElementById('distance').innerText, 10);


	if (last_lat == -1 && last_lng == -1) {
		let index = 0;
		const coords = getIntermediateCoordinates(marker.getLatLng().lat, marker.getLatLng().lng, marker.getLatLng().lat, marker.getLatLng().lng, 10000000);
		start_moving()
		processCoordinate(coords, index);
	}
	else {
		let index = 0;
		const coords = getIntermediateCoordinates(last_lat, last_lng, marker.getLatLng().lat, marker.getLatLng().lng, 10000000);
		start_moving()
		processCoordinate(coords, index);
	}

	startCountdown(labelValue);
	startCountdown_hunt();
}
// �j�w��L�ƥ�
document.addEventListener("keydown", function (event) {
	if (event.key === "b") {
		var coordinate = document.getElementById('back-coordinate').value
		var parts = coordinate.split(',');

		marker.setLatLng([parts[0].trim(), parts[1].trim()]);
		map.setView([marker.getLatLng().lat, marker.getLatLng().lng], map.getZoom());
		if (devices && devices.length) {
			enableButtons();
		}
		pure_fly();
	} else if (event.key === "f") {
		pure_fly();
	} else if (event.key === "n") {
		showFirstCoordinateAndRemove();
	}
});


document.querySelectorAll('.movefly').forEach(function (button) {
	button.addEventListener('click', function () {
		addItem(`${marker.getLatLng().lat}, ${marker.getLatLng().lng}`);
		locationPerform($(this).attr('disabled', true), fly_to_location);
	});
});

document.querySelectorAll('.movedrive').forEach(function (button) {
	button.addEventListener('click', function () { locationPerform($(this).attr('disabled', true), drive_to_location); });
});

document.querySelectorAll('.movewalk').forEach(function (button) {
	button.addEventListener('click', function () { locationPerform($(this).attr('disabled', true), walk_to_location); });
});

document.querySelectorAll('.moveterminate').forEach(function (button) {
	button.addEventListener('click', function () { shouldStop = true; });
});

document.querySelectorAll('.recordhunt').forEach(function (button) {
	button.addEventListener('click', recordHunt);
});

document.querySelectorAll('.copy-corrdinate-green').forEach(function (button) {
	button.addEventListener('click', function () {
		var textToCopy = document.getElementById("current-location").value;

		navigator.clipboard.writeText(textToCopy).then(function () {
			console.log('Text copied to clipboard');
		})
			.catch(function (err) {
				console.error('Could not copy text: ', err);
			});

	});
});

document.querySelectorAll('.copy-corrdinate-red').forEach(function (button) {
	button.addEventListener('click', function () {
		var textToCopy = document.getElementById("dest-location").value;

		navigator.clipboard.writeText(textToCopy).then(function () {
			console.log('Text copied to clipboard');
		})
			.catch(function (err) {
				console.error('Could not copy text: ', err);
			});

	});
});

document.querySelectorAll('.copy-corrdinate-ex').forEach(function (button) {
	button.addEventListener('click', function () {
		var textToCopy = document.getElementById("last-coordinate").value;

		navigator.clipboard.writeText(textToCopy).then(function () {
			console.log('Text copied to clipboard');
		})
			.catch(function (err) {
				console.error('Could not copy text: ', err);
			});

	});
});

document.querySelectorAll('.paste-chat').forEach(function (button) {
	button.addEventListener('click', async function pasteText() {
		try {
			const text = await navigator.clipboard.readText(); // Read the text from the clipboard
			document.getElementById("inputText").value = text; // Paste the text into the input field
		} catch (err) {
			alert('Failed to read clipboard contents: ', err);
		}
	});
});



document.querySelectorAll('.paste-corrdinate-1').forEach(function (button) {
	button.addEventListener('click', async function pasteText() {
		try {
			const text = await navigator.clipboard.readText(); // Read the text from the clipboard
			document.getElementById("query").value = text; // Paste the text into the input field
		} catch (err) {
			alert('Failed to read clipboard contents: ', err);
		}
	});
});


document.querySelectorAll('.paste-corrdinate-2').forEach(function (button) {
	button.addEventListener('click', async function pasteText() {
		try {
			const text = await navigator.clipboard.readText(); // Read the text from the clipboard
			document.getElementById("back-coordinate").value = text; // Paste the text into the input field
		} catch (err) {
			alert('Failed to read clipboard contents: ', err);
		}
	});
});

/*
// Handle location set-location
$('#set-location').click(function () {
	locationPerform($(this).attr('disabled', true), setLocation);
});

$('#walk-to-location').click(function () {
	locationPerform($(this).attr('disabled', true), walk_to_location);
});

$('#drive-to-location').click(function () {
	locationPerform($(this).attr('disabled', true), drive_to_location);
});

$('#fly-to-location').click(function () {
	locationPerform($(this).attr('disabled', true), fly_to_location);
});*/

$('#stop-location').click(function () {
	locationPerform($(this).attr('disabled', true), stopLocation);
});

/*
$('#terminate-journey').click(function () {
	shouldStop = true;
});*/

$('#show-abs-location').click(function () {
	getAbsLocation();
});



function set_marker_distance() {
	var positionA = marker.getLatLng();
	var positionB = mov_marker.getLatLng();
	var distance = positionA.distanceTo(positionB).toFixed(2);
	document.getElementById('distance').textContent = distance;

	document.getElementById('current-location').value = positionB.lat + ", " + positionB.lng;
	document.getElementById('dest-location').value = positionA.lat + ", " + positionA.lng;
}

function init_marker(latlng) {
	marker = new L.marker(latlng, { draggable: true, icon: redIcon }).addTo(map);
	mov_marker = new L.marker(latlng, { draggable: false, icon: greenIcon }).addTo(map);

	marker.on('move', function (event) {
		set_marker_distance();
	});

	mov_marker.on('move', function (event) {
		set_marker_distance();
		var positionB = mov_marker.getLatLng();
		saveCoordinates(positionB.lat, positionB.lng);
	});

};


// Initialise the OSM provider for searching
var provider = new GeoSearch.OpenStreetMapProvider();
var map = L.map('map');
var marker = null;
var mov_marker = null;

var redIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});


// Setup double-click marker placement
map.on('dblclick', function (e) {
	if (marker) {
		marker.setLatLng(e.latlng);
	}
	else {
		init_marker(e.latlng);
	}

	if (devices && devices.length) {
		enableButtons();
	}
});

var runLayer = null;
var parsed_kmlData = null;
map.on('moveend', function () {
	// Get the current map bounds
	var bounds = map.getBounds();
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	

	// Fetch the KML data from the backend
	fetch(`http://localhost:5000/get_kml?sw_lat=${sw.lat}&sw_lng=${sw.lng}&ne_lat=${ne.lat}&ne_lng=${ne.lng}`)
		.then(response => response.text())
		.then(kmlData => {
			function addKMLtoMap(kmlData) {

				// Remove existing KML layer if it exists
				if (runLayer) {
					map.removeLayer(runLayer);
				}

				parsed_kmlData = omnivore.kml.parse(kmlData);
				runLayer = parsed_kmlData.addTo(map);

				//console.log(parsed_kmlData);
				//
				//const entries = Object.entries(parsed_kmlData._layers);
				//console.log(entries);

				//parsed_kmlData.forEach(item => {
				//	console.log(item);
				//});

				
				runLayer.eachLayer(function (layer) {

					const styleUrl = layer.feature.properties.styleUrl;
					let styleToApply = {};

					if (styleUrl == "#poly-7CB342-1200-76") { // Forest Green
						styleToApply = {
							"color": "#008000",
							"fillColor": "#008000",
							"weight": "0.5"
						};
					} else if (styleUrl == "#poly-F9A825-1200-76") { // Desert Yellow
						styleToApply = {
							"color": "#FFD700",
							"fillColor": "#FFD700",
							"weight": "0.5"
						};
					} else if (styleUrl == "#poly-673AB7-1200-76") { // Swamp Blue
						styleToApply = {
							"color": "#000080",
							"fillColor": "#000080",
							"weight": "0.5"
						};
					}

					// �ˬd�O�_������˦��ݭn����
					if (Object.keys(styleToApply).length > 0) {
						layer.setStyle(styleToApply);
					}
				});
			}
			// Parse and add KML to map using omnivore
			addKMLtoMap(kmlData);
		});
});

function updateSelectStyle() {
	element = document.getElementById('biome-select')
	var selectedValue = element.value;
	  
	if (selectedValue === 'Forest') {
		element.style.backgroundColor = '#548C00';
		element.style.color = 'white';
	} else if (selectedValue === 'Swamp') {
		element.style.backgroundColor = '#8080C0';
		element.style.color = 'white';
		} else if (selectedValue === 'Desert') {
		element.style.backgroundColor = '#FFE66F';
		element.style.color = 'black';
	} else {
		element.style.backgroundColor = 'transparent';
	}
}

updateSelectStyle();
document.getElementById('biome-select').addEventListener('change', function () {
  updateSelectStyle();
});


$('#mark-last-coordinate').click(function () {
	var coordinate = document.getElementById('last-coordinate').value
	var parts = coordinate.split(',');

	marker.setLatLng([parts[0].trim(), parts[1].trim()]);
	map.setView([marker.getLatLng().lat, marker.getLatLng().lng], map.getZoom());
	if (devices && devices.length) {
		enableButtons();
	}
});


$('#go-back-to').click(function () {
	var coordinate = document.getElementById('back-coordinate').value
	var parts = coordinate.split(',');

	marker.setLatLng([parts[0].trim(), parts[1].trim()]);
	map.setView([marker.getLatLng().lat, marker.getLatLng().lng], map.getZoom());
	if (devices && devices.length) {
		enableButtons();
	}
});

$('#search').click(function () {
	var coordinate = document.getElementById('query').value
	var parts = coordinate.split(',');

	marker.setLatLng([parts[0].trim(), parts[1].trim()]);
	map.setView([marker.getLatLng().lat, marker.getLatLng().lng], map.getZoom());
	if (devices && devices.length) {
		enableButtons();
	}
});


/*function searchLocation() {
	if (!$('#query').val())
		return;
	$('#search').attr('disabled', true);
	provider.search({ query: $('#query').val() }).then(function (r) {
		$('#search').removeAttr('disabled');
		if (r.length) {
			if (!marker)
				marker = new L.marker([r[0].y, r[0].x], { draggable: true }).addTo(map);
			else
				marker.setLatLng([r[0].y, r[0].x]);
			map.setView([r[0].y, r[0].x], 13);
			if (devices && devices.length)
				$('#set-location').removeAttr('disabled');
			$('#walk-to-location').removeAttr('disabled');
			$('#drive-to-location').removeAttr('disabled');
			$('#fly-to-location').removeAttr('disabled');
		}
	});
}*/

// Handle search button
/*$('#search').click(searchLocation);
$('#locationSearch').submit(function (e) {
	e.preventDefault();
	searchLocation();
});*/

// Disable double-click zooming
map.doubleClickZoom.disable();

// Set the OSM basemap layer
var defaultProvider = function () {
	L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);
};
defaultProvider();

// Provider toggle for OSM basemap layer (ie. due to rate limiting or IP block)
$('#mapProviderAlt').change(function () {
	if (this.checked) {
		L.tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
	} else {
		defaultProvider();
	}
});

function saveCoordinates(latitude, longitude) {
	var date = new Date();
	date.setTime(date.getTime() + (1 * 365 * 24 * 60 * 60 * 1000));
	var expires = "expires=" + date.toUTCString();

	document.cookie = "latitude=" + latitude   + ";" + expires + ";path=/";
	document.cookie = "longitude=" + longitude + ";" + expires + ";path=/";
	console.log(document.cookie);
}


function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	console.log(ca);
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}


// Initialise the map to the user's home country
fetch('/home_country').then(function (e) {
	return e.text()
}).then(function (h) {
	provider.search({ query: h }).then(function (r) {
		var latitude = getCookie("latitude");
		var longitude = getCookie("longitude");

		if (latitude && longitude) {
		}
		else {
			latitude = 24.82594334344382;
			longitude = 121.01243019104005;
		}


		document.getElementById("back-coordinate").value = `${latitude}, ${longitude}`;

		map.setView([latitude, longitude], 18);

		init_marker([latitude, longitude]);

		alert("!!! �Ъ`�N: �Х����U���y�]�ƫ��s !!!");
	});
});
