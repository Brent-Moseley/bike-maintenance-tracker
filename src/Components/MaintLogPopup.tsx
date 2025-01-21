import React from "react";
import { Modal, Box, Typography, Button, Paper, Grid2 } from "@mui/material";
import { MaintLog } from "../services/BikeService";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

interface PopupModalProps {
  bikeName: string;
  log: MaintLog[];
  open: boolean;
  handleClose: () => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const headerStyle = {
  backgroundColor: "#f5f5f5",
  fontWeight: "bold",
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const MaintLogPopup: React.FC<PopupModalProps> = ({
  bikeName,
  log,
  open,
  handleClose,
}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Maintenance Log for {bikeName}
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          {log && log.length > 0 ? (
            <Box sx={{ width: "100%" }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Miles</StyledTableCell>
                      <StyledTableCell align="right">Description</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {log.map((row) => (
                      <StyledTableRow key={row.id}>
                        <StyledTableCell component="th" scope="row">
                          {row.date?.toLocaleDateString()}
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          {row.miles}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.description}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <p></p>
          )}
        </Typography>
        <Button onClick={handleClose} sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default MaintLogPopup;
