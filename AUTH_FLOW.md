# Fluxo de Autenticação INVIS / Supabase

O ecossistema INVIS utiliza o Supabase para gerenciar a identidade e o controle de sessão dos usuários, provendo tanto os mecanismos de front-end ("Client") quanto a proteção robusta em back-end ("Server"). Abaixo detalhamos como o fluxo funciona ponta a ponta e fornecemos exemplos de como interagir com endpoints restritos de forma segura.

## 1. Fluxo de Registro & Login (Front-end)

A lógica de autenticação dos usuários ocorre primariamente dentro de `src/lib/supabase.ts` gerida pela engine do Supabase Auth.
Os componentes como `LoginScreen` ou `RegisterScreen` invocam métodos do `SupabaseService`.

### Etapas:
1. **Autenticação:** O usuário entra com e-mail e senha no cliente (ou via OAuth com Google/Facebook).
2. **Emissão de Token JWT:** O Supabase valida internamente e devolve um token JWT válido de sessão. Ao invés do aplicativo ter que gerenciar localstorage de forma bruta, é recomendado extrair e salvar essa sessão via funções built-in como `supabase.auth.getSession()`.
3. **Criação de Perfil no App:** Assim que a conta é criada, o sistema INVIS possui uma lógica de pre-hook no middleware do `signUp` disparado em `src/lib/supabase.ts` para inserir o novo perfil na tabela genérica `profiles`, garantindo que atributos específicos da plataforma (Ex: Nível Tecnológico, fundos de Carteira IC$) existam desde o primeiro acesso.

## 2. Proteção de Endpoints (Back-end)

Um middleware personalizado (`requireAuth`) foi desenvolvido em `server.ts` para rejeitar o tráfego em endpoints sensíveis a não ser que a requisição seja assinada por um token autêntico do Supabase.

### 2.1 Middleware `requireAuth` (`server.ts`)

O express agora intercepta chamadas com o seguinte método de validação:
- Verifica se existe o cabeçalho `Authorization: Bearer <TOKEN>`.
- Isola o token, passando ele para a API de validação em servidor usando `supabase.auth.getUser(token)`.
- Se o usuário e a assinatura do JWT são confirmados, prossegue-se a requisição incluindo aos objetos de rotas os valores em `req.user`.

## 3. Exemplo Prático: Consumindo Uma Rota Segura no Front-end

Para acessar uma rota protegida (como a `POST /api/search` recém-blindada), o aplicativo front-end precisa ler o estado do `session` via cliente Supabase, e injetar o token na requisição fetch.

```typescript
import { supabase } from '../lib/supabase';

async function buscarPesquisaProtegida(termo: string) {
  try {
    // Passo 1: Busca a sessão atual gerenciada dinamicamente pelo Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Passo 2: Valida logica de usuário ativo (não enviar se for null)
    if (error || !session) {
      throw new Error("Você precisa estar logado para pesquisar na super inteligência.");
    }

    // Passo 3: Modela e envia a requisição assinada em seu header `Bearer`
    const resposta = await fetch('/api/search', {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         // ATENÇÃO: É vital prefixar o cabeçalho com Bearer 
         "Authorization": \`Bearer \${session.access_token}\`
      },
      body: JSON.stringify({ query: termo })
    });

    if (!resposta.ok) throw new Error("Acesso Negado ou Token Expirado");
    
    const dados = await resposta.json();
    console.log("Sucesso de API:", dados);
    return dados;

  } catch (erro) {
    console.error("Falha detalhada ao acionar rota segura:", erro);
  }
}
```

### 3.1 Tratamento e Teste de Revogação

O token gerado expira na cadência gerenciada em sua plataforma Supabase. Sempre prefira buscar o objeto via `supabase.auth.getSession()` imediatamente antes do payload fetch, assim, o client SDK cuidará automaticamente da fase de *renew* do token se ele expirar minimizando reboots por falhas de sessão (401 Unauthorized) nos endpoints do `server.ts`.
