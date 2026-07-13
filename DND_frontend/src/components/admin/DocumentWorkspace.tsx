import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import type { TextFileNode } from '../../data/library';
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
            Для предпросмотра картинки загрузите файл через кнопку "+" в библиотеке.
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
        <Box
          component="audio"
          controls
          src={selectedMediaPreview.item.fileUrl}
          sx={{ width: '100%', maxWidth: 520 }}
        />
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
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, pt: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.100' }}>
        <Tabs
          value={activeTabId}
          onChange={(_, value) => onSetActiveTabId(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 38, flex: 1, '& .MuiTab-root': { minHeight: 38, py: 0.5 } }}
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

      <Box sx={{ p: 2, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <FolderOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          {breadcrumbs.map((crumb) => (
            <Chip key={crumb} size="small" label={crumb} variant="outlined" />
          ))}
        </Stack>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, minHeight: 0, flex: 1 }}>
          <Paper variant="outlined" sx={{ p: 2, display: 'flex', minHeight: 0, flexDirection: 'column', bgcolor: 'grey.50' }}>
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

            <TextField
              multiline
              minRows={16}
              value={activeDocument.content}
              onChange={(event) => onUpdateTextContent(activeDocument.id, event.target.value)}
              sx={{ mt: 2, flex: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 } } }}
            />

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

          <Paper variant="outlined" sx={{ p: 2, display: 'flex', minHeight: 0, flexDirection: 'column' }}>
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
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderMediaPreview()}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
