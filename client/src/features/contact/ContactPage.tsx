import { Button, ButtonGroup, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { decrement, increment } from "./conterSlice";

export default function ContactPage(){
    const dispatch = useAppDispatch();
    const data = useAppSelector(state => state.counter.data)
    const title = useAppSelector(state => state.counter.title)

    return(
        <>
            <Typography variant="h2">
                {title}
            </Typography>
            <Typography variant="h5">
                The data is: {data}
            </Typography>
            <ButtonGroup>
                <Button onClick={() => dispatch(decrement(2))} variant='contained' color='error'>Decrement</Button>
                <Button onClick={() => dispatch(increment(2))} variant='contained' color='primary'>Increment</Button>
            </ButtonGroup>
        </>
    )
}