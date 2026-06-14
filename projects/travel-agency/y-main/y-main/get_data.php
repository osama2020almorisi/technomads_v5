<?php
$data = file_exists('trip_data.json') ? json_decode(file_get_contents('trip_data.json'), true) : [];
echo json_encode(['success' => true, 'data' => $data]);
?>
