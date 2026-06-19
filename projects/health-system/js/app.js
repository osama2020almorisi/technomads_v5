// تهيئة بسيطة للتطبيق
console.log('app initialized');
// تأكد وجود بيانات تجريبية عند أول تشغيل
if(!localStorage.getItem('medicalData')){
  const demo = {
    users:[{id:'user_001',username:'doctor_ahmed',password:'1234',email:'ahmed@hospital.com',role:'doctor',createdAt:'2023-10-15'}],
    patients:[{id:'patient_001',medicalId:'MED123456',name:'محمد أحمد',gender:'ذكر',birthDate:'1985-05-15',email:'mohamed@email.com',height:175,weight:80,bloodType:'A+',createdAt:'2023-10-20'}],
    medicalTests:[],
    notifications:[]
  };
  localStorage.setItem('medicalData', JSON.stringify(demo));
}
