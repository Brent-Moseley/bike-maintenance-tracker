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
  data: any;
  handleClose: () => void;
  handleOk: (newDate: Date | null, newInput: any) => void;
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

const EditFieldModal: React.FC<EditFieldModalProps> = ({
  open,
  data,
  handleClose,
  handleOk,
}) => {
  const [newDate, setNewDate] = useState<Date | null>(data);
  const [newInput, setNewInput] = useState(data);

  useEffect(() => {
    if (typeof data === "object" && data instanceof Date) setNewDate(data);
    else setNewInput(data);
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
          {data instanceof Date ? (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date"
                name="date"
                value={dayjs(data)}
                sx={{ maxWidth: "170px" }}
                onChange={(newVal) => {
                  setNewDate(newVal?.toDate());
                }}
              />
            </LocalizationProvider>
          ) : (
            <TextField
              label="Trigger Miles"
              name="miles"
              type="number"
              size="small"
              style={{ width: 80, marginTop: 80 }}
              value={data || ""}
              onChange={(newVal) => {
                setNewInput(newVal);
              }}
            />
          )}
          <Button variant="contained" color="primary" onClick={() => {handleOk(newDate, newInput)}}>
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

export default EditFieldModal;
