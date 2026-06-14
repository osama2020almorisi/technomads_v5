<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_POST['data'];
    file_put_contents('trip_data.json', $data);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
