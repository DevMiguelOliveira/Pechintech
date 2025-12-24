# Script de teste da API Key do Google Gemini
Write-Host "=== Teste da API Key do Google Gemini ===" -ForegroundColor Cyan
Write-Host ""

$apiKey = "AIzaSyDxtqMoWu7HpLdsUiYIytffFk91_Rz7QVQ"
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

Write-Host "API Key: $($apiKey.Substring(0, 10))...$($apiKey.Substring($apiKey.Length - 4))" -ForegroundColor Gray
Write-Host "URL: $apiUrl" -ForegroundColor Gray
Write-Host ""

Write-Host "Enviando requisição de teste..." -ForegroundColor Yellow

$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Responda apenas: 'API funcionando corretamente'"
                }
            )
        }
    )
    generationConfig = @{
        temperature = 0.7
        topK = 40
        topP = 0.95
        maxOutputTokens = 50
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$apiUrl?key=$apiKey" -Method Post -Body $body -ContentType "application/json"
    
    if ($response.candidates -and $response.candidates[0] -and $response.candidates[0].content) {
        $text = $response.candidates[0].content.parts[0].text
        Write-Host "✅ API Key funcionando corretamente!" -ForegroundColor Green
        Write-Host "Resposta: $text" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✅ A API Key está válida e funcionando." -ForegroundColor Green
    } else {
        Write-Host "⚠️  Resposta recebida mas formato inesperado" -ForegroundColor Yellow
        Write-Host "Resposta: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao testar API Key:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        try {
            $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Detalhes do erro:" -ForegroundColor Yellow
            Write-Host ($errorJson | ConvertTo-Json -Depth 5) -ForegroundColor Gray
        } catch {
            Write-Host "Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "- API Key inválida ou expirada" -ForegroundColor White
    Write-Host "- Quota da API excedida" -ForegroundColor White
    Write-Host "- Problema de conexão com a internet" -ForegroundColor White
    Write-Host "- API Key não tem permissões adequadas" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Teste Concluído ===" -ForegroundColor Cyan

