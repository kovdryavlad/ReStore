import { Typography, TextField, Grid2 } from "@mui/material";
import { useFormContext } from "react-hook-form";
import AppTextInput from "../../app/components/AppTextInput";
import { CardCvcElement, CardExpiryElement, CardNumberElement } from "@stripe/react-stripe-js";
import { StripeInput } from "./StripeInput";
import { StripeElementType } from "@stripe/stripe-js";

interface Props{
  cardState: {elementError: {[key in StripeElementType]?: string}},
  onCardInputChange: (event: any) => void,
}

export default function PaymentForm({cardState, onCardInputChange}:Props) {
  const {control} = useFormContext();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Payment method
      </Typography>
      <Grid2 container spacing={3}>
        <Grid2 size={{xs: 12, md: 6}}>
          <AppTextInput name='nameOnCard' label="Name on card" control={control} /> 
        </Grid2>
        <Grid2 size={{xs: 12, md: 6}}>
          <TextField
            onChange={onCardInputChange}
            error={!!cardState.elementError.cardNumber}
            helperText={cardState.elementError.cardNumber}
            id="cardNumber"
            //label="Card number"
            fullWidth
            autoComplete="cc-number"
            variant="outlined"
            InputProps={{
              inputComponent: StripeInput,
              inputProps:{
                component: CardNumberElement
              }
            }}
          />
        </Grid2>
        <Grid2 size={{xs: 12, md: 6}}>
          <TextField
            onChange={onCardInputChange}
            error={!!cardState.elementError.cardExpiry}
            helperText={cardState.elementError.cardExpiry}
            id="expDate"
            //label="Expiry date"
            fullWidth
            autoComplete="cc-exp"
            variant="outlined"
            InputProps={{
              inputComponent: StripeInput,
              inputProps:{
                component: CardExpiryElement
              }
            }}
          />
        </Grid2>
        <Grid2 size={{xs: 12, md: 6}}>
          <TextField
            onChange={onCardInputChange}
            error={!!cardState.elementError.cardCvc}
            helperText={cardState.elementError.cardCvc}
            id="cvv"
            //label="CVV"
            fullWidth
            autoComplete="cc-csc"
            variant="outlined"
            InputProps={{
              inputComponent: StripeInput,
              inputProps:{
                component: CardCvcElement
              }
            }}
          />
        </Grid2>
      </Grid2>
    </>
  );
}