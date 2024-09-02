'use strict';
// Блоки интерфейса
const col_buts = document.querySelector('.cols').children;
const out = document.querySelector('.out');

// Массив выбранных колонок
let data = { columns: [], sort: '' };

// Проверка/инициализация хранилища
if (!localStorage.getItem('webtop-data')) {
	localStorage.setItem('webtop-data', JSON.stringify({ columns: [], sort: '' }));
} else {
	data = JSON.parse(localStorage.getItem('webtop-data'));
	console.log(data);
}

for (let el of col_buts) {
	if (data.columns.includes(el.id)) {
		el.classList.add('active');
	}
	el.addEventListener('click', chooseColumn);
}

setInterval(() => {
	getData();
}, 400);

// Функция выбора сортировки
function chooseSort(colName) {
	console.log(colName);
	for (let el of document.querySelectorAll('hr')) {
		el.classList.remove('active');
	}

	data.sort = colName;
}

// Функция добавления/удаления колонок
function chooseColumn(e) {
	let t = e.currentTarget;
	if (data.columns.includes(t.id)) {
		t.classList.remove('active');
		data.columns = data.columns.filter(el => el != t.id);
	} else {
		t.classList.add('active');
		data.columns.push(t.id);
	}
	console.log(data);
}

// Функция запроса данных
async function getData() {
	let body = JSON.stringify(data);
	localStorage.setItem('webtop-data', body);
	let res = await fetch('/api/data', {
		method: 'POST',
		body,
	});
	res = await res.json();
	let tab = document.createElement('table');
	for (let i = 0; i < res.length; i++) {
		let tr = document.createElement('tr');

		let ttt = res[i].trim().split(/\s+/g);

		if (i == 0) {
			for (let p of ttt) {
				let th = document.createElement('th');
				th.innerText = p;
				th.onclick = () => chooseSort(p.toLowerCase());
				if (p == data.sort) {
					th.classList.add('active');
				}
				tr.append(th);
			}
		} else if (i < 32) {
			for (let p of ttt) {
				let td = document.createElement('td');
				td.innerText = p;
				tr.append(td);
			}
		}

		tab.append(tr);
	}
	out.innerHTML = '';
	out.append(tab);
}
