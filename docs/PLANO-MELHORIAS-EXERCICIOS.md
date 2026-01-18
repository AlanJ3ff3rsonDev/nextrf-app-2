# Plano de Melhorias - Exercicios NextRF

> Documento de acompanhamento das melhorias de UX, design e funcionalidade dos exercicios.

---

## Status Geral

| Item | Status | Prioridade |
|------|--------|------------|
| Fix loop infinito TTS | Pendente | Critica |
| Fix botao Check duplicado | Pendente | Critica |
| Redesign ListenTapImage | Pendente | Alta |
| Redesign SpeakRepeat | Pendente | Alta |
| Paleta de cores pastel | Pendente | Media |
| Dark mode | Pendente | Media |
| Integracao OpenAI TTS | Pendente | Media |

---

## Bugs Identificados

### 1. Loop Infinito do Microfone/TTS
**Localizacao:** `src/lib/hooks/use-audio.ts`

**Sintoma:** O TTS fica repetindo a palavra infinitamente.

**Causa Raiz:**
- O objeto `options` passado para `useTextToSpeech` e recriado a cada render
- Isso causa recriacao da funcao `speak` (useCallback depende de options)
- O useEffect que faz auto-play depende de `speak`, disparando em loop

**Correcao:**
```tsx
// Usar ref para armazenar options
const optionsRef = useRef(options);
useEffect(() => { optionsRef.current = options; }, [options]);

// speak so depende de isSupported agora
const speak = useCallback((text: string) => {
  // usar optionsRef.current
}, [isSupported]);
```

---

### 2. Botao Check Duplicado
**Localizacao:** `src/components/exercises/read-choose.tsx`

**Sintoma:** Aparecem 2 botoes "Check" na tela.

**Causa:**
- ReadChoose tem botao proprio (linhas 112-126)
- ExerciseContainer tambem renderiza botao (linhas 80-88)

**Correcao:** Remover botao interno do ReadChoose e usar apenas o do ExerciseContainer.

---

### 3. Cards Gigantes no ListenTapImage
**Localizacao:** `src/components/exercises/listen-tap-image.tsx`

**Sintoma:** Cards ocupam quase toda a tela, emojis pequenos, texto ilegivel.

**Causa:**
- Grid usa `flex-1` que expande para ocupar todo espaco disponivel
- Cards usam `aspect-square` sem limite de altura
- Container pai e `min-h-screen`

**Correcao:**
- Remover `flex-1` do grid
- Adicionar `max-h-[160px]` nos cards
- Aumentar tamanho dos emojis
- Centralizar grid com `max-w-sm mx-auto`

---

### 4. UX Confusa no SpeakRepeat
**Localizacao:** `src/components/exercises/speak-repeat.tsx`

**Sintomas:**
- Texto "Listening..." aparece quando TTS esta falando (confunde com microfone)
- Nao tem botao claro para o usuario falar
- Fluxo de 3 estagios e confuso

**Correcao:** Redesign completo com:
- Indicador de passos visual (1. Listen -> 2. Speak -> 3. Result)
- Botao de volume separado do botao de microfone
- Texto claro: "Playing audio..." vs "Recording..."
- Botao grande laranja "Tap to speak" sempre visivel

---

## Melhorias de Design

### Paleta de Cores Pastel

**Antes (cores saturadas):**
- Primary: #2B7DE9 (azul forte)
- Secondary: #FF8C00 (laranja forte)

**Depois (tons pastel):**
- Primary: #3B8EE8 (azul suave)
- Secondary: #F59E42 (laranja suave)
- Success: #4ADE80 (verde pastel)
- Error: #F87171 (vermelho pastel)

### Dark Mode

Variaveis CSS:
```css
:root {
  --background: #FAFBFC;
  --foreground: #1F2937;
  --card: #FFFFFF;
}

.dark {
  --background: #0F172A;
  --foreground: #F1F5F9;
  --card: #1E293B;
}
```

Componentes necessarios:
- `ThemeProvider` - Context para gerenciar tema
- `ThemeToggle` - Botao para alternar tema
- Persistencia no localStorage

---

## Melhoria de Qualidade de Voz

### Problema Atual
- Usa Web Speech API nativa do navegador
- Qualidade varia muito (ruim no Chrome Android, ok no Safari iOS)
- Voz robotica em alguns dispositivos

### Solucao: OpenAI TTS

**API Route:** `POST /api/tts`
```ts
{
  text: "Hello",
  voice: "nova",  // voz feminina natural
  speed: 0.9      // levemente mais lenta
}
```

**Custo:** ~$0.015 por 1000 caracteres

**Fallback:** Se API falhar, usa Web Speech API

**Cache:**
- Em memoria para frases repetidas na sessao
- Header Cache-Control: 24h

---

## Checklist de Implementacao

### Fase 1: Bug Fixes
- [ ] Corrigir `use-audio.ts` - loop infinito
- [ ] Corrigir `read-choose.tsx` - botao duplicado
- [ ] Testar em dispositivo real

### Fase 2: Redesign Responsivo
- [ ] Refatorar `listen-tap-image.tsx`
- [ ] Refatorar `speak-repeat.tsx`
- [ ] Testar em iPhone SE (320px)
- [ ] Testar em iPhone 14 (390px)
- [ ] Testar em iPad (768px)

### Fase 3: Design System
- [ ] Atualizar `tailwind.config.ts` com cores pastel
- [ ] Criar `theme-provider.tsx`
- [ ] Criar `theme-toggle.tsx`
- [ ] Atualizar `globals.css` com variaveis dark
- [ ] Adicionar toggle no header/perfil

### Fase 4: OpenAI TTS
- [ ] Criar `src/app/api/tts/route.ts`
- [ ] Criar `src/lib/services/tts-service.ts`
- [ ] Atualizar `use-audio.ts` para usar servico
- [ ] Configurar `OPENAI_API_KEY` no .env
- [ ] Testar qualidade do audio
- [ ] Testar fallback

---

## Comandos Uteis

```bash
# Desenvolvimento
cd nextrf-app
npm run dev

# Testar em dispositivo movel (mesma rede)
# Acessar http://<seu-ip>:3000

# Build de producao
npm run build
npm start
```

---

## Referencias

- [OpenAI TTS Docs](https://platform.openai.com/docs/guides/text-to-speech)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
