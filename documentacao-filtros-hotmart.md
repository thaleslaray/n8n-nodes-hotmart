# Documentação dos Filtros - Hotmart

## Club

### Obter Alunos

#### Parâmetros de Paginação

##### return_all
- **Descrição**: Se deve retornar todos os resultados
- **Nome na Interface**: Retornar Todos
- **Tipo**: boolean
- **Valores API**: true, false
- **Valores Tradução**: Sim, Não

##### limit
- **Descrição**: Limite de resultados por página quando não retornar todos
- **Nome na Interface**: Limite
- **Tipo**: number
- **Valores API**: -
- **Valores Tradução**: -
- **Observação**: Só aparece quando return_all é false

##### max_results
- **Descrição**: Número máximo total de resultados
- **Nome na Interface**: Máximo de Resultados
- **Tipo**: number
- **Valores API**: -
- **Valores Tradução**: -

#### Parâmetros Obrigatórios

##### subdomain
- **Descrição**: Nome do subdomínio da Área de Membros
- **Nome na Interface**: Subdomínio
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -
- **Observação**: Parâmetro obrigatório

#### Filtros

##### email
- **Descrição**: Filtrar por e-mail do aluno
- **Nome na Interface**: Email do aluno
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -

##### page_token
- **Descrição**: Token para paginação
- **Nome na Interface**: Token de página
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -

### Obter Módulos

#### Parâmetros Obrigatórios

##### subdomain
- **Descrição**: Nome do subdomínio da Área de Membros
- **Nome na Interface**: Subdomínio
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -
- **Observação**: Parâmetro obrigatório

#### Filtros

##### is_extra
- **Descrição**: Se habilitado, retorna apenas módulos extras
- **Nome na Interface**: Módulos extras
- **Tipo**: boolean
- **Valores API**: true, false
- **Valores Tradução**: Sim, Não

### Obter Progresso do Aluno

#### Parâmetros Obrigatórios

##### subdomain
- **Descrição**: Nome do subdomínio da Área de Membros
- **Nome na Interface**: Subdomínio
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -
- **Observação**: Parâmetro obrigatório

##### user_id
- **Descrição**: ID do aluno (use o endpoint de alunos para obter)
- **Nome na Interface**: ID do aluno
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -
- **Observação**: Parâmetro obrigatório

### Obter Páginas

#### Parâmetros Obrigatórios

##### subdomain
- **Descrição**: Nome do subdomínio da Área de Membros
- **Nome na Interface**: Subdomínio
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -
- **Observação**: Parâmetro obrigatório

##### module_id
- **Descrição**: ID do módulo (use o endpoint de módulos para obter)
- **Nome na Interface**: ID do módulo
- **Tipo**: string
- **Valores API**: -
- **Valores Tradução**: -
- **Observação**: Parâmetro obrigatório
