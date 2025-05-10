import requests
import json
import argparse
from datetime import datetime, timedelta

def obter_token():
    """Obtém um novo token de acesso da API Hotmart"""
    client_id = "763d8717-29ae-4c95-b6b6-c797367669c0"
    client_secret = "4d11b99e-eae4-4f17-ab9a-467c52d97a25"
    basic_auth = "NzYzZDg3MTctMjlhZS00Yzk1LWI2YjYtYzc5NzM2NzY2OWMwOjRkMTFiOTllLWVhZTQtNGYxNy1hYjlhLTQ2N2M1MmQ5N2EyNQ=="
    
    url = "https://api-sec-vlc.hotmart.com/security/oauth/token"
    params = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {basic_auth}"
    }
    
    response = requests.post(url, params=params, headers=headers)
    
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        print(f"Erro ao obter token: {response.status_code}")
        print(response.text)
        return None

def converter_data_para_timestamp(data_str):
    """Converte uma data no formato YYYY-MM-DD para timestamp em milissegundos"""
    if not data_str:
        return None
        
    try:
        data = datetime.strptime(data_str, "%Y-%m-%d")
        # Converte para timestamp em milissegundos
        return int(data.timestamp() * 1000)
    except ValueError:
        print(f"Erro ao converter data: {data_str}. Use formato YYYY-MM-DD")
        return None

def obter_assinaturas(token, filtros=None):
    """Obtém assinaturas da API Hotmart com os filtros fornecidos"""
    url = "https://developers.hotmart.com/payments/api/v1/subscriptions"
    
    # Parâmetros padrão
    params = {
        "max_results": 500  # Máximo permitido pela API
    }
    
    # Adiciona filtros se fornecidos
    if filtros:
        params.update(filtros)
        
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    print(f"Fazendo requisição com os seguintes filtros: {json.dumps(params, indent=2)}")
    
    response = requests.get(url, params=params, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Erro ao obter assinaturas: {response.status_code}")
        print(response.text)
        return None

def mostrar_resultados(data):
    """Exibe os resultados de forma organizada"""
    if not data or "items" not in data:
        print("Nenhum resultado encontrado ou resposta inválida")
        return
        
    items = data.get("items", [])
    page_info = data.get("page_info", {})
    
    print(f"\n=== Informações da Página ===")
    print(f"Total de resultados: {page_info.get('total_results', 0)}")
    print(f"Resultados por página: {page_info.get('results_per_page', 0)}")
    
    if "next_page_token" in page_info:
        print(f"Há mais páginas disponíveis. Token da próxima página: {page_info['next_page_token'][:10]}...")
    
    print(f"\n=== Assinaturas ({len(items)}) ===")
    
    for i, item in enumerate(items, 1):
        sub_code = item.get("subscriber_code", "N/A")
        status = item.get("status", "N/A")
        email = item.get("subscriber", {}).get("email", "N/A")
        produto = item.get("product", {}).get("name", "N/A")
        plano = item.get("plan", {}).get("name", "N/A")
        
        # Converter timestamps para datas legíveis
        data_adesao = datetime.fromtimestamp(item.get("accession_date", 0)/1000).strftime('%Y-%m-%d') if item.get("accession_date") else "N/A"
        prox_cobranca = datetime.fromtimestamp(item.get("date_next_charge", 0)/1000).strftime('%Y-%m-%d') if item.get("date_next_charge") else "N/A"
        
        print(f"\n{i}. Assinatura: {sub_code} ({status})")
        print(f"   Email: {email}")
        print(f"   Produto: {produto}")
        print(f"   Plano: {plano}")
        print(f"   Data de adesão: {data_adesao}")
        print(f"   Próxima cobrança: {prox_cobranca}")
        
        # Se for cancelada, mostrar data de cancelamento
        if "end_accession_date" in item:
            cancelamento = datetime.fromtimestamp(item.get("end_accession_date", 0)/1000).strftime('%Y-%m-%d')
            print(f"   Data de cancelamento: {cancelamento}")

def analisar_argumentos():
    """Analisa os argumentos da linha de comando"""
    parser = argparse.ArgumentParser(description='Testa a API de Assinaturas do Hotmart')
    
    # Filtros comuns
    parser.add_argument('--status', nargs='+', help='Status da assinatura (ex: ACTIVE CANCELLED_BY_SELLER)')
    parser.add_argument('--product_id', help='ID do produto')
    parser.add_argument('--plan', help='Nome do plano')
    parser.add_argument('--email', help='Email do assinante', dest='subscriber_email')
    parser.add_argument('--code', help='Código do assinante', dest='subscriber_code')
    parser.add_argument('--trial', action='store_true', help='Filtrar assinaturas em período de teste')
    
    # Datas
    parser.add_argument('--data_inicio', help='Data de início da assinatura (YYYY-MM-DD)')
    parser.add_argument('--data_fim', help='Data final da assinatura (YYYY-MM-DD)')
    parser.add_argument('--data_cancel_inicio', help='Data inicial de cancelamento (YYYY-MM-DD)')
    parser.add_argument('--data_cancel_fim', help='Data final de cancelamento (YYYY-MM-DD)')
    parser.add_argument('--data_prox_cobranca', help='Data da próxima cobrança (YYYY-MM-DD)')
    parser.add_argument('--data_prox_cobranca_fim', help='Data final da próxima cobrança (YYYY-MM-DD)')
    
    # Paginação
    parser.add_argument('--max_results', type=int, default=100, help='Número máximo de resultados por página')
    parser.add_argument('--page_token', help='Token da página para paginação')
    
    return parser.parse_args()

def main():
    args = analisar_argumentos()
    
    # Obter token
    token = obter_token()
    if not token:
        print("Não foi possível obter token. Encerrando.")
        return
        
    # Preparar filtros baseados nos argumentos
    filtros = {}
    
    # Adicionar filtros de status
    if args.status:
        filtros["status"] = args.status
    
    # Adicionar outros filtros simples
    for campo in ['product_id', 'plan', 'subscriber_email', 'subscriber_code', 'trial']:
        valor = getattr(args, campo, None)
        if valor is not None:
            filtros[campo] = valor
            
    # Converter e adicionar datas
    if args.data_inicio:
        ts = converter_data_para_timestamp(args.data_inicio)
        if ts:
            filtros["accession_date"] = ts
            
    if args.data_fim:
        ts = converter_data_para_timestamp(args.data_fim)
        if ts:
            filtros["end_accession_date"] = ts
            
    if args.data_cancel_inicio:
        ts = converter_data_para_timestamp(args.data_cancel_inicio)
        if ts:
            filtros["cancelation_date"] = ts
            
    if args.data_cancel_fim:
        ts = converter_data_para_timestamp(args.data_cancel_fim)
        if ts:
            filtros["end_cancelation_date"] = ts
            
    if args.data_prox_cobranca:
        ts = converter_data_para_timestamp(args.data_prox_cobranca)
        if ts:
            filtros["date_next_charge"] = ts
            
    if args.data_prox_cobranca_fim:
        ts = converter_data_para_timestamp(args.data_prox_cobranca_fim)
        if ts:
            filtros["end_date_next_charge"] = ts
    
    # Adicionar parâmetros de paginação        
    if args.max_results:
        filtros["max_results"] = args.max_results
        
    if args.page_token:
        filtros["page_token"] = args.page_token
    
    # Fazer a requisição
    resultados = obter_assinaturas(token, filtros)
    
    # Exibir resultados
    if resultados:
        mostrar_resultados(resultados)

if __name__ == "__main__":
    main()