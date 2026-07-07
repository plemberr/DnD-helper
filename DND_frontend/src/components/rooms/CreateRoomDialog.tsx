import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { CreateRoomData } from '../../types/room';

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateRoomData) => void;
}

const initialForm: CreateRoomData = {
  title: '',
  description: '',
  playersLimit: 6,
};

export function CreateRoomDialog({ open, onClose, onCreate }: CreateRoomDialogProps) {
  const [form, setForm] = useState<CreateRoomData>(initialForm);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setTitleError('');
    }
  }, [open]);

  const submit = () => {
    const normalizedTitle = form.title.trim();
    if (!normalizedTitle) {
      setTitleError('Введите название комнаты.');
      return;
    }

    onCreate({ ...form, title: normalizedTitle, description: form.description.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Создать комнату</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Название"
            required
            value={form.title}
            onChange={(event) => {
              setForm({ ...form, title: event.target.value });
              setTitleError('');
            }}
            error={Boolean(titleError)}
            helperText={titleError || 'Например: «Проклятие Страда»'}
            fullWidth
          />
          <TextField
            label="Описание"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label="Лимит игроков"
            type="number"
            value={form.playersLimit}
            onChange={(event) => {
              const value = Number(event.target.value);
              setForm({ ...form, playersLimit: Number.isNaN(value) ? 1 : Math.min(12, Math.max(1, value)) });
            }}
            slotProps={{ htmlInput: { min: 1, max: 12 } }}
            helperText="От 1 до 12 игроков. По умолчанию — 6."
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={submit}>
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}
