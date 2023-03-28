import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox, InputLabel, Select, FormControl, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function AdForm() {
  const navigate = useNavigate();

  const [model, setModel] = useState('');
  const [type, setType] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');

  const handleClick = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleModel = (event) => {
    setModel(event.target.value);
  };

    const handleType = (event) => {
    setType(event.target.value);
    };

    const handleAge = (event) => {
    setAge(event.target.value);
    };

    const handleLocation = (event) => {
    setLocation(event.target.value);
    };


  return (
    <>
      <Stack spacing={3}>
        <TextField name="description" label="Short Advertisement Description" />
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Type of Advertisement</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={type}
                label="Pricing Model"
                onChange={handleType}
            >
                <MenuItem value={"image"}>Image</MenuItem>
                <MenuItem value={"video"}>Video</MenuItem>
            </Select>
        </FormControl>
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Pricing Model</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={model}
                label="Pricing Model"
                onChange={handleModel}
            >
                <MenuItem value={"cpc"}>Cost per click</MenuItem>
                <MenuItem value={"cpm"}>Cost per impression</MenuItem>
            </Select>
        </FormControl>
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Target Audience</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age}
                label="Pricing Model"
                onChange={handleAge}
            >
                <MenuItem value={"youth"}>Youth</MenuItem>
                <MenuItem value={"adults"}>Adults</MenuItem>
                <MenuItem value={"seniors"}>Seniors</MenuItem>
            </Select>
        </FormControl>
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Target Location</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={location}
                label="Pricing Model"
                onChange={handleLocation}
            >
                <MenuItem value={"portugal"}>Portugal</MenuItem>
                <MenuItem value={"spain"}>Spain</MenuItem>
                <MenuItem value={"france"}>France</MenuItem>
                <MenuItem value={"germany"}>Germany</MenuItem>
                <MenuItem value={"italy"}>Italy</MenuItem>
                <MenuItem value={"uk"}>United Kingdom</MenuItem>
                <MenuItem value={"netherlands"}>Netherlands</MenuItem>
                <MenuItem value={"belgium"}>Belgium</MenuItem>
                <MenuItem value={"austria"}>Austria</MenuItem>
                <MenuItem value={"sweeden"}>Sweeden</MenuItem>
                <MenuItem value={"croatia"}>Croatia</MenuItem>
                <MenuItem value={"Poland"}>Poland</MenuItem>
            </Select>
        </FormControl>
        <TextField name="link" label="Advertisement url" />
        
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick} color='info'>
        Create Advertisement
      </LoadingButton>
    </>
  );
}
