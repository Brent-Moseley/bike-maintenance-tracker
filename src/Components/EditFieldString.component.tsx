import React, { useEffect, useState } from "react";
import { Modal, Box, Button, TextField } from "@mui/material";

/*

Purpose:  A popup that allows for the editing of one data field

*/

interface EditFieldModalProps {
  open: boolean;
  data: string;
  rowId: string;
  fieldName: string;
  handleClose: () => void;
  handleOk: (newInput: string, rowId: string, fieldName: string) => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const EditFieldStringModal: React.FC<EditFieldModalProps> = ({
  open,
  data,
  rowId,
  fieldName,
  handleClose,
  handleOk,
}) => {
  const [newInput, setNewInput] = useState<string>(data);

  useEffect(() => {
    setNewInput(data);
  }, [data]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <TextField
              name="miles"
              type="string"
              style={{ width: 480, marginTop: 10 }}
              value={newInput}
              onChange={(newVal) => {
                setNewInput(newVal.target.value);
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => {handleOk(newInput, rowId, fieldName)}}>
            OK
          </Button>
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditFieldStringModal;
