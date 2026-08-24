Write-Host "=== 1. WSL status ===" -ForegroundColor Cyan
wsl --status

Write-Host "`n=== 2. Docker CLI version ===" -ForegroundColor Cyan
docker --version

Write-Host "`n=== 3. Docker daemon info ===" -ForegroundColor Cyan
docker info

Write-Host "`n=== 4. Hello-world container test ===" -ForegroundColor Cyan
docker run hello-world