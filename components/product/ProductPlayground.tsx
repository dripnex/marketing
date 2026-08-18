'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import {
  FileStack,
  Folder,
  Hash,
  List,
  MoreVertical,
  Network,
  Search,
  Settings,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react';
import {
  features,
  notebooks,
  seedNotes,
  type DemoNote,
  type DemoNotebook,
  type EditorMode,
  type FeatureId,
  type NoteStatus,
} from './scenes';
import MarkdownView from './MarkdownView';
import { sc as side } from '../desktop/sidebarSc';
import { sc as list } from '../desktop/noteListSc';
import { sc as ed } from '../desktop/noteEditorSc';
import { sc as head } from '../desktop/headerSc';
import { sc as outline } from '../desktop/outlineSc';
import { sc as preview } from '../desktop/previewSc';
import { SidebarSection } from '../desktop/SidebarSection';
import { EditorViewToggle } from '../desktop/EditorViewToggle';
import { StatusGlyph } from '../desktop/StatusGlyph';
import { scanMarkdown } from '@/lib/markdown/scan';
import { useDemoTour } from './useDemoTour';
import { demoSlides } from './demoSlides';
import type { EditorView } from '@codemirror/view';
import '../desktop/tokens.css';
import '../desktop/layout.css';
import './demo.css';

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), { ssr: false });

type Filter = 'all' | DemoNotebook;

const STATUS: NoteStatus[] = ['active', 'on_hold', 'completed', 'dropped'];
const STATUS_LABEL: Record<NoteStatus, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  dropped: 'Dropped',
};

function excerpt(content: string): string {
  return content
    .split('\n')
    .map(line => line.replace(/^#+\s*/, '').trim())
    .filter(Boolean)
    .slice(1, 3)
    .join(' ');
}

export default function ProductPlayground({ fill = false }: { fill?: boolean }) {
  const params = useSearchParams();
  const featureParam = params.get('f');
  const demoParam = params.get('demo');
  const autoDemo = demoParam === '1' || (!featureParam && demoParam !== '0');
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [notes, setNotes] = useState<DemoNote[]>(seedNotes);
  const [filter, setFilter] = useState<Filter>('all');
  const [statusFilter, setStatusFilter] = useState<NoteStatus | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(seedNotes[0].id);
  const [mode, setMode] = useState<EditorMode>('editor');
  const [featureId, setFeatureId] = useState<FeatureId>('write');
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [jumpToLine, setJumpToLine] = useState<number | null>(null);
  const [notebookQuery, setNotebookQuery] = useState('');

  const visible = useMemo(() => {
    let scoped = filter === 'all' ? notes : notes.filter(note => note.notebook === filter);
    if (statusFilter) scoped = scoped.filter(note => note.status === statusFilter);
    if (tagFilter) scoped = scoped.filter(note => note.tags.includes(tagFilter));
    const q = query.trim().toLowerCase();
    if (q) {
      scoped = scoped.filter(
        note => note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q),
      );
    }
    return scoped;
  }, [filter, notes, query, statusFilter, tagFilter]);

  const selected = notes.find(note => note.id === selectedId) ?? visible[0] ?? null;

  const notesByTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const note of notes) map.set(note.title.toLowerCase(), note.id);
    return map;
  }, [notes]);

  const headings = useMemo(
    () => (selected && outlineOpen ? scanMarkdown(selected.content).headings : []),
    [outlineOpen, selected],
  );

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [notes]);

  const statusCounts = useMemo(() => {
    const counts: Record<NoteStatus, number> = {
      active: 0,
      on_hold: 0,
      completed: 0,
      dropped: 0,
    };
    for (const note of notes) counts[note.status] += 1;
    return counts;
  }, [notes]);

  function applyFeature(id: FeatureId) {
    const next = features.find(item => item.id === id);
    if (!next) return;
    setEditorView(null);
    setFeatureId(id);
    setMode(next.mode);
    setOutlineOpen(next.outline);
    setSelectedId(next.noteId);
    setFilter(id === 'notebooks' ? 'work' : 'all');
    setStatusFilter(null);
    setTagFilter(null);
    setQuery('');
    setJumpToLine(null);
  }

  const tour = useDemoTour({
    enabled: autoDemo,
    view: editorView,
    applyFeature,
    setNotes,
  });

  useEffect(() => {
    if (!featureParam || autoDemo) return;
    if (!features.some(item => item.id === featureParam)) return;
    applyFeature(featureParam as FeatureId);
  }, [autoDemo, featureParam]);

  function selectFilter(next: Filter) {
    setFilter(next);
    setStatusFilter(null);
    setTagFilter(null);
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
    setMode('editor');
    setOutlineOpen(false);
  }

  function openNote(id: string) {
    if (!notes.some(item => item.id === id)) return;
    setSelectedId(id);
    setFilter('all');
  }

  const listTitle =
    tagFilter ??
    (statusFilter ? STATUS_LABEL[statusFilter] : null) ??
    (filter === 'all' ? 'All Notes' : (notebooks.find(n => n.id === filter)?.label ?? 'Notes'));

  const shownNotebooks = notebooks.filter(item => {
    if (item.id === 'all') return false;
    if (!notebookQuery.trim()) return true;
    return item.label.toLowerCase().includes(notebookQuery.toLowerCase());
  });

  return (
    <div className={fill ? 'h-full' : undefined}>
      <div
        className="dripnex-app"
        style={
          fill
            ? { height: '100%', position: 'relative' }
            : {
                height: 'min(72vh, 680px)',
                minHeight: 520,
                border: '1px solid var(--border)',
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative',
              }
        }
      >
        <div
          className="app__layout"
          onPointerDown={() => {
            if (tour.status === 'running') tour.stop();
          }}
        >
          <aside className="app__sidebar">
            <aside className={side('sidebar')} aria-label="Main sidebar">
              <div className={side('sidebar-header')}>
                <button type="button" className={side('sidebar-settings-btn')} aria-label="Open graph">
                  <Network size={16} />
                </button>
                <button type="button" className={side('sidebar-settings-btn')} aria-label="Settings">
                  <Settings size={16} />
                </button>
              </div>
              <div className={side('sidebar-content')}>
                <nav className={side('sidebar-quick-filters')} aria-label="Quick filters">
                  <button
                    type="button"
                    className={side(
                      'sidebar-row',
                      filter === 'all' && !statusFilter && !tagFilter && 'selected',
                    )}
                    onClick={() => selectFilter('all')}
                    aria-pressed={filter === 'all' && !statusFilter && !tagFilter}
                  >
                    <span className={side('sidebar-row-icon')}>
                      <List size={15} />
                    </span>
                    <span className={side('sidebar-row-label')}>All Notes</span>
                    <span className={side('sidebar-row-count')}>{notes.length}</span>
                  </button>
                </nav>

                <div className={side('sidebar-templates')}>
                  <button type="button" className={side('sidebar-row')}>
                    <span className={side('sidebar-row-icon')}>
                      <FileStack size={15} />
                    </span>
                    <span className={side('sidebar-row-label')}>Note Templates</span>
                  </button>
                </div>

                <SidebarSection
                  title="Notebooks"
                  collapsible
                  searchable
                  searchQuery={notebookQuery}
                  onSearchChange={setNotebookQuery}
                  searchPlaceholder="Filter notebooks"
                >
                  {shownNotebooks.map(item => {
                    const count = notes.filter(note => note.notebook === item.id).length;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={side('notebook-item-row', filter === item.id && 'selected')}
                        onClick={() => selectFilter(item.id)}
                      >
                        <span className={side('notebook-item-icon')}>
                          <Folder size={12} />
                        </span>
                        <span className={side('notebook-item-name')}>{item.label}</span>
                        <span className={side('notebook-item-count')}>{count}</span>
                      </button>
                    );
                  })}
                </SidebarSection>

                <SidebarSection title="Status" collapsible>
                  <nav className={side('sidebar-status-filters')} aria-label="Status filters">
                    {STATUS.map(status => (
                      <button
                        key={status}
                        type="button"
                        className={side('sidebar-row', statusFilter === status && 'selected')}
                        onClick={() => setStatusFilter(current => (current === status ? null : status))}
                        aria-pressed={statusFilter === status}
                        data-status={status}
                      >
                        <span className={side('sidebar-row-icon', 'sidebar-status-icon')}>
                          <StatusGlyph status={status} />
                        </span>
                        <span className={side('sidebar-row-label')}>{STATUS_LABEL[status]}</span>
                        <span className={side('sidebar-row-count')}>{statusCounts[status]}</span>
                      </button>
                    ))}
                  </nav>
                </SidebarSection>

                <SidebarSection title="Tags" collapsible>
                  {tagCounts.map(([tag, count]) => (
                    <button
                      key={tag}
                      type="button"
                      className={side('sidebar-row', tagFilter === tag && 'selected')}
                      onClick={() => setTagFilter(current => (current === tag ? null : tag))}
                    >
                      <span className={side('sidebar-row-label')}>#{tag}</span>
                      <span className={side('sidebar-row-count')}>{count}</span>
                    </button>
                  ))}
                </SidebarSection>

                <button type="button" className={side('sidebar-row', 'sidebar-trash')}>
                  <span className={side('sidebar-row-icon')}>
                    <Trash2 size={15} />
                  </span>
                  <span className={side('sidebar-row-label')}>Trash</span>
                  <span className={side('sidebar-row-count')}>0</span>
                </button>
              </div>
            </aside>
          </aside>

          <nav className={`app__notelist ${list('note-list')}`} aria-label="Notes navigation">
            <div className={list('note-list-header')}>
              <span className={list('header-title')}>{listTitle}</span>
              <button
                type="button"
                className={list('header-btn')}
                onClick={addNote}
                aria-label="Create new note"
              >
                <SquarePen size={16} />
              </button>
            </div>
            <div className={list('note-list-search')}>
              <div className={list('search-input-wrapper')}>
                <Search size={14} className={list('search-icon')} aria-hidden="true" />
                <label htmlFor="note-search" className="visually-hidden">
                  Search notes
                </label>
                <input
                  id="note-search"
                  type="search"
                  placeholder="Search or tag:work status:active notebook:inbox"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  className={list('search-input')}
                />
                {query ? (
                  <button
                    className={list('search-clear')}
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>
              <p className={list('search-hint')}>
                tag:work · status:active · notebook:inbox · is:pinned · is:trash
              </p>
            </div>
            <div className={list('note-list-content')}>
              <ul className={list('note-list-items')} role="listbox" aria-label="Notes">
                {visible.map((note, index) => (
                  <li
                    key={note.id}
                    id={`note-${note.id}`}
                    role="option"
                    aria-selected={selected?.id === note.id}
                    className={list('note-list-item', selected?.id === note.id && 'selected')}
                    style={{ '--item-index': Math.min(index, 10) } as React.CSSProperties}
                    onClick={() => setSelectedId(note.id)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedId(note.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className={list('note-list-item-title')}>
                      <span
                        className={list('kind-dot')}
                        style={{ background: 'var(--status-active)' }}
                      />
                      {note.title || 'Untitled'}
                    </div>
                    <div className={list('note-list-item-meta')}>
                      <span className={list('timestamp')}>{note.updated}</span>
                      {note.tags.length > 0 ? (
                        <span className={list('tags')}>
                          {note.tags.slice(0, 2).map(tag => (
                            <button
                              key={tag}
                              type="button"
                              className={list('tag-badge', 'tag-badge-clickable')}
                              onClick={event => {
                                event.stopPropagation();
                                setTagFilter(tag);
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </span>
                      ) : null}
                    </div>
                    <div className={list('note-list-item-preview')}>{excerpt(note.content)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <main className={`app__editor ${ed('note-editor')}`} aria-label="Note editor">
            {selected ? (
              <>
                <header className={ed('note-editor-header')}>
                  <input
                    className={ed('title-input')}
                    value={selected.title}
                    onChange={event => renameSelected(event.target.value)}
                    aria-label="Note title"
                  />
                  <div className={ed('note-editor-header-mid')}>
                    <EditorViewToggle mode={mode} onModeChange={setMode} />
                    <div className={ed('editor-view-toggle')} role="group" aria-label="Outline">
                      <button
                        type="button"
                        className={ed('editor-view-toggle-btn', outlineOpen && 'active')}
                        onClick={() => setOutlineOpen(open => !open)}
                        title="Outline"
                        aria-label="Toggle outline"
                        aria-pressed={outlineOpen}
                      >
                        <Hash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={ed('note-editor-header-actions')}>
                    <button type="button" className={ed('note-editor-actions-btn')} aria-label="More actions">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </header>
                <div className={head('editor-header')}>
                  <button type="button" className={head('editor-header-dropdown-btn')}>
                    <Folder size={12} />
                    {notebooks.find(n => n.id === selected.notebook)?.label}
                  </button>
                  <button type="button" className={head('editor-header-dropdown-btn')}>
                    <StatusGlyph status={selected.status} />
                    {STATUS_LABEL[selected.status]}
                  </button>
                  <div className={head('tags-display')}>
                    {selected.tags.length === 0 ? (
                      <span className={head('tags-display-empty')}>Tags</span>
                    ) : (
                      selected.tags.map(tag => (
                        <span key={tag} className={head('tag-chip')}>
                          <span className={head('tag-hash')}>#</span>
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className={ed('note-editor-workspace')}>
                  <div className={ed('note-editor-body', `note-editor-body--${mode}`)}>
                    {mode !== 'preview' ? (
                      <div className={ed('split-pane', 'split-pane--editor')}>
                        <CodeMirrorEditor
                          noteId={selected.id}
                          value={selected.content}
                          onChange={updateSelected}
                          jumpToLine={jumpToLine}
                          onReady={setEditorView}
                        />
                      </div>
                    ) : null}
                    {mode !== 'editor' ? (
                      <div className={ed('split-pane', 'split-pane--preview')}>
                        <div className={preview('markdown-preview')} data-preview>
                          <MarkdownView
                            content={selected.content}
                            notesByTitle={notesByTitle}
                            onOpenNote={openNote}
                            onChange={updateSelected}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {outlineOpen ? (
                    <aside className={outline('outline')} aria-label="Note outline">
                      <p className={outline('outline-label')}>Outline</p>
                      {headings.length === 0 ? (
                        <p className={outline('outline-empty')}>No headings</p>
                      ) : (
                        <nav>
                          {headings.map(heading => (
                            <button
                              key={`${heading.line}-${heading.text}`}
                              type="button"
                              className={outline('outline-item', `outline-item--l${heading.level}`)}
                              onClick={() => {
                                setMode(mode === 'preview' ? 'editor' : mode);
                                setJumpToLine(heading.line);
                              }}
                            >
                              {heading.text}
                            </button>
                          ))}
                        </nav>
                      )}
                    </aside>
                  ) : null}
                </div>
              </>
            ) : (
              <div className={ed('note-editor-empty')}>
                <p className={ed('empty-title')}>Select a note to edit</p>
                <p className={ed('empty-hint')}>Or press ⌘N to create a new one</p>
              </div>
            )}
          </main>
        </div>
        {tour.status === 'running' || tour.status === 'done' ? (
          <div className="demo-hud" onPointerDown={event => event.stopPropagation()}>
            <div className="demo-hud__copy">
              <p className="demo-hud__caption">
                {tour.status === 'done' ? 'That’s every feature in this window.' : tour.caption}
              </p>
              <p className="demo-hud__dots" aria-hidden="true">
                {demoSlides.map((_, index) => (
                  <span key={index} data-on={index === tour.slide && tour.status === 'running'} />
                ))}
              </p>
            </div>
            {tour.status === 'done' ? (
              <button type="button" className="demo-hud__retry" onClick={tour.start}>
                Retry
              </button>
            ) : (
              <span className="demo-hud__step">
                {tour.slide + 1}/{tour.total}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
