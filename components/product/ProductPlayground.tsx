'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  features,
  notebooks,
  seedNotes,
  type DemoNote,
  type DemoNotebook,
  type EditorMode,
  type FeatureId,
} from './scenes';
import MarkdownView from './MarkdownView';
import OutlineNav from './OutlineNav';
import styles from './playground.module.css';
import './preview.css';

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), { ssr: false });

type Filter = 'all' | DemoNotebook;

function firstLine(content: string): string {
  return (
    content
      .split('\n')
      .map(line => line.replace(/^#+\s*/, '').trim())
      .find(Boolean) ?? ''
  );
}

export default function ProductPlayground() {
  const [notes, setNotes] = useState<DemoNote[]>(seedNotes);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState(seedNotes[0].id);
  const [mode, setMode] = useState<EditorMode>('write');
  const [featureId, setFeatureId] = useState<FeatureId>('write');
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [jumpToLine, setJumpToLine] = useState<number | null>(null);

  const feature = features.find(item => item.id === featureId) ?? features[0];

  const visible = useMemo(
    () => (filter === 'all' ? notes : notes.filter(note => note.notebook === filter)),
    [filter, notes],
  );

  const selected = visible.find(note => note.id === selectedId) ?? visible[0] ?? null;

  const notesByTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const note of notes) map.set(note.title.toLowerCase(), note.id);
    return map;
  }, [notes]);

  function applyFeature(id: FeatureId) {
    const next = features.find(item => item.id === id);
    if (!next) return;
    setFeatureId(id);
    setMode(next.mode);
    setOutlineOpen(next.outline);
    setSelectedId(next.noteId);
    if (id === 'notebooks') setFilter('work');
    else setFilter('all');
    setJumpToLine(null);
  }

  function selectFilter(next: Filter) {
    setFilter(next);
    const first = next === 'all' ? notes[0] : notes.find(note => note.notebook === next);
    if (first) setSelectedId(first.id);
  }

  function updateSelected(content: string) {
    if (!selected) return;
    setNotes(current =>
      current.map(note =>
        note.id === selected.id ? { ...note, content, updated: 'just now' } : note,
      ),
    );
  }

  function addNote() {
    const id = `note-${Date.now()}`;
    const notebook: DemoNotebook = filter === 'all' ? 'personal' : filter;
    const note: DemoNote = {
      id,
      title: 'Untitled',
      notebook,
      updated: 'just now',
      content: '# Untitled\n\n',
    };
    setNotes(current => [note, ...current]);
    setSelectedId(id);
    setMode('write');
    setOutlineOpen(false);
  }

  function openNote(id: string) {
    const note = notes.find(item => item.id === id);
    if (!note) return;
    setSelectedId(id);
    setFilter('all');
  }

  return (
    <div>
      <div className={styles.rail} role="tablist" aria-label="Product features">
        {features.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={featureId === item.id}
            className={styles.railBtn}
            data-active={featureId === item.id}
            onClick={() => applyFeature(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className={styles.hintTop}>{feature.hint}</p>

      <div className={styles.shell}>
        <div className={styles.chrome}>
          <div className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className={styles.chromeTitle}>dripnex — {selected?.title ?? 'Notes'}</span>
        </div>

        <div className={styles.body} data-outline={outlineOpen}>
          <aside className={styles.sidebar} aria-label="Notebooks">
            {notebooks.map(item => {
              const count =
                item.id === 'all'
                  ? notes.length
                  : notes.filter(note => note.notebook === item.id).length;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.sideBtn}
                  data-active={filter === item.id}
                  onClick={() => selectFilter(item.id)}
                >
                  {item.label}
                  <span className={styles.count}>{count}</span>
                </button>
              );
            })}
          </aside>

          <section className={styles.list} aria-label="Notes">
            <div className={styles.listHead}>
              <span>
                {filter === 'all' ? 'All Notes' : notebooks.find(n => n.id === filter)?.label}
              </span>
              <button type="button" className={styles.newBtn} onClick={addNote}>
                New
              </button>
            </div>
            {visible.map(note => (
              <button
                key={note.id}
                type="button"
                className={styles.noteBtn}
                data-active={selected?.id === note.id}
                onClick={() => setSelectedId(note.id)}
              >
                <span className={styles.noteTitle}>{note.title}</span>
                <span className={styles.noteMeta}>
                  {note.updated} · {firstLine(note.content)}
                </span>
              </button>
            ))}
          </section>

          <section className={styles.editor} aria-label="Editor">
            {selected ? (
              <>
                <div className={styles.editorBar}>
                  <span className={styles.titleLabel}>{selected.title}</span>
                  <div className={styles.modes} role="tablist" aria-label="Editor mode">
                    {(['write', 'split', 'read'] as const).map(item => (
                      <button
                        key={item}
                        type="button"
                        data-active={mode === item}
                        onClick={() => setMode(item)}
                      >
                        {item === 'write' ? 'Edit' : item === 'read' ? 'Preview' : 'Split'}
                      </button>
                    ))}
                    <button
                      type="button"
                      data-active={outlineOpen}
                      onClick={() => setOutlineOpen(open => !open)}
                      title="Outline"
                    >
                      #
                    </button>
                  </div>
                </div>
                <div className={styles.panes} data-mode={mode}>
                  {mode !== 'read' && (
                    <CodeMirrorEditor
                      noteId={selected.id}
                      value={selected.content}
                      onChange={updateSelected}
                      jumpToLine={jumpToLine}
                    />
                  )}
                  {mode !== 'write' && (
                    <div className={styles.read}>
                      <MarkdownView
                        content={selected.content}
                        notesByTitle={notesByTitle}
                        onOpenNote={openNote}
                        onChange={updateSelected}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className={styles.empty}>Select a note or create one.</p>
            )}
          </section>

          {outlineOpen && selected ? (
            <OutlineNav
              content={selected.content}
              onJump={heading => {
                setMode(mode === 'read' ? 'write' : mode);
                setJumpToLine(heading.line);
              }}
            />
          ) : null}
        </div>
        <p className={styles.hint}>
          Real editor in the browser. Download the app to keep the same files on disk.
        </p>
      </div>
    </div>
  );
}
