# 🏆 Luana Queiroz e Família — Desafio da Copa 2026

> Uma brincadeira familiar interativa da Copa do Mundo 2026 para o canal [Luana Queiroz e Família](https://www.youtube.com/@Luanaqueirozefamilia).

## ✨ Funcionalidades

- 🏠 **Visão Geral** — Dashboard com estatísticas, próximos jogos e chaveamento oficial
- 📊 **Grupos** — Classificação dos grupos com dados reais ou demonstrativos
- 🏆 **Chaveamento** — Chaveamento oficial separado do simulador
- ✨ **Simulador** — Monte seu palpite da Copa com placares, pênaltis e gere um PDF!
- 🚩 **Seleções** — Busque e explore as seleções participantes
- 🥇 **Ranking da Família** — Veja quem mandou melhor nos palpites
- 📜 **Regulamento** — Regras da brincadeira familiar
- 🎛️ **Admin** — Painel administrativo protegido por senha

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
git clone https://github.com/cabineeventos2025-dotcom/luanaevinicopa2026.git
cd luanaevinicopa2026

# Instalar dependências
npm install --legacy-peer-deps

# Copiar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves
```

### Desenvolvimento

```bash
npm run dev
```

O site abrirá em `http://localhost:3000`.

### Build para produção

```bash
npm run build
```

## ⚙️ Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Descrição | Obrigatório |
|---|---|---|
| `VITE_FOOTBALL_DATA_API_URL` | URL da API football-data.org | Não (tem padrão) |
| `VITE_FOOTBALL_DATA_API_KEY` | Chave da API football-data.org | Recomendado |
| `VITE_WORLD_CUP_COMPETITION_CODE` | Código da competição (WC) | Não |
| `VITE_WORLD_CUP_SEASON` | Temporada (2026) | Não |
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Opcional |
| `VITE_SUPABASE_ANON_KEY` | Chave pública do Supabase | Opcional |
| `VITE_ADMIN_PASSWORD` | Senha do painel admin (/admin) | Recomendado |

> Se o Supabase não estiver configurado, o sistema usa **LocalStorage** como fallback automaticamente.

## 🗄️ Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com/)
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `supabase/schema.sql`
4. Copie a URL e a chave anon do projeto
5. Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## 🌐 Deploy na Vercel

### Passo a passo

1. Faça fork ou clone este repositório
2. Acesse [vercel.com](https://vercel.com/) e conecte o repositório
3. Em **Settings > Environment Variables**, adicione todas as variáveis do `.env.example`
4. Clique em **Deploy**

### Variáveis necessárias na Vercel

```
VITE_FOOTBALL_DATA_API_URL=https://api.football-data.org/v4
VITE_FOOTBALL_DATA_API_KEY=sua_chave_aqui
VITE_WORLD_CUP_COMPETITION_CODE=WC
VITE_WORLD_CUP_SEASON=2026
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
VITE_ADMIN_PASSWORD=sua_senha_aqui
```

## 🏗️ Arquitetura

```
src/
├── routes/              # Páginas (file-based routing)
│   ├── __root.tsx       # Layout raiz com providers
│   ├── index.tsx        # Página principal
│   ├── ranking.tsx      # Ranking da Família
│   ├── regulamento.tsx  # Regulamento do Desafio
│   └── admin.tsx        # Painel administrativo
├── components/
│   ├── layout/          # Header, Navigation
│   ├── worldcup/        # OfficialBracketView, GroupStandings, etc.
│   ├── simulator/       # SimulatorView, SimulatorCard, ParticipantForm, etc.
│   ├── ranking/         # RankingTable
│   ├── channel/         # ChannelConfig
│   └── common/          # YouTubeButton, etc.
├── contexts/
│   ├── ChannelConfigContext.tsx   # Personalização do canal
│   └── SimulatorContext.tsx       # Estado do simulador
├── repositories/
│   ├── RankingRepository.ts             # Interface
│   ├── LocalStorageRankingRepository.ts # Fallback local
│   ├── SupabaseRankingRepository.ts     # Banco online
│   └── index.ts                         # Factory
├── services/
│   ├── footballDataOrgService.ts  # API football-data.org
│   └── supabaseClient.ts          # Cliente Supabase
├── types/
│   ├── prediction.ts   # Tipos do palpite e ranking
│   └── navigation.ts   # Tipos de navegação
├── utils/
│   ├── scoring.ts    # Sistema de pontuação (0-10 pts)
│   ├── ranking.ts    # Ordenação e atualização do ranking
│   ├── hashUtils.ts  # Código único LQF2026-XXXX e SHA-256
│   ├── dateUtils.ts  # Horário de Brasília (date-fns-tz)
│   └── pdfExport.ts  # Geração de PDF (jsPDF + html2canvas)
└── lib/
    └── worldcup/     # Motor de chaveamento, tipos, hook de dados
supabase/
└── schema.sql        # SQL do banco de dados Supabase
```

## 📜 Tecnologias

- **React 19** + **TypeScript** + **TanStack Start** (SSR)
- **TailwindCSS v4** + **Nunito/Outfit** (Google Fonts)
- **TanStack Router** (file-based routing)
- **React Query** (data fetching + cache)
- **React Hook Form** + **Zod** (formulários)
- **Supabase** (banco de dados online) + **LocalStorage** (fallback)
- **jsPDF** + **html2canvas** (geração de PDF)
- **date-fns-tz** (horário de Brasília)
- **Lucide React** (ícones)
- **football-data.org** (dados reais da Copa)

## ⚠️ Aviso Legal

Este site é uma **brincadeira familiar e recreativa** vinculada ao canal Luana Queiroz e Família.
**Não envolve pagamento, aposta, compra de produto ou qualquer tipo de valor financeiro para participar.**

---

Made with ❤️ for [Luana Queiroz e Família](https://www.youtube.com/@Luanaqueirozefamilia) 🏆
