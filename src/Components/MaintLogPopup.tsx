import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
} from "@mui/material";
import { MaintLog } from "../services/BikeService";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { v4 as uuidv4 } from "uuid";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface PopupModalProps {
  bikeName: string;
  log: MaintLog[];
  open: boolean;
  handleClose: (logs: MaintLog[]) => void;
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
  const [logs, setLogs] = useState<MaintLog[]>(log);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<MaintLog>({
    id: uuidv4(),
    date: new Date(),
    miles: 0,
    description: "",
  });

  useEffect(() => {
    setLogs(log);
  }, [log]);

  const handleAddRow = () => {
    const rowWithId = { ...newRow, id: uuidv4() };
    setLogs([...logs, rowWithId]);
    setEditRowId(rowWithId.id);
  };

  const handleInputChange = (
    e: { target: { name: any; value: any } },
    id: string
  ) => {
    const { name, value } = e.target;
    setLogs((prevLogs) =>
      prevLogs.map((row) => (row.id === id ? { ...row, [name]: value } : row))
    );
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRow((prevNewRow) => ({ ...prevNewRow, [name]: value }));
  };

  const handleCommit = (save: boolean) => {
    console.log("wants to save");
    console.log(logs);
    if (!save) {
      setLogs(logs.slice(0, -1));
    }
    setEditRowId("");
  };

  const handleDateChangeMYPurchased = (newValue: Dayjs | null) => {
    debugger;
    if (newValue)
      setLogs((prevLogs) =>
        prevLogs.map((row) => (row.id === editRowId ? { ...row, date : newValue.toDate() } : row))
      );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose(logs);
      }}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Maintenance Log for {bikeName}
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          {logs && logs.length > 0 ? (
            <Box sx={{ width: "100%" }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Miles</StyledTableCell>
                      <StyledTableCell align="right">
                        Description
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((row) => (
                      <StyledTableRow key={row.id}>
                        <StyledTableCell component="th" scope="row">
                          {row.id === editRowId ? (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                label="Date Purchased"
                                name="monthYearPurchased"
                                value={dayjs(row.date)}
                                sx={{maxWidth: '180px;'}}
                                onChange={handleDateChangeMYPurchased}
                              />
                            </LocalizationProvider>
                          ) : (
                            row.date?.toLocaleDateString()
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          {row.id === editRowId ? (
                            <TextField
                              label="Miles"
                              name="miles"
                              size="small"
                              style={{ width: 100 }}
                              value={row.miles}
                              onChange={(e) => handleInputChange(e, row.id)}
                            />
                          ) : (
                            row.miles
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.id === editRowId ? (
                            <>
                              <TextField
                                label="Description"
                                name="description"
                                size="small"
                                style={{ width: 350 }}
                                value={row.description}
                                onChange={(e) => handleInputChange(e, row.id)}
                              />
                              <Button
                                style={{ minWidth: "40px", maxHeight: "30px" }}
                                onClick={() => {
                                  handleCommit(true);
                                }}
                              >
                                OK
                              </Button>
                              <Button
                                style={{ minWidth: "30px", maxHeight: "30px" }}
                                onClick={() => {
                                  handleCommit(false);
                                }}
                              >
                                X
                              </Button>
                            </>
                          ) : (
                            row.description
                          )}
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
        <Button onClick={handleAddRow} sx={{ mt: 2 }}>
          Add Row
        </Button>
        <Button
          onClick={() => {
            handleClose(logs);
          }}
          sx={{ mt: 2 }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default MaintLogPopup;
