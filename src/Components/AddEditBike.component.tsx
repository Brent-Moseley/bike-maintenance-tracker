import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Bike } from "../services/BikeService";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import "./AddEditBike.component.css";

/*

Purpose:  Show a popup, allowing the user to add a new bike to their collection, or edit data for an existing bike.

*/

interface AddEditBikeProps {
  data: Bike;
  open: boolean;
  handleClose: (updated: Bike) => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 725,
  maxHeight: "100vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
};

function isWholeNumber(value: string) {
  const wholeNumberRegex = /^\d+$/; // Matches strings containing only digits
  return wholeNumberRegex.test(value);
}

const AddEditBikePopup: React.FC<AddEditBikeProps> = ({
  data,
  open,
  handleClose,
}) => {
  const newData = structuredClone(data);

  const handleCloseModal = (submit: boolean) => {
    const updated = { ...formData };
    if (!submit) updated.id = "";

    handleClose(updated);
  };

  const [formData, setFormData] = useState(newData);
  const [decimalErrorLastServ, setDecimalErrorLastServ] = useState<boolean>(false);
  const [decimalErrorTotal, setDecimalErrorTotal] = useState<boolean>(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    if (name === "milesLastServiced") {
      !isWholeNumber(value) ? setDecimalErrorLastServ(true) : setDecimalErrorLastServ(false);
    } 
    if (name === "totalMiles") {
      !isWholeNumber(value) ? setDecimalErrorTotal(true) : setDecimalErrorTotal(false);
    }     setFormData({ ...formData, [name]: value });
  };

  const handleDateChangeMYPurchased = (newValue: Dayjs | null) => {
    if (newValue) setFormData({ ...formData, monthYearPurchased: newValue.toDate() });
  };

  const handleDateChangeLastServiced = (newValue: Dayjs | null) => {
    if (newValue) setFormData({ ...formData, dateLastServiced: newValue.toDate() });
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      disableEscapeKeyDown
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      BackdropProps={{ onClick: (event) => event.stopPropagation(),}}
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Add / Edit Bike
        </Typography>
        <Box sx={{ width: "100%", maxWidth: 700, margin: "auto", overflowX: "auto", overflowY: "auto" }}>
          <form noValidate autoComplete="off">
            <div className="form-group-container">
              <div className="left">
                <TextField
                  label="Name"
                  name="name"
                  variant="outlined"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
              <div className="left">
                <TextField
                  label="Brand"
                  name="brand"
                  variant="outlined"
                  fullWidth
                  value={formData.brand}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
            </div>
            <TextField
              label="Model"
              name="model"
              variant="outlined"
              fullWidth
              value={formData.model}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Spec"
              name="spec"
              variant="outlined"
              fullWidth
              value={formData.spec}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Notes"
              name="notes"
              variant="outlined"
              fullWidth
              value={formData.notes}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date Purchased"
                name="monthYearPurchased"
                value={dayjs(formData.monthYearPurchased)}
                onChange={handleDateChangeMYPurchased}
                sx={{ mb: 2 }}
              />
              <DesktopDatePicker
                label="Date Last Serviced"
                name="dateLastServiced"
                value={dayjs(formData.dateLastServiced)}
                onChange={handleDateChangeLastServiced}
                sx={{ mb: 2 }}
              />
            </LocalizationProvider>
            <div className="form-group-container">
              <div className="left">
                <TextField
                  label="Miles Last Serviced"
                  name="milesLastServiced"
                  variant="outlined"
                  type="number"
                  error={decimalErrorLastServ}
                  helperText={decimalErrorLastServ ? 'Only use whole numbers.' : ''}
                  fullWidth
                  value={formData.milesLastServiced}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
              <div className="right">
                <TextField
                  label="Total Miles"
                  name="totalMiles"
                  variant="outlined"
                  type="number"
                  error={decimalErrorTotal}
                  helperText={decimalErrorTotal ? 'Only use whole numbers.' : ''}
                  fullWidth
                  value={formData.totalMiles}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </div>
            </div>
          </form>
        </Box>
        <Button onClick={() => handleCloseModal(true)} disabled={decimalErrorLastServ || decimalErrorTotal} sx={{ mt: 0 }}>
          Submit
        </Button>
        <Button onClick={() => handleCloseModal(false)} sx={{ mt: 0 }}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default AddEditBikePopup;
