import { Grid2, Typography } from '@mui/material';
import BasketSummary from '../basket/BasketSummary';
import BasketTable from '../basket/BasketTable';
import { useAppSelector } from '../../app/store/configureStore';

export default function Review() {
  const { basket } = useAppSelector(x => x.basket);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Order summary
      </Typography>

      {basket &&
      <BasketTable items={basket.items} isBasket={false} /> }
      <Grid2 container>
          <Grid2 size={{xs: 6}} ></Grid2>
          <Grid2 size={{xs: 6}} >
          <BasketSummary></BasketSummary>
          </Grid2>
      </Grid2>
    </>
  );
}
