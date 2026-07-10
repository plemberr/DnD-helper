import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { TextFileNode } from '../../data/library';

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
            <Typography variant="overline" color="text.secondary" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, fontWeight: 700 }}>
              Preview Markdown
            </Typography>
            <Box sx={{ mt: 2, p: 2, flex: 1, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'grey.50' }}>
              {activeDocument.content.trim() ? (
                <Box component="article" sx={{ '& p': { m: 0, mb: 1.5, color: 'text.primary' } }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ ...props }) => <Typography variant="h4" sx={{ mt: 1, mb: 1 }} {...props} />,
                      h2: ({ ...props }) => <Typography variant="h5" sx={{ mt: 1, mb: 1 }} {...props} />,
                      h3: ({ ...props }) => <Typography variant="h6" sx={{ mt: 1, mb: 1 }} {...props} />,
                      p: ({ ...props }) => <Typography variant="body1" {...props} />,
                      a: ({ ...props }) => <Box component="a" sx={{ color: 'warning.dark' }} {...props} />,
                      code: ({ ...props }) => (
                        <Box component="code" sx={{ px: 0.75, py: 0.25, borderRadius: 0.5, bgcolor: 'grey.200', fontFamily: 'monospace', fontSize: 13 }} {...props} />
                      ),
                      pre: ({ ...props }) => (
                        <Box
                          component="pre"
                          sx={{
                            overflow: 'auto',
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'grey.900',
                            color: 'grey.100',
                            fontFamily: 'monospace',
                            fontSize: 13,
                          }}
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => <Box component="ul" sx={{ pl: 3, mb: 1.5 }} {...props} />,
                      ol: ({ ...props }) => <Box component="ol" sx={{ pl: 3, mb: 1.5 }} {...props} />,
                      blockquote: ({ ...props }) => (
                        <Box component="blockquote" sx={{ pl: 1.5, ml: 0, borderLeft: 3, borderColor: 'warning.light', fontStyle: 'italic', color: 'text.secondary' }} {...props} />
                      ),
                      table: ({ ...props }) => <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} {...props} />,
                      th: ({ ...props }) => <Box component="th" sx={{ border: 1, borderColor: 'divider', bgcolor: 'grey.100', px: 1, py: 0.5, textAlign: 'left' }} {...props} />,
                      td: ({ ...props }) => <Box component="td" sx={{ border: 1, borderColor: 'divider', px: 1, py: 0.5, verticalAlign: 'top' }} {...props} />,
                    }}
                  >
                    {activeDocument.content}
                  </ReactMarkdown>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Введите markdown-текст слева, чтобы увидеть превью.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
