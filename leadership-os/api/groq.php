
<?php

$data = json_decode(file_get_contents("php://input"), true);

$type = $data["type"] ?? "";

$apiKey = "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";


if (!$apiKey) {
    http_response_code(500);
    echo json_encode(["error" => "Missing API key"]);
    exit;
}

function callGroq($endpoint, $payload, $apiKey) {

    $ch = curl_init($endpoint);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_POST, true);

    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . $apiKey,
        "Content-Type: application/json"
    ]);

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $response = curl_exec($ch);

    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    curl_close($ch);

    return [
        "body" => $response,
        "contentType" => $contentType
    ];
}

if ($type === "translate") {

    header("Content-Type: application/json");

    $text = $data["text"] ?? "";

    $payload = [
        "model" => "llama-3.3-70b-versatile",
        "messages" => [
            [
                "role" => "system",
                "content" => "Translate the following text to natural English. Only return the translation."
            ],
            [
                "role" => "user",
                "content" => $text
            ]
        ],
        "temperature" => 0.2
    ];

    $result = callGroq(
        "https://api.groq.com/openai/v1/chat/completions",
        $payload,
        $apiKey
    );

    $json = json_decode($result["body"], true);

    echo json_encode([
        "translation" => $json["choices"][0]["message"]["content"] ?? $text
    ]);

    exit;
}

if ($type === "speech") {

    $text = $data["text"] ?? "";

    $voice = $data["voice"] ?? "autumn";

    $payload = [
        "model" => "canopylabs/orpheus-v1-english",
        "voice" => $voice,
        "response_format" => "wav",
        "input" => $text
    ];

    $result = callGroq(
        "https://api.groq.com/openai/v1/audio/speech",
        $payload,
        $apiKey
    );

    header("Content-Type: audio/wav");

    echo $result["body"];

    exit;
}

http_response_code(400);

echo json_encode([
    "error" => "Invalid request"
]);
