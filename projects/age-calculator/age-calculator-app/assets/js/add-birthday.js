function saveForm(){

let data={
name:document.getElementById("name").value,
type:document.getElementById("type").value,
date:document.getElementById("date").value,
time:document.getElementById("time").value,
notes:document.getElementById("notes").value
}

saveBirthday(data)

alert("تم الحفظ")

location="index.html"
}