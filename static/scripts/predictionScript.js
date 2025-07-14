const loader = document.getElementById("loader");
loader.style.display = "flex"; // Show spinner
const params = new URLSearchParams(window.location.search);
const data = JSON.parse(decodeURIComponent(params.get('data')));
loader.style.display = "none";

if (data.disease1 && data.disease2) {
    document.getElementById('single').classList.add('hide');
    document.getElementById('multiple').classList.remove('hide');

    document.getElementById('name1').textContent = data.disease1;
    document.getElementById('desc1').textContent = data.description1;
    document.getElementById('precautions1').textContent = data.precautions1;

    document.getElementById('name2').textContent = data.disease2;
    document.getElementById('desc2').textContent = data.description2;
    document.getElementById('precautions2').textContent = data.precautions2;
} else {
    document.getElementById('single').classList.remove('hide');
    document.getElementById('multiple').classList.add('hide');

    document.getElementById('name').textContent = data.disease;
    document.getElementById('desc').textContent = data.description;
    document.getElementById('precautions').textContent = data.precautions;
}