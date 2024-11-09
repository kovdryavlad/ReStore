import {Elements} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "./CheckoutPage";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../app/store/configureStore";
import agent from "../../app/api/agent";
import { setBasket } from "../basket/basketSlice";
import LoadingComponent from "../../app/layout/LoadingComponent";

const stripePromise = loadStripe('pk_test_51QIVagEbwXCSGYujH58OLmhdoze6z8yh557CVxQMfaZqZbpdPeed54ulAuWvkf4fr2I9ojBHVoukGAJBXgJ1J14f00iFBsDPSa');

export default function CheckoutWrapper(){
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        agent.Payments.createPaymentIntent()
            .then(basket => dispatch(setBasket(basket)))
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }, [dispatch]);

    if(loading){
        return <LoadingComponent message="Loading checkout"/>
    }

    return (
        <Elements stripe={stripePromise}>
            <CheckoutPage />
        </Elements>
    );
}