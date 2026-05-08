# musique-web

SPA da Musique (Angular standalone + signals + Tailwind), integrada com a `musique-api`.

## Stack

- Angular 21 (compatível com Angular 20+)
- TypeScript
- Angular Signals
- RxJS
- Angular Router + lazy loading
- Angular HttpClient + interceptors
- TailwindCSS
- Angular Material (uso pontual)
- ESLint + Prettier

## Estrutura

- `src/app/core`: api, interceptors, estado global e erro global
- `src/app/shared`: componentes de UI reutilizáveis
- `src/app/features`: páginas por feature
- `src/app/layout`: navbar, sidebar e shell principal
  - layout atual: navbar única (sem sidebar)
- `src/app/models`: interfaces tipadas
- `src/environments`: configurações por ambiente

## Pre-requisitos

1. Node.js 22.12+ (recomendado)
2. npm 10+
3. Backend `musique-api` rodando em `http://localhost:8080`

> Observação: o Angular CLI atual pode emitir warning de engine se sua versão de Node estiver abaixo da recomendada.

## 1) Instalar dependências

Na pasta `musique-web`:

```bash
npm install
```

## 2) Configurar endpoint da API

Arquivo de desenvolvimento:

- `src/environments/environment.development.ts`

Valor default:

```ts
apiUrl: 'http://localhost:8080/api';
```

Se o backend estiver em outra URL/porta, ajuste esse valor.

## 3) Rodar localmente

```bash
npm start
```

ou

```bash
ng serve
```

Aplicação: `http://localhost:4200`

## 4) Qualidade e build

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Formatação:

```bash
npm run format
```

Testes:

```bash
npm test
```

## Fluxo recomendado para desenvolvimento local

1. Suba primeiro o backend (`musique-api`) em `:8080`
2. Suba o frontend (`musique-web`) em `:4200`
3. Acesse Home, Busca, Favoritos e Detalhe de Álbum
4. Acesse Mood para gerenciar álbuns do momento
5. Valide chamadas da API no DevTools (Network)

## Integração com Spotify (dependência do frontend)

O frontend depende do backend para enriquecer os álbuns com dados do Spotify no cadastro:

- capa do álbum (`coverUrl`)
- id do Spotify (`idExternal`)
- link publico (`spotifyUrl`)

Para funcionar localmente, configure as credenciais Spotify no backend (`musique-api`) usando:

- `APP_SPOTIFY_CLIENT_ID`
- `APP_SPOTIFY_CLIENT_SECRET`

## Contrato esperado de álbum

O frontend espera `artist` completo no álbum:

```json
{
  "id": 10,
  "name": "Discovery",
  "releaseYear": 2001,
  "rating": 4.5,
  "coverUrl": "https://...",
  "idExternal": "spotify_album_id",
  "spotifyUrl": "https://open.spotify.com/album/...",
  "artist": {
    "id": 1,
    "name": "Daft Punk"
  }
}
```

## Funcionalidades principais

- Home: vitrine de álbuns
- Busca: filtro por álbum/artista
- Favoritos: coleção local do usuário
- Mood: lista de álbuns do momento (persistida no backend)
- Cadastros: hub para cadastrar artista e álbum

## Regra de rating

- A avaliação de álbum usa escala de `0.0` a `5.0`
- Incremento permitido: `0.5`
