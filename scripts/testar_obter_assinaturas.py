import requests
import json

# Access token obtido
access_token = "H4sIAAAAAAAAAB3OyZKqMACF4Seyi0FQli2TCZDIJIQNhYxhUlq8EJ6%2Bub3%2F%2FlOnZLB5mDnFFPrhBnhEwRuMnpSrQAbdK76rUPkqGdyIoCyJD%2BSIQZZERgfoQgsRvgozpLG%2F0CRuFtA%2BV7S5AtacxQlcwVZhU8Te8%2FHn%2Bj5nfz0IeA%2B5dxjGnOH6Pix2NxVmt58AfGJ6jSM4K%2Fb5Bm0XagcujzV3JgM5IsYdyWB0WLt0SQA4HOl0b9vHvv0YvSqL3P8bImrRbvJ19wxHRm8HXouDcCZtQhHlW7R1orOR3RGJbN%2B0cr9uKSdRMAw%2F9nK96Gs%2F9Ke1bduK5MpNLbvZD2LydmUX9Ye4WKr4R%2FtYB8tzT7d3ofD95%2FjzmbO8d1T5qvqDYpNRJOXzeuiey1wbBE8HwYy45O4xFqXKNA8cPBQn%2Fekvrxtp3OYV8XCctAvPFJ0Z51H5xOnblMsFbwwoWVy2k6Sxd%2Bhdc3aSMxSYVWd3q%2Bx9smd63mZRJul2hHqvzJmPAY%2BtdrTD179mkWbHlyderResyVwgiwK63MWeedbZU08y5A%2F00alzUq9LiWFcGx8rV7TwJH0qXQd1FUiDC7ezY3GOVQ8vVf%2BeN2OqhU24dVUVoAj5lj6mphwYI8cbkhk90lCTstVx3F%2FsWgE%2FXgIAAA%3D%3D"

# URL para obter assinaturas
url = "https://developers.hotmart.com/payments/api/v1/subscriptions"

# Parâmetros para filtrar por status CANCELLED_BY_SELLER e ACTIVE
params = {
    "status": ["CANCELLED_BY_SELLER", "ACTIVE"]
}

# Headers com o token de autenticação
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {access_token}"
}

# Fazer a requisição
response = requests.get(url, params=params, headers=headers)

# Mostrar o status e headers da resposta
print(f"Status code: {response.status_code}")
print(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")

# Mostrar o conteúdo da resposta
print("\nResponse body:")
try:
    print(json.dumps(response.json(), indent=2))
except:
    print(response.text)