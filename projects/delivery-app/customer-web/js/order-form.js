function calculatePrice(distance, type) {

    let base = 2500;

    if (type === "fast")
        base += 1000;

    if (type === "frozen")
        base += 1500;

    return base + (distance * 100);
}

function createOrder(data) {

    console.log("New Order", data);

    showToast(
        "تم إنشاء الطلب بنجاح",
        "success"
    );
}