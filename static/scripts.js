'use strict';
const col_buts = document.querySelector('.cols').children;
const out = document.querySelector('.out');

for (let el of col_buts) {
	el.onclick = () => el.classList.toggle('active');
}

setInterval(() => {
	getData();
}, 1000);

async function getData() {
	let res = await fetch('/api/data');
	res = await res.json();
	let tab = document.createElement('table');
	for (let i = 0; i < res.length; i++) {
		let tr = document.createElement('tr');

		let ttt = res[i].trim().split(/\s+/g);

		if (i == 0) {
			for (let p of ttt) {
				let td = document.createElement('th');
				td.innerText = p;
				tr.append(td);
			}
		} else {
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
