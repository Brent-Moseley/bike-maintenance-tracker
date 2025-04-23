import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

/*

Purpose:  A simple confirmation box, with a custom message.

*/

interface ConfirmAutoModalProps {
  open: boolean;
  handleClose: () => void;
  handleOk: (date: Date) => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ConfirmAutoAlertsModal: React.FC<ConfirmAutoModalProps> = ({ open, handleClose, handleOk }) => {
    //const [date, setDate] = useState<string>("");
    const [startOfSchedule, setStartOfSchedule] = useState<Date>(new Date());

      const handleDateChange = (newValue: Dayjs | null) => {
        if (newValue) setStartOfSchedule(newValue.toDate());
      };
    useEffect(() => {
        if (open) setStartOfSchedule(new Date());
    }, [open]);

    return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Add Auto Alerts for Recommended Service Intervals
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2, fontStyle: "italic", fontSize: "16px", color: "saddlebrown" }}>
        This will add alerts to your current bike based on suggested maintenance intervals. You can later delete any that you do not want.
        </Typography>
        <br/>
        <Typography>
            Start of schedule (ie when was the bike new, or date of last major service):
        </Typography>
        <br/>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date of Schedule Start"
                name="startDate"
                value={dayjs(startOfSchedule)}
                onChange={handleDateChange}
                sx={{ mb: 2 }}
              />
        </LocalizationProvider>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" onClick={() => {handleOk(startOfSchedule)}}>
            Create
          </Button>
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmAutoAlertsModal;
