import { Typography, Grid2 } from "@mui/material";
import { useFormContext } from "react-hook-form";
import AppTextInput from "../../app/components/AppTextInput";
import AppCheckbox from "../../app/components/AppCheckBox";

export default function AddressForm() {
  const { control, formState, getValues } = useFormContext();
  console.log(getValues().saveAddress)

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Shipping address
      </Typography>
      <Grid2 container spacing={3}>
        <Grid2 size={{xs: 12, md: 12}}>
          <AppTextInput control={control} name='fullName' label="Full name"/>
        </Grid2>
        <Grid2 size={{xs: 12}}>
          <AppTextInput control={control} name='address1' label="Address1"/>
        </Grid2>
        <Grid2 size={{xs: 12}}>
          <AppTextInput control={control} name='address2' label="Address2"/>
        </Grid2>
        <Grid2 size={{xs: 12, md: 6}}>
          <AppTextInput control={control} name='city' label="City"/>
        </Grid2>
        <Grid2 size={{xs: 12, md: 6}}>
          <AppTextInput control={control} name='state' label="State"/>
        </Grid2>
        <Grid2 size={{xs: 12, md: 6}}>
          <AppTextInput control={control} name='zip' label="Zipcode"/>
        </Grid2>
        <Grid2 size={{xs: 12, md: 6}}>
          <AppTextInput control={control} name='country' label="Country"/>
        </Grid2>
        <Grid2 size={{xs: 12}}>
         <AppCheckbox 
            disabled={Object.keys(formState.dirtyFields).length === 0}
            name='saveAddress' 
            label='Save this as default address' 
            control={control} 
          />
        </Grid2>
      </Grid2> 
    </>
  );
}

