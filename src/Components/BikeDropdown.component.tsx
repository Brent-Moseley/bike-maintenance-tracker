import React, { useState } from 'react';
import { Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { Bike } from '../services/BikeService';

interface BikeDropdownProps {
  bikes: Bike[];
  onDataFromChild: Function;
}

const BikeDropdown: React.FC<BikeDropdownProps> = ({ bikes, onDataFromChild }) => {
  const [selectedBike, setSelectedBike] = useState<string>('');

  const handleChange = (event: SelectChangeEvent<string>) => {
    const bike = event.target.value as string;
    setSelectedBike(bike);
    onDataFromChild(bike);
  };

  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="bike-select-label">Select a Bike</InputLabel>
      <Select
        labelId="bike-select-label"
        value={selectedBike}
        onChange={handleChange}
        label="Select a Bike"
      >
        {bikes.map(bike => (
          <MenuItem key={bike.id} value={bike.id}>
            {bike.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default BikeDropdown;
