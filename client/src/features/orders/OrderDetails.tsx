import { useEffect, useState } from "react"
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Link, useParams } from "react-router-dom";
import Order from "../../app/models/order";
import agent from "../../app/api/agent";
import BasketTable from "../basket/BasketTable";
import { BasketItem } from "../../app/models/basket";
import NotFound from "../../app/errors/NotFound";
import { Button, Grid2, Typography } from "@mui/material";
import OrderSummary from "./OrderSummary";

export default function OrderDetails() {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const { id } = useParams<{ id: string }>() || 0;

    useEffect(() => {
        setLoading(true);

        if (id) {
            agent.Orders.fetch(parseInt(id))
                .then(order => setOrder(order))
                .catch(error => console.log(error))
                .finally(() => setLoading(false))
        }
    }, [id]);

    if (loading) {
        return <LoadingComponent message="Order loading ..." />
    }

    if (!order) {
        return <NotFound />
    }

    return (
        <>
            <Grid2
                container
                spacing={6}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Grid2 >
                    <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
                        Order# {order.id} - {order.orderStatus}
                    </Typography>
                </Grid2>
                <Grid2>
                    <Button component={Link} to="/orders">
                        Back to orders
                    </Button>
                </Grid2>
            </Grid2>

            <BasketTable items={order?.orderItems as BasketItem[]} isBasket={false} />
            
            <Grid2 container>
                <Grid2 size={{ xs: 6 }} ></Grid2>
                <Grid2 size={{ xs: 6 }} >
                    <OrderSummary order={order}></OrderSummary>
                </Grid2>
            </Grid2>
        </>);
}