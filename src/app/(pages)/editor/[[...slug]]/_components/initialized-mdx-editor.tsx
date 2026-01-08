'use client'

import React, { useCallback, useImperativeHandle, useRef, forwardRef } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown as markdownLang, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { syntaxHighlighting, HighlightStyle, defaultHighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import { useTheme } from 'next-themes'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
} from 'lucide-react'

export interface EditorHandle {
  getMarkdown: () => string
  setMarkdown: (markdown: string) => void
  focus: () => void
}

interface EditorProps {
  markdown: string
  onChange?: (markdown: string, viewUpdate: ViewUpdate) => void
  onImageUpload?: (file: File) => Promise<string | null>
  readOnly?: boolean
}

// Custom Syntax Highlighting
const customHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '2em', fontWeight: 'bold', color: 'inherit' },
  { tag: tags.heading2, fontSize: '1.5em', fontWeight: 'bold', color: 'inherit' },
  { tag: tags.heading3, fontSize: '1.25em', fontWeight: 'bold', color: 'inherit' },
  { tag: tags.heading, fontWeight: 'bold', color: 'inherit' },
  { tag: tags.strong, fontWeight: 'bold', color: 'inherit' }, // Keep color inherit (black), just bold
  { tag: tags.emphasis, fontStyle: 'italic', color: 'inherit' }, // Keep color inherit (black), just italic
  { tag: tags.strikethrough, textDecoration: 'line-through', color: 'var(--color-gray-400)' },
  { tag: tags.quote, color: 'var(--color-gray-500)', fontStyle: 'italic' },
  { tag: tags.link, color: 'var(--color-blue-500)', textDecoration: 'underline' },
  { tag: tags.url, color: 'var(--color-blue-400)', textDecoration: 'none' },
  {
    tag: tags.monospace,
    color: 'var(--color-pink-500)',
    backgroundColor: 'var(--color-gray-100)',
    borderRadius: '4px',
    padding: '0 4px',
  },
])

const InitializedMDXEditor = forwardRef<EditorHandle, EditorProps>(
  ({ markdown, onChange, onImageUpload, readOnly = false }, ref) => {
    const { theme } = useTheme()
    const editorRef = useRef<ReactCodeMirrorRef>(null)

    useImperativeHandle(ref, () => ({
      getMarkdown: () => {
        return editorRef.current?.view?.state.doc.toString() || ''
      },
      setMarkdown: (newMarkdown: string) => {
        if (editorRef.current?.view) {
          const transaction = editorRef.current.view.state.update({
            changes: { from: 0, to: editorRef.current.view.state.doc.length, insert: newMarkdown },
          })
          editorRef.current.view.dispatch(transaction)
        }
      },
      focus: () => {
        editorRef.current?.view?.focus()
      },
    }))

    // Smart Toggle (Wrap/Unwrap)
    const insertText = useCallback((prefix: string, suffix: string = '') => {
      const view = editorRef.current?.view
      if (!view) return

      const selection = view.state.selection.main
      const selectedText = view.state.sliceDoc(selection.from, selection.to)
      const doc = view.state.doc

      // Check surrounding text
      const before = doc.sliceString(Math.max(0, selection.from - prefix.length), selection.from)
      const after = doc.sliceString(selection.to, selection.to + suffix.length)

      const isWrapped = before === prefix && after === suffix

      if (isWrapped) {
        // Unwrap
        view.dispatch({
          changes: {
            from: selection.from - prefix.length,
            to: selection.to + suffix.length,
            insert: selectedText,
          },
          selection: {
            anchor: selection.from - prefix.length,
            head: selection.to - prefix.length, // Adjust selection to keep text selected
          },
          scrollIntoView: true,
        })
      } else {
        // Wrap
        const textToInsert = prefix + selectedText + suffix
        view.dispatch({
          changes: {
            from: selection.from,
            to: selection.to,
            insert: textToInsert,
          },
          selection: {
            anchor: selection.from + prefix.length,
            head: selection.from + prefix.length + selectedText.length,
          },
          scrollIntoView: true,
        })
      }
      view.focus()
    }, [])

    const insertBlock = useCallback((prefix: string) => {
      const view = editorRef.current?.view
      if (!view) return

      const selection = view.state.selection.main
      const line = view.state.doc.lineAt(selection.from)
      const lineContent = line.text

      // 이미 해당 접두사가 있는지 확인 (토글 기능)
      const hasPrefix = lineContent.startsWith(prefix)

      let newContent = ''
      let from = line.from
      let to = line.to

      if (hasPrefix) {
        newContent = lineContent.slice(prefix.length)
      } else {
        newContent = prefix + lineContent
      }

      view.dispatch({
        changes: { from, to, insert: newContent },
        selection: { anchor: from + newContent.length },
        scrollIntoView: true,
      })
      view.focus()
    }, [])

    // Toolbar Component
    const Toolbar = () => {
      if (readOnly) return null

      const btnClass =
        'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'

      return (
        <div className="sticky top-0 z-10 flex w-full overflow-x-auto border-b border-gray-100 bg-transparent p-2 backdrop-blur-sm dark:border-gray-800">
          <div className="flex items-center gap-1">
            <button onClick={() => insertText('**', '**')} className={btnClass} title="Bold">
              <Bold size={16} />
            </button>
            <button onClick={() => insertText('_', '_')} className={btnClass} title="Italic">
              <Italic size={16} />
            </button>
            <button
              onClick={() => insertText('~~', '~~')}
              className={btnClass}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>

            <div className="mx-2 h-4 w-px bg-gray-200 dark:bg-gray-700" />

            <button onClick={() => insertBlock('# ')} className={btnClass} title="Heading 1">
              <Heading1 size={16} />
            </button>
            <button onClick={() => insertBlock('## ')} className={btnClass} title="Heading 2">
              <Heading2 size={16} />
            </button>
            <button onClick={() => insertBlock('### ')} className={btnClass} title="Heading 3">
              <Heading3 size={16} />
            </button>

            <div className="mx-2 h-4 w-px bg-gray-200 dark:bg-gray-700" />

            <button onClick={() => insertBlock('> ')} className={btnClass} title="Quote">
              <Quote size={16} />
            </button>
            <button onClick={() => insertText('`', '`')} className={btnClass} title="Inline Code">
              <Code size={16} />
            </button>
            <button
              onClick={() => insertText('```\n', '\n```')}
              className={btnClass}
              title="Code Block"
            >
              <div className="px-0.5 text-xs font-bold">KB</div>
            </button>

            <div className="mx-2 h-4 w-px bg-gray-200 dark:bg-gray-700" />

            <button onClick={() => insertBlock('- ')} className={btnClass} title="Bulleted List">
              <List size={16} />
            </button>
            <button onClick={() => insertBlock('1. ')} className={btnClass} title="Ordered List">
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => insertBlock('---\n')}
              className={btnClass}
              title="Horizontal Rule"
            >
              <Minus size={16} />
            </button>

            <div className="mx-2 h-4 w-px bg-gray-200 dark:bg-gray-700" />

            <button onClick={() => insertText('[', '](url)')} className={btnClass} title="Link">
              <Link size={16} />
            </button>
            <button onClick={() => insertText('![alt](', ')')} className={btnClass} title="Image">
              <ImageIcon size={16} />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="group relative flex h-full w-full flex-col">
        <Toolbar />
        <div className={`flex-1 overflow-auto ${readOnly ? '' : 'cursor-text'}`}>
          <CodeMirror
            ref={editorRef}
            value={markdown}
            height="100%"
            extensions={[
              markdownLang({ base: markdownLanguage, codeLanguages: languages }),
              syntaxHighlighting(customHighlightStyle),
              EditorView.lineWrapping,
              EditorView.theme({
                '&': { height: '100%', backgroundColor: 'transparent !important' },
                '.cm-content': {
                  padding: '2rem 1.5rem',
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '0.95rem',
                },
                '.cm-line': { wordBreak: 'break-word', lineHeight: '1.6' },
                '.cm-scroller': { fontFamily: 'inherit' },
              }),
            ]}
            onChange={onChange}
            editable={!readOnly}
            theme={theme === 'dark' ? githubDark : githubLight}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              highlightActiveLineGutter: false,
              highlightActiveLine: false,
              allowMultipleSelections: true,
              indentOnInput: true,
            }}
            onPaste={async (event) => {
              const items = event.clipboardData?.items
              if (!items) return

              for (const item of items) {
                if (item.type.startsWith('image/')) {
                  const file = item.getAsFile()
                  if (file && onImageUpload) {
                    event.preventDefault()
                    const url = await onImageUpload(file)
                    if (url) {
                      const view = editorRef.current?.view
                      if (view) {
                        const selection = view.state.selection.main
                        view.dispatch({
                          changes: {
                            from: selection.from,
                            to: selection.to,
                            insert: `![image](${url})`,
                          },
                          selection: { anchor: selection.from + `![image](${url})`.length },
                        })
                      }
                    }
                  }
                }
              }
            }}
            className="h-full text-base"
          />
        </div>
      </div>
    )
  },
)

InitializedMDXEditor.displayName = 'InitializedMDXEditor'

export default InitializedMDXEditor
