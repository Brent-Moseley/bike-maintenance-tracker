import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";

interface FromTodayModalProps {
  open: boolean;
  message: string;
  units: string;
  handleClose: () => void;
  handleOk: (val: number) => void;
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

const FromTodayModal: React.FC<FromTodayModalProps> = ({
  open,
  message,
  units,
  handleClose,
  handleOk,
}) => {
  const [inputValue, setInputValue] = useState<number>(0);

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setInputValue(value);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title">
            {message}
        </Typography>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            name="milesLastServiced"
            variant="outlined"
            type="number"
            fullWidth
            value={inputValue}
            onChange={handleInputChange}
            sx={{
              mb: 2,
              width: 85,
              margin: 3,
              "& .MuiInputBase-root": {
                height: 40,
              },
            }}
          />
          {units}
        </div>
        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOk(inputValue)}
          >
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

export default FromTodayModal;
