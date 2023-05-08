import Editor, { EditorProps, OnValidate } from '@monaco-editor/react';
import { memo, useCallback, useState } from 'react';

const options = {
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: 'on',
  accessibilitySupport: 'auto',
  autoIndent: 'advanced',
  automaticLayout: true,
  codeLens: true,
  colorDecorators: true,
  contextmenu: true,
  cursorBlinking: 'blink',
  cursorSmoothCaretAnimation: 'off',
  cursorStyle: 'line',
  disableLayerHinting: false,
  disableMonospaceOptimizations: false,
  dragAndDrop: false,
  fixedOverflowWidgets: false,
  folding: true,
  foldingStrategy: 'auto',
  fontLigatures: false,
  formatOnPaste: false,
  formatOnType: false,
  hideCursorInOverviewRuler: false,
  highlightActiveIndentGuide: true,
  links: true,
  mouseWheelZoom: false,
  multiCursorMergeOverlapping: true,
  multiCursorModifier: 'alt',
  overviewRulerBorder: true,
  overviewRulerLanes: 2,
  quickSuggestions: true,
  quickSuggestionsDelay: 100,
  readOnly: false,
  renderControlCharacters: false,
  renderFinalNewline: 'off',
  renderIndentGuides: true,
  renderLineHighlight: 'all',
  renderWhitespace: 'none',
  revealHorizontalRightPadding: 30,
  roundedSelection: true,
  rulers: [80, 120],
  scrollBeyondLastColumn: 5,
  selectOnLineNumbers: false,
  selectionClipboard: false,
  selectionHighlight: true,
  showFoldingControls: 'mouseover',
  smoothScrolling: false,
  suggestOnTriggerCharacters: true,
  wordBasedSuggestions: true,
  wordSeparators: '~!@#$%^&*()-=+[{]}|;:\'",.<>/?',
  wordWrap: 'off',
  wordWrapBreakAfterCharacters: '\t})]?|&,;',
  wordWrapBreakBeforeCharacters: '{([+',
  wordWrapBreakObtrusiveCharacters: '.',
  wordWrapColumn: 80,
  wordWrapMinified: true,
  wrappingIndent: 'none',
} as EditorProps['options'];

type CustomEditorProps = {
  language: 'json';
  onChange: (value: string) => void;
  value: string;
  onValidate?: OnValidate;
};

const CustomEditor = ({
  language,
  onChange,
  value,
  onValidate,
}: CustomEditorProps) => {
  const [initialValue] = useState(JSON.stringify(value, null, 4));

  const _onChange = useCallback(
    (newValue: string) => {
      try {
        const newFormattedValue = JSON.parse(newValue);
        onChange(newFormattedValue);
      } catch (error) {
        console.error(error);
      }
    },
    [onChange],
  );

  return (
    <div
      className="rounded"
      style={{
        height: 105,
        background: '#F3F6F9',
      }}
    >
      <Editor
        className=""
        loading={<span className="font-sans text-zinc-700">Carregando</span>}
        language={language}
        value={initialValue}
        path={language}
        onChange={_onChange}
        options={options}
        onValidate={onValidate}
      />
    </div>
  );
};

export default memo(CustomEditor);
