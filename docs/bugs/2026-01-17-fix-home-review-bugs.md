# Correção: Home Page Vazia + Review Loading Infinito

**Data:** 17 de Janeiro de 2026
**Contexto:** Após corrigir o bug de login (erro RLS 42P17), o estudante consegue fazer login mas encontra problemas na navegação.

## Situação Anterior

1. **Bug de Login Resolvido:** Havia recursão infinita nas políticas RLS entre `students` e `classes`. Corrigido restringindo políticas com referências circulares ao role `authenticated` apenas.

2. **Novos Problemas Encontrados:**
   - Home page aparece "feia" ou vazia após login
   - Clicar em "Review" causa loading infinito

---

## Problemas Identificados

### 1. Review Page - Loading Infinito (BUG CRÍTICO)

**Arquivo:** `src/app/(student)/review/page.tsx`

**Causa raiz:** Loop infinito na geração de distractors (linhas 113-121):
```typescript
while (shuffledDistractors.length < 3) {
  const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
  // ... nunca sai se allItems está vazio ou tem < 3 items
}
```

**Cenários que causam o bug:**
- `allItems` vazio (fetch falhou ou não há items no banco)
- Menos de 3 items únicos disponíveis para distractors

### 2. Home Page - Tela Vazia/Feia

**Arquivo:** `src/app/(student)/home/page.tsx`

**Problemas:**
- Sem tratamento de erros nas queries Supabase
- Se dados falham, mostra conteúdo vazio sem feedback
- Possíveis problemas de RLS nas queries (similar ao login)

### 3. Mobile-First

**Status atual:** Já é mobile-focused, mas pode melhorar:
- UI components bem estruturados
- Safe areas configuradas
- Touch targets adequados (80px)

---

## Solução

### Passo 1: Corrigir Bug do Review (Loop Infinito)

**Arquivo:** `src/app/(student)/review/page.tsx`

Adicionar proteção contra loop infinito e tratamento de erros:

```typescript
const generateExercise = useCallback((reviewItem: ReviewItem) => {
  const item = reviewItem.item;

  // PROTEÇÃO: Verificar se há items suficientes
  if (allItems.length < 4) {
    // Não há items suficientes para gerar exercício com distractors
    setCurrentExercise(null);
    return;
  }

  // Get items with similar tags for distractors
  const similarItems = allItems.filter(
    (i) => i.id !== item.id && i.tags?.some((tag) => item.tags?.includes(tag))
  );

  // Shuffle and take up to 3
  const shuffledDistractors = [...similarItems]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // CORREÇÃO: Usar loop seguro com limite de iterações
  const availableItems = allItems.filter(
    (i) => i.id !== item.id && !shuffledDistractors.some((d) => d.id === i.id)
  );

  let attempts = 0;
  const maxAttempts = 100;

  while (shuffledDistractors.length < 3 && attempts < maxAttempts) {
    if (availableItems.length === 0) break;

    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const randomItem = availableItems[randomIndex];

    if (randomItem && !shuffledDistractors.some((d) => d.id === randomItem.id)) {
      shuffledDistractors.push(randomItem);
      availableItems.splice(randomIndex, 1); // Remove para não repetir
    }
    attempts++;
  }

  // Se ainda não tem 3, usa o que tem
  // ... resto do código
}, [allItems]);
```

### Passo 2: Adicionar Tratamento de Erros na Home

**Arquivo:** `src/app/(student)/home/page.tsx`

Adicionar estado de erro e feedback visual:

```typescript
const [error, setError] = useState<string | null>(null);

// No fetchData:
const { data: studentData, error: studentError } = await supabase
  .from("students")
  // ...

if (studentError) {
  console.error("Erro ao buscar estudante:", studentError);
  setError("Não foi possível carregar seus dados. Tente novamente.");
  setLoading(false);
  return;
}

// Renderizar estado de erro:
if (error) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-error-500 text-center">
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
```

### Passo 3: Verificar/Criar Dados de Teste

Executar no Supabase SQL Editor para garantir que existem items:

```sql
-- Verificar se existem items
SELECT COUNT(*) FROM items;

-- Se não houver, criar alguns items de teste
INSERT INTO items (english, portuguese, tags, audio_url, image_url)
VALUES
  ('apple', 'maçã', ARRAY['food', 'fruit'], null, null),
  ('banana', 'banana', ARRAY['food', 'fruit'], null, null),
  ('cat', 'gato', ARRAY['animal', 'pet'], null, null),
  ('dog', 'cachorro', ARRAY['animal', 'pet'], null, null),
  ('house', 'casa', ARRAY['place', 'building'], null, null),
  ('car', 'carro', ARRAY['vehicle', 'transport'], null, null),
  ('book', 'livro', ARRAY['object', 'school'], null, null),
  ('pencil', 'lápis', ARRAY['object', 'school'], null, null)
ON CONFLICT DO NOTHING;
```

### Passo 4: Verificar Políticas RLS

Garantir que estudantes autenticados podem ler items:

```sql
-- Verificar políticas em items
SELECT policyname, roles, cmd, qual FROM pg_policies WHERE tablename = 'items';

-- Se não houver política para authenticated, criar:
CREATE POLICY "Authenticated users can read items" ON items
  FOR SELECT
  TO authenticated
  USING (true);
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/app/(student)/review/page.tsx` | Corrigir loop infinito, adicionar tratamento de erros |
| `src/app/(student)/home/page.tsx` | Adicionar tratamento de erros e feedback visual |
| Supabase SQL | Verificar/criar items de teste e políticas RLS |

---

## Verificação

1. Após as mudanças, fazer login como `joao` / `joao123`
2. Verificar que a home carrega com dados ou mostra mensagem de erro clara
3. Clicar em "Review" e verificar que não trava mais
4. Se não houver items para revisar, deve mostrar mensagem apropriada
5. Testar em viewport mobile (375px width)

---

## Histórico de Correções Relacionadas

### Bug de Login (Resolvido)
- **Erro:** RLS 42P17 (recursão infinita)
- **Causa:** Políticas circulares entre `students` e `classes`
- **Solução:**
  1. Separar query de login em duas chamadas independentes
  2. Restringir políticas com referências circulares ao role `authenticated`
