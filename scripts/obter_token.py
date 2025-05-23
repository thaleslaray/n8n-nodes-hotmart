import requests

# Credenciais
client_id = "763d8717-29ae-4c95-b6b6-c797367669c0"
client_secret = "4d11b99e-eae4-4f17-ab9a-467c52d97a25"
basic_auth = "NzYzZDg3MTctMjlhZS00Yzk1LWI2YjYtYzc5NzM2NzY2OWMwOjRkMTFiOTllLWVhZTQtNGYxNy1hYjlhLTQ2N2M1MmQ5N2EyNQ=="

# URL e parâmetros
url = "https://api-sec-vlc.hotmart.com/security/oauth/token"
params = {
    "grant_type": "client_credentials",
    "client_id": client_id,
    "client_secret": client_secret
}

# Headers
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {basic_auth}"
}

# Fazer a requisição
response = requests.post(url, params=params, headers=headers)

# Mostrar o resultado
print(f"Status code: {response.status_code}")
print(f"Response: {response.text}")

# Se foi bem-sucedido, exibir apenas o token para uso fácil
if response.status_code == 200:
    try:
        data = response.json()
        print("\nACCESS TOKEN:")
        print(data.get("access_token"))
    except:
        print("Erro ao processar o JSON da resposta")