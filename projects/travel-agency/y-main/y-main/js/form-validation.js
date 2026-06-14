// إدارة الخطوات في نموذج التأشيرة
document.querySelectorAll('.btn-next').forEach(button => {
    button.addEventListener('click', () => {
        const currentStep = document.querySelector('.step-content:not(.hidden)');
        const nextStep = currentStep.nextElementSibling;
        
        currentStep.classList.add('hidden');
        nextStep.classList.remove('hidden');
        
        updateStepsIndicator(currentStep.dataset.step);
    });
});

// تحديث مؤشر الخطوات
function updateStepsIndicator(currentStep) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        if(step.dataset.step <= currentStep) {
            step.classList.add('active');
        }
    });
}

// محاكاة تتبع الطلب
function trackRequest() {
    const trackingId = document.getElementById('trackingId').value;
    if(trackingId === "12345") {
        document.querySelector('.progress-bar').style.width = "75%";
    }
}