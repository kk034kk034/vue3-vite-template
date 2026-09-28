import { reactive, watch } from 'vue'

export type FontScale = 'md' | 'lg' | 'xl'
export type ContrastMode = 'default' | 'high' | 'plain'
export type SpacingMode = 'default' | 'relaxed'

const storageKey = 'gov-a11y-settings'

interface A11yState {
  font: FontScale
  contrast: ContrastMode
  spacing: SpacingMode
  message: string
}

function loadSettings(): Pick<A11yState, 'font' | 'contrast' | 'spacing'> {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { font: 'md', contrast: 'default', spacing: 'default' }
    const parsed = JSON.parse(raw) as Partial<A11yState>
    return {
      font: parsed.font === 'lg' || parsed.font === 'xl' ? parsed.font : 'md',
      contrast: parsed.contrast === 'high' || parsed.contrast === 'plain' ? parsed.contrast : 'default',
      spacing: parsed.spacing === 'relaxed' ? 'relaxed' : 'default',
    }
  } catch {
    return { font: 'md', contrast: 'default', spacing: 'default' }
  }
}

export const a11y = reactive<A11yState>({
  ...loadSettings(),
  message: '',
})

watch(
  () => [a11y.font, a11y.contrast, a11y.spacing] as const,
  () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ font: a11y.font, contrast: a11y.contrast, spacing: a11y.spacing }),
    )
  },
)

export function setFont(font: FontScale) {
  a11y.font = font
  const label = font === 'md' ? '一般大小' : font === 'lg' ? '放大到 150%' : '放大到 200%'
  a11y.message = `文字已改為${label}`
}

export function setContrast(contrast: ContrastMode) {
  a11y.contrast = contrast
  a11y.message =
    contrast === 'high' ? '已改為高對比色彩' : contrast === 'plain' ? '已改為瀏覽器色彩' : '已改回一般色彩'
}

export function setSpacing(spacing: SpacingMode) {
  a11y.spacing = spacing
  a11y.message = spacing === 'relaxed' ? '已加寬行距與字距' : '已改回一般行距'
}
