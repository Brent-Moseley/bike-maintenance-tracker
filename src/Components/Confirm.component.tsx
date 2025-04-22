import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

/*

Purpose:  A simple confirmation box, with a custom message.

*/

interface ConfirmModalProps {
  open: boolean;
  message: string;
  cancelText? : string;
  handleClose: () => void;
  handleOk: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, cancelText, handleClose, handleOk }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          To confirm:
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" onClick={handleOk}>
            OK
          </Button>
          <Button variant="contained" color="secondary" onClick={handleClose}>
            {cancelText && cancelText.length > 0 ? cancelText : "Cancel"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;
