function loadUpcoming(){

let range=document.getElementById("range").value

let list=getBirthdays()

let tbody=document.getElementById("upcomingTable")

tbody.innerHTML=""

let now=new Date()

list.forEach(b=>{

let birth=new Date(b.date)

let next=new Date(now.getFullYear(),birth.getMonth(),birth.getDate())

let diff=(next-now)/86400000

if(diff>=0 && diff<=range){

tbody.innerHTML+=`
<tr>
<td>${b.name}</td>
<td>${now.getFullYear()-birth.getFullYear()+1}</td>
<td>${Math.floor(diff)}</td>
</tr>
`
}
})
}

document.getElementById("range").addEventListener("change",loadUpcoming)

loadUpcoming()