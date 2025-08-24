# Sistema de Autenticação - N8N Manager

Este documento descreve o sistema de autenticação implementado no projeto N8N Manager.

## Visão Geral

O sistema de autenticação foi implementado tanto no frontend quanto no backend para proteger o acesso ao dashboard de gerenciamento de instâncias N8N.

## Componentes Implementados

### Frontend

#### 1. AuthContext (`apps/frontend/src/contexts/AuthContext.tsx`)

- Gerencia o estado de autenticação global
- Fornece funções de login/logout
- Persiste dados no localStorage
- Hook `useAuth()` para acesso ao contexto

#### 2. Login Component (`apps/frontend/src/components/Login/Login.tsx`)

- Tela de login responsiva
- Validação de formulário
- Feedback visual de erros
- Toggle para mostrar/ocultar senha

#### 3. ProtectedRoute (`apps/frontend/src/components/ProtectedRoute.tsx`)

- Componente wrapper para proteger rotas
- Redireciona para login se não autenticado
- Loading state durante verificação

#### 4. Header Component (`apps/frontend/src/components/Dashboard/Header.tsx`)

- Exibe informações do usuário logado
- Botão de logout
- Integrado ao dashboard existente

### Backend

#### 1. Auth Middleware (`apps/backend/src/middleware/auth.ts`)

- `authMiddleware`: Verifica token de autenticação
- `requireAuth`: Middleware obrigatório para rotas protegidas
- `optionalAuth`: Middleware opcional

#### 2. Auth Endpoints

- `POST /auth/login`: Autenticação de usuário
- `POST /auth/logout`: Logout (preparado para futuras implementações)

#### 3. GraphQL Context

- Integração com Apollo Server
- Passa dados de usuário para resolvers
- Verificação de autenticação em operações

## Credenciais de Demonstração

```
Usuário: admin
Senha: admin123
```

## Fluxo de Autenticação

1. **Acesso Inicial**: Usuário acessa a aplicação
2. **Verificação**: `ProtectedRoute` verifica se há token válido
3. **Redirecionamento**: Se não autenticado, redireciona para `/login`
4. **Login**: Usuário insere credenciais
5. **Validação**: Frontend chama `POST /auth/login`
6. **Token**: Backend retorna token e dados do usuário
7. **Armazenamento**: Token salvo no localStorage
8. **Acesso**: Usuário redirecionado para dashboard

## Segurança

### Implementado

- ✅ Autenticação obrigatória para dashboard
- ✅ Tokens de autenticação
- ✅ Middleware de proteção
- ✅ Contexto de usuário no GraphQL

### Melhorias Futuras

- 🔄 JWT tokens com expiração
- 🔄 Refresh tokens
- 🔄 Criptografia de senhas
- 🔄 Rate limiting
- 🔄 Logs de auditoria
- 🔄 Múltiplos usuários
- 🔄 Roles e permissões

## Uso

### Desenvolvimento

```bash
# Credenciais padrão
admin / admin123
```

### Produção

- Implementar JWT tokens
- Usar banco de dados para usuários
- Adicionar criptografia de senhas
- Configurar HTTPS

## Arquivos Modificados

### Frontend

- `src/contexts/AuthContext.tsx` (novo)
- `src/components/Login/` (novo)
- `src/components/ProtectedRoute.tsx` (novo)
- `src/components/Dashboard/Header.tsx` (novo)
- `src/App.tsx` (modificado)
- `src/main.tsx` (modificado)

### Backend

- `src/middleware/auth.ts` (novo)
- `src/index.ts` (modificado)

## Testando

1. Acesse http://localhost:3000
2. Você será redirecionado para a tela de login
3. Use as credenciais: admin/admin123
4. Após login, você terá acesso ao dashboard
5. Use o botão "Sair" no header para fazer logout
