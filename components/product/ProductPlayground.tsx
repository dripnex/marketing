'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Columns2,
  Eye,
  Folder,
  Hash,
  Inbox,
  MoreVertical,
  PenLine,
  Search,
  Settings,
  SquarePen,
} from 'lucide-react';
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
import styles from './playground.module.css';
import './tokens.css';
import './preview.css';

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), { ssr: false });

type Filter = 'all' | DemoNotebook;

const STATUS_LABEL: Record<DemoNote['status'], string> = {
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
};

function excerpt(content: string): string {
  return content
    .split('\n')
    .map(line => line.replace(/^#+\s*/, '').trim())
    .filter(Boolean)
    .slice(1, 3)
    .join(' ');
}

export default function ProductPlayground() {
  const [notes, setNotes] = useState<DemoNote[]>(seedNotes);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(seedNotes[0].id);
  const [mode, setMode] = useState<EditorMode>('write');
  const [featureId, setFeatureId] = useState<FeatureId>('write');
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [jumpToLine, setJumpToLine] = useState<number | null>(null);

  const feature = features.find(item => item.id === featureId) ?? features[0];

  const visible = useMemo(() => {
    const scoped = filter === 'all' ? notes : notes.filter(note => note.notebook === filter);
    const q = query.trim().toLowerCase();
    if (!q) return scoped;
    return scoped.filter(
      note => note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q),
    );
  }, [filter, notes, query]);

  const selected = notes.find(note => note.id === selectedId) ?? visible[0] ?? null;

  const notesByTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const note of notes) map.set(note.title.toLowerCase(), note.id);
    return map;
  }, [notes]);

  const headings = useMemo(() => {
    if (!selected || !outlineOpen) return [];
    return selected.content
      .split('\n')
      .map((line, i) => {
        const match = line.match(/^(#{1,6})[ \t]+(.+?)(?:[ \t]+#+[ \t]*)?$/);
        if (!match) return null;
        return { level: match[1]!.length, text: match[2]!.trim(), line: i + 1 };
      })
      .filter((item): item is { level: number; text: string; line: number } => Boolean(item));
  }, [outlineOpen, selected]);

  function applyFeature(id: FeatureId) {
    const next = features.find(item => item.id === id);
    if (!next) return;
    setFeatureId(id);
    setMode(next.mode);
    setOutlineOpen(next.outline);
    setSelectedId(next.noteId);
    setFilter(id === 'notebooks' ? 'work' : 'all');
    setQuery('');
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

  function renameSelected(title: string) {
    if (!selected) return;
    setNotes(current =>
      current.map(note => (note.id === selected.id ? { ...note, title } : note)),
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
      status: 'active',
      tags: [],
      content: '# Untitled\n\n',
    };
    setNotes(current => [note, ...current]);
    setSelectedId(id);
    setMode('write');
    setOutlineOpen(false);
  }

  function openNote(id: string) {
    if (!notes.some(item => item.id === id)) return;
    setSelectedId(id);
    setFilter('all');
  }

  const listTitle =
    filter === 'all' ? 'All Notes' : (notebooks.find(n => n.id === filter)?.label ?? 'Notes');

  return (
    <div className={styles.wrap}>
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

      <div className={`dripnex-app ${styles.shell}`}>
        <div className={styles.body} data-outline={outlineOpen}>
          <aside className={styles.sidebar} aria-label="Notebooks">
            <div className={styles.sidebarHeader}>
              <span className={styles.wordmark}>dripnex.</span>
              <button type="button" className={styles.iconBtn} aria-label="Settings" tabIndex={-1}>
                <Settings size={16} />
              </button>
            </div>
            <nav className={styles.sidebarNav}>
              <button
                type="button"
                className={styles.navRow}
                data-active={filter === 'all'}
                onClick={() => selectFilter('all')}
              >
                <span className={styles.navIcon}>
                  <Inbox size={14} />
                </span>
                <span className={styles.navLabel}>All Notes</span>
                <span className={styles.navCount}>{notes.length}</span>
              </button>
              <p className={styles.sectionLabel}>Notebooks</p>
              {notebooks
                .filter(item => item.id !== 'all')
                .map(item => {
                  const count = notes.filter(note => note.notebook === item.id).length;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.nbRow}
                      data-active={filter === item.id}
                      onClick={() => selectFilter(item.id)}
                    >
                      <span className={styles.navIcon}>
                        <Folder size={14} />
                      </span>
                      <span className={styles.navLabel}>{item.label}</span>
                      <span className={styles.navCount}>{count}</span>
                    </button>
                  );
                })}
            </nav>
            <p className={styles.sidebarFoot}>Browser preview. Files stay on disk in the app.</p>
          </aside>

          <section className={styles.list} aria-label="Notes">
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>{listTitle}</h2>
              <button type="button" className={styles.iconBtn} onClick={addNote} aria-label="New note">
                <SquarePen size={16} />
              </button>
            </div>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search notes"
              />
            </div>
            <div className={styles.listItems}>
              {visible.map(note => (
                <button
                  key={note.id}
                  type="button"
                  className={styles.noteItem}
                  data-active={selected?.id === note.id}
                  onClick={() => setSelectedId(note.id)}
                >
                  <span className={styles.noteTitle}>{note.title}</span>
                  <span className={styles.noteMeta}>
                    <span className={styles.noteTime}>{note.updated}</span>
                    {note.tags.map(tag => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                  <span className={styles.notePreview}>{excerpt(note.content) || firstLine(note.content)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.editor} aria-label="Editor">
            {selected ? (
              <>
                <header className={styles.editorHeader}>
                  <input
                    className={styles.titleInput}
                    value={selected.title}
                    onChange={event => renameSelected(event.target.value)}
                    aria-label="Note title"
                  />
                  <div className={styles.headerMid}>
                    <div className={styles.toggle} role="group" aria-label="View mode">
                      {(
                        [
                          ['write', 'Edit', PenLine],
                          ['split', 'Split', Columns2],
                          ['read', 'Preview', Eye],
                        ] as const
                      ).map(([id, label, Icon]) => (
                        <button
                          key={id}
                          type="button"
                          className={styles.toggleBtn}
                          data-active={mode === id}
                          onClick={() => setMode(id)}
                          title={label}
                          aria-label={label}
                        >
                          <Icon size={16} />
                        </button>
                      ))}
                    </div>
                    <div className={styles.toggle} role="group" aria-label="Outline">
                      <button
                        type="button"
                        className={styles.toggleBtn}
                        data-active={outlineOpen}
                        onClick={() => setOutlineOpen(open => !open)}
                        title="Outline"
                        aria-label="Toggle outline"
                      >
                        <Hash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.headerActions}>
                    <button type="button" className={styles.iconBtn} aria-label="More actions" tabIndex={-1}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </header>
                <div className={styles.meta}>
                  <span className={styles.metaBtn}>
                    <Folder size={12} />
                    {notebooks.find(n => n.id === selected.notebook)?.label}
                  </span>
                  <span className={styles.metaBtn}>
                    <span className={styles.statusDot} data-status={selected.status} />
                    {STATUS_LABEL[selected.status]}
                  </span>
                  {selected.tags.length === 0 ? (
                    <span className={styles.metaBtn}>Tags</span>
                  ) : (
                    selected.tags.map(tag => (
                      <span key={tag} className={styles.tag}>
                        #{tag}
                      </span>
                    ))
                  )}
                </div>
                <div className={styles.workspace}>
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
                  {outlineOpen ? (
                    <aside className={styles.outline} aria-label="Note outline">
                      <p className={styles.outlineLabel}>Outline</p>
                      {headings.length === 0 ? (
                        <p className={styles.outlineEmpty}>No headings</p>
                      ) : (
                        headings.map(heading => (
                          <button
                            key={`${heading.line}-${heading.text}`}
                            type="button"
                            className={`${styles.outlineItem} ${heading.level > 1 ? styles[`outlineL${heading.level}` as 'outlineL2'] : ''}`}
                            onClick={() => {
                              setMode(mode === 'read' ? 'write' : mode);
                              setJumpToLine(heading.line);
                            }}
                          >
                            {heading.text}
                          </button>
                        ))
                      )}
                    </aside>
                  ) : null}
                </div>
              </>
            ) : (
              <div className={styles.empty}>Select a note to edit</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function firstLine(content: string): string {
  return (
    content
      .split('\n')
      .map(line => line.replace(/^#+\s*/, '').trim())
      .find(Boolean) ?? ''
  );
}
