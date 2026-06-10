function calculateAgeUI(){

let date=document.getElementById("birthDate").value
let time=document.getElementById("birthTime").value||"00:00"

let birth=new Date(date+"T"+time)
let now=new Date()

let diff=now-birth

let days=Math.floor(diff/86400000)
let years=Math.floor(days/365)

document.getElementById("result").innerText="العمر: "+years+" سنة"

startLive(birth)
}

function startLive(birth){

setInterval(()=>{

let now=new Date()

let diff=now-birth

let sec=Math.floor(diff/1000)

document.getElementById("liveCounter").innerText="عدد الثواني منذ الولادة: "+sec

},1000)

}