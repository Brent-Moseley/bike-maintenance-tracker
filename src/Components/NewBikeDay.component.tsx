import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

interface NBDModalProps {
  open: boolean;
  handleClose: () => void;
  handleOk: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 550,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const NewBikeDayModal: React.FC<NBDModalProps> = ({ open, handleClose, handleOk }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Whoa!!
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          Is this new bike day??
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" onClick={handleOk}>
            Heck yeah, gonna send it!
          </Button>
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Just kidding, too broke : (
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewBikeDayModal;
