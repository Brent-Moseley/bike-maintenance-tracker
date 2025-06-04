import React, { useState } from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    CircularProgress,
} from "@mui/material";
import { BikeService } from "../services/BikeService";

/*

Purpose:  Show a popup where the user can log in

*/

interface PopupModalProps {
    open: boolean;
    handleLoginClose: (user: string, name: string) => void;
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

const UserLoginPopup: React.FC<PopupModalProps> = ({
    open,
    handleLoginClose,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [failedLogin, setFailedLogin] = React.useState(false);
    const [user, setUser] = React.useState("");
    const [passcode, setPasscode] = React.useState("");

    const handleChangeUser = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setUser(event.target.value);
    };

    const handleChangePasscode = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setPasscode(event.target.value);
    };

    const handleCloseModal = async (submit: boolean) => {
        if (!submit) handleLoginClose("", "");
        else if (user.length > 0 && passcode.length > 0) {
            setLoading(true);
            var loadedUser = await BikeService.getUser(user, passcode);
            setLoading(false);
            if (!loadedUser) setFailedLogin(true);
            else handleLoginClose(loadedUser.id, loadedUser.name);
        }
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
                    Login
                </Typography>
                {loading && (
                    <Typography variant="h5" component="div"><CircularProgress /> </Typography>
                )}
                {failedLogin && (<Typography id="modal-title" variant="h6" component="h2">
                    User name or passcode incorrect.
                </Typography>)}
                <Typography id="modal-description" sx={{ mt: 2 }}>
                    {
                        <>
                            <Box sx={{ width: "98%" }}>
                                Enter your user credentials:
                                <TextField
                                    label="User Name"
                                    type="text"
                                    variant="outlined"
                                    fullWidth
                                    value={user}
                                    onChange={handleChangeUser} />
                            </Box>
                            <Box sx={{ width: "98%" }}>
                                <TextField
                                    label="Passcode"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    value={passcode}
                                    onChange={handleChangePasscode} />
                            </Box>
                        </>
                    }
                </Typography>
                <Button onClick={() => handleCloseModal(true)} sx={{ mt: 2 }}>
                    Login
                </Button>
                <Button onClick={() => handleCloseModal(false)} sx={{ mt: 2 }}>
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
};

export default UserLoginPopup;
