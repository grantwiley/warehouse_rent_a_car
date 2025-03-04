<?php
// Set CORS headers to allow your website to make requests to this script
header("Access-Control-Allow-Origin: *"); // In production, change * to your specific domain
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// For preflight OPTIONS requests, just return with success status
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests to this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit();
}

// Get the raw POST data and decode the JSON
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Validate the input data
if (!$data || !isset($data['template_id']) || !isset($data['email_data'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid request data']);
    exit();
}

// Extract the data
$template_id = $data['template_id'];
$email_data = $data['email_data'];

// EmailJS credentials - kept securely on server-side
$service_id = 'service_uwzvxd8';
$user_id = 'Ij6nI-ZNRp56im9-x';

// Prepare the data for EmailJS API
$emailjs_data = [
    'service_id' => $service_id,
    'template_id' => $template_id,
    'user_id' => $user_id,
    'template_params' => $email_data
];

// Initialize cURL session
$ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailjs_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

// Execute the cURL request
$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Return the appropriate response
if ($http_status === 200) {
    echo json_encode(['success' => true]);
} else {
    http_response_code($http_status);
    echo json_encode(['error' => 'Failed to send email', 'details' => $response]);
} 