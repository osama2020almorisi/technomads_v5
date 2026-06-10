
document.getElementById('contact-form').addEventListener('submit',e=>{
e.preventDefault();
alert('Vielen Dank! Ihre Anfrage wurde gesendet.');
e.target.reset();
});
