import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";

interface PopupModalProps {
  miles: number;
  open: boolean;
  handleClose: (add: number) => void;
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

const AddMilesPopup: React.FC<PopupModalProps> = ({
  open,
  handleClose,
}) => {
  const [numberValue, setNumberValue] = React.useState("");
  const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setNumberValue(event.target.value);
  };

  const handleCloseModal = (submit: boolean) => {
    let val = parseFloat(numberValue);
    submit && val > 0 ? 
    handleClose(val)
    : 
    handleClose(0);
  }

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Add Ride
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          {
            <Box sx={{ width: "98%" }}>
              How many miles on this ride?
              <TextField
                label=""
                type="number"
                variant="outlined"
                fullWidth
                value={numberValue}
                onChange={handleChange}
              />
            </Box>
          }
        </Typography>
        <Button onClick={() => handleCloseModal(true)} sx={{ mt: 2 }}>
          Submit
        </Button>
        <Button onClick={() => handleCloseModal(false)} sx={{ mt: 2 }}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default AddMilesPopup;
