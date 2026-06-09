/** Monaco-based code editor wrapper with project-wide editor defaults. */
import Editor from '@monaco-editor/react'
import {
  EDITOR_FONT_SIZE_PX,
  EDITOR_MIN_HEIGHT_PX,
  EDITOR_TAB_SIZE,
} from '../config/constants'
import { ui } from '../theme/ui'

const MONACO_THEME = 'vs-dark'
const MONACO_FONT_FAMILY =
  "ui-monospace, 'SF Mono', 'Cascadia Code', 'Source Code Pro', monospace"

interface CodeEditorProps {
  readonly monacoId: string
  readonly value: string
  readonly onChange: (value: string) => void
}

export function CodeEditor({
  monacoId,
  value,
  onChange,
}: CodeEditorProps): React.JSX.Element {
  return (
    <div className={ui.editorWrap}>
      <Editor
        height={`${String(EDITOR_MIN_HEIGHT_PX)}px`}
        theme={MONACO_THEME}
        language={monacoId}
        value={value}
        onChange={(next) => {
          onChange(next ?? '')
        }}
        options={{
          fontSize: EDITOR_FONT_SIZE_PX,
          tabSize: EDITOR_TAB_SIZE,
          fontFamily: MONACO_FONT_FAMILY,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          smoothScrolling: true,
          padding: { top: EDITOR_FONT_SIZE_PX },
        }}
      />
    </div>
  )
}
