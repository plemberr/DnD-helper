import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { TextFileNode } from '../../data/library';
import {
  fantasyColors,
  fantasyGradients,
  fantasyShadows,
  ornateCornersSx,
} from '../../theme/fantasyTheme';
import { FantasyAudioPlayer } from '../audio/FantasyAudioPlayer';
import { useMediaLibraryStore } from '../../store/mediaLibraryStore';

type TabState = {
  id: string;
  title: string;
  documentId: string;
};

type DocumentWorkspaceProps = {
  tabs: TabState[];
  activeTabId: string;
  activeDocument: TextFileNode;
  breadcrumbs: string[];
  getTabDocument: (documentId: string) => TextFileNode;
  onSetActiveTabId: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenNewTab: () => void;
  onUpdateTextContent: (documentId: string, content: string) => void;
};

export function DocumentWorkspace({
  tabs,
  activeTabId,
  activeDocument,
  breadcrumbs,
  getTabDocument,
  onSetActiveTabId,
  onCloseTab,
  onOpenNewTab,
  onUpdateTextContent,
}: DocumentWorkspaceProps) {
  const selectedMediaPreview = useMediaLibraryStore((state) => state.selectedMediaPreview);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorMode, setEditorMode] = useState<'preview' | 'edit'>('preview');
  const hasTabs = tabs.length > 0;

  const updateDocumentContent = (nextContent: string) => {
    onUpdateTextContent(activeDocument.id, nextContent);
  };

  const applyWrapSyntax = (left: string, right: string, placeholder: string) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const { selectionStart, selectionEnd, value } = editor;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const insertedText = selectedText || placeholder;
    const nextValue = `${value.slice(0, selectionStart)}${left}${insertedText}${right}${value.slice(selectionEnd)}`;
    const cursorStart = selectionStart + left.length;
    const cursorEnd = cursorStart + insertedText.length;

    updateDocumentContent(nextValue);

    requestAnimationFrame(() => {
      const updatedEditor = editorRef.current;
      if (!updatedEditor) {
        return;
      }
      updatedEditor.focus();
      updatedEditor.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const { selectionStart, selectionEnd, value } = editor;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEndCandidate = value.indexOf('\n', selectionEnd);
    const lineEnd = lineEndCandidate === -1 ? value.length : lineEndCandidate;
    const selectedBlock = value.slice(lineStart, lineEnd);
    const updatedBlock = selectedBlock
      .split('\n')
      .map((line) => `${prefix}${line}`)
      .join('\n');
    const nextValue = `${value.slice(0, lineStart)}${updatedBlock}${value.slice(lineEnd)}`;

    updateDocumentContent(nextValue);

    requestAnimationFrame(() => {
      const updatedEditor = editorRef.current;
      if (!updatedEditor) {
        return;
      }
      updatedEditor.focus();
      updatedEditor.setSelectionRange(lineStart, lineStart + updatedBlock.length);
    });
  };

  const renderMediaPreview = () => {
    if (!selectedMediaPreview || selectedMediaPreview.item.kind === 'folder') {
      return (
        <Typography variant="body2" color="text.secondary">
          Выберите файл в правой библиотеке, чтобы показать картинку или открыть аудиоплеер.
        </Typography>
      );
    }

    if (selectedMediaPreview.mediaType === 'picture') {
      if (!selectedMediaPreview.item.fileUrl) {
        return (
          <Typography variant="body2" color="text.secondary">
            Для предпросмотра картинки загрузите файл через кнопку " + " в библиотеке.
          </Typography>
        );
      }

      return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
          <Box
            component="img"
            src={selectedMediaPreview.item.fileUrl}
            alt={selectedMediaPreview.item.name}
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 1 }}
          />
        </Box>
      );
    }

    if (!selectedMediaPreview.item.fileUrl) {
      return (
        <Typography variant="body2" color="text.secondary">
          Для воспроизведения аудио загрузите музыкальный файл или звук через библиотеку справа.
        </Typography>
      );
    }

    return (
      <Stack spacing={2} sx={{ width: '100%', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Typography variant="subtitle2">{selectedMediaPreview.item.name}</Typography>
        <Box sx={{ width: '100%', maxWidth: 520 }}>
          <FantasyAudioPlayer src={selectedMediaPreview.item.fileUrl} />
        </Box>
      </Stack>
    );
  };

  return (
    <Box
      component="section"
      sx={{
        minWidth: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: fantasyColors.border,
        backgroundColor: fantasyColors.panel,
        backgroundImage: fantasyGradients.panel,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 1,
          pt: 1,
          borderBottom: 1,
          borderColor: fantasyColors.border,
          backgroundColor: fantasyColors.panelRaised,
          backgroundImage: fantasyGradients.panelRaised,
          boxShadow: `inset 0 -1px 0 rgba(210, 173, 103, 0.08)`,
        }}
      >
        <Tabs
          value={hasTabs ? activeTabId : false}
          onChange={(_, value) => onSetActiveTabId(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            flex: 1,
            '& .MuiTab-root': {
              minHeight: 38,
              py: 0.5,
              color: fantasyColors.textMuted,
            },
            '& .MuiTab-root:hover': {
              color: fantasyColors.text,
              backgroundColor: 'rgba(210, 173, 103, 0.045)',
            },
            '& .MuiTab-root.Mui-selected': {
              color: fantasyColors.goldLight,
            },
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, transparent, ${fantasyColors.gold}, transparent)`,
              boxShadow: `0 0 12px rgba(210, 173, 103, 0.5)`,
            },
          }}
        >
          {tabs.map((tab) => {
            const tabDocument = getTabDocument(tab.documentId);
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" noWrap>
                      {tab.title}: {tabDocument.name}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`Закрыть ${tab.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      sx={{ ml: 0.5 }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
                }
              />
            );
          })}
        </Tabs>
        <IconButton onClick={onOpenNewTab} aria-label="Добавить вкладку" size="small">
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <Box
        sx={{
          p: 2,
          minHeight: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background:
            'radial-gradient(circle at 50% 0%, rgba(87, 37, 45, 0.13), transparent 34%), #110e12',
        }}
      >
        {hasTabs ? (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <FolderOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              {breadcrumbs.map((crumb) => (
                <Chip key={crumb} size="small" label={crumb} variant="outlined" />
              ))}
            </Stack>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, minHeight: 0, flex: 1 }}>
              <Paper
                variant="outlined"
                sx={{
                  ...ornateCornersSx,
                  p: 2,
                  display: 'flex',
                  minHeight: 0,
                  flexDirection: 'column',
                  color: fantasyColors.text,
                  backgroundColor: '#2a211d',
                  backgroundImage:
                    'linear-gradient(145deg, rgba(234, 211, 158, 0.035), transparent 34%), linear-gradient(180deg, rgba(87, 37, 45, 0.11), transparent 58%)',
                  borderColor: fantasyColors.borderStrong,
                  boxShadow: fantasyShadows.panel,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {activeDocument.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {activeDocument.summary}
                    </Typography>
                  </Box>
                  <DescriptionOutlinedIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip size="small" label="H1" variant="outlined" onClick={() => applyLinePrefix('# ')} />
                    <Chip size="small" label="H2" variant="outlined" onClick={() => applyLinePrefix('## ')} />
                    <Chip size="small" label="B" variant="outlined" onClick={() => applyWrapSyntax('**', '**', 'жирный текст')} />
                    <Chip size="small" label="I" variant="outlined" onClick={() => applyWrapSyntax('*', '*', 'курсив')} />
                    <Chip size="small" label="S" variant="outlined" onClick={() => applyWrapSyntax('~~', '~~', 'зачеркнуто')} />
                    <Chip size="small" label="•" variant="outlined" onClick={() => applyLinePrefix('- ')} />
                    <Chip size="small" label="☑" variant="outlined" onClick={() => applyLinePrefix('- [ ] ')} />
                    <Chip size="small" label="Quote" variant="outlined" onClick={() => applyLinePrefix('> ')} />
                    <Chip size="small" label="Link" variant="outlined" onClick={() => applyWrapSyntax('[', '](https://)', 'текст')} />
                    <Chip size="small" label="Code" variant="outlined" onClick={() => applyWrapSyntax('`', '`', 'code')} />
                  </Stack>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={editorMode}
                    onChange={(_, value) => {
                      if (value) {
                        setEditorMode(value);
                      }
                    }}
                    sx={{
                      '& .MuiToggleButton-root': {
                        color: fantasyColors.textMuted,
                        borderColor: fantasyColors.border,
                        textTransform: 'none',
                      },
                      '& .MuiToggleButton-root:hover': {
                        color: fantasyColors.goldLight,
                        backgroundColor: 'rgba(210, 173, 103, 0.06)',
                      },
                      '& .MuiToggleButton-root.Mui-selected': {
                        color: fantasyColors.goldLight,
                        backgroundColor: 'rgba(87, 37, 45, 0.62)',
                      },
                      '& .MuiToggleButton-root.Mui-selected:hover': {
                        backgroundColor: 'rgba(87, 37, 45, 0.72)',
                      },
                    }}
                  >
                    <ToggleButton value="preview">Просмотр</ToggleButton>
                    <ToggleButton value="edit">Редактирование</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>

                {editorMode === 'edit' ? (
                  <TextField
                    multiline
                    minRows={16}
                    value={activeDocument.content}
                    onChange={(event) => updateDocumentContent(event.target.value)}
                    inputRef={editorRef}
                    sx={{
                      mt: 2,
                      flex: 1,
                      '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' },
                      '& .MuiOutlinedInput-root': {
                        color: fantasyColors.text,
                        backgroundColor: '#241a1d',
                        backgroundImage:
                          'linear-gradient(180deg, rgba(210, 173, 103, 0.025), transparent 22%)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: fantasyColors.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: fantasyColors.borderStrong,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: fantasyColors.gold,
                          boxShadow: '0 0 0 2px rgba(210, 173, 103, 0.08)',
                        },
                      },
                    }}
                    slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 } } }}
                  />
                ) : (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      flex: 1,
                      overflow: 'auto',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      color: fantasyColors.text,
                      backgroundColor: '#2a211d',
                      backgroundImage:
                        'linear-gradient(145deg, rgba(234, 211, 158, 0.028), transparent 32%)',
                      boxShadow: 'inset 0 1px 18px rgba(0, 0, 0, 0.18)',
                      '& h1, & h2, & h3': {
                        mt: 2,
                        mb: 1,
                        lineHeight: 1.3,
                        color: fantasyColors.goldLight,
                      },
                      '& h1': { fontSize: 28 },
                      '& h2': { fontSize: 22 },
                      '& p': { my: 1.2 },
                      '& ul, & ol': { pl: 3, my: 1.2 },
                      '& blockquote': {
                        borderLeft: 3,
                        borderColor: 'warning.main',
                        pl: 1.5,
                        mx: 0,
                        color: 'text.secondary',
                      },
                      '& code': {
                        fontFamily: 'monospace',
                        color: fantasyColors.goldLight,
                        backgroundColor: '#171215',
                        border: `1px solid ${fantasyColors.border}`,
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                      '& pre': {
                        p: 1.5,
                        borderRadius: 1,
                        color: fantasyColors.text,
                        backgroundColor: '#171215',
                        border: `1px solid ${fantasyColors.border}`,
                        overflow: 'auto',
                      },
                      '& a': {
                        color: fantasyColors.goldLight,
                      },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {activeDocument.content || '### Пустой документ\n\nПереключите в режим редактирования и начните писать.'}
                    </ReactMarkdown>
                  </Box>
                )}

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  {activeDocument.links?.map((link) => (
                    <Chip
                      key={link}
                      size="small"
                      icon={<DescriptionOutlinedIcon sx={{ fontSize: 14 }} />}
                      label={link}
                      variant="outlined"
                      color="warning"
                    />
                  ))}
                </Stack>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  ...ornateCornersSx,
                  p: 2,
                  display: 'flex',
                  minHeight: 0,
                  flexDirection: 'column',
                  color: fantasyColors.text,
                  backgroundColor: fantasyColors.panelRaised,
                  backgroundImage: fantasyGradients.panelRaised,
                  borderColor: fantasyColors.borderStrong,
                  boxShadow: fantasyShadows.panel,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                  {selectedMediaPreview?.mediaType === 'picture' ? (
                    <ImageOutlinedIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                  ) : (
                    <MusicNoteIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                  )}
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Центральный предпросмотр медиа
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedMediaPreview ? selectedMediaPreview.item.name : 'Файл не выбран'}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    flex: 1,
                    overflow: 'auto',
                    border: 1,
                    borderColor: fantasyColors.border,
                    borderRadius: 1,
                    color: fantasyColors.text,
                    backgroundColor: '#241a1d',
                    backgroundImage:
                      'radial-gradient(circle at 50% 28%, rgba(87, 37, 45, 0.16), transparent 48%)',
                    boxShadow: 'inset 0 1px 22px rgba(0, 0, 0, 0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderMediaPreview()}
                </Box>
              </Paper>
            </Box>
          </>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              ...ornateCornersSx,
              p: 3,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 1,
              color: fantasyColors.text,
              backgroundColor: fantasyColors.panelRaised,
              backgroundImage: fantasyGradients.panelRaised,
              borderColor: fantasyColors.borderStrong,
              boxShadow: fantasyShadows.panel,
            }}
          >
            <DescriptionOutlinedIcon sx={{ color: 'warning.main', fontSize: 28 }} />
            <Typography variant="h6">Нет открытых вкладок</Typography>
            <Typography variant="body2" color="text.secondary">
              Вы закрыли все вкладки. Нажмите на кнопку "+" вверху, чтобы открыть новую.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}