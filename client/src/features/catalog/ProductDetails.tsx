import { Divider, Grid2, Table, TableBody, TableCell, TableRow, TextField, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "../../app/models/product";
import agent from "../../app/api/agent";
import NotFound from "../../app/errors/NotFound";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useStoreContext } from "../../app/context/StoreContext";
import { LoadingButton } from "@mui/lab";

export default function ProductDetails(){
    const {basket, setBasket, removeItem} = useStoreContext();
    const {id} = useParams<{id: string}>();  
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const item = basket?.items?.find(x => x.productId === product?.id)
    
    useEffect(() => {
        if(!id){
            throw "Id is not defined";
        }

       if(item) setQuantity(item.quantity);

        agent.Catalog.details(parseInt(id))
            .then(product => setProduct(product))
            .catch(error => console.log(error))
            .finally(() => setLoading(false));
    }, [id, item])

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        if(parseInt(event.currentTarget.value) >= 0){
            setQuantity(parseInt(event.currentTarget.value))
        }
    }

    function handleUpdateCart(){
        if(!product){ return; }
        
        setSubmitting(true);
        if(!item || quantity > item.quantity){
            const updatedQuantity = item ? quantity - item.quantity : quantity;
            agent.Basket.addItem(product.id, updatedQuantity)
                .then(basket => setBasket(basket))
                .catch(error => console.log(error))
                .finally(() => setSubmitting(false));
        } else {
            const updatedQuantity = item.quantity - quantity;
            agent.Basket.removeItem(product.id, updatedQuantity)
                .then(() => removeItem(product.id, updatedQuantity))
                .catch(error => console.log(error))
                .finally(() => setSubmitting(false));
        }
    }

    if(loading) return (<LoadingComponent message="Loading product..." />);

    if(!product) return <NotFound />;

    return(
        <Grid2 container spacing={6}>
            <Grid2 size={{xs: 6}} >
                <img src={product.pictureUrl} 
                    alt={product.name} 
                    style={{width: '100%'}}>
                </img>
            </Grid2>
            <Grid2 size={{xs: 6}} >
                <Typography variant='h3'>{product.name}</Typography>
                <Divider sx={{mb: 2}}/>
                <Typography variant='h4' color='secondary'>${(product.price / 100).toFixed(2)}</Typography>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>{product.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>{product.description}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>{product.type}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Brand</TableCell>
                            <TableCell>{product.brand}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Quantity in stock</TableCell>
                            <TableCell>{product.quantityInStock}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Grid2 container spacing={2}>
                    <Grid2 size={{xs:6}}>
                        <TextField
                            onChange={handleInputChange}
                            variant="outlined"
                            type="number"
                            label="Quantity in Cart"
                            value={quantity}
                        />
                    </Grid2>
                    <Grid2 size={{xs:6}}>
                        <LoadingButton 
                            disabled={item?.quantity === quantity || (!item && quantity ===0)}
                            loading={submitting}
                            onClick={handleUpdateCart}
                            sx={{height: '55px'}}
                            color='primary'
                            size='large'
                            variant='contained'
                            fullWidth
                        >
                            {item ? 'Update quantity' : 'Add to cart'}
                        </LoadingButton>
                    </Grid2>
                </Grid2>
            </Grid2>
        </Grid2>
    )
}