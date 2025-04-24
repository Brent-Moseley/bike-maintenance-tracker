import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
//import ConfirmModal from "./Confirm.component";

/*

Purpose:  A popup that allows for the editing of one data field

*/

interface EditFieldModalProps {
  open: boolean;
  data: Date;
  handleClose: () => void;
  handleOk: (newDate: Date | null) => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const EditFieldDateModal: React.FC<EditFieldModalProps> = ({
  open,
  data,
  handleClose,
  handleOk,
}) => {
  const [newDate, setNewDate] = useState<Date | null>(data);

  useEffect(() => {
    setNewDate(data);
  }, [data]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date"
                name="date"
                value={dayjs(data)}
                sx={{ maxWidth: "170px" }}
                onChange={(newVal) => {
                  setNewDate(newVal ? newVal.toDate() : null);
                }}
              />
            </LocalizationProvider>
          <Button variant="contained" color="primary" onClick={() => {handleOk(newDate)}}>
            OK
          </Button>
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditFieldDateModal;
