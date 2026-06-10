function getBirthdays(){
return JSON.parse(localStorage.getItem("birthdays")||"[]")
}

function saveBirthday(data){
let list=getBirthdays()

if(!data.id){
data.id=Date.now()
list.push(data)
}else{
list=list.map(x=>x.id==data.id?data:x)
}

localStorage.setItem("birthdays",JSON.stringify(list))
}

function deleteBirthday(id){
let list=getBirthdays().filter(x=>x.id!=id)
localStorage.setItem("birthdays",JSON.stringify(list))
location.reload()
}

function calculateAge(date){
let birth=new Date(date)
let now=new Date()

let years=now.getFullYear()-birth.getFullYear()
let months=now.getMonth()-birth.getMonth()
let days=now.getDate()-birth.getDate()

return {years,months,days}
}

function goAdd(){
location="add-birthday.html"
}

function loadTable(){

let list=getBirthdays()

document.getElementById("totalRecords").innerText=list.length

let tbody=document.querySelector("tbody")

tbody.innerHTML=""

list.forEach(b=>{

let age=calculateAge(b.date)

tbody.innerHTML+=`
<tr>
<td>${b.name}</td>
<td>${b.date}</td>
<td>${age.years} سنة</td>

<td>
<button onclick="location='calculator.html?id=${b.id}'">عرض</button>
<button onclick="location='add-birthday.html?id=${b.id}'">تعديل</button>
<button onclick="deleteBirthday(${b.id})">حذف</button>
</td>

</tr>
`
})
}