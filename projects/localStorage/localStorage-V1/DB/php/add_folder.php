<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $folderName = $_POST['folderName'];

    $stmt = $conn->prepare("INSERT INTO folders (name) VALUES (:name)");
    $stmt->bindParam(':name', $folderName);
    if ($stmt->execute()) {
        echo "تم إضافة المجلد بنجاح.";
    } else {
        echo "حدث خطأ أثناء إضافة المجلد.";
    }
}
?>
